exports.connect = function(host) {
	var db = require('mongojs').connect(host,['data']);
	
	var many = function(data, options, callback) {
		if (!callback) {
			callback = options;
			options = {};
		}

		db.data.find(data, options, callback);
	};

	var one = function(data, options, callback) {
		if (!callback) {
			callback = options;
			options = {};
		}

		db.data.findOne(data, options, callback);
	};

	var save = function(query, data, callback) {
		if (!callback) {
			callback = data;
			data = query;
			query = null;
		}

		if (!query) {
			db.data.save(data, callback);
			return;
		}

		db.data.update(query, data, {upsert:true}, callback);
	};

	return {
		save: save,
		one: one,
		many: many,
		close: function() {
			db.close();
		}
	}
};