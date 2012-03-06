var curly = require('curly');
var qs = require("querystring");

var credentials = {
	key: '25f9189f314bbd9f2e064e4d8c21306bb92777fd00e3e3b286bb0e815e9b99c',
	secret: '7364fb6509d41dbf9cfefc503bf2cef498943f269999e7b2b045f9e0d510b'
};

var query = {
	'oauth_callback':'http://auth.pubsub.io/auth/withings/accesstoken',
	'oauth_consumer_key': credentials.key,
	'oauth_nonce': 'f71972b1fa93b8935ccaf34ee02d765es7',
	'oauth_signature': credentials.secret,
	'oauth_signature_method': 'HMAC-SHA1',
	'oauth_timestamp': Date.now(),
	'oauth_version': '1.0'	
};


console.log('https://oauth.withings.com/account/request_token?' + qs.encode(query));
//curly.get('https://oauth.withings.com/account/request_token').query(query).json(console.log);