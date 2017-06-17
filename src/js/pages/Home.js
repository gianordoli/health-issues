// @flow weak

import TrendsAPI from '../api/TrendsAPI';
import type { Term, Geo, Filter, TrendsAPITopTopics } from '../util/types';
import terms from '../data/terms';
import countries from '../data/countries';
import Icons from '../util/icons';
import { map } from '../util/util';
import homeIconsList from '../data/homeIconsList';
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
    self.trendsAPI = trendsAPI;``
    const disease = self.getRandomDisease();
    const country = self.getUserCountry(function(geo) {
      self.updateData({ disease, geo });
      self.getTrendsAPITopTopics();
    });
    this.createElements(parentContainer);
  }

  getRandomDisease(ignore?: string) {
    let topTerms = ['Acne', 'Allergy', 'Infection', 'Headache', 'Fever', 'Influenza'];
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
    self.trendsAPI.getTopQueries(filter, function(val){
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

  showRandomTopic() {
    const iconContainers = document.querySelectorAll('#home.page .top-topics-list .icon');
    const randomIcon = iconContainers[Math.floor(Math.random()*iconContainers.length)];

    let svg, p;
    svg = randomIcon.querySelector('svg');
    p = randomIcon.querySelector('p');
    if (svg && p) {
      svg.classList.add('flipped');
      p.classList.add('flipped');

      setTimeout(function() {
        svg.classList.remove('flipped');
        p.classList.remove('flipped');
      }, 4000);
    }
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
    setTimeout(function() {
      titleContainer.classList.add('enter');
    }, 1000);

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
    this.topTopicsList.classList.add('top-topics-list');
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

      const diseaseIconsList = homeIconsList[disease.name];
      const width = window.innerWidth;
      const height = window.innerHeight;
      const spacing = width < 600 ? 70 : 140;
      let i = 0;
      let line = 0;
      for (let y=0; y < height; y += spacing) {
        for (let x = (line % 2 === 0) ? 0 : -spacing/2 ; x < width; x += spacing) {
          const iconContainer = document.createElement('div');
          const n = i % diseaseIconsList.length;
          const iconName = diseaseIconsList[n];
          const distToCenter = Math.abs(height/2 - y);
          const opacity = map(distToCenter, 0, height/2, 0.24, 0.8);
          iconContainer.classList.add('icon');
          iconContainer.innerHTML = Icons[iconName];
          iconContainer.style.top = `${y}px`;
          iconContainer.style.left = `${x}px`;
          iconContainer.style.opacity = opacity;
          topTopicsList.appendChild(iconContainer);

          const p = document.createElement('p');
          const randomTopic = topTopics[Math.floor(Math.random()*topTopics.length)];
          p.innerHTML = randomTopic.title;
          iconContainer.appendChild(p);

          i++;
        }
        line++;
      }
    }

    setInterval(this.showRandomTopic, 2000);
  }
}
