// @flow weak

import StoriesContainer from '../containers/StoriesContainer';
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

    const storiesSeasonal = new StoriesContainer(elementsContainer, 'seasonal');
    // const storiesHolidays = new Stories(elementsContainer, 'holidays', 'newYear');
    // const storiesMedia = new Stories(elementsContainer, 'media', 'campaigns');

  }
}
