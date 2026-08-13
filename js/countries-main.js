jQuery(document).ready(function ($) {

	//for compatibility with older PMPro, make sure bcountry fields have ids
	jQuery("[name='bcountry']").attr('id', 'bcountry');
	jQuery("[name='scountry']").attr('id', 'scountry');

	jQuery("[name='pmpro_bcountry']").attr('id', 'bcountry');
	jQuery("[name='pmpro_bstate']").attr('id', 'bstate');

	// Whether a states object actually has any states/provinces in it.
	function pmprosd_has_states(states) {
		return typeof states !== 'undefined' && states !== null && Object.keys(states).length > 0;
	}

	/**
	 * Build the state field for a country: a populated dropdown if the country has states,
	 * or hide the field entirely (and clear its value) if it doesn't have any states so that
	 * it isn't shown or required at checkout.
	 *
	 * @param {string} id       The id (and name) of the state field, e.g. "bstate" or "pmpro_sstate".
	 * @param {string} wrapper  A selector for the field's wrapping element to show/hide.
	 * @param {Object} states   The states for the currently selected country, keyed by abbreviation.
	 * @param {string} selected The value that should be selected/prefilled, if any.
	 */
	function pmprosd_update_state_field(id, wrapper, states, selected) {
		var $field = jQuery('#' + id);
		var $wrapper = jQuery(wrapper);
		var has_error = $field.hasClass('pmpro_form_input-error');

		if (!pmprosd_has_states(states)) {
			// The selected country doesn't have any states/provinces defined.
			// Clear the value so it isn't submitted, and hide the field so it isn't shown or required.
			$field.val('');
			$wrapper.hide();
			return;
		}

		// The selected country has states/provinces. Make sure the field is visible and rebuild it as a dropdown.
		$wrapper.show();

		var error_class = has_error ? 'pmpro_form_input-error ' : '';
		$field.replaceWith('<select id="' + id + '" name="' + id + '" class="' + error_class + 'pmpro_form_input pmpro_form_input-select"></select>');

		pmprosd_populate_dropdown('#' + id, states, pmpro_state_labels.region, selected);
	}

	//make sure we have a bstate field to work with
	if (jQuery('#bstate').length) {
		var selected_states = pmprosd_states[pmpro_state_dropdowns.bcountry];
		pmprosd_update_state_field('bstate', '.pmpro_form_field-bstate', selected_states, pmpro_state_dropdowns.bstate);
	}

	//make sure we have a bcountry field to work with
	if (jQuery('#bcountry').length) {
		// Move #bcountry field and label above #bcity field and label.
		var bcountryDiv = jQuery('label[for="bcountry"]').closest('div');
		bcountryDiv.insertBefore(jQuery('label[for="bcity"]').closest('div'));
	}

	jQuery('body').on('change', "#bcountry", function () {
		var selected_country = jQuery(this).val();
		var selected_states = pmprosd_states[selected_country];
		pmprosd_update_state_field('bstate', '.pmpro_form_field-bstate', selected_states, '');
	});

	//pmpro-shipping support
	if (jQuery('#pmpro_scountry').length) {

		// Move Shipping Country field above city for better UX.
		jQuery('#pmpro_scountry_div').insertBefore(jQuery('#pmpro_scity_div').closest('div'));

		pmprosd_populate_dropdown("#pmpro_scountry", pmprosd_countries, pmpro_state_labels.country, pmpro_state_dropdowns.scountry);

		var selected_states = pmprosd_states[pmpro_state_dropdowns.scountry];
		pmprosd_update_state_field('pmpro_sstate', '#pmpro_sstate_div', selected_states, pmpro_state_dropdowns.sstate);
	}

	jQuery('body').on('change', "#pmpro_scountry", function () {
		var selected_country = jQuery(this).val();
		var selected_states = pmprosd_states[selected_country];
		pmprosd_update_state_field('pmpro_sstate', '#pmpro_sstate_div', selected_states, '');
	});

	// Add support for Same as billing: keep the shipping state field in sync with the billing state field/country.
	jQuery('#pmproship_same_billing_address').on('change', function () {
		if (jQuery(this).is(':checked')) {
			var selected_state = jQuery('#bstate').val();
			var billing_states = pmprosd_states[jQuery('#bcountry').val()];
			pmprosd_update_state_field('pmpro_sstate', '#pmpro_sstate_div', billing_states, selected_state);
		}
	});


	//PMPro orders page support
	if (jQuery('#billing_country').length) {

		jQuery('#billing_country').replaceWith('<select id="billing_country" name="billing_country"></select>');

		pmprosd_populate_dropdown("#billing_country", pmprosd_countries, pmpro_state_labels.country, pmpro_state_dropdowns.bcountry);
		var selected_states = pmprosd_states[pmpro_state_dropdowns.bcountry];

		if (typeof selected_states !== 'undefined' && jQuery(selected_states).length > 0) {
			jQuery('#billing_state').replaceWith('<select id="billing_state" name="billing_state" class="pmpro_form_input pmpro_form_input-select"></select>');
		} else {
			jQuery('#billing_state').replaceWith('<input type="text" id="billing_state" name="billing_state" class="pmpro_form_input pmpro_form_input-text" />');
		}

		pmprosd_populate_dropdown("#billing_state", selected_states, pmpro_state_labels.region, pmpro_state_dropdowns.bstate);

	}

	jQuery('body').on('change', "[name='billing_country']", function () {
		var selected_country = jQuery(this).val();

		var selected_states = pmprosd_states[selected_country];

		if (typeof selected_states !== 'undefined' && jQuery(selected_states).length > 0) {
			jQuery('#billing_state').replaceWith('<select id="billing_state" name="billing_state" class="pmpro_form_input pmpro_form_input-select"></select>');
		} else {
			jQuery('#billing_state').replaceWith('<input type="text" id="billing_state" name="billing_state" class="pmpro_form_input pmpro_form_input-text" />');
		}

		pmprosd_populate_dropdown("#billing_state", selected_states, pmpro_state_labels.region, pmpro_state_dropdowns.bstate);
	});

	function pmprosd_populate_dropdown(id, states, first_label, selected) {

		//Empty the dropdown first
		jQuery(id).html("");
		jQuery(id).append("<option value=''>" + first_label + "</select>");
		//Loop through the states and load them into the HTML dropdown
		if (typeof states !== 'undefined') {
			for (key in states) {
				if (selected.length > 0 && selected == key) {
					var selected_string = "selected='selected'";
				} else {
					var selected_string = "";
				}
				jQuery(id).append("<option value='" + key + "' " + selected_string + ">" + states[key] + "</option>");
			}
		}
	}

});
