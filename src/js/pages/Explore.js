// @flow weak

// Components
import LineChart from '../visualizations/LineChart';
import TrendsAPI from '../api/TrendsAPI';
import ShinyAPI from '../api/ShinyAPI';

// Types
import type { Term, Geo, Filter, TrendsAPIGraph, TrendsAPITopQueries } from '../util/types';

// Data and Utils
import { arrayIsEqual } from '../util/util';
import terms from '../data/terms';
import countries from '../data/countries';
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
  mergeButton: HTMLElement;
  topQueriesList: HTMLElement;

  seasonalChart: LineChart;
  trendChart: LineChart;

  trendsAPI: TrendsAPI;
  shinyAPI: ShinyAPI;

  constructor(parentContainer: HTMLElement, shinyAPI: ?ShinyAPI, trendsAPI: TrendsAPI) {
    this.data = {
      prevDiseases: [],
      diseases: [],
      prevGeo: countries[0],
      geo: countries[0],
      seasonal: [],
      trend: [],
      total: [],
      totalPerLine: [],
      topQueries: [],
      isMerged: false,
      isChanging: false,
      isLoading: false,
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
  }

  handleSelectDiseaseChange(value: string[], self: Explore) {
    const diseases = value.map(v => self.getDiseaseByEntity(v));
    this.updateData({diseases: diseases, isChanging: true});
    if (diseases.length > 0) {
      self.confirmFilters(self);
    }
  }

  handleSelectGeoChange(value: string, self: Explore) {
    const { prevGeo } = self.data;
    if (value) {
      const name = this.getCountryByIso(value).name;
      this.updateData({geo: {iso: value, name: name}, isChanging: true});
      self.confirmFilters(self);
    } else {
      this.updateData({geo: '', isChanging: true});
    }
  }

  getDiseaseByEntity(entity: string): Term {
    return terms.find(t => t.entity === entity);
  }

  getCountryByIso(iso: string): Geo {
    return countries.find(c => c.iso === iso);
  }

  confirmFilters(self) {
    log.info('confirmFilters');
    const { diseases, geo } = self.data;
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
    this.updateData({ isMerged, type: 'total' });
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

    const self = this;

    const elementsContainer = document.createElement('div');
    elementsContainer.id = 'explore';
    elementsContainer.classList.add('page');
    parentContainer.appendChild(elementsContainer);

    const pageHeader = document.createElement('div');
    pageHeader.classList.add('page-header', 'sticky');
    elementsContainer.appendChild(pageHeader);

    const container = document.createElement('div');
    container.classList.add('container');
    pageHeader.appendChild(container);

    const pageName = document.createElement('p');
    pageName.innerHTML = "Explore";
    container.appendChild(pageName);

    const pageBody = document.createElement('div');
    pageBody.classList.add('page-body');
    elementsContainer.appendChild(pageBody);

    const sectionHeader = document.createElement('div');
    sectionHeader.classList.add('section-header', 'container');
    pageBody.appendChild(sectionHeader);

    const title = document.createElement('h3');
    title.innerHTML = 'Lorem Ipsum dolor';
    sectionHeader.appendChild(title);

    const intro = document.createElement('p');
    intro.innerHTML = "Can you find any other seasonal patterns or interesting trends? Pick up to 3 options from the list of most common diseases below and choose a location to explore.";
    sectionHeader.appendChild(intro);

    const sectionBody = document.createElement('div');
    sectionBody.classList.add('section-body', 'container');
    pageBody.appendChild(sectionBody);

    // Loader
    self.loaderContainer = document.createElement('div');
    const { loaderContainer } = self;
    loaderContainer.classList.add('loader-container');
    const loader = document.createElement('span');
    loader.classList.add('loader');
    loaderContainer.appendChild(loader);
    sectionBody.appendChild(loaderContainer);


    // filtersMenu
    const filtersMenu = document.createElement('div');
    filtersMenu.classList.add('filters-menu');
    sectionBody.appendChild(filtersMenu);

    let text = document.createElement('span');
    text.classList.add('sentence');
    text.innerHTML = 'Search interest from 2004 to today for<br/>';
    filtersMenu.appendChild(text);


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
    let bindHandleChange = value => self.handleSelectDiseaseChange(value, self);
    filtersMenu.appendChild(diseaseSelect);
    const diseaseSelectize = $(diseaseSelect).selectize({
      plugins: ['remove_button'],
      maxItems: 3,
      onChange: bindHandleChange,
      openOnFocus: false,
      closeAfterSelect: true,
      placeholder: 'Select'
    });
    self.diseaseSelect = diseaseSelectize[0].selectize;

    text = document.createElement('span');
    text.classList.add('sentence');
    text.innerHTML = ' in ';
    filtersMenu.appendChild(text);

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
    bindHandleChange = value => self.handleSelectGeoChange(value, self);
    filtersMenu.appendChild(geoSelect);
    const geoSelectize = $(geoSelect).selectize({
      maxItems: 1,
      onChange: bindHandleChange,
      onFocus: function() {
        this.setValue('');
      },
      placeholder: 'Select'
    });
    self.geoSelect = geoSelectize[0].selectize;


    const row = document.createElement('div');
    row.classList.add('row');
    sectionBody.appendChild(row);

    // Charts section
    const chartsContainer = document.createElement('div');
    chartsContainer.classList.add('charts-container');
    row.appendChild(chartsContainer);

    // Seasonal Chart
    let chartItem = document.createElement('div');
    chartItem.classList.add('chart-item');
    chartsContainer.appendChild(chartItem);
    self.seasonalChart = new LineChart(chartItem, 'seasonal');

    // Trend chart
    chartItem = document.createElement('div');
    chartItem.classList.add('chart-item');
    chartsContainer.appendChild(chartItem);
    self.trendChart = new LineChart(chartItem, 'trend');


    // Top Queries
    const topQueriesContainer = document.createElement('div');
    topQueriesContainer.classList.add('top-queries-container');
    row.appendChild(topQueriesContainer);

    const topQueriesTitle = document.createElement('h4');
    topQueriesTitle.innerHTML = 'Top Related Queries';
    topQueriesContainer.appendChild(topQueriesTitle);

    this.topQueriesList = document.createElement('div');
    const { topQueriesList } = this;
    topQueriesList.classList.add('top-queries-list');
    topQueriesContainer.appendChild(topQueriesList);

    self.updateElements();
  }

  updateElements() {
    log.info('updateElements');
    const { data, loaderContainer, diseaseSelect, geoSelect, mergeButton, seasonalChart, trendChart, topQueriesList } = this;
    const { diseases, geo, seasonal, trend, total, topQueries, isMerged, isChanging, isLoading } = data;

    if (isLoading) {
      loaderContainer.classList.remove('hidden');
      diseaseSelect.disable();
      geoSelect.disable();
    } else {
      loaderContainer.classList.add('hidden');
      diseaseSelect.enable();
      geoSelect.enable();
    }

    if (!arrayIsEqual(diseaseSelect.getValue(), diseases.map(d => d.entity))) {
      diseaseSelect.setValue(diseases.map(d => d.entity), true);
    }

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

            const list = document.createElement('ol');
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
