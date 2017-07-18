var http = require('http'),
    url = require('url'),
    fs = require('fs'),
    querystring = require('querystring');

var corsHeaders = {};
corsHeaders["Access-Control-Allow-Origin"] = "*";
corsHeaders["Access-Control-Allow-Headers"] = "X-Requested-With, Access-Control-Allow-Headers, Content-Type, Accept";

var aso = '../../public_html/data/';
var local = 'data/';
var preface = local;

var server = http.createServer().listen(3000);
//
server.on('request', function(request, response) {
    //make local and server require file for url changes
    //var pathname = url.parse(request.url).pathname;
    //var query = url.parse(request.url, true).query;
    if (request.method == 'GET') {
        var requestOptions =  url.parse(request.url, true);
        console.log('PathName: ' + requestOptions.pathname + " Query: " + JSON.stringify(requestOptions.query));
        if (requestOptions.pathname == '/loadChar') {
            var string = preface + requestOptions.query['user'] + '/' + requestOptions.query['url'] + '.json';
            fs.readFile(string, 'utf8', function (err, file) {
                if (err) {
                    if (err.code === 'ENOENT')
                        file = '';
                    else if (err.code !== 'ENOENT')
                        throw err;
                }
                response.writeHead(200, corsHeaders);
                response.end(file);
            });
        }
        else if (requestOptions.pathname == '/user') {
            console.log(preface + requestOptions.query['name'] + '/charList.json');
            fs.readFile(preface + requestOptions.query['name'] + '/charList.json', 'utf8', function (err, file) {
                if (err) {
                    if (err.code === 'ENOENT')
                        file = '';
                    else if (err.code !== 'ENOENT')
                        throw err;
                }
                response.writeHead(200, corsHeaders);
                response.end(file);
            });
        }
        else if (requestOptions.pathname == '/uid') {
            //test. to remove
            var uid = ("0000" + (Math.random()*Math.pow(36,4) << 0).toString(36)).slice(-4);
            response.writeHead(200, {'Content-type': 'text/plain'});
            response.end(uid);
            /*function generateUIDNotMoreThan1million() {
                return ("0000" + (Math.random()*Math.pow(36,4) << 0).toString(36)).slice(-4)
            }*/
        }
    }
    else if (request.method == 'OPTIONS') {
        response.writeHead(200, corsHeaders);
        response.end();
    }
    else if (request.method == 'POST') {
        // LOOK TO SEND INFO IN HEADERS!
        var postData = '';
        var decoded;
        request.on('data', function(chunk) {
            postData += chunk.toString();
        });
        request.on('end', function() {
            response.writeHead(200, 'OK', corsHeaders);
            response.end();
            decoded = JSON.parse(postData);

            fs.writeFile(preface + decoded['user'] + '/' + decoded['url'] + '.json', decoded['data'], 'utf8', function(err, file) {
                if (err) throw err;

            });
        });
    }
});