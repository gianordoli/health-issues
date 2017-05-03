// @flow

// Components
import { FiltersMenu } from './FiltersMenu';
import { LineChart } from './LineChart';
import { TrendsAPI } from './TrendsAPI';

// Types
import type { Term, Geo, Filter } from './types'

// Data
import { dummyData, terms, countries } from './util.js';

// Libraries
import selectize from 'selectize';
import $ from 'jquery'; 

//Styles
import 'selectize/dist/css/selectize.css';

export class Explore {

  data: {
    prevDiseases: Term[],
    diseases: Term[],
    prevGeo: Geo,
    geo: Geo,
    seasonal: {date: Date, value: number}[],
    trend: {date: Date, value: number}[],
    total: {date: Date, value: number}[],
    isMerged: boolean,
    isLoading: boolean
  };

  keepShinyAlive: () => {};
  
  diseaseSelect: HTMLElement;
  geoSelect: HTMLElement;
  loaderContainer: HTMLElement;
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
        prevDiseases: [],
        diseases: [],
        prevGeo: countries[0],
        geo: countries[0],
        seasonal: [],
        trend: [],
        total: [],
        isMerged: false,
        isLoading: false
      }
    }
    this.trendsAPI = new TrendsAPI();
    this.addShinyListeners();
    this.createElements(parentContainer);
  }

  addShinyListeners() {
    const self = this;

    $(document).on('shiny:connected', function(event) {
      console.log('Connected to Shiny server');
    });

    $(document).on('shiny:sessioninitialized', function(event) {
      console.log('Shiny session initialized');

      // Create a loop to ping the Shiny server and keep the websocket connection on
      clearInterval(self.keepShinyAlive);
      self.keepShinyAlive = setInterval(pingShiny, 10000);
      function pingShiny() {
        const timestamp = Date.now();
        Shiny.onInputChange('ping', timestamp);      
      }

      // Add listener for stl data
      Shiny.addCustomMessageHandler('stl', function(dataFromR) {
        console.log('From R: ', dataFromR);
        self.parseRData(dataFromR);
      });
    });

    $(document).on('shiny:idle', function(event) {
      console.log('Shiny session idle');
    });

    $(document).on('shiny:disconnected', function(event) {
      console.log('Disconnected from Shiny server');
      location.reload();
    });
  }

  handleSelectDiseaseChange(value: string[], self) {
    const diseases = value.map(v => self.getDiseaseByEntity(v));
    this.updateData({diseases: diseases});
    self.confirmNav.classList.remove('hidden');
  }

  handleSelectGeoChange(event, self) {
    const { value } = event.target;
    const name = this.getSelectedText(event.target);
    this.updateData({geo: {iso: value, name: name}});
    self.confirmNav.classList.remove('hidden');
  }

  getDiseaseByEntity(entity: string): Term {
    return terms.find(t => t.entity === entity);
  }

  getSelectedText(el) {
    if (el.selectedIndex == -1)
      return null;
    return el.options[el.selectedIndex].text;
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
    this.updateData({ isLoading: true });
  }

  toggleChartMerge(event, self) {
    let { isMerged } = self.data;
    isMerged = isMerged ? false : true;
    this.seasonalChart.hide();
    this.updateData({ isMerged: isMerged });
  }

  loadCurated(filter: Filter) {
    const { terms, geo } = filter;
    this.updateData({ prevDiseases: terms, diseases: terms, prevGeo: geo, geo: geo });
    this.confirmNav.classList.add('hidden');
    this.callTrendsApi();
  }

  callTrendsApi(){
    const { diseases, geo } = this.data;
    let total = [];
    const self = this;

    self.trendsAPI.getTrends({terms: diseases, geo: geo}, function(val){
      console.log('From Google Trends: ', val);
      const total = val.lines.map(l => l.points);
      self.updateData({ total: total, seasonal: [], trends: [] });
      self.sendDataToR();
    });
  }

  sendDataToR() {
    const { total, seasonal } = this.data;
    const index = seasonal.length;
    const dataToR = total[index].map((p, i) => p.date+','+p.value);
    // this.parseRData(dummyData);
    Shiny.onInputChange('mydata', dataToR);
  }

  parseRData(dataFromR) {
    const { total, seasonal, trend } = this.data;
    let { isLoading } = this.data;

    const currSeasonalString = dataFromR.substring(dataFromR.indexOf('seasonal:') + 'seasonal:'.length + 1, dataFromR.indexOf('trend:'));
    const currSeasonal = (currSeasonalString.split(',')).slice(0, 13).map((n, i) => {
      return{ date: total[0][i].date, value: Number(n.trim())}
    });
    seasonal.push(currSeasonal);

    const currTrendString = dataFromR.substring(dataFromR.indexOf('trend:') + 'trend:'.length + 1, dataFromR.length);
    const currTrend = (currTrendString.split(',')).map((n, i) => {
      return{ date: total[0][i].date, value: Number(n.trim())}
    });
    trend.push(currTrend);

    if (seasonal.length < total.length) {
      sendDataToR()
    } else {
      isLoading = false;
    }
    this.updateData({seasonal: seasonal, trend: trend, isLoading: isLoading});
  }

  createElements(parentContainer: HTMLElement) {

    const elementsContainer = document.createElement('div');
    elementsContainer.id = 'explore';
    parentContainer.appendChild(elementsContainer);


    // Loader
    this.loaderContainer = document.createElement('div');
    const { loaderContainer } = this;
    loaderContainer.id = 'loader-container';
    loaderContainer.style.top = elementsContainer.offsetTop + 'px';
    loaderContainer.style.left = elementsContainer.offsetLeft + 'px';
    const loader = document.createElement('span');
    loader.classList.add('loader');
    loaderContainer.appendChild(loader);
    elementsContainer.appendChild(loaderContainer);


    // filtersMenu
    const filtersMenu = document.createElement('div');
    filtersMenu.id = 'filters-menu'
    elementsContainer.appendChild(filtersMenu);
      
      const text1 = document.createElement('span');
      text1.innerHTML = 'Search interest for ';
      filtersMenu.appendChild(text1);


      // Diseases
      const diseaseSelect = document.createElement('select');
      diseaseSelect.id = 'disease-select';
      terms.forEach((d, i) => {
        const option = document.createElement('option');
        option.setAttribute('value', d.entity);
        option.setAttribute('key', i);
        option.innerHTML = d.name;
        diseaseSelect.appendChild(option);
      });
      let bindHandleChange = value => this.handleSelectDiseaseChange(value, this);
      filtersMenu.appendChild(diseaseSelect);
      const diseaseSelectize = $(diseaseSelect).selectize({
        maxItems: 3,
        onChange: bindHandleChange,
        placeholder: 'Select'
      });
      this.diseaseSelect = diseaseSelectize[0].selectize;


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
    // End filtersMenu


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

    this.updateElements();
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
    const { data, loaderContainer, diseaseSelect, geoSelect, mergeButton, seasonalChart, trendChart } = this;
    const { geo, seasonal, trend, total, isMerged, isLoading } = data;
    let { diseases } = data;

    if (isLoading) {
      loaderContainer.classList.remove('hidden');
    } else {
      loaderContainer.classList.add('hidden');
    }

    diseases = diseases.map(d => d.entity);
    diseaseSelect.setValue(diseases, true);

    const geoOptions = geoSelect.children;
    for (const o of geoOptions) {
      if (o.value === data.geo.iso) {
        o.selected = true;
      }
    }

    mergeButton.innerHTML = isMerged ? 'Split Charts' : 'Merge Charts';

    if(!isLoading && seasonal && trend && total) {
      seasonalChart.updateData(seasonal);
      isMerged ? trendChart.updateData(total) : trendChart.updateData(trend);
    }    
  }
}