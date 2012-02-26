var common = require('common');
var fs = require('fs');
var path = require('path');
var mime = require('mime');

var file = function(location, options) {
	options = options || {};
	options.status = options.status || 200;
	
	return function(request, response) {
		var url = common.format(location, request.params);

		var onnotfound = function() {
			response.writeHead(404);
			response.end();
		};

		if (/\/\.\.\//.test(url)) { // security check
			onnotfound();
			return;
		}
		
		fs.stat(url, common.fork(onnotfound, function(stat) {
			var headers = {
				'content-type':mime.lookup(url),
				'content-length':stat.size,
				'date':new Date().toUTCString(),
				'last-modified':stat.mtime.toUTCString()
			};
			
			if (options.cacheMaxAge !== undefined) {
				headers['cache-control'] = 'public, max-age=' + options.cacheMaxAge;
			}
			
			response.writeHead(options.status, headers);
			fs.createReadStream(url).pipe(response);
		}));
	};
};
exports.file = file;