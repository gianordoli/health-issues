// @flow weak

import { FiltersMenu } from './FiltersMenu';
import { LineChart } from './LineChart';
import { dummyData, diseases, countries } from './util.js';
import { TrendsAPI } from './TrendsAPI';
import type { Disease, Geo, Filter } from './types'
import * as d3 from 'd3';

export class Explore {

  data: {
    prevDiseases: Disease[],
    diseases: Disease[],
    prevGeo: Geo,
    geo: Geo,
    seasonal: {date: Date, value: number}[],
    trend: {date: Date, value: number}[],
    total: {date: Date, value: number}[],
    merged: boolean
  };
  
  diseaseSelect: HTMLElement;
  geoSelect: HTMLElement;
  confirmNav: HTMLElement;
  mergeButton: HTMLElement;

  seasonalChart: LineChart;
  trendChart: LineChart;
  trendsAPI: TrendsAPI;

  constructor(parentContainer: HTMLElement, data) {
    if (data) {
      this.data = data;
    } else {
      this.data = {
        prevDiseases: diseases[0],
        diseases: diseases[0],
        prevGeo: countries[0],
        geo: countries[0],
        seasonal: [],
        trend: [],
        total: [],
        merged: false
      }
    }
    this.trendsAPI = new TrendsAPI();
    console.log(this.trendsAPI);
    this.createElements(parentContainer);

    const self = this;
    Shiny.addCustomMessageHandler("myCallbackHandler", function(dataFromR) {
      console.log('From R: ', dataFromR);
      self.parseRData(dataFromR);
    });    
  }

  handleSelectDiseaseChange(event, self) {
    const value = event.target.value;
    this.updateData({diseases: [value]});
    self.confirmNav.classList.remove('hidden');
  }

  handleSelectGeoChange(event, self) {
    const { value, name } = event.target;
    this.updateData({geo: {iso: value, name: name}});
    self.confirmNav.classList.remove('hidden');
  }

  cancelFilters(event, self) {
    const { prevDiseases, prevGeo } = self.data;
    self.confirmNav.classList.add('hidden');
    self.updateData({ diseases: prevDiseases, geo: prevGeo });
  }

  confirmFilters(event, self) {
    const { diseases, geo } = self.data;
    self.confirmNav.classList.add('hidden');
    self.updateData({ prevDiseases: diseases, prevGeo: geo });
    self.callTrendsApi();
  }

  toggleChartMerge(event, self) {
    let { merged } = self.data;
    merged = merged ? false : true;
    this.seasonalChart.hide();
    this.updateData({ merged: merged });
  }

  loadCurated(filter: Filter) {
    const { terms, geo } = filter;
    this.updateData({ prevDiseases: terms, diseases: terms, prevGeo: geo, geo: geo });
    this.confirmNav.classList.add('hidden');
    this.callTrendsApi();
  }

  callTrendsApi(){
    const { diseases, geo } = this.data;
    const self = this;
    self.trendsAPI.getTrends({terms: diseases, geo: geo}, function(val){
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
    
    // let checkShinyConnection = setInterval(function(){
    //   if (Shiny) {
    //     console.log('Shiny connected');
    //     clearTimeout(checkShinyConnection);
        Shiny.onInputChange("mydata", dataToR);
    //   } else {
    //     console.log('Can\'t find Shiny');
    //   }
    // }, 500);
  }

  parseRData(dataFromR) {
    const { total } = this.data;

    const seasonalString = dataFromR.substring(dataFromR.indexOf('seasonal:') + 'seasonal:'.length + 1, dataFromR.indexOf('trend:'));
    const seasonal = (seasonalString.split(',')).slice(0, 13).map((n, i) => {
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


    // Geo
    this.geoSelect = document.createElement('select');
    const { geoSelect } = this;
    geoSelect.name = 'geo-select';    
    countries.forEach((c, i) => {
      const option = document.createElement('option');
      option.setAttribute('value', c.iso);
      option.innerHTML = c.name;
      geoSelect.appendChild(option);
    });
    bindHandleChange = evt => this.handleSelectGeoChange(evt, this);
    geoSelect.addEventListener('change', bindHandleChange);
    filtersMenu.appendChild(geoSelect);


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


    // Merge
    this.mergeButton = document.createElement('button');
    const { mergeButton } = this;
    mergeButton.innerHTML = 'Merge Charts';
    bindHandleChange = evt => this.toggleChartMerge(evt, this);
    mergeButton.addEventListener('click', bindHandleChange);
    elementsContainer.appendChild(mergeButton);


    // Charts
    this.seasonalChart = new LineChart(elementsContainer, 'seasonal');
    this.trendChart = new LineChart(elementsContainer, 'trend');

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
    const { data, diseaseSelect, geoSelect, mergeButton, seasonalChart, trendChart } = this;
    const { diseases, geo, seasonal, trend, total, merged } = data;
    
    const diseaseOptions = diseaseSelect.children;
    for (const o of diseaseOptions) {
      if (o.value === data.diseases[0]) {
        o.selected = true;
      }
    }

    const geoOptions = geoSelect.children;
    for (const o of geoOptions) {
      if (o.value === data.geo.iso) {
        o.selected = true;
      }
    }

    mergeButton.innerHTML = merged ? 'Split Charts' : 'Merge Charts';

    if(seasonal && trend && total) {
      seasonalChart.updateData(seasonal);
      merged ? trendChart.updateData(total) : trendChart.updateData(trend);
    }    
  }
}