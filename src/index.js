// @flow weak 

import { Explore } from './js/Explore';
import { TrendsAPI } from './js/TrendsAPI';
import { dummyData } from './js/util'
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
      console.log('From Google Trends: ', data);

      const dataToR = data.lines[0].points.map((p, i) => p.date+','+p.value);
      const dates = data.lines[0].points.map((p, i) => p.date);
      parseRData(dummyData, dates);

      Shiny.onInputChange("mydata", dataToR);
      Shiny.addCustomMessageHandler("myCallbackHandler", function(dataFromR) {
        console.log('From R: ', dataFromR);
        parseRData(dataFromR, dates);
      });
    }

    function parseRData(dataFromR, dates) {

      let seasonal = dataFromR.substring(dataFromR.indexOf('seasonal:') + 'seasonal:'.length + 1, dataFromR.indexOf('trend:'));
      seasonal = (seasonal.split(',')).map((n, i) => {
        return{ date: dates[i], value: Number(n.trim())}
      });
      console.log(seasonal);
      // let data = message.substring(message.indexOf('(') + 1, message.lastIndexOf(')'));
      // data = data.split(',');
      // let seasonal = [];
      // let trend = [];
      // for(let i = 0; i < data.length; i += 3) {
      //   seasonal.push(data[i]);
      //   trend.push(data[i+1]);
      // }
      // console.log('seasonal', seasonal);
      // console.log('trend', trend);
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