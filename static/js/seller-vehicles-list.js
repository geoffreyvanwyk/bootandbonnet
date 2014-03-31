/*jshint browser: true*/

$(window).load(function () {
	'use strict';

	var setViewCartAbility = function () {
		if ($('#nrOfItems').text() === '0') {
			$('#nrOfItems').attr('disabled', true);
			$('#viewCart').attr('disabled', true);
		} else {
			$('#nrOfItems').attr('disabled', false);
			$('#viewCart').attr('disabled', false);
		}
	};

	setViewCartAbility();

	$('.bootandbonnet-btn-advertise').on({
		click: function () {
			var vehicleId, vehicleObject;

			vehicleId = $(this).attr('name');
			vehicleObject = $(this).val();

			if ($(this).hasClass('active')) {
				$(this)
					.addClass('btn-success')
					.removeClass('btn-danger')
					.text('Advertise')
					.button('toggle');

				$('#nrOfItems').text(function (index, text) {
					return (Number(text) - 1).toString();
				});

				$('#'.concat(vehicleId)).remove();
			} else {
				$(this)
					.addClass('btn-info')
					.removeClass('btn-success')
					.text('In Cart')
					.button('toggle');

				$('#nrOfItems').text(function (index, text) {
					return (Number(text) + 1).toString();
				});

				$('<input type="hidden">').attr({
					name: 'items[]',
					value: vehicleObject,
					id: vehicleId
				}).appendTo('#items');
			}

			setViewCartAbility();
		},
		mouseenter: function () {
			if ($(this).hasClass('active')) {
				$(this)
					.addClass('btn-danger')
					.removeClass('btn-info')
					.text('Remove');
			}
		},
		mouseleave: function () {
			if ($(this).hasClass('active')) {
				$(this)
					.addClass('btn-info')
					.removeClass('btn-danger')
					.text('In Cart');
			}
		}
	});

	$('#nrOfItems').click(function () {
		$('#items').submit();
	});
});