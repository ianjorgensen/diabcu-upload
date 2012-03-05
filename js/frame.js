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
	good: 0.25, // percentage of results that are bad
	bad: 0.5
};
var colors = {
	good: '#9BD99B',
	ok: '#FEEDA5',
	bad: '#FF9794',
	today: '#ADADFF',
	empty: '#DEE4F2',
	high: 'pink',
	blank: 'white'
};

var addDay = function(date, days) {
	return new Date(date.getTime() + (days || 0)*24*60*60*1000);
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

// lows highs perfects 
var num = function(readings, criteria, type) {
	$.each(readings, function(dayId,readings) {
		var rango = range(criteria, readings[0]);

		if (type === 'percentage') {
			$('#' + dayId + ' .num').text(100 - parseInt(judge(readings, rango) * 100));	
			return;
		}
		if (type === 'count') {
			$('#' + dayId + ' .num').text(readings.length);	
			return;
		}
		if (type === 'low') {
			var count = 0;
			for(var i in readings) {
				var reading = readings[i];

				if(reading.bg < rango.low) {
					count += 1;
				}
			}
			$('#' + dayId + ' .num').text(count);	
			return;
		}
		if (type === 'high') {
			var count = 0;
			for(var i in readings) {
				var reading = readings[i];

				if(reading.bg > rango.high) {
					count += 1;
				}
			}
			$('#' + dayId + ' .num').text(count);	
			return;
		}
		$('#' + dayId + ' .num').text('');	
	});
};

/*todo add different choice of numbers in bubbles, number of lows or highs, 
number of readings taken, 
average, 
swings i.e. standard deviation, 
percentage within range.*/

var color = function(readings, criteria) {
	if(!readings) {
		$('#' + dayId).css({'background': colors.blank});
		$('#' + dayId).css({'border-color': colors.blank});
		return;
	}

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

};

var showweek = function(weeks,criteria) {
	var day = new Date();
	var prev = new Date();
	var week = [];
	var last = Object.keys(weeks).splice(-1);

	$('.dot').css({'background': colors.blank});
	$('.dot').css({'border-color': colors.blank});

	while(true) {
		prev = day;
		day = addDay(day, -1);

		if (day.getDay() > prev.getDay()) {
			weeks[dateId(day)] = week;
			week = [];
		}

		if (readings[dateId(day)]) {
			week.push(readings[dateId(day)]);
		}

		if (last == dateId(day)) {
			break;
		}
	}

	for(var day in weeks) {
		var week = weeks[day];

		if (week.length) {
			weeks[day] = color(day, week[day], criteria);
			$('#' + day).css({'background': color});
			$('#' + day).css({'border-color': color});			
		}

		// readch to wednesday
	}
};

var brush = function(veredict, criteria) {
	console.log(veredict);
	if (veredict >= criteria.bad) {
		return colors.bad;
	} 
	if (veredict >= criteria.good) {
		return colors.ok;
	}
	return colors.good;
};

var fill = function(readings, criteria) {
	if (state !== 'fill') {
		lows(readings,criteria, state);
		return;
	};

	$('#' + dateId(new Date())).css({'border-color': colors.today});
	
	$.each(readings, function(dayId,readings) {
		var veredict = judge(readings, range(criteria, readings[0]));
		var color = brush(veredict, criteria);

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
	$.get(window.location.pathname + '/readings', function(data) {
  	values = data.data;
  	
  	values.days = _.groupBy(values, function(reading) {
			return reading.dayId;
		});

		values.weeks = _.groupBy(values, function(reading) {
			return reading.weekId;
		});
		console.log(values.days);

  	fill(values.days, criteria);
  	uno = true;
	});
};

$(function() {
	load();
	
	$('#set').click(target);
	$('#lows').click(function() {
		lows(values.days, criteria);
	});
	$('#highs').click(function() {
		lows(values.days, criteria, 'highs');
	});
	$('#perfects').click(function() {
		lows(values.days, criteria, 'perfect');
	});
	$('#colors').click(function() {
		state = 'fill';
		fill(values.days, criteria);
	});
	$('#lowsnum').click(function() {
		num(values.days,criteria,'low');
	});
	$('#highsnum').click(function() {
		num(values.days,criteria,'high');
	});
	$('#percentagenum').click(function() {
		num(values.days,criteria,'percentage');
	});
	$('#countnum').click(function() {
		num(values.days,criteria,'count');
	});
	$('#plainnum').click(function() {
		num(values.days,criteria,'');
	});

	setTimeout(load, 10000);
});

window.addEventListener("load",function() {
  setTimeout(function(){
    window.scrollTo(0, 1);
  }, 0);
});
//fill(values,{low: 3.5,high: 10.5,good: 0.15,ok: 0.3,bad: 0.5});