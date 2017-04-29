// @flow weak

import { FiltersMenu } from './FiltersMenu';
import { LineChart } from './LineChart';
import { dummyData, diseases, countries } from './util.js';
import { TrendsAPI } from './TrendsAPI';
import * as d3 from 'd3';

export class Explore {

  data: {
    diseases: string[]
  };
  diseaseSelect: HTMLElement;
  seasonalChart: LineChart;
  trendChart: LineChart;
  totalChart: LineChart;
  trendsAPI: TrendsAPI;

  constructor(parentContainer: HTMLElement, data) {
    if (data) {
      this.data = data;
    } else {
      this.data = {
        diseases: []
      }
    }
    this.trendsAPI = new TrendsAPI();
    console.log(this.trendsAPI);
    this.createElements(parentContainer);
  }

  callTrendsApi(event, self){
    const { diseases } = self.data;
    self.trendsAPI.getTrends(diseases[0], function(val){
      self.sendDataToR(val);
    });
  }

  sendDataToR(data) {
    console.log('From Google Trends: ', data);

    const dataToR = data.lines[0].points.map((p, i) => p.date+','+p.value);
    const dates = data.lines[0].points.map((p, i) => p.date);
    this.parseRData(dummyData, dates);

    Shiny.onInputChange("mydata", dataToR);
    Shiny.addCustomMessageHandler("myCallbackHandler", function(dataFromR) {
      console.log('From R: ', dataFromR);
      this.parseRData(dataFromR, dates);
    });
  }

  parseRData(dataFromR, dates) {

    const parseTime = d3.timeParse('%Y-%m-%d');

    let seasonal = dataFromR.substring(dataFromR.indexOf('seasonal:') + 'seasonal:'.length + 1, dataFromR.indexOf('trend:'));
    seasonal = (seasonal.split(',')).map((n, i) => {
      return{ date: parseTime(dates[i]), value: Number(n.trim())}
    });
    // this.chartTrend.updateData(seasonal);
  }

  handleSelectDiseaseChange(event, self) {
    const value = event.target.value;
    this.updateData({diseases: [value]});
  }

  createElements(parentContainer: HTMLElement) {
    var elementsContainer = document.createElement('div');
    elementsContainer.id = 'explore';

    const filtersMenu = document.createElement('div');
    filtersMenu.id = 'filters-menu'
    elementsContainer.appendChild(filtersMenu);
      
    const text1 = document.createElement('span');
    text1.innerHTML = 'Search interest for ';
    filtersMenu.appendChild(text1);

    this.diseaseSelect = document.createElement('select');
    const { diseaseSelect } = this;
    diseaseSelect.name = 'disease-select';
    diseases.forEach((d, i) => {
      const option = document.createElement('option');
      option.setAttribute('value', d);
      option.setAttribute('key', i);      
      option.innerHTML = d;
      diseaseSelect.appendChild(option);
    });
    const bindHandleChange = evt => this.handleSelectDiseaseChange(evt, this);    
    diseaseSelect.addEventListener('change', bindHandleChange);    
    filtersMenu.appendChild(diseaseSelect);

    const text2 = document.createElement('span');
    text2.innerHTML = ' in the ';
    filtersMenu.appendChild(text2);

    const countrySelect = document.createElement('select');
    diseaseSelect.name = 'country-select';    
    countries.forEach((c, i) => {
      const option = document.createElement('option');
      option.setAttribute('value', c.iso);
      option.innerHTML = c.name;
      countrySelect.appendChild(option);
    });
    filtersMenu.appendChild(countrySelect);

    var doneButton = document.createElement('button');
    doneButton.innerHTML = 'Done';
    const bindButtonEvent = evt => this.callTrendsApi(evt, this);    
    doneButton.addEventListener('click', bindButtonEvent);    
    filtersMenu.appendChild(doneButton);

    this.totalChart = new LineChart(elementsContainer);

    parentContainer.appendChild(elementsContainer);
  }

  updateData(obj) {
    this.data = {
      ...obj
    }
    this.updateElements();
    console.log(this.data);
  }

  updateElements() {
    const { data, diseaseSelect } = this;
    
    const options = diseaseSelect.children;
    for (const o of options) {
      if (o.value === data.diseases[0]) {
        o.selected = true;
      }
    }
  }
}