// @flow weak

import { TrendsAPI } from '../api/TrendsAPI';
import type { Term, Geo, Filter, TrendsAPITopQueries } from '../util/types';
import { terms, countries } from '../util/data.js';
import $ from 'jquery';
import log from 'loglevel';

export class Home {

  data: {
    geo: Geo,
    disease: Term,
    topQueries: TrendsAPITopQueries[],
  }
  trendsAPI: TrendsAPI;

  constructor(parentContainer: HTMLElement, trendsAPI: TrendsAPI) {
    this.data ={
      geo: {},
      disease: {},
      topQueries: [],
    }
    this.trendsAPI = trendsAPI;
    this.getRandomDisease();
    this.createElements(parentContainer);
  }

  getRandomDisease() {
    const disease = terms.find(t => t.name === 'Pain');
    this.updateData({ disease });
    this.getUserCountry();
  }

  countryToGeo(country: string):Geo {
    return countries.find(c => c.iso === country);
  }

  getUserCountry() {
    log.info('getUserCountry');
    const self = this;
    $.get("https://ipinfo.io", function(response) {
      const { country } = response;
      const geo = self.countryToGeo(country);
      self.updateData({ geo });
      self.getTrendsAPITopQueries();
    }, 'jsonp');
  }

  getTrendsAPITopQueries(){
    log.info('getTrendsAPITopQueries');
    const { geo, disease } = this.data;

    const self = this;
    self.trendsAPI.getTopQueries({terms: [disease], geo: geo}, function(val){
      log.info('From Google Trends: ', val);
      // topQueries = topQueries.concat(val);
      // self.updateData({topQueries});
      // if (topQueries.length < diseases.length) {
      //   self.getTrendsAPITopQueries();
      // }
    });
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

  createElements(parentContainer: HTMLElement) {

    const elementsContainer = document.createElement('div');
    elementsContainer.id = 'home';
    elementsContainer.classList.add('page');
    parentContainer.appendChild(elementsContainer);


    // const titleContainer = document.createElement('div');
    // elementsContainer.appendChild(titleContainer);
    //
    // const title = document.createElement('h1');
    // title.innerHTML = 'Project Title';
    // titleContainer.appendChild(title);
    //
    // const projectDescription = document.createElement('p');
    // projectDescription.id = 'project-description'
    // projectDescription.innerHTML = 'Here goes a project projectDescription. no longer than 2 sentences.'
    // titleContainer.appendChild(projectDescription);
    //
    //
    // const logosContainer = document.createElement('div');
    // logosContainer.id = 'logos-container';
    // elementsContainer.appendChild(logosContainer);
    //
    // const fuguLogo = document.createElement('p');
    // fuguLogo.innerHTML = 'Fugu.Studio';
    // logosContainer.appendChild(fuguLogo);
    //
    // const forP = document.createElement('p');
    // forP.innerHTML = 'for';
    // logosContainer.appendChild(forP);
    //
    // const newsLabLogo = document.createElement('p');
    // newsLabLogo.innerHTML = 'Google News Lab';
    // logosContainer.appendChild(newsLabLogo);
  }

  updateElements() {

  }
}
