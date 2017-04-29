// @flow weak 

import { Explore } from './js/Explore';
import { diseases, countries } from './js/util.js';
import './sass/app.scss';

var app = app || {};

app.main = (function (){
  
  console.log('app.main.init');

  function render() {
    
    console.log('render');
    
    const container = document.createElement('div');
    const explore = new Explore(container);
    
    var test1 = document.createElement('button');
    test1.innerHTML = diseases[10] + ' in ' + countries[30].name;
    test1.addEventListener('click', e => explore.loadCurated({terms: [diseases[10]], geo: countries[30]}));
    container.appendChild(test1);

    // var test2 = document.createElement('button');
    // test2.innerHTML = 'Andropause';
    // test2.addEventListener('click', e => explore.updateData({diseases: ['Andropause']}));
    // container.appendChild(test2);

    var body = document.querySelector('body');
    if(body){
      body.appendChild(container);
    }
  }

  var init = function(){
    console.log('Initializing app.');
    render();
  };

  return {
    init: init
  };
})();

window.addEventListener('DOMContentLoaded', app.main.init);