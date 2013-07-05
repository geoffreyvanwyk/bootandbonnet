var sanitizer = require('sanitizer');

function wrapSanitizer(userInputString) {
	return sanitizer.escape(sanitizer.sanitize(userInputString));
}

module.exports = {
	sanitize: wrapSanitizer
};