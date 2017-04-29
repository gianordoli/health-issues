// @flow weak

export class TrendsAPI {

  constructor(callback) {
    
    console.log('TrendAPI');
    
    require( 'google-client-api' )().then( function( gapi ) {
      
      console.log('GoogleAPI library loaded');

      // 1. Load the JavaScript client library.
      gapi.load('client', start);

      function start() {
        const apiKey = 'AIzaSyAGzlgd2FAXWWaq10kSmTZ-y6SE15Xx3Hk';
        const id = 'diseases';

        // 2. Initialize the JavaScript client library.
        gapi.client.init({
          'apiKey': apiKey,
          // clientId and scope are optional if auth is not required.
          'clientId': 'diseases.apps.googleusercontent.com',
        }).then(function() {
          // 3. Initialize and make the API request.
          return gapi.client.request({
            'path': 'https://www.googleapis.com/trends/v1beta/graph?terms=flu',
          })
        }).then(function(response) {
          // console.log(response.result.lines[0].points);
          callback(response.result);
        }, function(reason) {
          console.log('Error: ' + reason.result.error.message);
        });      
      }
    });
  }
}