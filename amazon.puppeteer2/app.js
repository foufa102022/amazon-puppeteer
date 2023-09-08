const express = require('express');  //appel d'express
const puppeteer = require ('puppeteer');        //appel du puppeteer
const engine = require ('express-handlebars').engine;       //appel module engine de l'express


const app = express();             //declaration de variable
app.use(express.static('public'));

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', '/views');

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/search', async (req, res) => {
    try {
      const searchQuery = req.query.q; 
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto('https://www.amazon.com/');
      await page.type('#twotabsearchtextbox', searchQuery);
      await page.click('input[type="submit"]');
      const listResult = await page.evaluate(() => {
        const results = [];
        const product = document.querySelectorAll('.s-result-item');
        product.forEach((product) => {
          const titlep = product.querySelector('h2 a');
          const imagep = product.querySelector('.s-image');
          const pricep = product.querySelector('.a-price span');
          const title = titlep.innerText;
          const image = imagep.getAttribute('src');
          const price = pricep ? pricep.innerText : '';
          results.push({ title, image, price});
        });
  
        return results;
      });
      await browser.close();
      res.render('search', { listResult });
    } catch (error) {
      res.render('search', { error:'erreur' });
    }
  });

  app.listen(3000, () => {
    console.log('Le serveur Express écoute sur le port 3000.');
  });