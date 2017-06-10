// @flow weak

import TrendsAPI from '../api/TrendsAPI';
import type { Term, Geo, Filter, TrendsAPITopTopics } from '../util/types';
import terms from '../data/terms';
import countries from '../data/countries';
import Icons from '../util/icons';
import * as d3 from 'd3';
import $ from 'jquery';
import log from 'loglevel';
import '../../sass/home.scss';

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

  randomTopicStyle(p: HTMLElement, i: number) {
    const iX = d3.interpolateNumber(0, window.innerWidth*0.4);
    const iY = d3.interpolateNumber(window.innerHeight*0.2, window.innerHeight*0.4);

    const upOrDown = i % 2 == 0 ? 1 : -1;
    const leftOrRight = (i % 3) == 0 ? 1 : -1;
    const posLeft = Math.round(leftOrRight * iX(Math.random())).toString() + 'px';
    const posTop = Math.round(upOrDown * iY(Math.random())).toString() + 'px';
    p.style.left = posLeft;
    p.style.top = posTop;

    const iS = d3.interpolateNumber(window.innerWidth*0.01, window.innerWidth*0.05);
    const size = iS(Math.random());
    p.style.fontSize = Math.round(size).toString() + 'px';
    p.style.filter = `blur(${size*0.02}px)`;
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
    titleContainer.classList.add('title-container');
    elementsContainer.appendChild(titleContainer);

    const title = document.createElement('h1');
    title.innerHTML = 'I\'m not<br>feeling well';
    titleContainer.appendChild(title);

    const projectDescription = document.createElement('p');
    projectDescription.id = 'project-description'
    projectDescription.innerHTML = 'Here goes a project projectDescription. no longer than 2 sentences.'
    titleContainer.appendChild(projectDescription);


    const logosContainer = document.createElement('div');
    logosContainer.classList.add('logos-container');
    titleContainer.appendChild(logosContainer);

    const gabriel = document.createElement('p');
    gabriel.classList.add('gabriel');
    gabriel.innerHTML = 'Gabriel Gianordoli';
    logosContainer.appendChild(gabriel);

    const forSpan = document.createElement('span');
    forSpan.innerHTML = 'for';
    logosContainer.appendChild(forSpan);

    const gnl = document.createElement('div');
    gnl.classList.add('google-news-lab-logo');
    gnl.innerHTML = Icons.googleNewsLabLogo;
    logosContainer.appendChild(gnl);

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

      let span = document.createElement('span');
      span.innerHTML = 'Searches for ';
      countryContainer.append(span);

      const diseaseContainer = document.createElement('span');
      diseaseContainer.classList.add('disease-container');
      diseaseContainer.innerHTML = disease.name.toLowerCase();
      countryContainer.appendChild(diseaseContainer);

      countryContainer.appendChild(document.createElement('br'));

      span = document.createElement('span');
      span.innerHTML = 'in ';
      countryContainer.appendChild(span);

      const country = document.createElement('span');
      country.classList.add('country');
      country.innerHTML = geo.name;
      countryContainer.appendChild(country);

      topTopics.forEach((t, i) => {
        const p = document.createElement('p');
        p.innerHTML = t.title;
        topTopicsList.appendChild(p);
        this.randomTopicStyle(p, i);
      });
    }
  }
}
