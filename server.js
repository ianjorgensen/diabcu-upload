var server = require('router').create();
var buffoon = require('buffoon');
var _ = require('underscore');
var file = require('./file').file;
var data = require('./data');
var calendar = require('./calendar');

var port = process.argv[2] || 9000;
var email = {};
var readings = {};

var parse = function(mail) {
	var readings = {};
	if (mail.Attachments && mail.Attachments[0].ContentType.toLowerCase() === 'text/csv') {
		readings.raw = new Buffer(mail.Attachments[0].Content, 'base64').toString('ascii').split('\n');
		
		readings.data = _.compact(readings.raw.map(function(row){
			var cells = row.split(',');
			
			if(cells.length !== 5) {
				return;
			}

			return {
				timestamp: new Date((cells[0] + ',' + cells[1] + ' GMT').replace(/"/g,'')),
				bg: cells[2] 
			}
		}));

		readings.day = _.groupBy(readings.data, function(reading) {
			return calendar.dateId(reading.timestamp);
		});

	}
	return readings;
};

server.get('/', function(request, response) {
	response.writeHead(200, {'content-type':'application/json'});
	response.end(JSON.stringify(email, null, '\t'));
});
server.get('/readings', function(request, response) {
	response.writeHead(200, {'content-type':'application/json'});
	response.end(JSON.stringify(readings.data, null, '\t'));
});
server.get('/readings/day', function(request, response) {
	response.writeHead(200, {'content-type':'application/json'});
	response.end(JSON.stringify(readings.day, null, '\t'));
});
server.get('/frame', function(request, response) {
	response.writeHead(200, {'content-type':'text/html'});
	var table = calendar.table(_.last(_.keys(readings.day)));
	response.end(table);
});
server.get('/jquery.js', file('./jquery.js'));
server.get('/frame.js', file('./frame.js'));
server.get('/style.css', file('./style.css'));
server.post('/upload', function(request, response) {
	buffoon.json(request, function(err, mail) {
		this.mail = mail;
		readings = parse(mail);
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

email = data.mail;
readings = parse(email);

process.on('uncaughtException', function(err) { console.log(err.stack) });