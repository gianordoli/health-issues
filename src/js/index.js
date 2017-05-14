// @flow weak

import { Home } from './pages/Home';
import { Intro } from './pages/Intro';
import { Curated } from './pages/Curated';
import { Explore } from './pages/Explore';
import { About } from './pages/About';
import { terms, countries } from './util/util.js';
import log from 'loglevel';
import '../sass/App.scss';

var app = app || {};

app.main = (function (){

  console.log('app.main.init');

  function render() {

    console.log('render');

    const elementsContainer = document.createElement('div');
    elementsContainer.id = 'page-container';
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

    const home = new Home(elementsContainer);
    const intro = new Intro(elementsContainer);
    const curated = new Curated(elementsContainer);    
    const explore = new Explore(elementsContainer);
    const about = new About(elementsContainer);
  }

  const init = function(){
    console.log('Initializing app.');
    log.setLevel('trace');
    render();
  };

  return {
    init: init
  };
})();

window.addEventListener('DOMContentLoaded', app.main.init);
