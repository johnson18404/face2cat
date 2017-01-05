#!/usr/bin/env node

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var siofu = require("socketio-file-upload");

var path = require('path');
const exec = require('child_process').exec;
var fs = require('fs-extra');
var randomstring = require("randomstring");
var gm = require('gm');

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

app.use(siofu.router);

app.get('/about', function(req, res){
  res.send('draw me a cat server. v1.0');
});

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', function(socket){
    console.log('a user connected');

    var uploader = new siofu();
    uploader.dir = path.join(__dirname, 'tmp');
    uploader.listen(socket);

    // server side
    uploader.on("saved", function(event){
      console.log(event.file.meta.hello);
      // console.log(event.file);

      var saveFileName = randomstring.generate() + '.jpg';

      // to JPEG
      gm(event.file.pathName)
      .setFormat('jpg')
      .compress('JPEG')
      .write(path.join(__dirname, 'uploads', saveFileName), function(err) {
          // fs.unlink(filepath, function(err) { })
          fs.remove(event.file.pathName, function (err) {});

          if (err) {
              console.log(err)
              socket.emit('upload', true, '');
              return;
          }
          else {
              console.log('preprocess complete')
              socket.emit('upload', null, saveFileName);
          }
      });

    });


    socket.on('draw', (saveFileName, cat)=>{
      if (!(/^([a-zA-Z]|\d)+\.jpg$/g).test(saveFileName) || !(/^[0-5]$/g).test(cat) ) {
        socket.emit('drawed', 'invaild format', '');
      }

      saveFileName = path.join(__dirname, 'uploads', saveFileName);

      console.log('connamd: ' + `python face.py ${saveFileName} ${cat}`);

      var resultImg = randomstring.generate() + '.jpg';
      var resultImgPath = path.join(__dirname, 'public', 'results', resultImg);

      exec(`python face.py ${saveFileName} ${cat} ${resultImgPath}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          socket.emit('drawed', 'no face detected', '');
          return;
        }
        console.log('python callback finish');
        // console.log(`stdout: ${stdout}`);
        // console.log(`stderr: ${stderr}`);

        socket.emit('drawed', null, resultImg);
      });
    });


});

http.listen(port, function(){
  console.log('face2cat server listening on: '+port);
});

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}