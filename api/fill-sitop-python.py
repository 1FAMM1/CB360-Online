from openpyxl import load_workbook
from http.server import BaseHTTPRequestHandler
import json
import io
import urllib.request

TEMPLATE_URL = "https://raw.githubusercontent.com/1FAMM1/CB360-Mobile/main/templates/sitop_template.xlsx"

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            # Download do template
            with urllib.request.urlopen(TEMPLATE_URL) as response:
                template_data = response.read()
            
            # Carrega o workbook SEM keep_vba primeiro para testar
            wb = load_workbook(io.BytesIO(template_data))
            ws = wb.active
            
            # Preenche as células de texto
            ws['P11'] = str(data.get('vehicle', ''))
            ws['E17'] = str(data.get('registration', ''))
            ws['B17'] = str(data.get('gdh_inop', ''))
            ws['O14'] = str(data.get('failure_type', ''))
            
            desc = data.get('failure_description', '')
            ws['K16'] = f"Descrição: {desc}" if desc else ''
            
            ws['G23'] = str(data.get('gdh_op', ''))
            ws['E28'] = str(data.get('optel', ''))
            
            # Preenche células vinculadas às checkboxes
            ws['S1'].value = bool(data.get('ppi_airport', False))
            ws['S2'].value = bool(data.get('ppi_a22', False))
            ws['S3'].value = bool(data.get('ppi_a2', False))
            ws['S4'].value = bool(data.get('ppi_linfer', False))
            ws['S5'].value = bool(data.get('ppi_airfield', False))
            ws['S6'].value = bool(data.get('ppi_part', False))
            ws['S7'].value = not bool(data.get('ppi_part', False))
            ws['S8'].value = bool(data.get('ppi_subs', False))
            ws['S9'].value = not bool(data.get('ppi_subs', False))
            
            # Salva em buffer com template original
            output = io.BytesIO()
            wb.save(output)
            output.seek(0)
            excel_data = output.read()
            
            # Headers
            self.send_response(200)
            self.send_header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            self.send_header('Content-Length', str(len(excel_data)))
            self.send_header('Content-Disposition', 'attachment; filename="SITOP_test.xlsx"')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            self.wfile.write(excel_data)
            
        except Exception as e:
            import traceback
            self.send_response(500)
            self.send_header('Content-Type', 'text/plain')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(f"Erro: {str(e)}\n\n{traceback.format_exc()}".encode('utf-8'))
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
