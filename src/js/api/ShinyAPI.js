// @flow weak

import { Explore } from '../pages/Explore';
import log from 'loglevel';

export class ShinyAPI {

  keepShinyAlive: () => {};
  isInitialized: boolean;

  constructor() {
    log.info('ShinyAPI');
  }

  setup(callback: () => {}) {
    log.info('addShinyListeners');
    const self = this;

    $(document).on('shiny:connected', function(event) {
      log.info('Connected to Shiny server');
    });

    $(document).on('shiny:sessioninitialized', function(event) {
      log.info('Shiny session initialized');

      // Create a loop to ping the Shiny server and keep the websocket connection on
      clearInterval(self.keepShinyAlive);
      self.keepShinyAlive = setInterval(pingShiny, 10000);
      function pingShiny() {
        const timestamp = Date.now();
        Shiny.onInputChange('ping', timestamp);
      }

      self.isInitialized = true;
      callback();
    });

    $(document).on('shiny:idle', function(event) {
      log.info('Shiny session idle');
    });

    $(document).on('shiny:disconnected', function(event) {
      log.info('Disconnected from Shiny server');
      location.reload();
    });
  }

  setCallback(explore: Explore, callback: () => {}) {
    log.info('Shiny setCallback');
    // Add listener for stl data
    Shiny.addCustomMessageHandler('myCallbackHandler', function(dataFromR) {
      log.info('From R: ', dataFromR);
      callback(explore, dataFromR);
    });
  }

  updateData(data) {
    Shiny.onInputChange('mydata', data);
  }
}
