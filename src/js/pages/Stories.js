// @flow weak

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

    const chartsContainer = document.createElement('div');
    chartsContainer.classList.add('charts-container');
    elementsContainer.appendChild(chartsContainer);

    let chartItem = document.createElement('div');
    chartItem.classList.add('chart-item');
    chartsContainer.appendChild(chartItem);
    const seasonalChart = new LineChart(chartItem, 'seasonal');
    d3.json('./data/seasonal-summer.json', function(data) {
      log.info('Loaded story');
      log.info(data);
      seasonalChart.updateData(data['US']);
    });

  }
}
