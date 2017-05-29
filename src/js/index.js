// @flow weak

import { Home } from './pages/Home';
import { Intro } from './pages/Intro';
import { Stories } from './pages/Stories';
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

  let explore;
  let ticking = false;
  let storiesOffsetTop;

  function checkScroll(e) {
    if (!ticking) {
      window.requestAnimationFrame(function() {
        ticking = false;
        if (window.scrollY > storiesOffsetTop) {
          window.removeEventListener('scroll', checkScroll);
          initializeExplore();
        }
      });
    }
    ticking = true;
  }

  function initializeExplore() {
    log.info('initializeExplore');
    const filter = {
      terms: [
        terms.find(t => t.name === 'Sunburn'),
        terms.find(t => t.name === 'Dehydration'),
        terms.find(t => t.name === 'Lyme disease'),
      ], geo: countries[0]
    }
    explore.loadFilter(filter);
  }



  function render(shinyAPI: ?ShinyAPI, trendsAPI: TrendsAPI) {

    log.info('render');

    const elementsContainer = document.createElement('div');
    elementsContainer.classList.add('main-container');
    const body = document.querySelector('body');
    if (body) {
      body.appendChild(elementsContainer);
    }

    const home = new Home(elementsContainer, trendsAPI);
    const intro = new Intro(elementsContainer);
    const stories = new Stories(elementsContainer);
    explore = new Explore(elementsContainer, shinyAPI, trendsAPI);
    const about = new About(elementsContainer);

    const storiesDiv = document.querySelector('#stories.page');
    if (storiesDiv) {
      storiesOffsetTop = storiesDiv.offsetTop;
    }
    window.addEventListener('scroll', checkScroll);
    // const ranking = new Ranking(trendsAPI);
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
