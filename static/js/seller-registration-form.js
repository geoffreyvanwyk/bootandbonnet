window.onload = function() {
	'use strict';

	/**
	 * Sets the type of alert-span and the span content for the relevant control.
	 */
	var setValidationState = function (control, state, message) {
		var textNode = document.createTextNode(message);
		var spanElement = document.getElementById("span".concat(control));
		var divElement = document.getElementById("div".concat(control));
		divElement.className = "form-group ".concat('has-').concat(state);
		spanElement.textContent = "";
		spanElement.appendChild(textNode);
	};

/* EMAIL ADDRESS */

	$('#email').blur(function () {
		setValidationState("Email", "", "");
	});

/* PASSWORDS */

	var passwordBox = document.getElementById("password");
	var confirmPasswordBox = document.getElementById("confirmPassword");

	/**
	 * The data type of the value of every HTML element is string. It has to be
	 * converted to boolean.
	 */
	var isUserLoggedIn = document.getElementById("loggedIn").value === "true" ? true : false;

	/**
	 * If a user is logged-in, it means he/she is editing his/her profile, as opposed to a new
	 * user registering. When editing his/her profile, a user might not want to change the
	 * the password, in which case the passwordBox may be left blank.
	 */
	var isPasswordValid = function () {
		if (isUserLoggedIn) {
			return (passwordBox.value.length >= 10) || (passwordBox.value.length === 0);
		}
		return (passwordBox.value.length >= 10);
	};

	var isPasswordConfirmed = function () {
		return (passwordBox.value === confirmPasswordBox.value);
	};

	passwordBox.required = !isUserLoggedIn;
	confirmPasswordBox.required = !isUserLoggedIn;

	var confirmPasswordOnKeyUp = function() {
		if (!isPasswordValid()) {
			setValidationState("ConfirmPassword", "", "");
		} else if (!isPasswordConfirmed()) {
			setValidationState("ConfirmPassword", "warning", "The passwords do not match yet.");
		} else {
			setValidationState("ConfirmPassword", "success", "The passwords match!");
		}
	};

	$('#password').on({
		focus:function() {
			if (!isPasswordValid()) {
				setValidationState("Password", "warning", "Minimum ten characters.");
			}
		},
		keyup: function() {
			if (isPasswordValid()) {
				setValidationState("Password", "success", "Good!");
			} else {
				setValidationState("Password", "warning", "Minimum ten characters.");
			}

			if (confirmPasswordBox.value.length > 0) {
				confirmPasswordOnKeyUp();
			}
		},
		blur: function() {
			if (passwordBox.value.length !== 0 && !isPasswordValid()) {
				setValidationState("Password", "error", "Too short! Minimum ten characters.");
			} else if (!isPasswordValid()) {
				setValidationState("Password", "", "");
			}
		}
	});

	$('#confirmPassword').on({
		focus: function() {
			if (!isPasswordValid() || confirmPasswordBox.value.length === 0) {
				setValidationState("ConfirmPassword", "", "");
			} else if (!isPasswordConfirmed()) {
				setValidationState("ConfirmPassword", "warning", "The passwords do not match yet.");
			}
		},
		keyup: confirmPasswordOnKeyUp,
		blur: function() {
			if (!isPasswordValid()) {
				setValidationState("ConfirmPassword", "", "");
			} else if (!isPasswordConfirmed()) {
				setValidationState("ConfirmPassword", "error", "The passwords do not match!");
			}
		}
	});

/* CONTACT NUMBERS */

	var isContactNumberProvided = function () {
		return ($('#telephone').val() !== "") || ($('#cellphone').val() !== "");
	};

	$('#telephone').on({
		focus: function () {
			setValidationState("Telephone", "warning", "Use digits only, e.g. 0123456789.");
		},
		blur: function () {
			setValidationState("Telephone", "", "");
		}
	});

	$('#cellphone').on({
		focus: function () {
			setValidationState("Cellphone", "warning", "Use digits only, e.g. 0834567819.");
		},
		blur: function () {
			setValidationState("Cellphone", "", "");
		}
	});

/* SELLER TYPE */

	var isSellerTypeProvided = function () {
		return $('#privateSeller').is(':checked') || $('#dealership').is(':checked');
	};

	var showDealershipFields = function () {
		$('#dealerOrLocation').text('Dealership Details');
		$('#dealershipDetails').css('display', '');
		$('#dealershipName').attr('required', 'required');
		$('#street').attr('required', 'required');
		var divProvinces = $('#divProvinces').detach();
		$('#rightColumn').prepend(divProvinces);
	};

	var hideDealershipFields = function () {
		$('#dealerOrLocation').text('Location');
		$('#dealershipDetails').css('display', 'none');
		$('#dealershipName').removeAttr('required');
		$('#street').removeAttr('required');
		var divProvinces = $('#divProvinces').detach();
		divProvinces.appendTo('#leftColumn');
	};

	/*
	 * The sellerType element is a hidden input element. Its value is an empty string
	 * when a new user registers.
	 */
	switch ($('#sellerType').val()) {
		case 'privateSeller':
			$('#privateSeller').attr('checked', 'checked');
			hideDealershipFields();
			break;
		case 'dealership':
			$('#dealership').attr('checked', 'checked');
			showDealershipFields();
			break;
	}

	/**
	 * Show or hide the fields required for a dealership depending on the seller type.
	 */
	$('#privateSeller').change(function() {
		if ($(this).is(':checked')) {
			hideDealershipFields();
		}
	});

	$('#dealership').change(function() {
		if ($(this).is(':checked')) {
			showDealershipFields();
		}
	});

/* ADDRESS */

	var isProvinceProvided = function () {
		if ($('#provinces').val() === 'Please select ...') {
			return false;
		}
		return true;
	};

	var isTownProvided = function () {
		if ($('#towns').val() === 'Please select ...') {
			return false;
		}
		return true;
	};

	var provinces = JSON.parse($('#locations').val());
	/**
	 * Fills the #towns select element with the towns in the province selected in the #provinces
	 * select element.
	 */
	$('#provinces').change(function() {
		var currentProvince = $(this).val();
		var p, t;
		$('#towns').html('<option selected="selected">Please select ...</option>');
		for (p in provinces) {
			if (provinces[p].name === currentProvince) {
				for (t in provinces[p].towns) {
					jQuery('<option/>', {
						text: provinces[p].towns[t]
					}).appendTo('#towns');
				}
				break;
			}
		}
	});

/* ALERTS */

	var showContactNumbersAlert = function () {
		document.getElementById("contactNumbersAlert").style.display = "";
	};

	var hideContactNumbersAlert = function () {
		document.getElementById("contactNumbersAlert").style.display = "none";
	};

	var showSellerTypeAlert = function () {
		$('#sellerTypeAlert').css('display', '');
		// document.getElementById("sellerTypeAlert").style.display = "";
	};

	var hideSellerTypeAlert = function () {
		$('#sellerTypeAlert').css('display', 'none');
		// document.getElementById("sellerTypeAlert").style.display = "none";
	};

	var showLocationAlert = function () {
		document.getElementById("locationAlert").style.display = "";
	};

	var hideLocationAlert = function () {
		document.getElementById("locationAlert").style.display = "none";
	};

/* FORM SUBMISSION */

	/**
	 * Validate the form before submitting it. Display alert-spans for the required fields which
	 * were not completed or which were completed incorrectly.
	 */
	$('#register').submit(function() {
		if (!isPasswordValid() || !isPasswordConfirmed()) {
			return false;
		}

		if (!isContactNumberProvided()) {
			showContactNumbersAlert();
			return false;
		} else {
			hideContactNumbersAlert();
		}

		if (!isSellerTypeProvided()) {
			showSellerTypeAlert();
			return false;
		} else {
			hideSellerTypeAlert();
		}

		if (!isProvinceProvided() || !isTownProvided()) {
			showLocationAlert();
			return false;
		} else {
			hideLocationAlert();
		}

		return true;
	});
};
