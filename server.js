'use strict';

const puppeteer = require('puppeteer-core');
const request = require('request-promise-native');
const express = require('express');
const dns = require('dns');

const tmp = require('tmp');


// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();

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
                .then((browser) => {

                    app.get('/render', (req, res) => {
                        (async () => {
                            const page = await browser.newPage();
                            const url = req.query.url ? req.query.url : 'https://news.ycombinator.com';
                            await page.goto(url, {waitUntil: 'networkidle2'});


                            const name = tmp.tmpNameSync();
                            await page.pdf({path: name, format: 'A4'});
                            res.download(name, 'result.pdf');
                        })();
                    });

                    app.listen(PORT, HOST);
                    console.log(`Running on http://${HOST}:${PORT}`);
                });



        });


});
