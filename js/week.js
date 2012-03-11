	var data;
	var days;
	var weeks;
	var target;
	var state = 'day';
	var viewChoice = {
		color: 'target',
		num: 'empty'
	};

	var actions = function() {
		$('#choice-view-day').click(function() {
			$('#legend').text('');
			if (state == 'day') {
				return;
			}
			state = 'day';
			load(data);	
		});
		$('#choice-view-week').click(function() {
			$('#legend').text('');
			if (state == 'week') {
				return;
			}
			state = 'week';
			load(data);
		});
		
		$('.slider-high').change(setTarget);
		$('.slider-low').change(setTarget);
		
		$('#options-day #choice-lows').click(function() {
			viewChoice.color = 'low';
			diabcu.update.days.color(days, target, 'low');
		});
		$('#options-day #choice-highs').click(function() {
			viewChoice.color = 'high';
			diabcu.update.days.color(days, target, 'high');
		});
		$('#options-day #choice-perfect').click(function() {
			viewChoice.color = 'perfect';
			diabcu.update.days.color(days, target, 'perfect');
		});
		$('#options-day #choice-target').click(function() {
			viewChoice.color = 'target';
			diabcu.update.days.fill(days, target);
		});

		$('#options-day #choice-num-low').click(function() {
			$('#legend').text('Number of low readings');
			viewChoice.num = 'low';
			diabcu.update.days.numbers(days, target, 'low');
		});
		$('#options-day #choice-num-high').click(function() {
			$('#legend').text('Number of high readings');
			viewChoice.num = 'high';
			diabcu.update.days.numbers(days, target, 'high');
		});
		$('#options-day #choice-num-percent').click(function() {
			viewChoice.num = 'percent';
			$('#legend').text('Percentage of readgins within range');
			diabcu.update.days.numbers(days, target, 'percentage');
		});
		$('#options-day #choice-num-count').click(function() {
			viewChoice.num = 'count';
			$('#legend').text('Number of readings');
			diabcu.update.days.numbers(days, target, 'count');
		});
		$('#options-day #choice-num-empty').click(function() {
			viewChoice.num = 'clean';
			$('#legend').text('');
			diabcu.update.days.numbers(days, target, 'clean');
		});
		$('#options-day #choice-num-date').click(function() {
			$('#legend').text('Date');
			viewChoice.num = 'date';
			diabcu.update.days.numbers(days, target, 'date');
		});

		/*$('#options-day #weightnum').click(function() {
			diabcu.update.days.numbers(days, target, 'weight');
		});*/
		$('#options-week #choice-num-week-empty').click(function() {
			viewChoice.num = 'clean';
			$('#legend').text('');
			diabcu.update.weeks.numbers(weeks, 'clean');
		});
		$('#options-week #choice-num-week-weight').click(function() {
			$('#legend').text('Avergae weight per week');
			viewChoice.num = 'weight';
			diabcu.update.weeks.numbers(weeks, 'weight');
		});
	};

	var zoom = function() {
		if(state === 'day') {
			diabcu.update.days.fill(days, target);
			return;
		}

		diabcu.update.weeks.fill(weeks, target);
	};
	var setTarget = function() {
		target = {
			low: parseFloat($('.slider-low').attr('value')),
			high: parseFloat($('.slider-high').attr('value'))
		};

		if(state === 'day') {
			switch(viewChoice.color) {
				case 'low':
				diabcu.update.days.color(days, target, 'low');
				break;
				case 'high':
				diabcu.update.days.color(days, target, 'high');
				break;
				case 'perfect':
				diabcu.update.days.color(days, target, 'perfect');
				break;
				default:
				diabcu.update.days.fill(days, target);
				break;
			};
			switch(viewChoice.num) {
				case 'low':
				diabcu.update.days.numbers(days, target, 'low');
				break;
				case 'high':
				diabcu.update.days.numbers(days, target, 'high');
				break;
				case 'percent':
				diabcu.update.days.numbers(days, target, 'percentage');
				break;
				case 'count':
				diabcu.update.days.numbers(days, target, 'count');
				break;
				case 'date':
				diabcu.update.days.numbers(days, target, 'date');
				break;
				default:
				diabcu.update.days.numbers(days, target, 'clean');
				break;
			};
			return;
		}
		switch(viewChoice.num) {
				case 'weight':
				diabcu.update.weeks.numbers(days, target, 'weight');
				break;
				default:
				diabcu.update.weeks.numbers(days, target, 'clean');
				break;
			};
		diabcu.update.weeks.fill(weeks, target);
	};
	
	var updateTargetMakup = function(target, unit) {
		$('.slider-low').attr('min','30');
		$('.slider-low').attr('max','360');
		$('.slider-low').attr('step','1');
		$('.slider-low').attr('value',target.low);

		$('.slider-high').attr('min','30');
		$('.slider-high').attr('max','360');
		$('.slider-high').attr('step','1');
		$('.slider-high').attr('value',target.high);
	};

	var load = function(result) {
		data = result;
		target = diabcu.criteria[result.unit];
		
		if (result.unit == 'mgdl') {
			updateTargetMakup(target, result.unit);	
		}
		
		$('#main').show();
		$('#loading').hide();
		$('#low').attr('value', target.low);
		$('#high').attr('value', target.high);

		if(state === 'day') {
			loadDays(result);
			return;
		}
		loadWeeks(result);
	};

	var loadWeeks = function(result) {
		$('#weeks').show();
		$('#days').hide();
		$('#options-day').hide();
		$('#options-week').show();

		var weeksGroup = _.groupBy(result.data, function(reading) {
			return reading.weekId;
		});
		weeks = weeksGroup;

		var dots = diabcu.weeks(weeksGroup, target);

		$('#weeks .frame').html('');
		$.each(dots, function(i,dot) {
			$('#weeks .frame').append(dot);
		});
	};

	var loadDays = function(result) {
		$('#weeks').hide();
		$('#days').show();
		$('#options-day').show();
		$('#options-week').hide();
		
		var daysGroup = _.groupBy(result.data, function(reading) {
			return reading.dayId;
		});
		days = daysGroup;

		var dots = diabcu.days(daysGroup, target);

		$('#days .frame').html('');
		$.each(dots, function(i,dot) {
			$('#days .frame').append(dot);
		});

		$('.data').unbind('click');
		$('.data').click(function(e) {
			var id = e.currentTarget.id;
			$.modal(diabcu.details.day(days[id], target), {overlayClose: true});
		});
	};

	$(function() {
		state = 'day';
		$.get('/' + window.location.pathname.split('/')[1] + '/readings', load);
		actions();
	});