exports.connect = function(host) {
	var db = require('mongojs').connect(host,['ladata']);
	
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

		db.ladata.find(query, options, callback);
	};

	var one = function(query, options, callback) {
		query = objectify(query);

		if (!callback) {
			callback = options;
			options = {};
		}

		db.ladata.findOne(query, options, callback);
	};

	var save = function(query, data, callback) {
		if (!callback) {
			callback = data;
			data = query;
			query = null;
		}

		if (!query) {
			db.ladata.save(data, callback);
			return;
		}

		db.ladata.update(query, data, {upsert:true}, function(err, data) {
			if(err) {
				callback(err);
			}
			db.ladata.findOne(query, {id:1}, callback);
		});
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