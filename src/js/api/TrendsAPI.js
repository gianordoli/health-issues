// @flow weak

import type { Filter } from '../util/types';
import log from 'loglevel';

export class TrendsAPI {

  gapi: () => {};

  constructor() {
    log.info('TrendsAPI');
  }

  setup(callback) {
    const self = this;
    require( 'google-client-api' )()
      .then( function( gapi ) {
        log.info('GoogleAPI library loaded');
        gapi.load('client', start);

        function start() {
          const apiKey = 'AIzaSyAGzlgd2FAXWWaq10kSmTZ-y6SE15Xx3Hk';
          const id = 'diseases';
          gapi.client.init({
            'apiKey': apiKey,
            'clientId': 'diseases.apps.googleusercontent.com',
          })
          .then(function(){
            log.info('GoogleAPI client initialized');
            self.gapi = gapi;
            if (callback) {
              callback();  
            }
          })
        }
      });
  }

  composePath(method: string, filter: Filter) {
    const { geo } = filter;
    const { terms } = filter;
    let path = 'https://www.googleapis.com/trends/v1beta/graph?';
    for (const t of terms) {
      path += 'terms=' + encodeURIComponent(t.entity) + '&';
    }
    if (geo.iso !== 'world') {
      path += 'restrictions.geo='+geo.iso;
    }
    log.info(path);
    return path;
  }

  executeCall(path: string, callback) {
    this.gapi.client.request({
      'path': path
    })
    .then(function(response) {
        callback(response.result);
      }, function(reason) {
        log.info('Error: ' + reason.result.error.message);
      });
  }

  getGraph(filter: Filter, callback) {
    log.info('getGraph for:', filter);
    const path = this.composePath('graph', filter);
    this.executeCall(path, callback);
  }

  getGraph(filter: Filter, callback) {
    log.info('getTopQueries for:', filter);
    const path = this.composePath('topQueries', filter);
    this.executeCall(path, callback);
  }
}
