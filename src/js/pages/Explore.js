// @flow weak

// Components
import LineChart from '../visualizations/LineChart';
import TrendsAPI from '../api/TrendsAPI';
import ShinyAPI from '../api/ShinyAPI';

// Types
import type { Term, Geo, Filter, TrendsAPIGraph, TrendsAPITopQueries } from '../util/types'

// Data and Utils
import { arrayIsEqual } from '../util/util';
import { terms, countries } from '../util/data';
import { dummyData } from '../scripts/data';

// Libraries
import log from 'loglevel';
import selectize from 'selectize';
import $ from 'jquery';

//Styles
import 'selectize/dist/css/selectize.css';
import '../../sass/explore.scss';

export default class Explore {

  data: {
    prevDiseases: Term[],
    diseases: Term[],
    prevGeo: Geo,
    geo: Geo,
    seasonal: TrendsAPIGraph[],
    trend: TrendsAPIGraph[],
    total: TrendsAPIGraph[],
    totalPerLine: TrendsAPIGraph[],
    topQueries: TrendsAPITopQueries[],
    isMerged: boolean,
    isChanging: boolean,
    isLoading: boolean
  };

  diseaseSelect: selectize;
  geoSelect: selectize;

  loaderContainer: HTMLElement;
  confirmNav: HTMLElement;
  mergeButton: HTMLElement;
  topQueriesList: HTMLElement;
  sentenceItem: HTMLElement;

  seasonalChart: LineChart;
  trendChart: LineChart;

  trendsAPI: TrendsAPI;
  shinyAPI: ShinyAPI;

  constructor(parentContainer: HTMLElement, shinyAPI: ?ShinyAPI, trendsAPI: TrendsAPI, filter?: Filter) {
    this.data = {
      prevDiseases: filter ? filter.terms : [],
      diseases: filter ? filter.terms : [],
      prevGeo: filter ? filter.geo : countries[0],
      geo: filter ? filter.geo : countries[0],
      seasonal: [],
      trend: [],
      total: [],
      totalPerLine: [],
      topQueries: [],
      isMerged: false,
      isChanging: false,
      isLoading: filter ? true : false,
    }
    const self = this;
    self.trendsAPI = trendsAPI;
    if (shinyAPI) {
      self.shinyAPI = shinyAPI;
      self.shinyAPI.setCallback(self, function(explore, dataFromR) {

        const { diseases, total } = self.data;
        const type = dataFromR.indexOf('trend') > -1 ? 'trend' : 'seasonal';
        const data = self.data[type];
        const index = data.length;
        const obj = {};

        obj[type] = data.concat({
          term: diseases[index].name,
          points: self.parseDataFromR(dataFromR)
        });
        self.updateData(obj);

        // I'm still getting R Data for that one type
        if (obj[type].length < total.length) {
          // Trend? Keep parsing the already loaded data
          if (type === 'trend') {
            const dataToR = self.parseDataToR(type);
            self.shinyAPI.updateData(type, dataToR);

          // Seasonal? Go get more data from Google Trends
          } else if (type === 'seasonal') {
            self.getTrendsAPIGraph('seasonal');
          }

        // I'm done with this type!
        } else {
          // Trend? Start seasonal then
          if (type === 'trend') {
            self.getTrendsAPIGraph('seasonal');
          // Seasonal? Move on to load top queries
          } else if (type === 'seasonal') {
            self.updateData({ topQueries: [], isLoading: false });
            self.getTrendsAPITopQueries();
          }
        }

      });
    }

    self.createElements(parentContainer);

    if (filter) {
      self.getTrendsAPIGraph('trend');
    }
  }

  handleSelectDiseaseChange(value: string[], self: Explore) {
    log.info('handleSelectDiseaseChange');
    const diseases = value.map(v => self.getDiseaseByEntity(v));
    this.updateData({diseases: diseases, isChanging: true});
    self.confirmNav.classList.remove('hidden');
  }

  handleSelectGeoChange(value: string, self: Explore) {
    log.info('handleSelectGeoChange');
    log.info(value);
    const name = this.getCountryByIso(value).name;
    this.updateData({geo: {iso: value, name: name, isChanging: true}});
    self.confirmNav.classList.remove('hidden');
  }

  getDiseaseByEntity(entity: string): Term {
    return terms.find(t => t.entity === entity);
  }

  getCountryByIso(iso: string): Geo {
    return countries.find(c => c.iso === iso);
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
    self.updateData({
      prevDiseases: diseases,
      prevGeo: geo,
      isChanging: false,
      isLoading: true,
      totalPerLine: [],
      seasonal: [],
      trend: [],
    });
    self.getTrendsAPIGraph('trend');
  }

  toggleChartMerge(event, self) {
    let { isMerged } = self.data;
    isMerged = isMerged ? false : true;
    this.seasonalChart.hide();
    this.updateData({ isMerged: isMerged });
  }

  getTrendsAPIGraph(type: string){
    log.info('getTrendsAPIGraph');
    const self = this;
    const { diseases, geo, totalPerLine } = self.data;
    const { shinyAPI } = self;
    const terms = type === 'trend' ? diseases : [diseases[totalPerLine.length]];

    self.trendsAPI.getGraph({ terms, geo }, function(val){
      log.info('From Google Trends: ', type);
      log.info(val);

      const obj = {};
      if (type === 'trend') {
        obj['total'] = self.mapGraphResponse(val.lines);

      } else if (type === 'seasonal') {
        obj['totalPerLine'] = totalPerLine.concat(
          self.mapGraphResponse(val.lines)
        );
      }
      self.updateData(obj);

      if (ENV !== 'DEVELOPMENT') {
        const dataToR = self.parseDataToR(type);
        shinyAPI.updateData(type, dataToR);
      } else {
        const obj = {
          ...dummyData,
          topQueries: [],
          isLoading: false,
        };
        self.updateData(obj);
        self.getTrendsAPITopQueries();
      }
    });
  }

  mapGraphResponse(lines) {
    const { diseases } = this.data;
    return lines.map((l, i) => {
      return { term: diseases[i].name, points: l.points}
    });
  }

  getTrendsAPITopQueries(){
    log.info('getTrendsAPITopQueries');
    const { diseases, geo } = this.data;
    let { topQueries } = this.data;
    const index = topQueries.length;
    const disease = diseases[index];
    const self = this;

    self.trendsAPI.getTopQueries({terms: [disease], geo: geo}, function(val){
      log.info('From Google Trends: ', val);
      topQueries = topQueries.concat(val);
      self.updateData({topQueries});
      if (topQueries.length < diseases.length) {
        self.getTrendsAPITopQueries();
      }
    });
  }

  parseDataToR(type: string) {
    log.info('parseDataToR', type);
    const { total, totalPerLine } = this.data;
    const { shinyAPI } = this;
    const index = this.data[type].length;
    const whichTotal = type === 'trend' ? total : totalPerLine;
    return whichTotal[index].points.map((p, i) => p.date+','+p.value);
  }

  parseDataFromR(dataFromR) {
    log.info('parseDataFromR');
    const { diseases, total, seasonal, trend, isLoading } = this.data;
    const type = dataFromR.indexOf('trend') > -1 ? 'trend' : 'seasonal';
    const index = this.data[type].length;
    const newDataString = dataFromR.substring(
      dataFromR.indexOf(type) + type.length + 1);
    let newData = (newDataString.split(','));
    if (type === 'seasonal') {
      newData = newData.slice(0, 13);
    }
    return (
      newData.map((n, i) => {
        const date = total[0].points[i].date;
        const value = (Math.round(Number(n.trim())*100))/100;
        return { date, value };
      })
    )
  }

  updateData(obj) {
    const { data } = this;
    Object.assign(data, obj);
    log.info(this.data);
    this.updateElements();
  }

  createElements(parentContainer: HTMLElement) {

    const elementsContainer = document.createElement('div');
    elementsContainer.id = 'explore';
    elementsContainer.classList.add('page');
    parentContainer.appendChild(elementsContainer);


    // Loader
    this.loaderContainer = document.createElement('div');
    const { loaderContainer } = this;
    loaderContainer.classList.add('loader-container');
    loaderContainer.style.top = elementsContainer.offsetTop + 'px';
    const loader = document.createElement('span');
    loader.classList.add('loader');
    loaderContainer.appendChild(loader);
    elementsContainer.appendChild(loaderContainer);


    // filtersMenu
    const filtersMenu = document.createElement('div');
    filtersMenu.classList.add('filters-menu');
    elementsContainer.appendChild(filtersMenu);

    const text1 = document.createElement('span');
    text1.innerHTML = 'Search interest from 2004 to today for ';
    filtersMenu.appendChild(text1);


    // Diseases
    const diseaseSelect = document.createElement('select');
    diseaseSelect.classList.add('disease-select');
    terms.forEach((d, i) => {
      const option = document.createElement('option');
      option.setAttribute('value', d.entity);
      option.setAttribute('key', i);
      option.innerHTML = d.alias ? d.alias : d.name;
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


    this.sentenceItem = document.createElement('span');
    const { sentenceItem } = this;
    sentenceItem.classList.add('sentence-item');
    sentenceItem.innerHTML = ' in the ';
    filtersMenu.appendChild(sentenceItem);


    // Geo
    const geoSelect = document.createElement('select');
    geoSelect.classList.add('geo-select');
    geoSelect.name = 'geo-select';
    countries.forEach((c, i) => {
      const option = document.createElement('option');
      option.setAttribute('value', c.iso);
      option.innerHTML = c.name;
      geoSelect.appendChild(option);
    });
    bindHandleChange = value => this.handleSelectGeoChange(value, this);
    filtersMenu.appendChild(geoSelect);
    const geoSelectize = $(geoSelect).selectize({
      maxItems: 1,
      onChange: bindHandleChange
    });
    this.geoSelect = geoSelectize[0].selectize;


    // Cancel / Done
    this.confirmNav = document.createElement('div');
    const { confirmNav } = this;
    confirmNav.classList.add('confirm-nav');
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


    // Charts section
    const chartsContainer = document.createElement('div');
    chartsContainer.classList.add('charts-container');
    elementsContainer.appendChild(chartsContainer);

    // Seasonal Chart
    let chartItem = document.createElement('div');
    chartItem.classList.add('chart-item');
    chartsContainer.appendChild(chartItem);
    this.seasonalChart = new LineChart(chartItem, 'seasonal');

    const toggleBar = document.createElement('div');
    toggleBar.classList.add('toggle-bar');
    elementsContainer.appendChild(toggleBar);

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('button-container');
    toggleBar.appendChild(buttonContainer);

    this.mergeButton = document.createElement('a');
    const { mergeButton } = this;
    mergeButton.classList.add('icon');
    bindHandleChange = evt => this.toggleChartMerge(evt, this);
    mergeButton.addEventListener('click', bindHandleChange);
    buttonContainer.appendChild(mergeButton);

    const titlesContainer = document.createElement('div');
    titlesContainer.classList.add('titles-container');
    toggleBar.appendChild(titlesContainer);

    let title = document.createElement('p');
    title.classList.add('title');
    title.innerHTML = 'Seasonal';
    titlesContainer.appendChild(title);

    title = document.createElement('p');
    title.classList.add('title');
    title.innerHTML = 'Trend';
    titlesContainer.appendChild(title);


    // Trend chart
    chartItem = document.createElement('div');
    chartItem.classList.add('chart-item');
    chartsContainer.appendChild(chartItem);
    this.trendChart = new LineChart(chartItem, 'trend');


    const bottomContainer = document.createElement('div');
    bottomContainer.classList.add('bottom-container');
    elementsContainer.appendChild(bottomContainer);

    // Top Queries
    const topQueriesContainer = document.createElement('div');
    topQueriesContainer.classList.add('top-queries-container');
    bottomContainer.appendChild(topQueriesContainer);

    const topQueriesTitle = document.createElement('h4');
    topQueriesTitle.innerHTML = 'Top Related Queries';
    topQueriesContainer.appendChild(topQueriesTitle);

    this.topQueriesList = document.createElement('div');
    const { topQueriesList } = this;
    topQueriesList.classList.add('top-queries-list');
    topQueriesContainer.appendChild(topQueriesList);

    this.updateElements();
  }

  updateElements() {
    log.info('updateElements');
    const { data, loaderContainer, diseaseSelect, geoSelect, sentenceItem, mergeButton, seasonalChart, trendChart, topQueriesList } = this;
    const { diseases, geo, seasonal, trend, total, topQueries, isMerged, isChanging, isLoading } = data;

    if (isLoading) {
      loaderContainer.classList.remove('hidden');
    } else {
      loaderContainer.classList.add('hidden');
    }

    diseaseSelect.setValue(diseases.map(d => d.entity), true);
    sentenceItem.innerHTML = geo.article ? 'in the' : 'in';
    geoSelect.setValue(geo.iso, true);

    // mergeButton.innerHTML = isMerged ? 'Split Charts' : 'Merge Charts';

    // if(!isChanging && !isLoading && seasonal.length > 0 && trend.length > 0 && total.length > 0) {
    if(!isChanging && !isLoading && trend.length > 0 && total.length > 0) {
      seasonalChart.updateData(seasonal);
      isMerged ? trendChart.updateData(total) : trendChart.updateData(trend);

      if (topQueries.length > 0) {

        let isEmpty = true;
        topQueriesList.innerHTML = '';
        for(let i = 0; i < topQueries.length; i++) {
          if (topQueries[i].item) {
            isEmpty = false;
            const listContainer = document.createElement('div');
            listContainer.classList.add('list-container');
            topQueriesList.appendChild(listContainer);

            const term = document.createElement('p');
            term.innerHTML = diseases[i].name;
            listContainer.appendChild(term);

            const list = document.createElement('ul');
            listContainer.appendChild(list);

            for(const q of topQueries[i].item) {
              const listItem = document.createElement('li');
              listItem.innerHTML = q.title;
              list.appendChild(listItem);
            }
          }
        }
        const parent = topQueriesList.parentElement;
        if (parent) {
          isEmpty ? parent.classList.add('hidden') : parent.classList.remove('hidden');
        }
      }
    }
  }
}
