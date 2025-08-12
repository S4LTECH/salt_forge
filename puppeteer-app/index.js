const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = process.env.PORT || 3000;

app.get('/analisar', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Parâmetro ?url= é obrigatório.' });
  }

  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: 'URL inválida.' });
  }

  let browser;

  try {
    browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome-stable',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true
  });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, como Gecko) Chrome/117.0.0.0 Safari/537.36');

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    const content = await page.content();

    const hasFazerLogin = content.includes('Fazer login');
    const hasErroPublicar = content.includes('Desculpe. Não foi possível publicar o documento.');
    const found = hasFazerLogin || hasErroPublicar;

    res.json({ found });

  } catch (err) {
    console.error('Erro ao analisar página:', err);
    res.status(500).json({ error: 'Erro ao acessar a página.' });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});