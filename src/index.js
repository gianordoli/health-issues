// @flow weak 

import { Explore } from './js/Explore';
import { diseases, countries } from './js/util.js';
import './sass/app.scss';

var app = app || {};

app.main = (function (){
  
  console.log('app.main.init');

  function render() {
    
    console.log('render');
    
    const elementsContainer = document.createElement('div');

    // Curated
    const curatedNav = document.createElement('div');
    const curatedTitle = document.createElement('h3');
    curatedTitle.innerHTML = 'Curated';
    curatedNav.appendChild(curatedTitle);

    const test1 = document.createElement('button');
    test1.innerHTML = diseases[10] + ' in ' + countries[30].name;
    test1.addEventListener('click', e => explore.loadCurated({terms: [diseases[10]], geo: countries[30]}));
    curatedNav.appendChild(test1);

    const test2 = document.createElement('button');
    test2.innerHTML = diseases[2] + ' in ' + countries[234].name;
    test2.addEventListener('click', e => explore.loadCurated({terms: [diseases[2]], geo: countries[234]}));
    curatedNav.appendChild(test2);

    elementsContainer.appendChild(curatedNav);


    // Explore
    const explore = new Explore(elementsContainer);

    const body = document.querySelector('body');
    if(body){
      body.appendChild(elementsContainer);
    }
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