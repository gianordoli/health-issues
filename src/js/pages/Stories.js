// @flow weak

import StoriesLineCharts from '../containers/StoriesLineCharts';
import StoriesEpidemics from '../containers/StoriesEpidemics';
import StoriesRanking from '../containers/StoriesRanking';
import LineChart from '../visualizations/LineChart';
import * as d3 from 'd3';
import log from 'loglevel';
import '../../sass/stories.scss';

export default class Stories {

  constructor(parentContainer: HTMLElement) {
    this.createElements(parentContainer);
  }

  createElements(parentContainer: HTMLElement) {

    const elementsContainer = document.createElement('div');
    elementsContainer.id = 'stories';
    elementsContainer.classList.add('page');
    parentContainer.appendChild(elementsContainer);

    const sticky = document.createElement('div');
    sticky.classList.add('sticky');
    elementsContainer.appendChild(sticky);

    const pageHeader = document.createElement('div');
    pageHeader.classList.add('page-header');
    sticky.appendChild(pageHeader);

    const container = document.createElement('div');
    container.classList.add('container');
    pageHeader.appendChild(container);

    const pageName = document.createElement('p');
    pageName.innerHTML = "Stories";
    container.appendChild(pageName);

    const pageBody = document.createElement('div');
    pageBody.classList.add('page-body');
    elementsContainer.appendChild(pageBody);

    const storiesSeasonal = new StoriesLineCharts(pageBody, 'seasonal');
    const storiesHolidays = new StoriesLineCharts(pageBody, 'holidays');
    const storiesMedia = new StoriesLineCharts(pageBody, 'media');
    const storiesEpidemics = new StoriesEpidemics(pageBody, 'epidemics');
    const storiesRanking = new StoriesRanking(pageBody);
  }
}
