/*jslint browser: true*/
/*global $*/
/*global alert*/

$(window).load(function () {
	'use strict';

	function updateTotal() {
		var total = 0;

		$('.cardog-cost').each(function () {
			total += Number($(this).text());
		});

		return total;
	}

	$('.cardog-weeks').on({
		change: function () {
			var that = this;

			$('#'.concat($(that).attr('name'))).text(function () {
				return $(that).val() * 70;
			});

			$('#total').text(updateTotal);
		}
	});

	$('.cardog-cost').each(function () {
		$(this).text(function () {
			return $('.cardog-weeks[name="'.concat($(this).attr('id')).concat('"]')).val() * 70;
		});
	});

	$('#total').text(updateTotal);
});