'use strict';

const puppeteer = require('puppeteer');
const request = require('request-promise-native');
const express = require('express');
const dns = require('dns');

const tmp = require('tmp');


// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();

let browser = null;



(async () => {
    browser = await puppeteer.launch({args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
    ]});

    app.get('/render', (req, res) => {
        (async () => {

            if(!browser){
                res.send("Browser not initialized");
                return;
            }



            const url = req.query.url ? req.query.url : 'https://news.ycombinator.com';
            const name = tmp.tmpNameSync();


            const page = await browser.newPage();
            await page.goto(url, {waitUntil: 'networkidle2'});
            await page.pdf({
                path: name,
                printBackground: true,
                width: '1374px',
                height: '1081px',
                pageRanges: '1',
            });

            res.download(name, 'result.pdf');
        })();
    });

    app.listen(PORT, HOST);
    console.log(`Running on http://${HOST}:${PORT}`);

})();





/*
dns.resolve('chrome', function(err, records){

    console.log('ip', records);
    const options = {
        uri: "http://" + records[0] + ":9222/json/version",
        json: true,
        resolveWithFullResponse: true
    };

    request(options)
        .then((res) => {
            let webSocket = res.body.webSocketDebuggerUrl;
            console.log(`WebsocketUrl: ${webSocket}`);

            puppeteer.connect({browserWSEndpoint: webSocket})
                .then((_browser) => {
                    browser = _browser;
                });

        });

});
*/