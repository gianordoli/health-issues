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
    const self = this;
    self.data ={
      geo: {},
      disease: {},
      topQueries: [],
    }
    self.trendsAPI = trendsAPI;
    const disease = self.getRandomDisease();
    const country = self.getUserCountry(function(geo) {
      self.updateData({ disease, geo });
      self.getTrendsAPITopQueries();
    });
    this.createElements(parentContainer);
  }

  getRandomDisease(ignore?: string) {
    let topTerms = ['Pain', 'Fever', 'Influenza', 'Infection'];
    if (ignore) {
      topTerms = topTerms.filter(t => t !== ignore);
    }
    const i = Math.floor(Math.random() * topTerms.length);
    const disease = terms.find(t => t.name === topTerms[i]);
    return disease;
  }

  countryToGeo(country: string):Geo {
    return countries.find(c => c.iso === country);
  }

  getUserCountry(callback) {
    log.info('getUserCountry');
    const self = this;
    $.get("https://ipinfo.io", function(response) {
      const { country } = response;
      const geo = self.countryToGeo(country);
      callback(geo);
    }, 'jsonp');
  }

  getTrendsAPITopQueries(){
    log.info('getTrendsAPITopQueries');
    const { geo, disease } = this.data;

    const self = this;
    self.trendsAPI.getTopQueries({terms: [disease], geo: geo}, function(val){
      log.info('From Google Trends: ', val);
      const { item } = val;
      if (item) {
        self.updateData({ topQueries: item });
      } else if (geo.iso !== 'US') {
        const defaultGeo = self.countryToGeo('US');
        self.updateData({ geo: defaultGeo });
        self.getTrendsAPITopQueries();
      } else {
        self.updateData({ disease: self.getRandomDisease(disease.name) });
        self.getTrendsAPITopQueries();
      }
    });
  }

  updateData(obj) {
    const { data } = this;
    Object.assign(data, obj);
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

    const topQueries = document.createElement('div');
    topQueries.classList.add('top-queries');
    elementsContainer.appendChild(topQueries);

  }

  updateElements() {

  }
}
