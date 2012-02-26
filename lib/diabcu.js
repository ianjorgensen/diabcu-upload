var _ = require('underscore');
var calendar = require('./calendar');

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
exports.parse = parse;