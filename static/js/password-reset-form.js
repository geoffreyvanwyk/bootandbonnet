window.onload = function() {
	var passwordBox = document.getElementById("password");
	var confirmPasswordBox = document.getElementById("confirmPassword");
	var resetForm = document.getElementById('reset');

	function isPasswordValid() {
		return (passwordBox.value.length >= 10);
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
		document.getElementById("div".concat(control)).className = "form-group ".concat(state);
		spanElement.textContent = "";
		spanElement.appendChild(textNode);
	}

	passwordBox.onfocus = function() {
		if (!isPasswordValid()) {
			setValidationState("Password", "has-warning", "Minimum 10 characters.");
		}
	};

	passwordBox.onkeyup = function() {
		if (isPasswordValid()) {
			setValidationState("Password", "has-success", "Good!");
		} else {
			setValidationState("Password", "has-warning", "Minimum 10 characters.");
		}

		if (confirmPasswordBox.value.length > 0) {
			confirmPasswordOnKeyUp();
		}
	};

	passwordBox.onblur = function() {
		if (passwordBox.value.length !== 0 && !isPasswordValid()) {
			setValidationState("Password", "has-error", "Too short! Minimum 10 characters.");
		} else if (!isPasswordValid()) {
			setValidationState("Password", "", "");
		}
	};

	confirmPasswordBox.onfocus = function() {
		if (!isPasswordValid() || confirmPasswordBox.value.length === 0) {
			setValidationState("ConfirmPassword", "", "");
		} else if (!isPasswordConfirmed()) {
			setValidationState("ConfirmPassword", "has-warning", "The passwords do not match yet.");
		}
	};

	var confirmPasswordOnKeyUp = confirmPasswordBox.onkeyup = function() {
		if (!isPasswordValid()) {
			setValidationState("ConfirmPassword", "", "");
		} else if (!isPasswordConfirmed()) {
			setValidationState("ConfirmPassword", "has-warning", "The passwords do not match yet.");
		} else {
			setValidationState("ConfirmPassword", "has-success", "The passwords match!");
		}
	};

	confirmPasswordBox.onblur = function() {
		if (!isPasswordValid()) {
			setValidationState("ConfirmPassword", "", "");
		} else if (!isPasswordConfirmed()) {
			setValidationState("ConfirmPassword", "has-error", "The passwords do not match!");
		}
	};

	resetForm.onsubmit = function() {
		if (!isPasswordValid() || !isPasswordConfirmed()) {
			return false;
		}
		return true;
	};
};

