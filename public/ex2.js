const request = require('request');

const options = {  
    // url: 'https://www.reddit.com/r/funny.json',
    url: 'https://en.wikipedia.org/w/api.php?action=opensearch&format=json&formatversion=2&search=albert&namespace=0&limit=20',
    method: 'GET',
    headers: {
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8',
        'User-Agent': 'wikipedia-client'
    }
};

request(options, function(err, res, body) {  
    let json = JSON.parse(body);
    return json;
});
