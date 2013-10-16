/*jshint browser: true*/
/*global $*/
/*global alert*/

$(window).on({
	load: function () {
		'use strict';
		
		/**
		 * Updates the total cost of all items in the cart.
		 *
		 * @returns	{number}
		 */
		function updateTotal() {
			var total = 0;

			$('.cardog-cost').each(function () {
				total += Number($(this).text());
			});

			return total;
		}

		/**
		 * Calculates the cost for one item in the cart, based in the number of weeks selected, then updates 
		 * the total cost as well.
		 *
		 * @param	{object}	select	The select element displaying the number of weeks.
		 * @returns	{undefined}
		 */
		function calculateCost(select) {
				$('.cardog-cost[data-custom="'
					.concat($(select).attr('data-custom'))
					.concat('"]'))
					.attr('value', $(select).val() * 70)
					.text(function () {
						return $(this).attr('value');
				});

				$('#total').text(updateTotal);
		}

		$('.cardog-weeks').on({
			change: function () {
				calculateCost(this);
			}
		});

		$('.cardog-weeks').each(function () {
			calculateCost(this);
		});

//	$('.cardog-cost').each(function () {
//			$(this).text(function () {
//				return $('.cardog-weeks[data-custom="'
//					.concat($(this).attr('data-custom'))
//					.concat('"]'))
//					.val() * 70;
//			});
//		});

//	$('#total').text(updateTotal);
	}
});
