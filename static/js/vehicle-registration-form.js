/*jslint browser: true*/
/*global FileReader*/
/*global $*/

window.onload = function () {
	'use strict';
	var photoInputs, index, makesSelect, modelsSelect, removePhotoButtons;

	/**
	 * Fill the models select element with the models corresponding with the selected make.
	 */
	var fillModels = function () {
		var selectedMake = $('#makes').val();
		var makes = JSON.parse($('#manufacturers').val());
		for (var m in makes) {
			if (makes.hasOwnProperty(m) && (makes[m].name === selectedMake)) {
				for (var o in makes[m].models) {
					if (makes[m].models.hasOwnProperty(o)) {
						jQuery('<option/>', {
							text: makes[m].models[o].name
						}).appendTo('#models');
					}
				}
				break;
			}
		}
	};

	fillModels();

	$('#makes').change(function () {
		$('#models').html("<option selected='selected'>Please select ...</option>");
		fillModels();
	});

	/* Set the toggle states of toggle buttons. */
	/* jQuery has to be used here, because the button method is only available in jQuery. */
	if ($('#market').val() === 'new') {
		$('#marketNew').button('toggle');
	} else if ($('#market').val() === 'used') {
		$('#marketUsed').button('toggle');
	}

	if ($('#fullServiceHistory').val() === 'true') {
		$('#fullServiceHistoryYes').button('toggle');
	} else if ($('#fullServiceHistory').val() === 'false') {
		$('#fullServiceHistoryNo').button('toggle');
	}

	if ($('#absBrakes').val() === 'true') {
		$('#absBrakesYes').button('toggle');
	} else if ($('#absBrakes').val() === 'false') {
		$('#absBrakesNo').button('toggle');
	}

	if ($('#powerSteering').val() === 'true') {
		$('#powerSteeringYes').button('toggle');
	} else if ($('#powerSteering').val() === 'false') {
		$('#powerSteeringNo').button('toggle');
	}

	if ($('#airConditioning').val() === 'true') {
		$('#airConditioningYes').button('toggle');
	} else if ($('#airConditioning').val() === 'false') {
		$('#airConditioningNo').button('toggle');
	}

	if ($('#cdPlayer').val() === 'true') {
		$('#cdPlayerYes').button('toggle');
	} else if ($('#cdPlayer').val() === 'false') {
		$('#cdPlayerNo').button('toggle');
	}

	if ($('#radio').val() === 'true') {
		$('#radioYes').button('toggle');
	} else if ($('#radio').val() === 'false') {
		$('#radioNo').button('toggle');
	}

	if ($('#alarm').val() === 'true') {
		$('#alarmYes').button('toggle');
	} else if ($('#alarm').val() === 'false') {
		$('#alarmNo').button('toggle');
	}

	if ($('#centralLocking').val() === 'true') {
		$('#centralLockingYes').button('toggle');
	} else if ($('#centralLocking').val() === 'false') {
		$('#centralLockingNo').button('toggle');
	}

	if ($('#immobilizer').val() === 'true') {
		$('#immobilizerYes').button('toggle');
	} else if ($('#immobilizer').val() === 'false') {
		$('#immobilizerNo').button('toggle');
	}

	if ($('#gearLock').val() === 'true') {
		$('#gearLockYes').button('toggle');
	} else if ($('#gearLock').val() === 'false') {
		$('#gearLockNo').button('toggle');
	}

	if ($('#negotiable').val() === 'true') {
		$('#negotiableYes').button('toggle');
	} else if ($('#negotiable').val() === 'false') {
		$('#negotiableNo').button('toggle');
	}

	/* Change the appearance of input controls of type file to look like a normal Bootstrap button. */
	$('input[type=file]').bootstrapFileInput();
	$('.file-inputs').bootstrapFileInput();

	/* Display thumbnails of photographs before uploading them. */
	function readURL(input, id) {
		var reader;

		if (input.files && input.files[0]) {
			reader = new FileReader();

			reader.onload = function (e) {
				document.getElementById(id).src = e.target.result;
			};

			reader.readAsDataURL(input.files[0]);
		}
	}

	photoInputs = document.getElementsByClassName('bootandbonnet-input-file');
	for (index = 0; index < photoInputs.length; index++) {
		photoInputs[index].onchange = function () {
			readURL(this, this.name);
		};
	}

	removePhotoButtons = document.getElementsByClassName('bootandbonnet-remove-file');
	for (index = 0; index < removePhotoButtons.length; index++) {
		removePhotoButtons[index].onclick = function () {
			var name, newPhotoInput, oldPhotoInput;
			newPhotoInput = document.createElement('input');
			newPhotoInput.type = 'file';
			newPhotoInput.className = 'bootandbonnet-input-file bootandbonnet-file-changed';
			newPhotoInput.setAttribute('name', 'soup');
			newPhotoInput.title = "Browse";
			newPhotoInput.setAttribute('accept', 'images/*');
			oldPhotoInput = this.previousSibling.previousSibling;
			this.parentNode.replaceChild(newPhotoInput, oldPhotoInput);
			$('.bootandbonnet-file-changed').bootstrapFileInput();
			oldPhotoInput.className = 'bootandbonnet-input-file';
		};
	}

	var cancelButton = document.getElementById("cancelButton");
	cancelButton.onclick = function() {
		window.history.back();
	};
};