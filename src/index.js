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
    test1.innerHTML = terms[18].name + ' in ' + countries[10].name;
    test1.addEventListener('click', e => explore.loadCurated({terms: [terms[18]], geo: countries[10]}));
    curatedNav.appendChild(test1);

    const test2 = document.createElement('button');
    test2.innerHTML = terms[12].name + ' in ' + countries[234].name;
    test2.addEventListener('click', e => explore.loadCurated({terms: [terms[12]], geo: countries[234]}));
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
