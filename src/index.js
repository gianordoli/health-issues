// @flow weak 

import { Explore } from './js/Explore';
import { TrendsAPI } from './js/TrendsAPI';
import { Shiny } from 'shiny-server-client/dist/shiny-server-client.min';
import './sass/app.scss';

var app = app || {};

app.main = (function (){
  
  console.log('app.main.init');

  function render() {
    
    console.log('render');
    
    const container = document.createElement('div');
    const explore = new Explore(container);
    
    var test1 = document.createElement('button');
    test1.innerHTML = 'Allergy';
    test1.addEventListener('click', e => explore.updateData({diseases: ['Allergy']}));
    container.appendChild(test1);

    var test2 = document.createElement('button');
    test2.innerHTML = 'Andropause';
    test2.addEventListener('click', e => explore.updateData({diseases: ['Andropause']}));
    test2.addEventListener('click', function(){
      const trendsAPI = new TrendsAPI(function(data){
        updateData(data);
      });
    })

    function updateData(data) {
      console.log(data);
      Shiny.onInputChange("mydata", data);
      Shiny.addCustomMessageHandler("myCallbackHandler", function(message) {
        console.log('From R: ' + message);
      });      
    }

    container.appendChild(test2);

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

// class App extends React.Component {
// 	render() {
// 		return <div className="test">
// 			<h1>This is my AWESOME App</h1>
// 			<p>This is Eves app created with React, webpack and magic!</p>
// 		</div>
// 	}
// }

// ReactDOM.render(<App />, document.getElementById('react-container'));