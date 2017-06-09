// @flow weak

import Home from './pages/Home';
import Intro from './pages/Intro';
import Stories from './pages/Stories';
import Explore from './pages/Explore';
import About from './pages/About';
import ShinyAPI from './api/ShinyAPI';
import TrendsAPI from './api/TrendsAPI';
import terms from './data/terms';
import countries from './data/countries';
import log from 'loglevel';
import Stickyfill from 'stickyfill';
const stickyfill = Stickyfill();
import '../sass/App.scss';

import GetMapData from './scripts/GetMapData';

var app = app || {};

app.main = (function (){

  let explore;
  let ticking = false;
  let storiesOffsetTop;

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
    const diseases = [
      terms.find(t => t.name === 'Sunburn'),
      terms.find(t => t.name === 'Dehydration'),
      terms.find(t => t.name === 'Lyme disease'),
    ];
    const geo = countries[0];
    explore.updateData({ diseases, geo });
    explore.confirmFilters(null, explore);
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

    stickyfill.init();
    var stickyElements = document.getElementsByClassName('page-header');
    for (var i = stickyElements.length - 1; i >= 0; i--) {
        Stickyfill.add(stickyElements[i]);
    }

    // const getMapData = new GetMapData(trendsAPI);
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
