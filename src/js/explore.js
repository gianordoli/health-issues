// @flow weak

import { FiltersMenu } from './FiltersMenu';
import { LineChart } from './LineChart';
import { dummyData, diseases, countries } from './util.js';
import { TrendsAPI } from './TrendsAPI';
import * as d3 from 'd3';

export class Explore {

  data: {
    diseases: string[],
    seasonal: {date: Date, value: number}[],
    trend: {date: Date, value: number}[],
    total: {date: Date, value: number}[]
  };
  diseaseSelect: HTMLElement;
  seasonalChart: LineChart;
  trendChart: LineChart;
  trendsAPI: TrendsAPI;

  constructor(parentContainer: HTMLElement, data) {
    if (data) {
      this.data = data;
    } else {
      this.data = {
        diseases: [],
        seasonal: [],
        trend: [],
        total: []
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

    const parseTime = d3.timeParse('%Y-%m-%d');

    // Storing original data 
    this.data.total = data.lines[0].points.map((p, i) => {
      return{ date: parseTime(p.date), value: p.value}
    });

    // Stringifying data to R
    const dataToR = data.lines[0].points.map((p, i) => p.date+','+p.value);
    
    this.parseRData(dummyData);    

    Shiny.onInputChange("mydata", dataToR);
    Shiny.addCustomMessageHandler("myCallbackHandler", function(dataFromR) {
      console.log('From R: ', dataFromR);
      this.parseRData(dataFromR);
    });
  }

  parseRData(dataFromR) {
    const { total } = this.data;

    const seasonalString = dataFromR.substring(dataFromR.indexOf('seasonal:') + 'seasonal:'.length + 1, dataFromR.indexOf('trend:'));
    const seasonal = (seasonalString.split(',')).map((n, i) => {
      return{ date: total[i].date, value: Number(n.trim())}
    });
    
    const trendString = dataFromR.substring(dataFromR.indexOf('trend:') + 'trend:'.length + 1, dataFromR.length);
    const trend = (trendString.split(',')).map((n, i) => {
      return{ date: total[i].date, value: Number(n.trim())}
    });
    this.updateData({seasonal: seasonal, trend: trend});
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

    this.seasonalChart = new LineChart(elementsContainer);
    this.trendChart = new LineChart(elementsContainer);

    parentContainer.appendChild(elementsContainer);
  }

  updateData(obj) {
    let { data } = this;
    for (const key in obj) {
      data[key] = obj[key];
    }
    this.data = data;
    console.log(this.data);    
    this.updateElements();
  }

  updateElements() {
    const { data, diseaseSelect, seasonalChart, trendChart } = this;
    const { diseases, seasonal, trend, total } = data;
    
    const options = diseaseSelect.children;
    for (const o of options) {
      if (o.value === data.diseases[0]) {
        o.selected = true;
      }
    }
    if(seasonal && trend && total) {
      seasonalChart.updateData(seasonal);  
      trendChart.updateData(trend);
    }    
  }
}