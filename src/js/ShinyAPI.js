// @flow weak

export class ShinyAPI {

  keepShinyAlive: () => {};

  constructor() {
    console.log('ShinyAPI');
  }

  addListeners(explore, callback) {
    console.log('addShinyListeners');
    const self = this;

    $(document).on('shiny:connected', function(event) {
      console.log('Connected to Shiny server');
    });

    $(document).on('shiny:sessioninitialized', function(event) {
      console.log('Shiny session initialized');

      // Create a loop to ping the Shiny server and keep the websocket connection on
      clearInterval(self.keepShinyAlive);
      self.keepShinyAlive = setInterval(pingShiny, 10000);
      function pingShiny() {
        const timestamp = Date.now();
        Shiny.onInputChange('ping', timestamp);      
      }

      // Add listener for stl data
      Shiny.addCustomMessageHandler('myCallbackHandler', function(dataFromR) {
        console.log('From R: ', dataFromR);
        callback(explore, dataFromR);
      });
    });

    $(document).on('shiny:idle', function(event) {
      console.log('Shiny session idle');
    });

    $(document).on('shiny:disconnected', function(event) {
      console.log('Disconnected from Shiny server');
      location.reload();
    });
  }

  updateData(data) {
    Shiny.onInputChange('mydata', data);
  }
}