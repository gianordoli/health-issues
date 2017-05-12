// @flow weak

// Components
import { FiltersMenu } from './FiltersMenu';
import { LineChart } from './LineChart';
import { TrendsAPI } from './TrendsAPI';
import { ShinyAPI } from './ShinyAPI';

// Types
import type { Term, Geo, Filter, TrendsAPIData } from './types'

// Data
import { arrayIsEqual, dummyData, terms, countries } from './util.js';

// Libraries
import log from 'loglevel';
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
    seasonal: TrendsAPIData[],
    trend: TrendsAPIData[],
    total: TrendsAPIData[],
    dataToR: string[],
    dataFromR: string,
    isMerged: boolean,
    isChanging: boolean,
    isLoading: boolean
  };

  diseaseSelect: HTMLElement;
  geoSelect: HTMLElement;
  loaderContainer: HTMLElement;
  confirmNav: HTMLElement;
  mergeButton: HTMLElement;

  seasonalChart: LineChart;
  trendChart: LineChart;
  trendsAPI: TrendsAPI;
  shinyAPI: ShinyAPI;

  constructor(parentContainer: HTMLElement, filter?: Filter) {
    this.data = {
      prevDiseases: filter ? filter.terms : [],
      diseases: filter ? filter.terms : [],
      prevGeo: filter ? filter.geo : countries[0],
      geo: filter ? filter.geo : countries[0],
      dataToR: '',
      dataFromR: '',
      seasonal: [],
      trend: [],
      total: [],
      isMerged: false,
      isChanging: false,
      isLoading: false
    }
    const self = this;
    self.trendsAPI = new TrendsAPI();
    self.trendsAPI.setup(function(){
      if (filter) {
        self.callTrendsApi();
      }
    });
    self.shinyAPI = new ShinyAPI();
    self.shinyAPI.addListeners(self, self.parseDataFromR);
    self.createElements(parentContainer);
  }

  handleSelectDiseaseChange(value: string[], self: Explore) {
    log.info('handleSelectDiseaseChange');
    const diseases = value.map(v => self.getDiseaseByEntity(v));
    this.updateData({diseases: diseases, isChanging: true});
    self.confirmNav.classList.remove('hidden');
  }

  handleSelectGeoChange(event: {}, self: Explore) {
    log.info('handleSelectGeoChange');
    const { value } = event.target;
    const name = this.getSelectedText(event.target);
    this.updateData({geo: {iso: value, name: name, isChanging: true}});
    self.confirmNav.classList.remove('hidden');
  }

  getDiseaseByEntity(entity: string): Term {
    return terms.find(t => t.entity === entity);
  }

  getSelectedText(el: HTMLElement) {
    if (el.selectedIndex == -1)
      return null;
    return el.options[el.selectedIndex].text;
  }

  cancelFilters(event, self) {
    log.info('cancelFilters');
    const { prevDiseases, prevGeo } = self.data;
    self.confirmNav.classList.add('hidden');
    self.updateData({ diseases: prevDiseases, geo: prevGeo, isChanging: false });
  }

  confirmFilters(event, self) {
    log.info('confirmFilters');
    const { diseases, geo } = self.data;
    self.confirmNav.classList.add('hidden');
    self.updateData({ prevDiseases: diseases, prevGeo: geo, isChanging: true, isLoading: true });
    self.callTrendsApi();
  }

  toggleChartMerge(event, self) {
    let { isMerged } = self.data;
    isMerged = isMerged ? false : true;
    this.seasonalChart.hide();
    this.updateData({ isMerged: isMerged, isChanging: true });
  }

  loadCurated(filter: Filter) {
    const { terms, geo } = filter;
    this.updateData({ prevDiseases: terms, diseases: terms, prevGeo: geo, geo: geo, isChanging: true, isLoading: true });
    this.confirmNav.classList.add('hidden');
    this.callTrendsApi();
  }

  callTrendsApi(){
    log.info('callTrendsApi');
    const { diseases, geo } = this.data;
    let total = [];
    const self = this;

    self.trendsAPI.getTrends({terms: diseases, geo: geo}, function(val){
      log.info('From Google Trends: ', val);
      const total = val.lines.map((l, i) => {
        return { term: diseases[i].name, points: l.points}
      });
      self.updateData({ total: total, seasonal: [], trend: [] });
      self.parseDataToR();
    });
  }

  parseDataToR() {
    log.info('parseDataToR');
    const { dataToR, dataFromR, total, seasonal } = this.data;
    const { shinyAPI } = this;
    const index = seasonal.length;

    const newDataToR = total[index].points.map((p, i) => p.date+','+p.value);
    if (arrayIsEqual(dataToR, newDataToR)) {
      this.parseDataFromR(this, dataFromR);
    } else {
      this.updateData({ dataToR: newDataToR });
      shinyAPI.updateData(newDataToR);
    }
    // this.parseDataFromR(this, dummyData[index]);
  }

  parseDataFromR(explore, dataFromR) {
    log.info('parseDataFromR');
    const self = explore;
    const { total, diseases, isLoading } = self.data;
    let { seasonal, trend } = self.data;
    const index = seasonal.length;

    const currSeasonalString = dataFromR.substring(
      dataFromR.indexOf('seasonal:') + 'seasonal:'.length + 1,
      dataFromR.indexOf('trend:'));
    const currSeasonal = (currSeasonalString.split(','))
      .slice(0, 13)
      .map((n, i) => {
        return{
          date: total[0].points[i].date,
          value: (Math.round(Number(n.trim())*100))/100
        }
      });
    seasonal.push({ term: diseases[index].name, points: currSeasonal });

    const currTrendString = dataFromR.substring(
      dataFromR.indexOf('trend:') + 'trend:'.length + 1,
      dataFromR.length);
    const currTrend = (currTrendString.split(','))
      .map((n, i) => {
        return{
          date: total[0].points[i].date,
          value: Math.round(Number(n.trim()))
        }
      });
    trend.push({ term: diseases[index].name, points: currTrend });

    self.updateData({ seasonal: seasonal, trend: trend, dataFromR: dataFromR });

    if (seasonal.length === total.length) {
      self.updateData({ isLoading: false });
    } else {
      self.parseDataToR();
    }
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

    // Charts
    const chartsContainer = document.createElement('div');
    chartsContainer.classList.add('charts-container');
    elementsContainer.appendChild(chartsContainer);
    this.seasonalChart = new LineChart(chartsContainer, 'seasonal');
    this.trendChart = new LineChart(chartsContainer, 'trend');

    // Merge
    this.mergeButton = document.createElement('button');
    const { mergeButton } = this;
    mergeButton.innerHTML = 'Merge Charts';
    bindHandleChange = evt => this.toggleChartMerge(evt, this);
    mergeButton.addEventListener('click', bindHandleChange);
    elementsContainer.appendChild(mergeButton);

    this.updateElements();
  }

  updateData(obj) {
    let { data } = this;
    for (const key in obj) {
      data[key] = obj[key];
    }
    this.data = data;
    log.info(this.data);
    this.updateElements();
  }

  updateElements() {
    log.info('updateElements');
    const { data, loaderContainer, diseaseSelect, geoSelect, mergeButton, seasonalChart, trendChart } = this;
    const { diseases, geo, seasonal, trend, total, isMerged, isChanging, isLoading } = data;

    if (isLoading) {
      loaderContainer.classList.remove('hidden');
    } else {
      loaderContainer.classList.add('hidden');
    }

    diseaseSelect.setValue(diseases.map(d => d.entity), true);

    const geoOptions = geoSelect.children;
    for (const o of geoOptions) {
      if (o.value === data.geo.iso) {
        o.selected = true;
      }
    }

    mergeButton.innerHTML = isMerged ? 'Split Charts' : 'Merge Charts';

    if(isChanging && !isLoading && seasonal.length > 0 && trend.length > 0 && total.length > 0) {
      seasonalChart.updateData(seasonal);
      isMerged ? trendChart.updateData(total) : trendChart.updateData(trend);
      this.updateData({ isChanging: false });
    }
  }
}
