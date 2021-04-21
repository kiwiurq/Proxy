'use strict';
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const http = require('http');
const fs = require('fs');
const request = require('request');
const youtubedl = require('youtube-dl');
const server = http.createServer(app);

const helmet = require('helmet');

app.set('trust proxy', true);

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(helmet.frameguard());

app.get('/get', (req, res) => {
    var url = req.query.url;
    if (url.includes('youtube.com/watch?v=') || url.includes('youtu.be')) {
        try {
            var downloaded = 0;
            if (url.includes('youtube.com/watch?v=')){
                url = url.split('?v=')[1].split('&')[0];
            }
            else{
                url = url.split('tu.be/')[1].split('&')[0];
            }
            var video = youtubedl(url, ['--format=18'], { start: downloaded, cwd: __dirname });
            var duration = 60000;
            video.on('info', function(info) {
                console.log('Download started')
                console.log('Filename: ' + info._filename);
                var total = info.size + downloaded;
                console.log('Size: ' + total);
                duration = info.duration;
                if (downloaded > 0) {
                    console.log('Resuming from: ' + downloaded);
                    console.log('Remaining bytes: ' + info.size);
                }
            });
            setTimeout(function () {
                video.pipe(fs.createWriteStream('./public/video' + url + '.mp4', { flags: 'a' }));
                video.on('complete', function complete(info) {
                    console.log('Filename: ' + info._filename + ' already downloaded.')
                });
                video.on('end', function() {
                    //video.pipe(res);
                    res.send('<html><script>window.open("https://proxy.davidfahim.repl.co/video' + url + '.mp4", "_top");</script></html>');
                    setTimeout(function () {
                        fs.unlinkSync('./public/video' + url + '.mp4');
                    }, (duration * 1000) + 30000);
                });
            }, 500);
        }
        catch (error) {
            res.send('An error occured');
        }
    }
    else {
        var content;
        try {
            content = request.get(url);
        }
        catch (error) {
            content = 'Please enter a FULL valid url. For example, "youtube.com" should be "https://www.youtube.com/"';
        }
        if (typeof content != 'string') {
            content.pipe(res);
        }
        else {
            res.send(content);
        }
    }
});

app.get('/watch', (req, res) => {
    res.send('<html><script>window.open("https://proxy.davidfahim.repl.co/get?url=' + 'https://www.youtube.com/watch?v=' + req.query.v + '", "_top");</script></html>');
});

app.get('/', (request, response) => {
    response.status(200).sendFile(__dirname + '/public/main.html');
});

app.listen(8080);