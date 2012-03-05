var _ = require('underscore');
var calendar = require('./calendar');

var parse = function(mail) {
	var readings = {};
	if (mail.Attachments && mail.Attachments[0].ContentType.toLowerCase() === 'text/csv') {
		var raw = new Buffer(mail.Attachments[0].Content, 'base64').toString('ascii').split('\n');
		var vals = [];
		var start = false;

		for(var i in raw) {
			var first = raw[i].substring(0,1);
			
			if(start) {
				vals.push(raw[i]);					
			}

			if(first === 'R') {
				start = true;
			} else if(start && first != '"') {
				break;
			}
		}

		readings.data = _.compact(vals.map(function(row){
			var cells = row.split(',');
			
			if(cells.length !== 5) {
				return;
			}

			var timestamp = new Date((cells[0] + ',' + cells[1] + ' GMT').replace(/"/g,''))
			return {
				bg: cells[2], 
				timestamp: timestamp,
				dayId: calendar.dateId(timestamp),
				weekId: calendar.weekId(timestamp)
			}
		}));

		readings.unit = readings.data[0].bg > 32 ? 'mgdl' : 'mmoll';
	}
	return readings;
};
exports.parse = parse;