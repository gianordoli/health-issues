// @flow weak

import { Home } from './pages/Home';
import { Intro } from './pages/Intro';
import { Curated } from './pages/Curated';
import { Explore } from './pages/Explore';
import { About } from './pages/About';
import { ShinyAPI } from './api/ShinyAPI';
import { TrendsAPI } from './api/TrendsAPI';
import { terms, countries } from './util/data.js';
import log from 'loglevel';
import '../sass/App.scss';
import Ranking from './scripts/Ranking';

var app = app || {};

app.main = (function (){

  function loadShinyAPI() {
    const shinyAPI = new ShinyAPI();
    if (ENV !== 'DEVELOPMENT') {
      shinyAPI.setup(function(){
        loadTrendsAPI(shinyAPI);
      });
    } else {
      loadTrendsAPI(null);
    }
  }

  function loadTrendsAPI(shinyAPI: ?ShinyAPI) {
    const trendsAPI = new TrendsAPI();
    trendsAPI.setup(function(){
      render(shinyAPI, trendsAPI);
    });
  }

  function render(shinyAPI: ?ShinyAPI, trendsAPI: TrendsAPI) {

    log.info('render');

    const elementsContainer = document.createElement('div');
    elementsContainer.classList.add('main-container');
    const body = document.querySelector('body');
    if (body) {
      body.appendChild(elementsContainer);
    }

    new Ranking(trendsAPI);

    // const home = new Home(elementsContainer, trendsAPI);
    // const intro = new Intro(elementsContainer);
    // const curated = new Curated(elementsContainer);
    // const explore = new Explore(elementsContainer, shinyAPI, trendsAPI);
    // const about = new About(elementsContainer);
    //
    // explore.loadCurated({
    //   terms: [terms[55], terms[359], terms[515]], geo: countries[241]
    // });
  }

  const init = function(){
    log.enableAll();
    log.info('Initializing app.');
    log.info('ENV: ' + ENV);
    loadShinyAPI();
  };

  return {
    init: init
  };
})();

window.addEventListener('DOMContentLoaded', app.main.init);
