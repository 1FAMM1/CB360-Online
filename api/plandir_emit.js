import puppeteer from "puppeteer";

(async () => {
  const html = `<html><body><h1>Teste PDF</h1></body></html>`;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html);
  await page.pdf({ path: "teste.pdf", format: "A4" });
  await browser.close();
})();
