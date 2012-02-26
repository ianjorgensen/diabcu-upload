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

var colors = {
	good: '#9BD99B',
	ok: '#FEEDA5',
	bad: '#FF9794',
	today: '#ADADFF'
};

var fill = function(readings, criteria) {
	$('#' + dateId(new Date())).css({'border-color': colors.today});
	$.each(readings, function(dayId,readings) {
		var veredict = judge(readings, criteria);
		var color = colors.good;

		if(veredict >= criteria.bad) {
			color = colors.bad;
		}
		if(veredict >= criteria.ok && veredict < criteria.bad) {
			color = colors.ok;
		}

		$('#' + dayId).css({'background': color});
		$('#' + dayId).css({'border-color': color});
		
	});
}

$(function() {
	$.get('/jorgensen.ian@gmail.com/readings/day', function(readings) {
  	values = readings;
  	fill(readings, criteria);
	});
});

// When ready...
window.addEventListener("load",function() {
  // Set a timeout...
  setTimeout(function(){
    // Hide the address bar!
    window.scrollTo(0, 1);
  }, 0);
});
//fill(values,{low: 3.5,high: 10.5,good: 0.15,ok: 0.3,bad: 0.5});