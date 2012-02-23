var values;
var criteria = {
	low: 3.5,
	high: 11,
	good: 0.18, // percentage of results that are bad
	ok: 0.35, 
	bad: 0.6
};

var dateId = function(date) {
	return date.getDate() + '-' + date.getMonth() + '-' + date.getFullYear();
};
var judge = function(readings, criteria) {
	var bad = 0;
	//console.log(readings);
	$.each(readings, function(i,reading) {
		if(reading.bg > criteria.high || reading.bg < criteria.low) {
			bad = bad + 1;
		}
	});
	
	return bad/readings.length;
};
var fill = function(readings, criteria) {
	$('#' + dateId(new Date())).css({'background': 'blue'});
	$.each(readings, function(dayId,readings) {
		var veredict = judge(readings, criteria);
		var color = 'green';

		if(veredict >= criteria.bad) {
			color = 'red';
		}
		if(veredict >= criteria.ok && veredict < criteria.bad) {
			color = 'yellow';
		}

		$('#' + dayId).css({'background': color});
	});
}

$(function() {
	$.get('/readings/day', function(readings) {
  	values = readings;
  	console.log(readings);
  	console.log(values);
  	fill(readings, criteria);
	});
});
//fill(values,{low: 3.5,high: 10.5,good: 0.15,ok: 0.3,bad: 0.5});