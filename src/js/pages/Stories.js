// @flow weak

import StoriesLineCharts from '../containers/StoriesLineCharts';
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

    const stickyHeader = document.createElement('div');
    stickyHeader.classList.add('sticky-header');
    stickyHeader.innerHTML = "Stories";
    elementsContainer.appendChild(stickyHeader);

    const sections = [];
    for(let i = 0; i < 4; i++) {
      const section = document.createElement('div');
      elementsContainer.appendChild(section);
      sections.push(section);
    }

    const storiesSeasonal = new StoriesLineCharts(sections[0], 'seasonal');
    const storiesHolidays = new StoriesLineCharts(sections[1], 'holidays');
    const storiesMedia = new StoriesLineCharts(sections[2], 'media');
    const storiesRanking = new StoriesRanking(sections[3]);

  }
}
