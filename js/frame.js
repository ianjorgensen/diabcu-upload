var values;
var criteria = {
	low: 4,
	high: 10.5,
	good: 0.18, // percentage of results that are bad
	ok: 0.35, 
	bad: 0.5
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
	
	if (!bad && !readings.length) {
		return -1;
	}

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
		$('#' + dayId).unbind('click');
		$('#' + dayId).click(function(){
			var message = '';

			if(readings.length) {
				message = new Date(readings[0].timestamp).toString().substring(0,15) + '\n\n';
			}

			for(var i = readings.length - 1; i >= 0; i--) {
				message += readings[i].bg + '    ' + new Date(readings[i].timestamp).toTimeString().substring(0,5) + '\n';
			}

			alert(message);
			return;
		});
	});
};

var load = function() {
	$.get('/jorgensen.ian@gmail.com/readings/day', function(readings) {
  	values = readings;
  	fill(readings, criteria);
	});
};

$(function() {
	load();
	setTimeout(load, 10000);
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