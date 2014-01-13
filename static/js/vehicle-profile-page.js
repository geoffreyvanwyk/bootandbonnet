/*jshint browser: true*/
/*jshint strict: true*/
/*jshint jquery: true*/

$(window).load(function () {
	'use strict';

/* BUYER NAME */

	var MAX_NAME_LENGTH = 50;
	var MIN_NAME_LENGTH = 3;

	var nameLength = function () {
		return $('#buyerName').val().split(/\s/).join('').length;
	};

	var isBuyerNameProvided = function () {
		return nameLength() >= MAX_NAME_LENGTH && nameLength() <= MAX_NAME_LENGTH;
	};

	var setBuyerNameValidationState = function (state) {
		if (nameLength() === 0) {
			$('#divBuyerName').attr('class', 'control-group '.concat(state));
			$('#spanBuyerName').text('Please provide a name.');
		} else if (nameLength() > 0 && nameLength() < MIN_NAME_LENGTH) {
			$('#divBuyerName').attr('class', 'control-group '.concat(state));
			$('#spanBuyerName').text('The name should contain at least three letters.');
		} else if (nameLength() >= MIN_NAME_LENGTH && nameLength() <= MAX_NAME_LENGTH) {
			$('#divBuyerName').attr('class', 'control-group');
			$('#spanBuyerName').text('');
		} else if (nameLength() > MAX_NAME_LENGTH) {
			$('#divBuyerName').attr('class', 'control-group '.concat(state));
			$('#spanBuyerName').text(
				'The name exceeds the maximum name length by '
				.concat(nameLength() - MAX_NAME_LENGTH)
				.concat(' letters')
			);
		}
	};

	$('#buyerName').on({
		blur: function () {
			if (nameLength() === 0) {
				$('#divBuyerName').attr('class', 'control-group');
				$('#spanBuyerName').text('');
			} else {
				setBuyerNameValidationState('warning');
			}
		}
	});

/* BUYER MESSAGE */

	var MIN_MESSAGE_LENGTH = 15;
	var MAX_MESSAGE_LENGTH = 500;

	var messageLength = function () {
		return $('#buyerMessage').val().split(/\s/).join('').length;
	};

	var isBuyerMessageProvided = function () {
		return messageLength() >= MIN_MESSAGE_LENGTH && messageLength() <= MAX_MESSAGE_LENGTH;
	};

	var setBuyerMessageValidationState = function (state) {
		var clearState = state || 'info';  // When there are no characters in the text area.
		var textState = state || 'warning'; // When there are some text in the text area.
		if (messageLength() === 0) {
			$('#divBuyerMessage').attr('class', 'control-group '.concat(clearState));
			$('#spanBuyerMessage').text(
				'Minimum length: '
				.concat(MIN_MESSAGE_LENGTH)
				.concat(' characters.')
			);
		} else if (messageLength() > 0 && messageLength() < MIN_MESSAGE_LENGTH) {
			$('#divBuyerMessage').attr('class', 'control-group '.concat(textState));
			$('#spanBuyerMessage').text(
				'Type '
				.concat(MIN_MESSAGE_LENGTH - messageLength())
				.concat(' more characters.')
			);
		} else if (messageLength() >= MIN_MESSAGE_LENGTH && messageLength() <= MAX_MESSAGE_LENGTH) {
			$('#divBuyerMessage').attr('class', 'control-group info');
			$('#spanBuyerMessage').text('Remaining characters: '.concat(MAX_MESSAGE_LENGTH - messageLength()));
		} else if (messageLength() > MAX_MESSAGE_LENGTH) {
			$('#divBuyerMessage').attr('class', 'control-group '.concat(textState));
			$('#spanBuyerMessage').text(
				'Please reduce your message by '
				.concat(messageLength() - MAX_MESSAGE_LENGTH)
				.concat(' characters.')
			);
		}
	};

	$('#buyerMessage').on({
		focus: function () {
			setBuyerMessageValidationState();
		},
		keyup: function () {
			setBuyerMessageValidationState();
		},
		blur: function () {
			if (messageLength() === 0 || isBuyerMessageProvided()) {
				$('#divBuyerMessage').attr('class', 'control-group');
				$('#spanBuyerMessage').text('');
			} else {
				setBuyerMessageValidationState();
			}
		}
	});

/* CLEAR BUTTON */

	$('#clearButton').click(function () {
		$('#buyerName').val('');
		$('#buyerEmailAddress').val('');
		$('#buyerMessage').val('');
	});

/* FORM SUBMISSION */

	$('#sendEmail').submit(function () {
		if (!isBuyerNameProvided()) {
			setBuyerNameValidationState('error');
			return false;
		}

		if (!isBuyerMessageProvided()) {
			setBuyerMessageValidationState(null, 'error');
			return false;
		}

		return true;
	});
});