var http = require('http');

// function getTestPersonaLoginCredentials(callback) {

//   return http.get({
//     host: 'personatestuser.org',
//     path: '/email'
//   }, function(response) {
//     console.log(response);
//     // Continuously update stream with data
//     var body = '';
//     response.on('data', function(d) {
//       body += d;
//     });
//     response.on('end', function() {
//       // Data reception is done, do whatever with it!
//       var parsed = JSON.parse(body);
//       callback({
//         email: parsed.email,
//         password: parsed.pass
//       });
//     });
//   });
// };

console.log("hola");
// getTestPersonaLoginCredentials();

return http.get({
    host: 'https://en.wikipedia.org/',
    path: 'w/api.php?action=opensearch&format=json&formatversion=2&search=albert&namespace=0&limit=20'
  }, function(response) {
    console.log(response);
  }
);