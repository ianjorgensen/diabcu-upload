var server = require('router').create();
var buffoon = require('buffoon');

var readings = {};
var content = {};
var port = process.argv[2] || 9000;

server.get('/', function(request, response) {
	response.writeHead(200, {'content-type':'application/json'});
	response.end(JSON.stringify(readings, null, '\t'));
});

server.get('/readings', function(request, response) {
	response.writeHead(200, {'content-type':'application/json'});
	response.end(JSON.stringify(content, null, '\t'));
});

server.post('/upload', function(request, response) {
	buffoon.json(request, function(err, data) {
		readings = data;
		if (data.Attachments) {
			content = new Buffer(data.Attachments[0].Content, 'base64').toString('ascii');
		}

		response.writeHead(200);
		response.end('ok');
	});
});

server.all('*', function(request, response) {
	response.writeHead(404);
	response.end('404');
});

server.listen(port);
console.log('server running on port',port);

process.on('uncaughtException', function(err) { console.log(err.stack) });