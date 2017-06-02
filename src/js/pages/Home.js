// @flow weak

import TrendsAPI from '../api/TrendsAPI';
import type { Term, Geo, Filter, TrendsAPITopTopics } from '../util/types';
import terms from '../data/terms';
import countries from '../data/countries';
import $ from 'jquery';
import log from 'loglevel';

export default class Home {

  data: {
    geo: Geo,
    disease: Term,
    topTopics: TrendsAPITopTopics[],
  }
  trendsAPI: TrendsAPI;
  countryContainer: HTMLElement;
  topTopicsList: HTMLElement;

  constructor(parentContainer: HTMLElement, trendsAPI: TrendsAPI) {
    const self = this;
    self.data ={
      geo: { iso: '', name: ''},
      disease: { name: '', entity: '', alias: ''},
      topTopics: [],
    }
    self.trendsAPI = trendsAPI;
    const disease = self.getRandomDisease();
    const country = self.getUserCountry(function(geo) {
      self.updateData({ disease, geo });
      self.getTrendsAPITopTopics();
    });
    this.createElements(parentContainer);
  }

  getRandomDisease(ignore?: string) {
    let topTerms = ['Pain', 'Acne', 'Allergy', 'Infection', 'Headache', 'Fever', 'Influenza'];
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
      const geo = self.countryToGeo(country);
      callback(geo);
    }, 'jsonp');
  }

  getTrendsAPITopTopics(){
    log.info('getTrendsAPITopTopics');
    const { geo, disease } = this.data;
    const self = this;
    const filter = {
      terms: [disease],
      geo,
      startDate: self.getPrevMonth(),
    };
    self.trendsAPI.getTopTopics(filter, function(val){
      log.info('From Google Trends: ', val);
      const { item } = val;
      if (item && item.length > 0) {
        self.updateData({ topTopics: item });
      } else if (geo && geo.iso !== 'US') {
        const defaultGeo = self.countryToGeo('US');
        self.updateData({ geo: defaultGeo });
        self.getTrendsAPITopTopics();
      } else if (disease) {
        self.updateData({ disease: self.getRandomDisease(disease.name) });
        self.getTrendsAPITopTopics();
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

    this.topTopicsList = document.createElement('div');
    this.topTopicsList.classList.add('top-queries-list');
    elementsContainer.appendChild(this.topTopicsList);
  }

  updateElements() {
    const { geo, disease, topTopics } = this.data;
    const { countryContainer, topTopicsList } = this;
    if (topTopics.length > 0) {
      countryContainer.innerHTML =
        `Searches for ${disease.name.toLowerCase()} in ${geo.article ? 'the' : ''} ${geo.name}:`;

      topTopics.forEach(t => {
        const p = document.createElement('p');
        p.innerHTML = t.title;
        topTopicsList.appendChild(p);
      })
    }
  }
}
