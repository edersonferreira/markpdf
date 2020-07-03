#!/usr/bin/env node

var argv = require('minimist')(process.argv.slice(2));

const fs = require('fs');
const puppeteer = require('puppeteer');
var markdown = require('markdown-it')();

const files = process.argv.splice(2);

fs.readFile(files[0], 'utf8', (err, data) => {
  if (err) {
    return console.log(err);
  }
  const markdownFile = data;
  const markdownHTML = markdown.render(markdownFile);
  pagePDF(markdownHTML);
});

function pagePDF(html) {
  (async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html);

	const defaultCSS = "body{font-family:Arial, Helvetica, sans-serif;margin-top:-1010px;}h1{margin-top:1010px;text-align:center;}p{text-align:justify;}table{border-collapse:collapse;margin-left:auto;margin-right:auto;}table,th,td{border:1px solid black;padding:10px;}pre{background-color:#282a36;color:#f8f8f2;display:block;border-radius:5px;padding:5px;}code{background-color:#282a36;color:#f8f8f2;border-radius:5px;}a{text-decoration:none;}"

    if (argv.theme != undefined){
      await page.addStyleTag({ path: argv.theme });
    }
    if (argv.t != undefined){
      await page.addStyleTag({ path: argv.t });
    }
    else{ 
      await page.addStyleTag({ content: defaultCSS })
    }

    await page.emulateMedia('screen');

    if (argv.theme != undefined){
      var format = argv.theme
    }
    else if ( argv.t != undefined ){
      var format = argv.t
    }
    else {
      var format = 'A4'
    }
    pdfFile = files[0].replace('.md', '.pdf');

    await page.pdf({
      path: pdfFile,
      format: format,
      printBackground: true,
    });

    await browser.close();
  })();
}