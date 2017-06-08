var Model = {
	searchterms: "",
	searchSuggestions: null,
};

var SearchFormView = {

	searchterms: "",

	init: function(){
		// store pointers for easy access later
		var those = this;
		this.$searchEle = document.querySelector('.search');
		this.$searchInputEle = document.querySelector('.js-search');

		// Add event listeners
		var searchInputHandler = function(e){
			those.searchterms = this.value;
			console.log("code: ", e.which);

			if ( EventUtil.isAValidKeyCharForSearch(e) ) Fuzzearch.getDataFromAPI(this.value);

			if ( EventUtil.isAValidKeyCharForNavigate(e) ) {
				console.log('enter');
				e.preventDefault();
			}

		};

		EventUtil.addHandler(this.$searchInputEle, 'keyup', searchInputHandler);

		var arrownavigationHandler = function(e) {
			console.log(e);
			if ( EventUtil.isAValidKeyCharForNavigate(e) ) Fuzzearch.startArrowNavigation(e);
		}

		EventUtil.addHandler(document, 'keyup', arrownavigationHandler);
	}
};

var SearchSuggestionsView = {
	init: function() {
		this.$searchSuggestionsEle = document.querySelector(".search__suggestions");
		this.$searchSuggestionsListEle = document.querySelector(".search__suggestions__list");
	},

	render: function(){
		var those = this;
		var searchSuggestionsItems = Fuzzearch.getSearchSuggestions();

		// remove all content in the container list
		this.$searchSuggestionsListEle.innerHTML = "";

		if ( ! searchSuggestionsItems instanceof Object || searchSuggestionsItems.error ) return false;

		var searchterms = searchSuggestionsItems[0].toLowerCase(),
				searchSuggestions = searchSuggestionsItems[1],
				searchExcerpts = searchSuggestionsItems[2],
				searchLinks = searchSuggestionsItems[3],
				liElem, aElem;

		for (var i = 0; i < searchSuggestions.length; i++) {

			liElem = document.createElement('li');
	    liElem.className = 'search__suggestions__list__item';

	    aElem = document.createElement('a');
	    aElem.className = 'search__suggestions__list__item__link';
	    aElem.innerHTML = searchSuggestions[i].toLowerCase().replace(searchterms, "<b>" + searchterms + "</b>");

	    pElem = document.createElement('p');
	    pElem.className = 'search__suggestions__list__item__excerpt';
	    pElem.textContent = searchExcerpts[i];


	    EventUtil.addHandler(liElem, 'click', function(){

	    	Fuzzearch.removeCurrentItemOnSuggestionList();

	    	this.classList.add('current');
	    	
	    });

	    liElem.appendChild(aElem);
	    liElem.appendChild(pElem);

	    this.$searchSuggestionsListEle.appendChild(liElem);
		}
	},

	setupNavArrowDirection: function(e) {

		if( e.which == 40 ) 
			this.arrowNavDirection = "down";
		if( e.which == 38 ) 
			this.arrowNavDirection = "up";

	},

	renderArrowNavigation: function(e) {

		this.setupNavArrowDirection(e);

		if ( this.arrowNavDirection == "down" ) this.goToDown();

		if ( this.arrowNavDirection == "up" ) this.goToUp();
	},

	goToDown: function(){
		
		var currentItem = Fuzzearch.getCurrentItemOnSuggestionList();
		
		if ( ! currentItem ) {
			Fuzzearch.setFirstItemOnSuggestionListToCurrent();
			return false;
		}

		var nextSiblingItem = currentItem.nextSibling;

		if ( ! nextSiblingItem ) { return false; }

		Fuzzearch.removeCurrentItemOnSuggestionList();

		Fuzzearch.setCurrentItemOnSuggestionList(nextSiblingItem);

	},

	goToUp: function() {

		var currentItem = Fuzzearch.getCurrentItemOnSuggestionList();
		
		if ( ! currentItem ) { return false; }


		var previousSiblingItem = currentItem.previousSibling;

		if ( ! previousSiblingItem ) { return false; }

		Fuzzearch.removeCurrentItemOnSuggestionList();

		Fuzzearch.setCurrentItemOnSuggestionList(previousSiblingItem);
	}
};

var Fuzzearch = {
	init: function(){
		SearchFormView.init();
		SearchSuggestionsView.init();
	},

	getDataFromAPI:  function(searchterms){
		var those = this;
		Ajax.init(searchterms);

		Ajax.get().then(function(response) {
			those.setSearchSuggestions(response);
			SearchSuggestionsView.render();
		}).catch(function(error) {
			alert("Error:" + error);
		});
	},

	startArrowNavigation: function(e){
		console.log(e);
		e.preventDefault();
		SearchSuggestionsView.renderArrowNavigation(e);

	},

	getSearchSuggestions: function() {
		return Model.searchSuggestions;
	},

	setSearchSuggestions: function(searchSuggestions){
		Model.searchSuggestions = JSON.parse(searchSuggestions);
	},

	removeCurrentItemOnSuggestionList: function() {
		var currentItem = this.getCurrentItemOnSuggestionList();
		if ( ! currentItem ) return false;
		console.log(currentItem);
		currentItem.classList.remove('current');
	},

	getFirstItemOnSuggestionList: function() {
		if ( ! SearchSuggestionsView.$searchSuggestionsListEle.childNodes.length ) return false;

		var firstItem = SearchSuggestionsView.$searchSuggestionsListEle.childNodes[0];
		console.log(firstItem);

		return firstItem;
	},	

	getCurrentItemOnSuggestionList: function() {
		var currentItem = SearchSuggestionsView.$searchSuggestionsListEle.querySelector('.search__suggestions__list__item.current');
		return currentItem ? currentItem : false;
	},

	setFirstItemOnSuggestionListToCurrent: function() {
		var firstItem = this.getFirstItemOnSuggestionList();

		this.setCurrentItemOnSuggestionList(firstItem);

	},

	setCurrentItemOnSuggestionList: function(item) {
		item.classList.add('current');
	}
};


module.exports = Fuzzearch;