/* ========================== INEM SERVICES ========================= */
function generateCODUserviceMessage() {
  const hourAlert = document.getElementById('alert-service')?.value || '';
  const address = document.getElementById('address-service')?.value?.trim() || '';
  const locality = document.getElementById('location-service')?.value?.trim() || '';
  const referencePoint = document.getElementById('reference-address-service')?.value?.trim() || '';
  const gender = document.getElementById('victim-gender-service')?.value || '';
  const age = document.getElementById('victim-age-service')?.value?.trim() || '';
  const ageType = document.getElementById('victim-age-type-service')?.value || '';
  const situation = document.getElementById('situation-service')?.value?.trim() || '';
  const nrCODU = document.getElementById('nr-codu-service')?.value?.trim() || '';
  const observations = document.getElementById('observations-service')?.value?.trim() || '';
  let message = `*🚨⚠️ SERVIÇO INEM ⚠️🚨*\n\n`;
  if (nrCODU) message += `*Nr. CODU:* ${nrCODU}\n`;
  if (hourAlert) message += `*Hora Alerta:* ${hourAlert}\n`;
  if (address || locality) message += `*Local:* ${address}${address && locality ? ' - ' : ''}${locality}\n`;
  if (referencePoint) message += `*Ponto Ref.:* ${referencePoint}\n`;
  if (gender || age) message += `*Vítima:* ${gender}${gender && (age || ageType) ? ', ' : ''}${age} ${ageType}\n`;
  if (situation) message += `*Situação:* ${situation}\n\n`;
  if (observations) message += `*Observações:* ${observations}`;
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(message).then(() => {
      alert("Mensagem criada e copiada! Pode colar no WhatsApp (CTRL+V).");
    }).catch(() => alert("Não foi possível copiar automaticamente. Copie manualmente."));
  } else {
    alert("Mensagem criada! Copie manualmente o texto.");
  }
  console.log(message);
  return message;
}
