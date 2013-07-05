window.onload = function() {
	var passwordBox = document.getElementById("password");
	var confirmPasswordBox = document.getElementById("confirmPassword");
	var resetForm = document.getElementById('reset');

	function isPasswordValid() {
		return (passwordBox.value.length >= 8);
	}

	function isPasswordConfirmed() {
		return (passwordBox.value === confirmPasswordBox.value);
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

	resetForm.onsubmit = function() {
		if (!isPasswordValid() || !isPasswordConfirmed()) {
			return false;
		}
		return true;
	};
};

