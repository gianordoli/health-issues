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

    // Curated
    // const curatedNav = document.createElement('div');
    // const curatedTitle = document.createElement('h3');
    // curatedTitle.innerHTML = 'Curated';
    // curatedNav.appendChild(curatedTitle);
    //
    // const test1 = document.createElement('button');
    // test1.innerHTML = 'Curated in ' + countries[11].name;
    // test1.addEventListener('click', e => explore.loadCurated({
    //   terms: [terms[139], terms[257], terms[2142]], geo: countries[11]
    // }));
    // curatedNav.appendChild(test1);
    //
    // const test2 = document.createElement('button');
    // test2.innerHTML = 'Curated in the' + countries[241].name;
    // test2.addEventListener('click', e => explore.loadCurated({
    //   terms: [terms[78], terms[254], terms[1018]], geo: countries[241]
    // }));
    // curatedNav.appendChild(test2);
    //
    // elementsContainer.appendChild(curatedNav);

    const home = new Home(elementsContainer, trendsAPI);
    const intro = new Intro(elementsContainer);
    const curated = new Curated(elementsContainer);
    const explore = new Explore(elementsContainer, shinyAPI, trendsAPI);
    const about = new About(elementsContainer);

    explore.loadCurated({
      terms: [terms[55], terms[359], terms[515]], geo: countries[241]
    });
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
