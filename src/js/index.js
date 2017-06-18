// @flow weak

import MainNav from './components/MainNav';
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

  function initializeExplore() {
    log.info('initializeExplore');
    const diseases = [
      terms.find(t => t.name === 'Sunburn'),
      // terms.find(t => t.name === 'Dehydration'),
      // terms.find(t => t.name === 'Lyme disease'),
    ];
    const geo = countries[0];
    explore.updateData({ diseases, geo });
    explore.confirmFilters(explore);
  }

  let ticking = false;
  let scrollY = 0;
  function scrollTicker(evt: Event, home: Home, mainNav: MainNav) {
    if (!ticking) {
      window.requestAnimationFrame(function() {
        ticking = false;
        scrollY = window.scrollY;
        home.checkScroll(scrollY, home);
        mainNav.moveBurger(scrollY, mainNav);
      });
    }
    ticking = true;
  }

  function render(shinyAPI: ?ShinyAPI, trendsAPI: TrendsAPI) {

    log.info('render');
    const body = document.querySelector('body');

    if (body) {

      const mainNav = new MainNav(body);

      const header = document.createElement('header');
      body.appendChild(header);
      const home = new Home(header, trendsAPI);

      const mainContainer = document.createElement('div');
      mainContainer.classList.add('main-container');
      body.appendChild(mainContainer);

      const intro = new Intro(mainContainer);
      const stories = new Stories(mainContainer);
      explore = new Explore(mainContainer, shinyAPI, trendsAPI);
      const about = new About(mainContainer);

      stickyfill.init();
      var stickyElements = document.getElementsByClassName('sticky');
      for (let i = stickyElements.length - 1; i >= 0  ; i--) {
        stickyfill.add(stickyElements[i]);
      }

      const bindScrollListener = evt => scrollTicker(evt, home, mainNav);
      window.addEventListener('scroll', bindScrollListener);
    }
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
