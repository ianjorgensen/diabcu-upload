var db = require('./lib/data').connect('mongodb://root:root@staff.mongohq.com:10019/diabcu');
var diabcu = require('./lib/diabcu');

db.one({'mail.From':'shilpa@glooko.com'}, function(err,data) {	
	var mail = data.mail;
	var readings = diabcu.parse(data.mail);
	db.save({'mail.From': mail.From}, {mail:mail, readings:readings}, console.log);
})