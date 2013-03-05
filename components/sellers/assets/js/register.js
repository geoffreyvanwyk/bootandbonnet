window.onload = function() {

	var passwordBox = document.getElementById("password");
	var confirmPasswordBox = document.getElementById("confirmPassword");
	var telephoneBox = document.getElementById("telephone");
	var privateSellerOption = document.getElementById("privateSeller");
	var dealershipOption = document.getElementById("dealership");
	var sellerType = document.getElementById("sellerType").value;
	var provincesSelect = document.getElementById("provinces");
	var townsSelect = document.getElementById("towns");
	var cancelButton = document.getElementById("cancelButton");
	var sellerForm = document.getElementById("register");

	function isUserLoggedIn() {
		var loggedIn = document.getElementById("loggedIn").value;
		if (loggedIn === "true") {
			return true;
		} else {
			return false;
		}
	}

	function isPasswordValid() {
		if (!isUserLoggedIn()) {
			return (passwordBox.value.length >= 7);
		} else {
			return ((passwordBox.value.length >= 7) || (passwordBox.value.length === 0));
		}
	}

	function isPasswordConfirmed() {
		return (passwordBox.value === confirmPasswordBox.value);
	}
	/**
	 * Returns true if the user has provided at least one telephone number; false, otherwise.
	 */
	function isPhoneNumberProvided() {
		var telephone = document.getElementById("telephone").value;
		var cellphone = document.getElementById("cellphone").value;

		if (telephone === "" && cellphone === "") {
			return false;
		}
		else {
			return true;
		}
	}

	function isSellerTypeProvided() {
		var privateSeller = document.getElementById("privateSeller").checked;
		var dealership = document.getElementById("dealership").checked;

		if (!privateSeller && !dealership) {
			return false;
		} else {
			return true;
		}
	}

	function isProvinceProvided() {
		var province = document.getElementById("provinces").value;
		return (province !== "Please select ...");
	}

	function isTownProvided() {
		var town = document.getElementById("towns").value;
		return (town !== "Please select ...");
	}

	/**
	 * Sets the type of alert-span and the span content for the relevant control.
	 */
	function setValidationState(control, state, message) {
		var textNode = document.createTextNode(message);
		var spanElement = document.getElementById("span".concat(control));
		document.getElementById("div".concat(control)).className = "control-group ".concat(state);
		spanElement.textContent = "";
		spanElement.appendChild(textNode);
	}

	passwordBox.required = !isUserLoggedIn();
	confirmPasswordBox.required = !isUserLoggedIn();

	passwordBox.onfocus = function() {
		if (!isPasswordValid()) {
			setValidationState("Password", "info", "Minimum 7 characters.");
		}
	};

	passwordBox.onkeyup = function() {
		if (isPasswordValid()) {
			setValidationState("Password", "success", "Good!");
		} else {
			setValidationState("Password", "info", "Minimum 7 characters.");
		}

		if (confirmPasswordBox.value.length > 0) {
			confirmPasswordOnKeyUp();
		}
	};

	passwordBox.onblur = function() {
		if (passwordBox.value.length !== 0 && !isPasswordValid()) {
			setValidationState("Password", "error", "Too short! Minimum 7 characters.");
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

	telephoneBox.onfocus = function() {
		setValidationState("Telephone", "info", "Include the area code.");
	};

	telephoneBox.onblur = function() {
		setValidationState("Telephone", "", "");
	};

	switch (sellerType) {
		case 'privateSeller':
			privateSellerOption.checked = true;
			break;
		case 'dealership':
			dealershipOption.checked = true;
			break;
	}

	/**
	 * Show or hide the fields required for a dealership depending on the seller type.
	 */
	privateSellerOption.onchange = function() {
		if (this.checked) {
			document.getElementById("dealershipDetails").style.display = "none";
			document.getElementById("dealershipName").required = false;
			document.getElementById("streetAddress1").required = false;
		}
	};

	dealershipOption.onchange = function() {
		if (this.checked) {
			document.getElementById("dealershipDetails").style.display = "";
			document.getElementById("dealershipName").required = true;
			document.getElementById("streetAddress1").required = true;
		}
	};

	/**
	 * Fills the towns select element with the towns in the province selected in the provinces select element.
	 */
	provincesSelect.onchange = function() {
		var selectedProvince = this.value;
		var provinces = JSON.parse(document.getElementById("locations").value);
		townsSelect.innerHTML = "";
		townsSelect.innerHTML = "<option selected='selected'>Please select ..</option>";
		for (p in provinces) {
			if (provinces[p].name === selectedProvince) {
				for (t in provinces[p].towns) {
					var townOption = document.createElement("option");
					townOption.textContent = provinces[p].towns[t].name;
					townsSelect.appendChild(townOption);
				}
				break;
			}
		}
	}

	/**
	 * Sets the value of the hidden input element townId to the id of the selected town.
	 */
	townsSelect.onchange = function() {
		var selectedProvince = provincesSelect.value;
		var selectedTown = this.value;
		var townIdHidden = document.getElementById("townId");
		var provinces = JSON.parse(document.getElementById("locations").value);
		townIdHidden.value = "";
		for (p in provinces) {
			if (provinces[p].name === selectedProvince) {
				for (t in provinces[p].towns) {
					if (provinces[p].towns[t].name === selectedTown) {
						townIdHidden.value = provinces[p].towns[t].id;
						break;
					}
				}
				break;
			}
		}
	};

	cancelButton.onclick = function() {
		window.history.back();
	};

	/**
	 * Validate the form before submitting it. Display alert-spans for the required fields which were not completed or
	 * which were completed incorrectly.
	 */
	sellerForm.onsubmit = function() {
		if (!isPasswordValid() || !isPasswordConfirmed()) {
			return false;
		}

		if (!isPhoneNumberProvided()) {
			document.getElementById("phonesAlert").style.display = "";
			return false;
		} else {
			document.getElementById("phonesAlert").style.display = "none";
		}

		if (!isSellerTypeProvided()) {
			document.getElementById("sellerTypeAlert").style.display = "";
			return false;
		} else {
			document.getElementById("sellerTypeAlert").style.display = "none";
		}

		var isDealership = dealershipOption.checked;

		if (isDealership && (!isProvinceProvided() || !isTownProvided())) {
			document.getElementById("locationAlert").style.display = "";
			return false;
		} else {
			document.getElementById("phonesAlert").style.display = "none";
		}

		return true;
	};
};