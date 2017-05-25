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
  countryContainer: HTMLElement;
  topQueriesList: HTMLElement;

  constructor(parentContainer: HTMLElement, trendsAPI: TrendsAPI) {
    const self = this;
    self.data ={
      geo: { iso: '', name: ''},
      disease: { name: '', entity: '', alias: ''},
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
    // Pain: bug; Stress, Fever: not that many results
    let topTerms = ['Headache', 'Infection', 'Fatigue'];
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

  getPrevMonth() {
    const prevMonthDate = new Date();
    prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
    const year = prevMonthDate.getFullYear();
    let month = (new Date()).getMonth();
    month = month < 10 ? `0${month}` : month;
    return `${year}-${month}`;
  }

  getUserCountry(callback) {
    log.info('getUserCountry');
    const self = this;
    $.get("https://ipinfo.io", function(response) {
      const { country } = response;
      // const geo = self.countryToGeo(country);
      const geo = self.countryToGeo('AF');
      callback(geo);
    }, 'jsonp');
  }

  getTrendsAPITopQueries(){
    log.info('getTrendsAPITopQueries');
    const { geo, disease } = this.data;
    const self = this;
    const filter = {
      terms: [disease],
      geo,
      startDate: self.getPrevMonth(),
    };
    self.trendsAPI.getTopQueries(filter, function(val){
      log.info('From Google Trends: ', val);
      const { item } = val;
      if (item && item.length > 0) {
        self.updateData({ topQueries: item });
      } else if (geo && geo.iso !== 'US') {
        const defaultGeo = self.countryToGeo('US');
        self.updateData({ geo: defaultGeo });
        self.getTrendsAPITopQueries();
      } else if (disease) {
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

    const titleContainer = document.createElement('div');
    elementsContainer.appendChild(titleContainer);

    const title = document.createElement('h1');
    title.innerHTML = 'I\'m not feeling well';
    titleContainer.appendChild(title);

    const projectDescription = document.createElement('p');
    projectDescription.id = 'project-description'
    projectDescription.innerHTML = 'Here goes a project projectDescription. no longer than 2 sentences.'
    titleContainer.appendChild(projectDescription);


    const logosContainer = document.createElement('div');
    logosContainer.id = 'logos-container';
    elementsContainer.appendChild(logosContainer);

    const gabriel = document.createElement('p');
    gabriel.innerHTML = 'Gabriel Gianordoli';
    logosContainer.appendChild(gabriel);

    const forP = document.createElement('p');
    forP.innerHTML = 'for';
    logosContainer.appendChild(forP);

    const newsLabLogo = document.createElement('p');
    newsLabLogo.innerHTML = 'Google News Lab';
    logosContainer.appendChild(newsLabLogo);

    this.countryContainer = document.createElement('div');
    this.countryContainer.classList.add('country-container');
    elementsContainer.appendChild(this.countryContainer);

    this.topQueriesList = document.createElement('div');
    this.topQueriesList.classList.add('top-queries-list');
    elementsContainer.appendChild(this.topQueriesList);
  }

  updateElements() {
    const { geo, disease, topQueries } = this.data;
    const { countryContainer, topQueriesList } = this;
    if (topQueries.length > 0) {
      countryContainer.innerHTML =
        `Searches for ${disease.name.toLowerCase()} in ${geo.article ? 'the' : ''} ${geo.name}:`;

      topQueries.forEach(t => {
        const p = document.createElement('p');
        p.innerHTML = t.title;
        topQueriesList.appendChild(p);
      })
    }
  }
}
