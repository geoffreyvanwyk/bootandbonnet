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

	if ($('#market').val() === 'new') {
		$('#marketNew').button('toggle');
	} else {
		$('#marketUsed').button('toggle');
	}

	if ($('#fullServiceHistory').val() === true) {
		$('#fullServiceHistoryYes').button('toggle');
	} else {
		$('#fullServiceHistoryNo').button('toggle');
	}

	if ($('#absBrakes').val() === true) {
		$('#absBrakesYes').button('toggle');
	} else {
		$('#absBrakesNo').button('toggle');
	}

	if ($('#powerSteering').val() === true) {
		$('#powerSteeringYes').button('toggle');
	} else {
		$('#powerSteeringNo').button('toggle');
	}

	if ($('#airConditiong').val() === true) {
		$('#airConditionYes').button('toggle');
	} else {
		$('#airConditioningNo').button('toggle');
	}

	if ($('#cdPlayer').val() === true) {
		$('#cdPlayerYes').button('toggle');
	} else {
		$('#cdPlayerNo').button('toggle');
	}

	if ($('#radio').val() === true) {
		$('#radioYes').button('toggle');
	} else {
		$('#radioNo').button('toggle');
	}

	if ($('#alarm').val() === true) {
		$('#alarmYes').button('toggle');
	} else {
		$('#alarmNo').button('toggle');
	}

	if ($('#centralLocking').val() === true) {
		$('#centralLockingYes').button('toggle');
	} else {
		$('#centralLockingNo').button('toggle');
	}

	if ($('#immobilizer').val() === true) {
		$('#immobilizerYes').button('toggle');
	} else {
		$('#immobilizerNo').button('toggle');
	}

	if ($('#gearLock').val() === true) {
		$('#gearLockYes').button('toggle');
	} else {
		$('#gearLockNo').button('toggle');
	}

	if ($('#negotiable').val() === true) {
		$('#negotiableYes').button('toggle');
	} else {
		$('#negotiableNo').button('toggle');
	}
};