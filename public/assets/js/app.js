var Ajax = {

	searchterms: "",
	req: null, // Xhr request

	url: "https://en.wikipedia.org/w/api.php?action=opensearch&format=json&formatversion=2&search=albert&namespace=0&limit=20&origin=*",

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

		return new Promise(function(resolve, reject){
			var req = new XMLHttpRequest();
			req.open("GET", those.url, true);

			req.addEventListener("load", function(){
				if (req.status < 400) {
					resolve(req.responseText);
				}else{
					reject(new Error('Request reject: ' + req.statusText));
				}
			});
			req.addEventListener('error', function(){
				reject(new Error('Network error'));
			});
			req.send(null);
		});
	}
};

var EventUtil = {
	addHandler: function(element, type, handler){
		if (element.addEventListener){
			element.addEventListener(type, handler, false);
		} else if (element.attachEvent){
			element.attachEvent("on" + type, handler);
		} else {
			element["on" + type] = handler;
		}
	},
	removeHandler: function(element, type, handler){
		if (element.removeEventListener){
			element.removeEventListener(type, handler, false);
		} else if (element.detachEvent){
			element.detachEvent("on" + type, handler);
		} else {
			element["on" + type] = null;
		}
	},

	isAValidKeyCharForSearch: function(e) {
		if ( e.which <= 222 && e.which >= 48 || e.which == 8 ) return true;
  	return false;
	},

	isAValidKeyCharForNavigate: function(e){
		if ( e.which == 40 || e.which == 38 ) return true;
		return false;
	}
};

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

		// this.render();	
	},

	render: function(){
		var those = this;
		var searchSuggestionsItems = Fuzzearch.getSearchSuggestions();

		console.info(searchSuggestionsItems.error);

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
	    // aElem.setAttribute('href', searchLinks[i]);
	    // aElem.setAttribute('target', '_blank');
	    
	    // divWrapItemInfo = "<div class='search__suggestions__list__item__excerpt>'";
	    // divWrapItemInfo += "<p>Hola</p>";<
	    // divWrapItemInfo += "</div>'";

	    pElem = document.createElement('p');
	    pElem.className = 'search__suggestions__list__item__excerpt';
	    pElem.textContent = searchExcerpts[i];

	    // EventUtil.addHandler(aElem, 'click', function(){
	    // 	this.classList.add('current');
	    // 	// alert(i);
	    // 	// this.classList.add('current' + i);
	    // });

	    EventUtil.addHandler(liElem, 'click', function(){

	    	var current = Fuzzearch.getCurrentItemOnSuggestionList();

	    	// var current = those.$searchSuggestionsListEle.querySelector('.search__suggestions__list__item.current');

	    	if (current) current.classList.remove('current');

	    	this.classList.add('current');
	    	
	    });

	    // EventUtil.addHandler(liElem, 'click', function(){

	    // 	liElem.classList.add('current');

	    // 	// var parentNode = this.parentNode;
	    // 	var items = those.$searchSuggestionsListEle.querySelectorAll('.search__suggestions__list__item.current');

	    	
	    // 	// if ( this.classList.contains("current") )
	    // });

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
}

document.addEventListener('DOMContentLoaded', function (event) {
	Fuzzearch.init();
});