// @flow weak

import stories from '../data/stories';
import StoriesNavBar from '../components/StoriesNavBar';
import FiltersMenu from '../components/FiltersMenu';
import WorldMap from '../visualizations/WorldMap';
import type { TrendsAPIRegion, TrendsAPIRegionsList } from '../util/types';
import * as d3 from 'd3';
import log from 'loglevel';
import '../../sass/stories.scss';

export default class StoriesEpidemics {

  data: {
    storySection: string,
    currCase: number,
    geoIso: string,
    currMonth: number,
    mapData: TrendsAPIRegionsList,
  };
  filtersMenu: HTMLElement;
  worldMap: WorldMap;
  slider: HTMLElement;
  copyContainer: HTMLElement;

  constructor(parentContainer: HTMLElement, storySection: string) {
    const self = this;
    const currCase = 0;
    const geoIso = stories[storySection].cases[currCase].geoList[0];
    const currMonth = 0;
    const path = stories[storySection].cases[currCase].data;

    const elementsContainer = document.createElement('div');
    elementsContainer.classList.add('story-section');
    parentContainer.appendChild(elementsContainer);

    d3.json(path, function(mapData) {
      self.data = { storySection, currCase, mapData, geoIso, currMonth };
      self.createElements(parentContainer);
    });
  }

  handleSliderChange(event, self: StoriesVizEpidemics) {
    const { value } = event.target;
    const currMonth = value;
    self.updateData({ currMonth });
  }

  updateData(obj) {
    const { data } = this;
    Object.assign(data, obj);
    log.info(this.data);
    this.updateElements();
  }

  createElements(parentContainer: HTMLElement) {
    const { mapData, currMonth } = this.data;
    log.info(mapData);

    const elementsContainer = document.createElement('div');
    elementsContainer.id = 'epidemics';
    parentContainer.appendChild(elementsContainer);

    const chartsContainer = document.createElement('div');
    chartsContainer.classList.add('charts-container');
    elementsContainer.appendChild(chartsContainer);

    let chartItem = document.createElement('div');
    chartItem.classList.add('chart-item');
    chartsContainer.appendChild(chartItem);
    this.worldMap = new WorldMap(chartItem, mapData[currMonth].regions);

    this.slider = document.createElement('input');
    const { slider } = this;
    slider.setAttribute('type', 'range');
    slider.setAttribute('min', 0);
    slider.setAttribute('max', mapData.length - 1);
    const bindSliderChange = evt => this.handleSliderChange(evt, this);
    slider.addEventListener('input', bindSliderChange);
    elementsContainer.appendChild(slider);
  }

  updateElements() {
    const { currMonth, mapData } = this.data;
    const { worldMap } = this;
    worldMap.updateData(mapData[currMonth].regions);
  }
}
