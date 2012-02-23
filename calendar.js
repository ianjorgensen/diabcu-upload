var dateId = function(date) {
	return date.getDate() + '-' + date.getMonth() + '-' + date.getFullYear();
};
exports.dateId = dateId;

var addDay = function(date, days) {
	return new Date(date.getTime() + (days || 0)*24*60*60*1000);
};
exports.addDay = addDay;

var table = function(stop) {
	var date = new Date();
	var script = '<link rel="stylesheet" type="text/css" href="/style.css" />';
	script += '<script src="/jquery.js" ></script><script src="/frame.js"></script>';

	var rows = '';
	// add missing part of this week
	while(true) {
		if (date.getDay() === 0) break;
		date = addDay(date, 1);	
	}
	// rest
	while(true) {
		var row = '';
		var bail = false;

		for (var i = 0; i < 7; i++) {
			if (dateId(date) === stop) bail = true;

			row += '<td id="' + dateId(date) + '"></td>'; 

			date = addDay(date, -1);
		}
		rows += '<tr>' + row + '</tr>';

		if(bail) break;
	}
	return '<html><head><title>frame</title>' + script + '</head><body><table>' + rows + '</table></body></html>';	
}
exports.table = table;