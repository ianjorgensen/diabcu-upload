var _ = require('underscore');
var calendar = require('./calendar');

var parse = function(mail) {
	var readings = {};
	if (mail.Attachments && mail.Attachments[0].ContentType.toLowerCase() === 'text/csv') {
		readings.raw = new Buffer(mail.Attachments[0].Content, 'base64').toString('ascii').split('\n');
		
		var vals = [];
		var start = false;

		for(var i in readings.raw) {
			var first = readings.raw[i].substring(0,1);
			
			if(start) {
				vals.push(readings.raw[i]);					
			}

			if(first === 'R') {
				console.log(first);
				start = true;
			} else if(start && first != '"') {
				console.log(first);
				break;
			}
		}

		readings.raw = vals;

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
exports.parse = parse;