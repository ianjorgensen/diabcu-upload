var server = require('router').create();
var buffoon = require('buffoon');
var _ = require('underscore');
var aejs = require('async-ejs');
var common = require('common');

var file = require('./lib/file').file;
var data = require('./lib/dummy');
var calendar = require('./lib/calendar');
var diabcu = require('./lib/diabcu');
var db = require('./lib/data').connect('mongodb://root:root@staff.mongohq.com:10019/diabcu');

// move to crossmania
//var db = require('mongojs').connect('mongodb://root:root@staff.mongohq.com:10019/diabcu',['data']);
var postmark = require('postmark')('2bae114c-d0c9-4dbc-a55c-dd0f66f1c8d6');

var port = process.argv[2] || 9000;

var onerror = function(response) {
	return function(err) {
		response.writeHead(500);
		response.end(err.message);
	}
};
//todo: add logging to see what is happending
//todo: fix on error
server.get('/', function(request, response) {
	response.writeHead(200, {'content-type':'text/html'});	
	response.end('Send a mail from glooko app to upload@diabcu.com and you are done!');
});

server.post('/upload', function(request, response) {
	buffoon.json(request, function(err, mail) {
		var readings = diabcu.parse(mail);

		common.step([
			function(next) {
				db.save({'mail.From': mail.From}, {mail:mail, readings:readings}, next);
			},
			function(data) {
				postmark.send({
		        From: 'upload@diabcu.com', 
		        To: mail.From, 
		        Subject: 'Nice! Readings are flowing in', 
		        TextBody: 'You uploaded readings and we created a frame for you. Check it out http://www.diabcu.com/i' + data._id + '\nKeep them comming!'
    			});	

				response.writeHead(200);
				response.end('ok');
			}]
		,onerror(response));
	});
});

server.get('/upload/dummy', function(request, response) {
	var readings = diabcu.parse(data.mail);
	db.save({'mail.From': data.mail.From}, {mail:data.mail, readings:readings}, common.fork(onerror(response),
		function() {
			response.writeHead(200);
			response.end('ok');
		})
	);
});

server.get('/{id}/mail', function(request, response) {
	var query;
	if (request.params.id.indexOf('@') === -1)
		query = {'_id': request.params.id.slice(1)};
	else
		query = {'mail.From' : request.params.id};

	db.one(query, common.fork(onerror(response),
		function(data) {
			response.writeHead(200, {'content-type':'application/json'});
			response.end(JSON.stringify(data.mail, null, '\t'));		
		})
	);
});

server.get('/{id}/readings', function(request, response) {
	var query;
	if (request.params.id.indexOf('@') === -1)
		query = {'_id': request.params.id.slice(1)};
	else
		query = {'mail.From' : request.params.id};

	db.one(query, common.fork(onerror(response),
		function(data) {
			response.writeHead(200, {'content-type':'application/json'});
			response.end(JSON.stringify(data.readings.data, null, '\t'));		
		})
	);
});

server.get('/{id}/readings/day', function(request, response) {
	var query;
	if (request.params.id.indexOf('@') === -1)
		query = {'_id': request.params.id.slice(1)};
	else
		query = {'mail.From' : request.params.id};

	db.one(query, common.fork(onerror(response),
		function(data) {
			response.writeHead(200, {'content-type':'application/json'});
			response.end(JSON.stringify(data.readings.day, null, '\t'));		
		})
	);
});

server.get('/js/*', file('./js/{*}'));

server.get('/css/*', file('./css/{*}'));

server.get('/html/*', file('./html/{*}'));

server.get(/^\/([\w\s._]+@[\w\s._]+)/, function(request, response) {
	var id = request.params[1];

	common.step([
		function(next) {
			if (id.indexOf('@') === -1)
				db.one({'_id' : id}, next);
			else
				db.one({'mail.From' : id}, next);
		},
		function(data, next) {
			if (!data) {
				onerror(response)('no data');
				return;
			}
			aejs.renderFile('./html/frame.html', {days: calendar.table(_.last(Object.keys(data.readings.day)))}, next);
		},
		function(src) {
			response.writeHead(200, {'content-type':'text/html'});	
			response.end(src);
		}
	], onerror(response));
});

server.get('/i{id}', function(request, response) {
	common.step([
		function(next) {
			db.one({'_id' : request.params.id}, next);
		},
		function(data, next) {
			if (!data) {
				onerror(response)('no data');
				return;
			}
			aejs.renderFile('./html/frame.html', {days: calendar.table(_.last(Object.keys(data.readings.day)))}, next);
		},
		function(src) {
			response.writeHead(200, {'content-type':'text/html'});	
			response.end(src);
		}
	], onerror(response));
});

server.all('*', function(request, response) {
	response.writeHead(404);
	response.end('404');
});

server.listen(port);

console.log('server running on port',port);

process.on('uncaughtException', function(err) { console.log(err.stack) });