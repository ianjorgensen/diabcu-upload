exports.connect = function(host) {
	var db = require('mongojs').connect(host,['data']);
	
	var objectify = function(query) {
		if (query['_id']) {
			query['_id'] = db.ObjectId(query['_id']);
		}

		return query;
	};

	var many = function(query, options, callback) {
		query = objectify(query);

		if (!callback) {
			callback = options;
			options = {};
		}

		db.data.find(query, options, callback);
	};

	var one = function(query, options, callback) {
		query = objectify(query);

		if (!callback) {
			callback = options;
			options = {};
		}

		db.data.findOne(query, options, callback);
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