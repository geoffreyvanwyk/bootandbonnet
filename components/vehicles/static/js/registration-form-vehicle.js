window.onload = function () {
	var makesSelect = document.getElementById("makes");
	var modelsSelect = document.getElementById("models");
	makesSelect.onchange = function () {
		var selectedMake = this.value;
		var makes = JSON.parse(document.getElementById("manufacturers").value);
		modelsSelect.innerHTML = "<option selected='selected'>Please select ...</option>";
		for (m in makes) {
			if (makes[m].name === selectedMake) {
				for (o in makes[m].models) {
					var modelOption = document.createElement("option");
					modelOption.textContent = makes[m].models[o].name;
					modelsSelect.appendChild(modelOption);
				}
				break;
			}
		}
	};
};