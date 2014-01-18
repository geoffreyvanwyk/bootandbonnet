/*jshint browser: true*/
/*global $*/
/*global alert*/

$(window).on({
	load: function () {
		'use strict';

		/**
		 * Calculates the total cost of all items in the cart.
		 *
		 * @returns	{number}	The total cost of all items in the cart.
		 */
		function totalCost() {
			var total = 0;

			$('td.bootandbonnet-cost').each(function () {
				total += Number($(this).text());
			});

			return total;
		}

		/**
		 * Calculates the cost for one item in the cart (based on the number of weeks selected), updates
		 * the value in the corresponding table cell, then updates the total cost.
		 *
		 * @param	{object}		select	The select element displaying the number of weeks.
		 * @returns	{undefined}
		 */
		function calculateItemCost(select) {
				$('td.bootandbonnet-cost[data-custom="'
					.concat($(select).attr('data-custom'))
					.concat('"]'))
					.attr('value', $(select).val() * 70)
					.text(function () {
						return $(this).attr('value');
				});

				$('input.bootandbonnet-cost[data-custom="'
					.concat($(select).attr('data-custom'))
					.concat('"]'))
					.val($(select).val() * 70);

				$('#total').text(totalCost);
		}

		$('.bootandbonnet-weeks').on({
			change: function () {
				calculateItemCost(this);
			}
		});

		$('.bootandbonnet-weeks').each(function () {
			calculateItemCost(this);
		});
	}
});
