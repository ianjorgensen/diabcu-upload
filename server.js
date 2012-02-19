var server = require('router').create();
var buffoon = require('buffoon');

var readings = {};
var port = process.argv[2] || 9000;

server.post('/upload', function(request, response) {
	buffoon.json(request, function(err, data) {
		readings = data;
		console.log(new Buffer("SGVsbG8gV29ybGQ=", 'base64').toString('ascii'))
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