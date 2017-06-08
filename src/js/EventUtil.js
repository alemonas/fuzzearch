
/**
 * Util Event manage functions
 * @type {Object}
 */
var EventUtil = {

	/**
	 * Add Event Listener
	 * @param {DOM element} element
	 * @param {String}  type
	 * @param {Function} handler
	 */
	addHandler: function(element, type, handler){
		if (element.addEventListener){
			element.addEventListener(type, handler, false);
		} else if (element.attachEvent){
			element.attachEvent("on" + type, handler);
		} else {
			element["on" + type] = handler;
		}
	},

	/**
	 * Remove an Event Listener
	 * @param  {DOM element}element
	 * @param  {String} type
	 * @param  {Function} handler
	 * @return @void
	 */
	removeHandler: function(element, type, handler){
		if (element.removeEventListener){
			element.removeEventListener(type, handler, false);
		} else if (element.detachEvent){
			element.detachEvent("on" + type, handler);
		} else {
			element["on" + type] = null;
		}
	},

	/**
	 * Validate if a chars is a valid string for the search
	 * @param  {[Event} e 
	 * @return {Boolean} 
	 */
	isAValidKeyCharForSearch: function(e) {
		if ( e.which <= 222 && e.which >= 48 || e.which == 8 ) return true;
  	return false;
	},

	/**
	 * Validate if the event key is for arrow up or down
	 * @param  {[Event} e 
	 * @return {Boolean} 
	 */
	isAValidKeyCharForNavigate: function(e){
		if ( e.which == 40 || e.which == 38 ) return true;
		return false;
	}
};

module.exports = EventUtil;