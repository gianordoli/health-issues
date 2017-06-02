// @flow weak

import stories from '../content/stories';
import LineChart from '../visualizations/LineChart';
import * as d3 from 'd3';
import log from 'loglevel';
// import '../../sass/stories.scss';

export default class StoriesContainer {
  data: {
    storySection: string,
    currCase: string,
    chartData: [],
  };
  chart: LineChart;

  constructor(parentContainer: HTMLElement, storySection: string, currCase: string) {
    log.info('StoriesContainer');
    const self = this;
    d3.json(stories[storySection].cases[currCase].data, function(chartData) {
      log.info(chartData);
      self.data = { storySection, currCase, chartData };
      self.createElements(parentContainer);
    });
  }

  loadData(path: string) {
    const self = this;
    d3.json(path, function(chartData) {
      self.updateData({ chartData });
    });
  }

  updateData(obj) {
    const { data } = this;
    Object.assign(data, obj);
    log.info(this.data);
    this.updateElements();
  }

  createElements(parentContainer: HTMLElement) {
    const { storySection, currCase, chartData } = this.data;

    const elementsContainer = document.createElement('div');
    parentContainer.appendChild(elementsContainer);

    const sectionHeader = document.createElement('div');
    sectionHeader.classList.add('section-header');
    elementsContainer.appendChild(sectionHeader);

    const title = document.createElement('h1');
    title.innerHTML = stories[storySection].title;
    sectionHeader.appendChild(title);

    const intro = document.createElement('p');
    intro.innerHTML = stories[storySection].intro;
    sectionHeader.appendChild(intro);

    // const chartsContainer = document.createElement('div');
    // chartsContainer.classList.add('charts-container');
    // elementsContainer.appendChild(chartsContainer);
    //
    // const chartItem = document.createElement('div');
    // chartItem.classList.add('chart-item');
    // chartsContainer.appendChild(chartItem);
    // this.chart = new LineChart(chartItem, );
    //
    // this.slider = document.createElement('input');
    // const { slider } = this;
    // slider.setAttribute('type', 'range');
    // slider.setAttribute('min', 0);
    // slider.setAttribute('max', mapData.length);
    // const bindSliderChange = evt => this.handleSliderChange(evt, this);
    // slider.addEventListener('change', bindSliderChange);
    // elementsContainer.appendChild(slider);
  }

  updateElements() {
    // const { currMonth, mapData } = this.data;
    // const { worldMap } = this;
    // worldMap.updateData(mapData[currMonth].regions);
  }
}
