var http = require('http');
var url = require('url');
var fs = require('fs');
var getTestSuite = require('./js/sim/relationComputer.test')

http.createServer(function (req, res) {
    var q = url.parse(req.url, true);
    if (q.path.startsWith('/test')) {
        debugTest();
    }
    if (q.path === '/') {
        createContent(res, 'text/html', 'index.html');
    }
    else if (q.path.endsWith('.js')) {
        createContent(res, 'javascript', `.${q.pathname}`);
    }
}).listen(8080);

function createContent(res, contentType, fileName) {
    fs.readFile(fileName, function (err, data) {
        if (err) {
            res.writeHead(404, { 'Content-Type': contentType });
            return res.end("404 Not Found");
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(data);
        return res.end();
    });
}

function debugTest() {
    const testSuite = getTestSuite();
    testSuite.testFourIndividuals();
}
