window.onload = function () {

    var passwordBox = document.getElementById("password");
    var confirmPasswordBox = document.getElementById("confirmPassword");
    var telephoneBox = document.getElementById("telephone");

    var isPasswordValid = function () {
        return passwordBox.value.length >= 7;
    };

    var isPasswordConfirmed = function () {
        return (passwordBox.value === confirmPasswordBox.value);
    };

    var setValidationState = function (control, state, message) {
        var textNode = document.createTextNode(message);
        var spanElement = document.getElementById("span".concat(control));
        document.getElementById("div".concat(control)).className = "control-group ".concat(state);
        spanElement.textContent = "";
        spanElement.appendChild(textNode);
    };

    passwordBox.onfocus = function () {
        if (!isPasswordValid()) {
            setValidationState("Password", "info", "Minimum 7 characters.");
        }
    };

    passwordBox.onkeyup = function () {
        if (isPasswordValid()) {
            setValidationState("Password", "success", "Good!");
        }
        else {
            setValidationState("Password", "info", "Minimum 7 characters.");
        }

        if (confirmPasswordBox.value.length > 0) {
            confirmPasswordOnKeyUp();
        }
    };

    passwordBox.onblur = function () {
        if (passwordBox.value.length !== 0 && !isPasswordValid()) {
            setValidationState("Password", "error", "Too short! Minimum 7 characters.");
        }
        else if (!isPasswordValid()) {
            setValidationState("Password", "", "");
        }
    };

    confirmPasswordBox.onfocus = function () {
        if (!isPasswordValid() || confirmPasswordBox.value.length === 0) {
            setValidationState("ConfirmPassword", "", "");
        }
        else if (!isPasswordConfirmed()) {
            setValidationState("ConfirmPassword", "info", "The passwords do not match yet.");
        }
    };

    var confirmPasswordOnKeyUp = confirmPasswordBox.onkeyup = function () {
        if (!isPasswordValid()) {
            setValidationState("ConfirmPassword", "", "");
        }
        else if (!isPasswordConfirmed()) {
            setValidationState("ConfirmPassword", "info", "The passwords do not match yet.");
        }
        else {
            setValidationState("ConfirmPassword", "success", "The passwords match!");
        }
    };

    confirmPasswordBox.onblur = function () {
        if (!isPasswordValid()) {
            setValidationState("ConfirmPassword", "", "");
        }
        else if (!isPasswordConfirmed()) {
            setValidationState("ConfirmPassword", "error", "The passwords do not match!");
        }
    };

    telephoneBox.onfocus = function () {
        setValidationState("Telephone", "info", "Include the area code.");
    }

    telephoneBox.onblur = function () {
        setValidationState("Telephone", "", "");
    }

    document.getElementById("privateSeller").onchange = function () {
        if (this.checked) {
            document.getElementById("dealershipDetails").style.display = "none";
        };
    };

    document.getElementById("dealership").onchange = function () {
        if (this.checked) {
            document.getElementById("dealershipDetails").style.display = "";
        };
    };

    document.getElementById("register").onsubmit = function () {
        var telephoneBox = document.getElementById("telephone");
        var cellphoneBox = document.getElementById("cellphone");

        if (telephoneBox.value === "" && cellphoneBox.value === "") {
            document.getElementById("phonesAlert").style.display = "";
            return false;
        }
        else {
            document.getElementById("phonesAlert").style.display = "none";
        }

        var privateSellerRadio = document.getElementById("privateSeller");
        var dealershipRadio = document.getElementById("dealership");

        if (!privateSellerRadio.checked && !dealershipRadio.checked) {
            document.getElementById("sellerTypeAlert").style.display = "";
            return false;
        }
        else {
            document.getElementById("sellerTypeAlert").style.display = "none";
        }

        if (!isPasswordValid() || !isPasswordConfirmed()) {
            return false;
        }

        return true;
    };
};