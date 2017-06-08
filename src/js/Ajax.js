
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