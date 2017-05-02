// @flow weak

import type { Filter } from './types'

export class TrendsAPI {

  gapi: () => {};

  constructor(callback) {
    
    console.log('TrendsAPI');
    const self = this;
    
    require( 'google-client-api' )()
      .then( function( gapi ) {
        console.log('GoogleAPI library loaded');
        gapi.load('client', start);

        function start() {
          const apiKey = 'AIzaSyAGzlgd2FAXWWaq10kSmTZ-y6SE15Xx3Hk';
          const id = 'diseases';
          gapi.client.init({
            'apiKey': apiKey,
            'clientId': 'diseases.apps.googleusercontent.com',
          })
          .then(function(){
            console.log('GoogleAPI client initialized');
            self.gapi = gapi;
          })
        }
      });
  }

  getTrends(filter: Filter, callback) {
    console.log('Requesting data for:', filter);
    const { geo } = filter;
    const { terms } = filter;
    let path = 'https://www.googleapis.com/trends/v1beta/graph?';
    for (const t of terms) {
      path += 'terms=' + encodeURIComponent(t.entity) + '&';
    }
    if (geo.iso !== '') {
      path += 'restrictions.geo='+geo.iso;
    }
    console.log(path);
    this.gapi.client.request({
      'path': path
    })
    .then(function(response) {
        callback(response.result);
      }, function(reason) {
        console.log('Error: ' + reason.result.error.message);
      });
  }
}