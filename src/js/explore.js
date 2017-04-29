// @flow weak

import { FiltersMenu } from './FiltersMenu';
import { ChartTrend } from './ChartTrend';
import { dummyData, diseases, countries } from './util.js';
import { TrendsAPI } from './TrendsAPI';
import * as d3 from 'd3';

export class Explore {

  data: {
    diseases: string[]
  };
  diseaseSelect: HTMLElement;
  chartTrend: ChartTrend;
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

  generateRandomData(n) {
    var data = [];
    // for(var i=0; i<100; i++){
    //   data.push({
    //     x: i,
    //     y: Math.round(Math.random() * 100)
    //   });
    // };
    return data;
  }

  callTrendsApi(event, self){
    self.trendsAPI.getTrends('flu', function(val){
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
    this.chartTrend.updateData(seasonal);
  }

  handleSelectDiseaseChange(event, self) {
    self.chartTrend.updateData(this.generateRandomData());
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

    this.chartTrend = new ChartTrend(elementsContainer, this.generateRandomData());

    parentContainer.appendChild(elementsContainer);
  }

  updateData(obj) {
    this.data = {
      ...obj
    }
    this.updateElements();
  }

  updateElements() {
    const { data, diseaseSelect, chartTrend } = this;
    
    const options = diseaseSelect.children;
    for (const o of options) {
      if (o.value === data.diseases[0]) {
        o.selected = true;
      }
    }

    chartTrend.updateData(this.generateRandomData());
  }
}