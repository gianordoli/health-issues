// @flow weak

import { FiltersMenu } from './FiltersMenu';
import { LineChart } from './LineChart';
import { dummyData, diseases, countries } from './util.js';
import { TrendsAPI } from './TrendsAPI';
import * as d3 from 'd3';

export class Explore {

  data: {
    prevDiseases: string[],
    diseases: string[],
    prevCountry: string,
    country: string,
    seasonal: {date: Date, value: number}[],
    trend: {date: Date, value: number}[],
    total: {date: Date, value: number}[]
  };
  
  diseaseSelect: HTMLElement;
  countrySelect: HTMLElement;
  confirmNav: HTMLElement;

  seasonalChart: LineChart;
  trendChart: LineChart;
  trendsAPI: TrendsAPI;

  constructor(parentContainer: HTMLElement, data) {
    if (data) {
      this.data = data;
    } else {
      this.data = {
        prevDiseases: ['Acne'],
        diseases: ['Acne'],
        prevCountry: 'AD',
        country: 'AD',
        seasonal: [],
        trend: [],
        total: []
      }
    }
    this.trendsAPI = new TrendsAPI();
    console.log(this.trendsAPI);
    this.createElements(parentContainer);
  }

  handleSelectDiseaseChange(event, self) {
    const value = event.target.value;
    this.updateData({diseases: [value]});
    self.confirmNav.classList.remove('hidden');
  }

  handleSelectCountryChange(event, self) {
    const value = event.target.value;
    this.updateData({country: value});
    self.confirmNav.classList.remove('hidden');
  }    

  cancelFilters(event, self) {
    const { prevDiseases, prevCountry } = self.data;
    self.confirmNav.classList.add('hidden');
    self.updateData({ diseases: prevDiseases, country: prevCountry });
  }

  confirmFilters(event, self) {
    const { diseases, country } = self.data;
    self.confirmNav.classList.add('hidden');
    self.updateData({ prevDiseases: diseases, prevCountry: country });
    self.callTrendsApi();
  }  

  callTrendsApi(){
    const { diseases, country } = this.data;
    const self = this;
    self.trendsAPI.getTrends({terms: diseases, geo: country}, function(val){
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

  createElements(parentContainer: HTMLElement) {
    const elementsContainer = document.createElement('div');
    elementsContainer.id = 'explore';

    const filtersMenu = document.createElement('div');
    filtersMenu.id = 'filters-menu'
    elementsContainer.appendChild(filtersMenu);
      
    const text1 = document.createElement('span');
    text1.innerHTML = 'Search interest for ';
    filtersMenu.appendChild(text1);


    // Diseases
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
    let bindHandleChange = evt => this.handleSelectDiseaseChange(evt, this);
    diseaseSelect.addEventListener('change', bindHandleChange);
    filtersMenu.appendChild(diseaseSelect);

    const text2 = document.createElement('span');
    text2.innerHTML = ' in the ';
    filtersMenu.appendChild(text2);


    // Countries
    this.countrySelect = document.createElement('select');
    const { countrySelect } = this;
    countrySelect.name = 'country-select';    
    countries.forEach((c, i) => {
      const option = document.createElement('option');
      option.setAttribute('value', c.iso);
      option.innerHTML = c.name;
      countrySelect.appendChild(option);
    });
    bindHandleChange = evt => this.handleSelectCountryChange(evt, this);
    countrySelect.addEventListener('change', bindHandleChange);
    filtersMenu.appendChild(countrySelect);


    // Cancel / Done
    this.confirmNav = document.createElement('div');
    const { confirmNav } = this;
    confirmNav.id = 'confirm-nav';
    confirmNav.classList.add('hidden');   

    const cancelButton = document.createElement('button');
    cancelButton.innerHTML = 'Cancel';
    bindHandleChange = evt => this.cancelFilters(evt, this);
    cancelButton.addEventListener('click', bindHandleChange);
    confirmNav.appendChild(cancelButton);

    const doneButton = document.createElement('button');
    doneButton.innerHTML = 'Done';
    bindHandleChange = evt => this.confirmFilters(evt, this);
    doneButton.addEventListener('click', bindHandleChange);
    confirmNav.appendChild(doneButton);

    filtersMenu.appendChild(confirmNav);


    // Charts
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
    const { data, diseaseSelect, countrySelect, seasonalChart, trendChart } = this;
    const { diseases, country, seasonal, trend, total } = data;
    
    const diseaseOptions = diseaseSelect.children;
    for (const o of diseaseOptions) {
      if (o.value === data.diseases[0]) {
        o.selected = true;
      }
    }

    const countryOptions = countrySelect.children;
    for (const o of countryOptions) {
      if (o.value === data.country) {
        o.selected = true;
      }
    }

    if(seasonal && trend && total) {
      seasonalChart.updateData(seasonal);  
      trendChart.updateData(trend);
    }    
  }
}