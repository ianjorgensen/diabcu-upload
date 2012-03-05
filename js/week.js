
	var diabcu = (function() {
		var range;
		var criteria = {
			mmoll: {low: 4,high: 10.5},
			mgdl: {low: 4 * 18, high: 10.5 * 18},
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
			console.log(veredict);
			if (veredict >= criteria.bad) {
				return colors.bad;
			} 
			if (veredict >= criteria.good) {
				return colors.ok;
			}
			return colors.good;
		};

		var compute = function(readings, unit) {
			var bad = 0;
			
			$.each(readings, function(i,reading) {
				if(reading.bg > criteria[unit].high || reading.bg < criteria[unit].low) {
					bad = bad + 1;
				}
			});
			
			if (!bad && !readings.length) {
				return -1;
			}

			return bad/readings.length;
		};

		var week = function(weekId, color) {
			return format('<div class="week" id="{0}" style="background: {1}; border-color: {1}"></div>', weekId, color);
		};

		var weeks = function(weeks, unit) {
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
				var color = brush(compute(readings, unit));
				
				dots.push(week(id, color));
			});

			return dots;
		};

		var day = function(date, color) {
			var today = new Date();
			var time = 'past';

			if (today == date) {
				time = 'today';
			}
			if (date > today) {
				time = 'future';
			}

			return format("<div class='day {2}'><div class='dot {0}' id='{1}' style='background: {3}; border-color: {3}'><div class='num'></div></div></div>",time,getDayId(date), '', color)
		};

		var days = function(days, unit) {
			var date = getMonday(new Date());
			var keys = Object.keys(days);
			var stop = keys[keys.length -1];
			var dots = [];

			while(true) {
				var bail = false;

				for (var i = 0; i < 7; i++) {
					var id = getDayId(date);
					var color = colors.empty;

					if (id === stop) bail = true;
					if(days[id]) {
						color = brush(compute(days[id], unit));
					}

					dots.push(day(date, color));

					date = addDay(date, -1);
				}
				dots.push("<div class='clear'></div>");

				if(bail) break;
			}
			return dots;	
		}

		return {
			weeks: weeks,
			days: days,
			colors: colors
		};
	})();