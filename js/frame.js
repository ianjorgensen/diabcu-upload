var values;
var criteria = {
	mmoll : {
		low: 4,
		high: 10.5	
	},
	mgdl : {
		low: 4 * 18,
		high: 10.5 * 18	
	},
	good: 0.18, // percentage of results that are bad
	ok: 0.35, 
	bad: 0.5
};
//mg/dl = 18 × mmol/l

var dateId = function(date) {
	return date.getDate() + '-' + date.getMonth() + '-' + date.getFullYear();
};
var judge = function(readings, criteria) {
	var bad = 0;
	
	var range = criteria.mmoll;
	if (readings[0].bg > 32)
		range = criteria.mgdl;
	
	//console.log(readings);
	$.each(readings, function(i,reading) {
		if(reading.bg > range.high || reading.bg < range.low) {
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
	
	var criteria = 
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
				message = new Date(readings[0].timestamp).toUTCString().substring(0,15) + '\n\n';
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