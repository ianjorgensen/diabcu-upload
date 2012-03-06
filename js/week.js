var diabcu = (function() {
	var range;
	var criteria = {
		mmoll: {low: 4,high: 10.5},
		mgdl: {low: 4 * 18, high: 10.5 * 18}
	};
	var jury = {
		good: 0.18, // percentage of results that are bad
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

	var brush = function(veredict) {
		if (veredict >= jury.bad) {
			return colors.bad;
		} 
		if (veredict >= jury.good) {
			return colors.ok;
		}
		return colors.good;
	};

	var compute = function(readings, target) {
		var bad = 0;
		
		$.each(readings, function(i,reading) {
			if(reading.bg > target.high || reading.bg < target.low) {
				bad = bad + 1;
			}
		});
		
		if (!bad && !readings.length) {
			return -1;
		}

		return bad/readings.length;
	};

	var paint = function(element, core, border) {
		$(element).css({'background': core});
		$(element).css({'border-color': border || core});
	};

	// todo: add real data from wiithings and hide it for now in production
	var weights = [
		{weight: 80, timestamp: new Date()},
		{weight: 79.1, timestamp: addDay(new Date(),-7)},
		{weight: 81.2, timestamp: addDay(new Date(),-21)},
		{weight: 82, timestamp: addDay(new Date(),-28)},
		{weight: 78, timestamp: addDay(new Date(),-35)},
		{weight: 76, timestamp: addDay(new Date(),-42)},
		{weight: 79, timestamp: addDay(new Date(),-49)},
		{weight: 81.5, timestamp: addDay(new Date(),-56)},
		{weight: 82.1, timestamp: addDay(new Date(),-63)},
		{weight: 80.3, timestamp: addDay(new Date(),-70)}
	];

	var getWeekWeight = function(id, day) {
		var g = _.groupBy(weights, function(reading) {
			if(day) {
				return getDayId(reading.timestamp);	
			}
			return getWeekId(reading.timestamp);
		});

		if(!g[id]) {
			return;
		}

		var total = 0;
		$.each(g[id], function(i, reading) {
			total += reading.weight;
		});
		return total/g[id].length;
	};

	var week = function(weekId, color, border) {
		if (weekId == getWeekId(new Date())) {
			border = colors.today;
		}

		return format('<div class="week" id="{0}" style="background: {1}; border-color: {2}"><div class="num"></div></div>', weekId, color, border || color);
	};

	var dayDetails = function(readings) {
		var message = '';

		if(readings.length) { 
			message = new Date(readings[0].timestamp).toUTCString().substring(0,16) + '<br><br>';
		}

		for(var i = readings.length - 1; i >= 0; i--) {
			message += format('<div id="bg">{0}</div><div id="time">{1}</div><div class="clear"></div>',readings[i].bg,new Date(readings[i].timestamp).toTimeString().substring(0,5));
		}

		return message;
	};

	var day = function(date, color, empty) {
		var today = new Date();
		var time = 'past';

		if (getDayId(today) == getDayId(date)) {
			time = 'today';
		} else if (date > today) {
			time = 'future';
		}

		if (!empty) {
			time += ' data';
		}

		return format("<div class='day {2}'><div class='dot {0}' id='{1}' style='background: {3}; border-color: {3}'><div class='num'></div></div></div>",time,getDayId(date), '', color);
	};

	var weeks = function(weeks, target) {
		var dots = [];

		var date = new Date();
		while(1) {
			var id = getWeekId(date);

			if(Object.keys(weeks)[0] == id) {
				break;
			}
			
			dots.push(week(id, colors.empty));
			date = addDay(date, -7);
		}

		$.each(weeks, function(id,readings) {
			var color = brush(compute(readings, target));
			
			dots.push(week(id, color));
		});

		return dots;
	};

	var days = function(days, target) {
		var date = addDay(getMonday(new Date()),6);
		var keys = Object.keys(days);
		var stop = keys[keys.length -1];
		var dots = [];

		while(true) {
			var bail = false;

			var week = [];
			for (var i = 0; i < 7; i++) {
				var id = getDayId(date);
				var color = colors.empty;

				if (id === stop) bail = true;
				
				if(days[id]) {
					week.push(day(date, brush(compute(days[id], target))));
				} else {
					week.push(day(date, color.empty, true));	
				}

				date = addDay(date, -1);
			}
			dots = dots.concat(week.reverse());
			dots.push("<div class='clear'></div>");

			if(bail) break;
		}
		return dots;	
	};

	var update = {
		weeks : {
			fill: function(weeks, target) {	
				var today = getWeekId(new Date());
				$.each(weeks, function(id,readings) {
					var color = brush(compute(readings, target));
					paint('#'+id, color, today == id ? colors.today : color);
				});
			},
			numbers: function(weeks,state) {
				var num = '';

				$.each(weeks, function(id, readings) {
					if(state == 'weight') {
						var weight = getWeekWeight(id);	
						num = weight ? weight.toString().substring(0,2) : '';
					}
					$('#' + id + ' .num').text(num);
				});
			}
		},
		days : {
			fill: function(days, target) {
				var today = getDayId(new Date());
				$.each(days, function(id,readings) {
					var color = brush(compute(readings, target));
					paint('#'+id, color, today == id ? colors.today : color);
				});
			},
			numbers: function(days, target, state) {
				$.each(days, function(id, readings) {
					var num = '';
					switch(state) {
						case 'percentage':
						num = 100 - parseInt(compute(readings, target) * 100);					
						break;
						case 'count':
						num = readings.length;
						break;
						case 'date':
						num = id.split('-')[0];
						break;
						case 'weight':
						var weight = getWeekWeight(id, true);	
						num = weight ? weight.toString().substring(0,2) : '';
						break;
						case 'low':
						var count = 0;
						$.each(readings, function(i, reading) {
							if(reading.bg < target.low) {
								count += 1;
							}
						});
						num = count;
						break;
						case 'high':
						var count = 0;
						$.each(readings, function(i, reading) {
							if(reading.bg > target.high) {
								count += 1;
							}
						});
						num = count;
						break;
					}
					$('#' + id + ' .num').text(num);	
				});
			},
			color: function(days, target, state) {
				paint('.data,.dot', colors.blank, colors.empty);
				if(state == 'perfect') {
					paint('.dot,.data',colors.good, colors.good);
				}

				$.each(days, function(id,readings) {
					$.each(readings, function(i,reading) {
						switch(state) {
							case 'high':
							if (reading.bg > target.high) {
								paint('#'+id, colors.high);
								break;
							}
							break;
							case 'low':
							if (reading.bg < target.low) {
								paint('#'+id, colors.today);
								break;
							}
							break;
							case 'perfect':
							if (reading.bg < target.low || reading.bg > target.high) {
								paint('#'+id, colors.blank, colors.empty);
								break;
							}
							break;
						}
					});
				});
			}
		}
	}

	return {
		weeks: weeks,
		days: days,
		details: {
			day : dayDetails
		},
		update: update,
		colors: colors,
		criteria: criteria
	};
})();