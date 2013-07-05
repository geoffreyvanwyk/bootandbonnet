var email = require('emailjs');

// var server = email.server.connect({
// 	user: "info@bootandbon.net",
// 	password: "GNU4tw!",
// 	host: "smtpout.secureserver.net",
// 	ssl: true
// });

var server = email.server.connect({
	user: 'geoffrey.van.wyk@gmail.com',
	password: 'Salvation@7',
	host: 'smtp.gmail.com',
	ssl: true
});

module.exports = {
	server: server 
};