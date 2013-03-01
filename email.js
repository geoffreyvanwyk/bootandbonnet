var email = exports.email = require('emailjs').server.connect({
	user: "info@bootandbon.net",
	password: "GNU4tw!",
	host: "smtpout.secureserver.net",
	ssl: true
});