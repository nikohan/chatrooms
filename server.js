var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');//根据文件扩展名获取MIME类型

var cache = {};//缓存文件内容

function send404(response) {
    response.writeHead(404, {'Content-Type' : 'text/plain'});
    response.write('Error 404:resource not found.');
    response.end();
}

function sendFile(response, filePath, fileContents) {
    response.writeHead(
        200,
        {'Content-Type' : mime.lookup(path.basename(filePath))}
    );
    response.end(fileContents);
}

//发送静态文件
function serveStatic(response, cache, absPath) {
    //文件是否缓存
    if(cache[absPath]) {
        sendFile(response, absPath, cache[absPath]);
    } else {
        fs.exists(absPath, function(exists) {
            if(exists) {
                fs.readFile(absPath, function(err, data) {
                    if(err) {
                        send404(response);
                    } else {
                        cache[absPath] = data;
                        sendFile(response, absPath, data);
                    }
                });
            } else {
                send404(response);
            }
        });
    }
}

//启动服务器
var server = http.createServer(function(request, response) {
    var filePath = false;

    if(request.url == '/') {
        filePath = 'public/index.html';
    } else {
        filePath = 'public' + request.url;
    }

    var absPath = './' + filePath;
    serveStatic(response, cache, absPath);
});

server.listen(3000, function() {
    console.log('Server running at port 3000');
});
