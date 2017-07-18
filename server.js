require('./config/enviornment');

const http = require('http');

const routes = require('./routes/routes');
const db = require('./db/mongo.js');

var server = http.createServer().listen(process.env.PORT, process.env.HOSTNAME);

console.log(`Server Running On: ${process.env.HOSTNAME}:${process.env.PORT}`);
db.connect();

server.on('request', (req, res) => {    
 
    console.log('Heard Request');
    routes(req, res, (error, result) => {   
        // for now just 404 if url doesn't have a route
        //console.log(`Error: ${error}, Result: ${result}`);
        console.log('About to respond to Request');
        if (error) {
            res.writeHead(404, {'Content-Type': 'text/html'});
            console.log(error);
            res.end();
        }
        // for now just print routes return result
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(`<H1>Your temp response</H1><h2>${result}</h2>`);
    });
});