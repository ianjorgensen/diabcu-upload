var common = require('common');

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
	var today = date;
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

			var time = '';
			if (today == date) {
				time = 'today';
			}
			if (date > today) {
				time = 'future';
			}

			row += common.format("<div class='day {2}'><div class='dot {0}' id='{1}'></div></div>",time,dateId(date), i==0 ? 'first': '');

			date = addDay(date, -1);
		}
		rows += row + "<div class='clear'></div>";

		if(bail) break;
	}
	return rows;	
}
exports.table = table;