// @flow weak

import stories from '../data/stories';
import StoriesNavBar from '../components/StoriesNavBar';
import FiltersMenu from '../components/FiltersMenu';
import LineChart from '../visualizations/LineChart';
import type { Term, Geo, TrendsAPIGraph } from '../util/types';
import * as d3 from 'd3';
import log from 'loglevel';
// import '../../sass/stories.scss';

export default class StoriesLineCharts {
  data: {
    storySection: string,
    currCase: number,
    geoIso: string,
    chartData: {
      [key: string]: Array<TrendsAPIGraph>,
    },
    isLoading: boolean,
  };
  filtersMenu: HTMLElement;
  chart: LineChart;
  copyContainer: HTMLElement;
  loaderContainer: HTMLElement;

  constructor(parentContainer: HTMLElement, storySection: string) {
    const self = this;
    const currCase = 0;
    const geoIso = stories[storySection].cases[currCase].geoList[0];
    const path = stories[storySection].cases[currCase].data;
    const isLoading = false;

    const elementsContainer = document.createElement('div');
    elementsContainer.classList.add('story-section');
    parentContainer.appendChild(elementsContainer);

    d3.json(path, function(chartData) {
      self.data = { storySection, currCase, chartData, geoIso, isLoading };
      self.createElements(elementsContainer);
    });
  }

  loadNewCase(
    event: Event,
    self: StoriesLineCharts,
    elementsContainer: HTMLElement,
    currCase: number
  ) {
    const { storySection } = self.data;
    const path = stories[storySection].cases[currCase].data;
    const geoIso = stories[storySection].cases[currCase].geoList[0];
    let isLoading = true;
    self.updateData({ isLoading });

    elementsContainer.querySelectorAll('p').forEach((e, i) => {
      i === currCase ? e.classList.add('active') : e.classList.remove('active');
    });
    d3.json(path, function(chartData) {
      isLoading = false;
      self.updateData({ currCase, chartData, geoIso, isLoading });
    });
  }

  changeGeo(geoIso: string, self: StoriesLineCharts) {
    self.updateData({ geoIso });
  }

  updateData(obj) {
    const { data } = this;
    Object.assign(data, obj);
    this.updateElements();
  }

  createElements(elementsContainer: HTMLElement) {
    const { storySection, currCase, chartData, geoIso } = this.data;
    const { terms, geoList, chartType, copy } = stories[storySection].cases[
      currCase
    ];

    const pageBody = document.createElement('div');
    pageBody.classList.add('page-body');
    elementsContainer.appendChild(pageBody);

    const sectionHeader = document.createElement('div');
    sectionHeader.classList.add('section-header', 'container');
    pageBody.appendChild(sectionHeader);

    const title = document.createElement('h3');
    title.innerHTML = stories[storySection].title;
    sectionHeader.appendChild(title);

    const intro = document.createElement('p');
    intro.innerHTML = stories[storySection].intro;
    sectionHeader.appendChild(intro);

    const storiesNavBar = new StoriesNavBar(
      pageBody,
      stories[storySection].cases.map(c => c.title),
      this,
      this.loadNewCase
    );

    const sectionBody = document.createElement('div');
    sectionBody.classList.add('section-body', 'container');
    pageBody.appendChild(sectionBody);

    this.loaderContainer = document.createElement('div');
    const { loaderContainer } = this;
    loaderContainer.classList.add('loader-container');
    const loader = document.createElement('span');
    loader.classList.add('loader');
    loaderContainer.appendChild(loader);
    sectionBody.appendChild(loaderContainer);

    const row = document.createElement('div');
    row.classList.add('row');
    sectionBody.appendChild(row);

    const chartsContainer = document.createElement('div');
    chartsContainer.classList.add('charts-container');
    row.appendChild(chartsContainer);

    this.filtersMenu = new FiltersMenu(
      chartsContainer,
      terms,
      geoList,
      geoIso,
      this,
      this.changeGeo
    );

    const chartItem = document.createElement('div');
    chartItem.classList.add('chart-item');
    chartsContainer.appendChild(chartItem);
    this.chart = new LineChart(chartItem, chartType);

    this.copyContainer = document.createElement('div');
    const { copyContainer } = this;
    copyContainer.classList.add('case-copy');
    for (const c of copy) {
      const p = document.createElement('p');
      p.innerHTML = c;
      copyContainer.appendChild(p);
    }
    row.appendChild(copyContainer);

    this.updateElements();
  }

  updateElements() {
    let { filtersMenu } = this;
    const { chart, copyContainer, loaderContainer } = this;
    const { storySection, currCase, chartData, geoIso, isLoading } = this.data;
    const { terms, geoList, chartType, copy } = stories[storySection].cases[
      currCase
    ];

    if (isLoading) {
      loaderContainer.classList.remove('hidden');
    } else {
      loaderContainer.classList.add('hidden');
    }

    const parent = filtersMenu.parentElement;
    filtersMenu = new FiltersMenu(
      filtersMenu.parentElement,
      terms,
      geoList,
      geoIso,
      this,
      this.changeGeo
    );

    chart.updateData(chartData[geoIso], chartType);

    copyContainer.innerHTML = '';
    for (const c of copy) {
      const p = document.createElement('p');
      p.innerHTML = c;
      copyContainer.appendChild(p);
    }
  }
}
