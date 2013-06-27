window.onload = function() {

	/**
	 * Sets the type of alert-span and the span content for the relevant control.
	 */
	function setValidationState(control, state, message) {
		var textNode = document.createTextNode(message);
		var spanElement = document.getElementById("span".concat(control));
		var divElement = document.getElementById("div".concat(control));
		divElement.className = "control-group ".concat(state);
		spanElement.textContent = "";
		spanElement.appendChild(textNode);
	}

	var emailBox = document.getElementById("email");

	emailBox.onblur = function () {
		setValidationState("Email", "", "");
	};

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
	function isPasswordValid() {
		if (isUserLoggedIn) {
			return (passwordBox.value.length >= 8) || (passwordBox.value.length === 0)
		}
		return (passwordBox.value.length >= 8);
	}

	function isPasswordConfirmed() {
		return (passwordBox.value === confirmPasswordBox.value);
	}

	passwordBox.required = !isUserLoggedIn;
	confirmPasswordBox.required = !isUserLoggedIn;

	passwordBox.onfocus = function() {
		if (!isPasswordValid()) {
			setValidationState("Password", "info", "Minimum 8 characters.");
		}
	};

	passwordBox.onkeyup = function() {
		if (isPasswordValid()) {
			setValidationState("Password", "success", "Good!");
		} else {
			setValidationState("Password", "info", "Minimum 8 characters.");
		}

		if (confirmPasswordBox.value.length > 0) {
			confirmPasswordOnKeyUp();
		}
	};

	passwordBox.onblur = function() {
		if (passwordBox.value.length !== 0 && !isPasswordValid()) {
			setValidationState("Password", "error", "Too short! Minimum 8 characters.");
		} else if (!isPasswordValid()) {
			setValidationState("Password", "", "");
		}
	};

	confirmPasswordBox.onfocus = function() {
		if (!isPasswordValid() || confirmPasswordBox.value.length === 0) {
			setValidationState("ConfirmPassword", "", "");
		} else if (!isPasswordConfirmed()) {
			setValidationState("ConfirmPassword", "info", "The passwords do not match yet.");
		}
	};

	var confirmPasswordOnKeyUp = confirmPasswordBox.onkeyup = function() {
		if (!isPasswordValid()) {
			setValidationState("ConfirmPassword", "", "");
		} else if (!isPasswordConfirmed()) {
			setValidationState("ConfirmPassword", "info", "The passwords do not match yet.");
		} else {
			setValidationState("ConfirmPassword", "success", "The passwords match!");
		}
	};

	confirmPasswordBox.onblur = function() {
		if (!isPasswordValid()) {
			setValidationState("ConfirmPassword", "", "");
		} else if (!isPasswordConfirmed()) {
			setValidationState("ConfirmPassword", "error", "The passwords do not match!");
		}
	};

	var telephoneBox = document.getElementById("telephone");
	var cellphoneBox = document.getElementById("cellphone");

	function isPhoneNumberProvided() {
		return (telephoneBox.value !== "") || (cellphoneBox.value !== "");
	}

	telephoneBox.onfocus = function() {
		setValidationState("Telephone", "info", "Include the area code.");
	};

	telephoneBox.onblur = function() {
		setValidationState("Telephone", "", "");
	};

	var privateSellerOption = document.getElementById("privateSeller");
	var dealershipOption = document.getElementById("dealership");

	function isSellerTypeProvided() {
		return (privateSellerOption.checked || dealershipOption.checked);
	}

	/**
	 * The sellerType element is a hidden input element. Its value is an empty string
	 * when a new user registers.
	 */
	var sellerType = document.getElementById("sellerType").value;

	switch (sellerType) {
		case 'privateSeller':
			privateSellerOption.checked = true;
			break;
		case 'dealership':
			dealershipOption.checked = true;
			break;
	}

	var dealerOrLocationLegend = document.getElementById("dealerOrLocation");
	var leftColumn = document.getElementById("leftColumn");
	var rightColumn = document.getElementById("rightColumn");
	var provincesDiv = document.getElementById("provincesDiv");
	var townsDiv = document.getElementById("townsDiv");

	/**
	 * Show or hide the fields required for a dealership depending on the seller type.
	 */
	privateSellerOption.onchange = function() {
		if (this.checked) {
			dealerOrLocationLegend.textContent = "Location";
			document.getElementById("dealershipDetails").style.display = "none";
			document.getElementById("dealershipName").required = false;
			document.getElementById("streetAddress1").required = false;
			rightColumn.removeChild(provincesDiv);
			leftColumn.appendChild(provincesDiv);
		}
	};

	dealershipOption.onchange = function() {
		if (this.checked) {
			dealerOrLocationLegend.textContent = "Dealership Details";
			document.getElementById("dealershipDetails").style.display = "";
			document.getElementById("dealershipName").required = true;
			document.getElementById("streetAddress1").required = true;
			leftColumn.removeChild(provincesDiv);
			rightColumn.insertBefore(provincesDiv, townsDiv);
		}
	};

	var provincesSelect = document.getElementById("provinces");
	var townsSelect = document.getElementById("towns");

	function isProvinceProvided() {
		return (provincesSelect.value !== "Please select ...");
	}

	function isTownProvided() {
		return (townsSelect.value !== "Please select ...");
	}

	/**
	 * Fills the towns select element with the towns in the province selected in the provinces
	 * select element.
	 */
	provincesSelect.onchange = function() {
		var currentProvince = this.value;
		var provinces = JSON.parse(document.getElementById("locations").value);
		townsSelect.innerHTML = "<option selected='selected'>Please select ..</option>";
		for (p in provinces) {
			if (provinces[p].name === currentProvince) {
				for (t in provinces[p].towns) {
					var townOption = document.createElement("option");
					townOption.textContent = provinces[p].towns[t];
					townsSelect.appendChild(townOption);
				}
				break;
			}
		}
	};

	var cancelButton = document.getElementById("cancelButton");
	cancelButton.onclick = function() {
		window.history.back();
	};

	function showPhonesAlert() {
		document.getElementById("phonesAlert").style.display = "";
	}

	function hidePhonesAlert() {
		document.getElementById("phonesAlert").style.display = "none";
	}

	function showSellerTypeAlert() {
		document.getElementById("sellerTypeAlert").style.display = "";
	}

	function hideSellerTypeAlert() {
		document.getElementById("sellerTypeAlert").style.display = "none";
	}

	function showLocationAlert() {
		document.getElementById("locationAlert").style.display = "";
	}

	function hideLocationAlert() {
		document.getElementById("locationAlert").style.display = "none";
	}

	var registrationForm = document.getElementById("register");
	/**
	 * Validate the form before submitting it. Display alert-spans for the required fields which
	 * were not completed or which were completed incorrectly.
	 */
	registrationForm.onsubmit = function() {
		if (!isPasswordValid() || !isPasswordConfirmed()) {
			return false;
		}

		if (!isPhoneNumberProvided()) {
			showPhonesAlert();
			return false;
		} else {
			hidePhonesAlert();
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
	};
};
