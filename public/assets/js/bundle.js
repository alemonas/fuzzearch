(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

/**
 * Manage Ajax Request 
 * @type {Object}
 */
var Ajax = {

	searchterms: "",
	req: null, // Xhr request
	url: "",

	init: function(searchterms) {
		this.searchterms = searchterms;
		this.setUrl();
	},

	setUrl: function() {
		this.url = "https://en.wikipedia.org/w/api.php?action=opensearch&format=json&formatversion=2&search=" + this.searchterms + "&namespace=0&limit=10&origin=*";
	},

	getUrl: function() {
		return this.url;
	},

	get: function() {

		var those = this;

		if ( this.req != null ){
			this.req.abort();
		}

		return new Promise(function(resolve, reject){
			those.req = new XMLHttpRequest();
			those.req.open("GET", those.url, true);

			those.req.addEventListener("load", function(){
				if (those.req.status < 400) {
					resolve(those.req.responseText);
				}else{
					reject(new Error('Request reject: ' + those.req.statusText));
				}
			});
			those.req.addEventListener('error', function(){
				reject(new Error('Network error'));
			});
			those.req.send(null);
		});
	}
};


module.exports = Ajax;
},{}],2:[function(require,module,exports){

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
},{}],3:[function(require,module,exports){
// Require the necessary resources for the app
var Ajax = require('./Ajax.js');
var EventUtil = require('./EventUtil.js');


// Fuzzearch MVC 

/**
 * The Model save the data for the application
 * @type {Object}
 */
var Model = {
	searchterms: "",
	searchSuggestions: null,
};

/**
 * View for the input section
 * @type {Object}
 */
var SearchFormView = {

	init: function(){

		// store pointers for easy access later
		var those = this;
		this.$searchEle = document.querySelector('.search');
		this.$searchInputEle = document.querySelector('.js-search');

		// Handler function for the serach keyup event
		var searchInputHandler = function(e){
			
			if ( EventUtil.isAValidKeyCharForSearch(e) ) Fuzzearch.getDataFromAPI(this.value);

			if ( EventUtil.isAValidKeyCharForNavigate(e) ) e.preventDefault(); 
		};

		// Create an event listener 
		EventUtil.addHandler(this.$searchInputEle, 'keyup', searchInputHandler);

		// Handler function for the arrow navigation
		var arrownavigationHandler = function(e) {
			if ( EventUtil.isAValidKeyCharForNavigate(e) ) Fuzzearch.startArrowNavigation(e);
		}

		// Add event listener to the document
		EventUtil.addHandler(document, 'keyup', arrownavigationHandler);
	}
};

/**
 * View for the Search Suggestion Area 
 * @type {Object}
 */
var SearchSuggestionsView = {

	/**
	 * Store the Element who wrap the search suggestions content
	 * @type {DOM Node Element}
	 */
	$searchSuggestionsele: null,


	/**
	 * Store the DOM Element who contains all the item suggested
	 * @type {DOM Node Element}
	 */
	$searchSuggestionsListEle: null,

	/**
	 * Save the direction of the arrow's navigation
	 * @type {String}
	 */
	arrowNavDirection: "down",

	/**
	 * Initialization
	 * @return @void
	 */
	init: function() {

		// store pointer for easy access later
		this.$searchSuggestionsEle = document.querySelector(".search__suggestions");
		this.$searchSuggestionsListEle = document.querySelector(".search__suggestions__list");
	},

	/**
	 * Renderization of the content
	 * @return @void
	 */
	render: function(){

		// save the scope of the value "this" 
		var those = this;

		// Get and store the search suggestions 
		var searchSuggestionsItems = Fuzzearch.getSearchSuggestions();

		// remove all content in the container list
		this.$searchSuggestionsListEle.innerHTML = "";

		// Validate searchSuggestionsItems
		if ( ! searchSuggestionsItems instanceof Object || searchSuggestionsItems.error ) return false;

		this.createHTMLSuggestionsContent(searchSuggestionsItems);
	},

	/**
	 * Create all the html content for the items in the list of suggestions
	 * @param  {JSON Object} searchSuggestionsItems
	 * @return @void
	 */
	createHTMLSuggestionsContent: function (searchSuggestionsItems) {
		
		// Save and organize the values of searchSuggestionItems for easy access later
		var searchterms = searchSuggestionsItems[0].toLowerCase(),
				searchSuggestions = searchSuggestionsItems[1],
				searchExcerpts = searchSuggestionsItems[2],
				searchLinks = searchSuggestionsItems[3],
				len = searchSuggestions.length,
				liElem, aElem;

		/**
		 * Navigate to all suggestions to create a ony by one item
		 * @param  {Int} var i
		 */
		for (var i = 0; i < len; i++) {

			// Create and config <li> element 
			liElem = document.createElement('li');
	    liElem.className = 'search__suggestions__list__item';

	    // Create and config <a> element 
	    aElem = document.createElement('a');
	    aElem.className = 'search__suggestions__list__item__link';
	    aElem.innerHTML = searchSuggestions[i].toLowerCase().replace(searchterms, "<b>" + searchterms + "</b>");

	    // Create and config <p> element 
	    pElem = document.createElement('p');
	    pElem.className = 'search__suggestions__list__item__excerpt';
	    pElem.textContent = searchExcerpts[i];

	    // Add a click event listener for set as a current item in the list of suggestions
	    EventUtil.addHandler(liElem, 'click', function(){
	    	Fuzzearch.removeCurrentPointerOnItemSuggestionList();
	    	this.classList.add('current');
	    });

	    // append children elements
	    liElem.appendChild(aElem);
	    liElem.appendChild(pElem);

	    // append the new item to the list
	    this.$searchSuggestionsListEle.appendChild(liElem);
		}
	},

	/**
	 * Setup the arrow navigation
	 * @param  {Event} e 
	 */
	setupNavArrowDirection: function(e) {

		// for arrow down
		if( e.which == 40 ) 
			this.arrowNavDirection = "down";

		// for arrow up
		if( e.which == 38 ) 
			this.arrowNavDirection = "up";

	},

	/**
	 * Renderization of the arrow navigation content
	 * @param  {Event} e 
	 */
	renderArrowNavigation: function(e) {

		this.setupNavArrowDirection(e);

		if ( this.arrowNavDirection == "down" ) this.goToDown();

		if ( this.arrowNavDirection == "up" ) this.goToUp();
	},

	/**
	 * Set the current item to the next sibling of the item list (if the item exists)
	 * @return {@void | boolan (for exit) }
	 */
	goToDown: function(){
		
		// Save the current item in a variable
		var currentItem = Fuzzearch.getCurrentItemOnSuggestionList();
		
		// check if isset a current item
		if ( ! currentItem ) {
			// in case that doesnt exists a current item, set the first item to current and exit
			Fuzzearch.setFirstItemOnSuggestionListToCurrent();
			return false;
		}

 		// find the next sibling item
		var nextSiblingItem = currentItem.nextSibling;

		// if doesnt exists (in case that the item be the last) return and exit
		if ( ! nextSiblingItem ) { return false; }

		
		// Set as current to the new item selected
		Fuzzearch.removeCurrentPointerOnItemSuggestionList();
		Fuzzearch.setCurrentItemOnSuggestionList(nextSiblingItem);

	},

	/**
	 * Set the current item to the previuos sibling of the item list (if the item exists)
	 * @return {@void | boolan (for exit) }
	 */
	goToUp: function() {

		// Save the current item in a variable
		var currentItem = Fuzzearch.getCurrentItemOnSuggestionList();
		
		// check if isset a current item
		if ( ! currentItem ) { 
			// in case that doesnt exists a current item, set the last item to current and exit
			Fuzzearch.setLastItemOnSuggestionListToCurrent();
			return false; 
		}

		// find the previous sibling item
		var previousSiblingItem = currentItem.previousSibling;

		// if doesnt exists (in case that the item be the first) return and exit
		if ( ! previousSiblingItem ) { return false; }

		// Set as current to the new item selected
		Fuzzearch.removeCurrentPointerOnItemSuggestionList();
		Fuzzearch.setCurrentItemOnSuggestionList(previousSiblingItem);
	}
};

/**
 * Controller
 * [Fuzzearch Controls all the interactions between the model and views for the Search]
 * @type {Object}
 */
var Fuzzearch = {

	/**
	 * Initailize the views
	 * @return {@void}
	 */
	init: function(){
		SearchFormView.init();
		SearchSuggestionsView.init();
	},

	/**
	 * Get the data from the API
	 * @param  {String} searchterms [contains the search terms]
	 * @return {[type]}
	 */
	getDataFromAPI:  function(searchterms){
		var those = this;

		// Initialize the Ajax Object and set the parameters
		Ajax.init(searchterms);

		/**
		 * Make the get request and return the reponse throught Promises
		 * @param  {[JSON object]} 
		 * @return @void
		 */
		Ajax.get()
			// in case of successs
			.then(function(response) {
				// set the search Suggestios items on the model
				those.setSearchSuggestions(response);
				// Render the search suggestions view
				SearchSuggestionsView.render();
			// in case of error, alert the error
			}).catch(function(error) {
				alert("Error:" + error);
		});
	},

	/**
	 * Start the arrow navigation
	 * @param  {Event} e 
	 * @return @void
	 */
	startArrowNavigation: function(e){
		e.preventDefault();
		SearchSuggestionsView.renderArrowNavigation(e);
	},

	/**
	 * Get the searchSuggestions from de Model
	 * @return {JSON Object}
	 */
	getSearchSuggestions: function() {
		return Model.searchSuggestions;
	},

	/**
	 * Set the searchSuggestions on the Model
	 * @param {String} searchSuggestions 
	 */
	setSearchSuggestions: function(searchSuggestions){
		Model.searchSuggestions = JSON.parse(searchSuggestions);
	},

	/**
	 * Remove the current pinter "class" of the items on sugestions list
	 * @return {[type]} [description]
	 */
	removeCurrentPointerOnItemSuggestionList: function() {
		var currentItem = this.getCurrentItemOnSuggestionList();
		if ( ! currentItem ) return false;

		currentItem.classList.remove('current');
	},

	/**
	 * Get the first item 
	 * @return {DOM Node Element} 
	 */
	getFirstItemOnSuggestionList: function() {
		var countItems = SearchSuggestionsView.$searchSuggestionsListEle.childNodes.length;

		// check 
		if ( ! countItems ) return false;

		var firstItem = SearchSuggestionsView.$searchSuggestionsListEle.childNodes[0];

		return firstItem;
	},	

	/**
	 * Get the Last item 
	 * @return {DOM Node Element} 
	 */
	getLastItemOnSuggestionList: function() {
		var countItems = SearchSuggestionsView.$searchSuggestionsListEle.childNodes.length;

		// check 
		if ( ! countItems ) return false;

		return SearchSuggestionsView.$searchSuggestionsListEle.childNodes[countItems -1];
	},

	/**
	 * find and return the current item on the suggestion list
	 * @return {DOM Node Element | false} 
	 */
	getCurrentItemOnSuggestionList: function() {
		var currentItem = SearchSuggestionsView.$searchSuggestionsListEle.querySelector('.search__suggestions__list__item.current');
		return currentItem ? currentItem : false;
	},

	/**
	 * Set the current item to the last item on the list
	 */
	setLastItemOnSuggestionListToCurrent: function() {
		var lastItem = this.getLastItemOnSuggestionList();

		this.setCurrentItemOnSuggestionList(lastItem);

	},

	/**
	 * Set the current item to the first item on the list
	 */
	setFirstItemOnSuggestionListToCurrent: function() {
		var firstItem = this.getFirstItemOnSuggestionList();

		this.setCurrentItemOnSuggestionList(firstItem);

	},

	/**
	 * Set the item to the current
	 * @param @void
	 */
	setCurrentItemOnSuggestionList: function(item) {
		item.classList.add('current');
	}
};


document.addEventListener('DOMContentLoaded', function (event) {
	// Initialize Fuzzearch
	Fuzzearch.init();


	SearchSuggestionsView.$searchSuggestionsListEle.style.display = 'block';



});
},{"./Ajax.js":1,"./EventUtil.js":2}]},{},[3]);
