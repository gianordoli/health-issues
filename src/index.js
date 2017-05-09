// @flow weak

import { Explore } from './js/Explore';
import { terms, countries } from './js/util.js';
import './sass/app.scss';

var app = app || {};

app.main = (function (){

  console.log('app.main.init');

  function render() {

    console.log('render');

    const elementsContainer = document.createElement('div');
    const body = document.querySelector('body');
    if (body) {
      body.appendChild(elementsContainer);
    }

    // Curated
    const curatedNav = document.createElement('div');
    const curatedTitle = document.createElement('h3');
    curatedTitle.innerHTML = 'Curated';
    curatedNav.appendChild(curatedTitle);

    const test1 = document.createElement('button');
    test1.innerHTML = 'Curated in ' + countries[11].name;
    test1.addEventListener('click', e => explore.loadCurated({
      terms: [terms[139], terms[257], terms[2142]], geo: countries[11]
    }));
    curatedNav.appendChild(test1);

    const test2 = document.createElement('button');
    test2.innerHTML = 'Curated in the' + countries[241].name;
    test2.addEventListener('click', e => explore.loadCurated({
      terms: [terms[78], terms[254], terms[1018]], geo: countries[241]
    }));
    curatedNav.appendChild(test2);

    elementsContainer.appendChild(curatedNav);


    // Explore
    const explore = new Explore(elementsContainer);
  }

  const init = function(){
    console.log('Initializing app.');
    render();
  };

  return {
    init: init
  };
})();

window.addEventListener('DOMContentLoaded', app.main.init);
