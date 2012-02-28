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
var target = function() {
	criteria.target = {low: parseFloat($('#low').attr('value')), high: parseFloat($('#high').attr('value'))};
	fill(values, criteria);
	return false;
};
var dateId = function(date) {
	return date.getDate() + '-' + date.getMonth() + '-' + date.getFullYear();
};
var judge = function(readings, range) {
	var bad = 0;
	
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
	today: '#ADADFF',
	empty: '#DEE4F2',
	high: 'pink'
};
var range = function(criteria, reading) {
	if(!uno && reading.bg > 32) {
		$('#low').attr('value', 4 * 18);
		$('#high').attr('value', parseInt(10.5 * 18));
	}

	var range = criteria.mmoll;
	if (reading.bg > 32)
		range = criteria.mgdl;
	if (criteria.target)
		range = criteria.target;
	return range;
};
var fill = function(readings, criteria) {
	if (state !== 'fill') {
		lows(readings,criteria, state);
		return;
	};

	$('#' + dateId(new Date())).css({'border-color': colors.today});
	
	$.each(readings, function(dayId,readings) {
		var veredict = judge(readings, range(criteria, readings[0]));
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

var state = 'fill';

var lows = function(readings, criteria, high) {
	state = high;
	$('#' + dateId(new Date())).css({'border-color': colors.today});
	console.log('i');
	$.each(readings, function(dayId,readings) {
		var color = colors.empty;
		var bad = 0;
		var mal = range(criteria, readings[0]);

		$.each(readings, function(i,reading) {
			if(high && high === 'perfect') {
				if(reading.bg > mal.high || reading.bg < mal.low) {
					bad = bad + 1;
				}
				return;
			}
			if(high) {
				if(reading.bg > mal.high) {
					bad = bad + 1;
				}
				return;
			}
			if(reading.bg < mal.low) {
				bad = bad + 1;
			}
		});

		if(!bad && high && high === 'perfect') {
			color = colors.good;
		}
		else if(bad && state == 'highs') {
			color = colors.high;
		} else if(bad && !state) {
			color = colors.today;
		}

		if(color == colors.empty) {
			$('#' + dayId).css({'background': 'white'});	
		} else {
			$('#' + dayId).css({'background': color});	
		}
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

var uno = false;
var load = function() {
	$.get('/jorgensen.ian@gmail.com/readings/day', function(readings) {
  	values = readings;
  	fill(readings, criteria);
  	uno = true;
	});
};

$(function() {
	load();
	$('#set').click(target);
	$('#lows').click(function() {
		lows(values, criteria);
	});
	$('#highs').click(function() {
		lows(values, criteria, 'highs');
	});
	$('#perfects').click(function() {
		lows(values, criteria, 'perfect');
	});
	$('#colors').click(function() {
		state = 'fill';
		fill(values, criteria);
	});
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