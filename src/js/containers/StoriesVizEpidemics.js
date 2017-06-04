// @flow weak

import type { TrendsAPIRegionsList } from '../util/types';
import { WorldMap } from '../visualizations/WorldMap';
import * as d3 from 'd3';
import log from 'loglevel';
import '../../sass/stories.scss';

export class StoriesVizEpidemics {


  data: {
    currMonth: number;
    mapData: {
      month: string,
      regions: TrendsAPIRegionsList
    }[]
  };
  worldMap: WorldMap;
  slider: HTMLElement;

  constructor(parentContainer: HTMLElement) {
    const self = this;
    d3.json('./data/epidemics-zika-virus.json', function(mapData) {
      log.info('Loaded story');
      log.info(mapData);
      self.data = {
        currMonth: 0,
        mapData
      };
      self.createElements(parentContainer);
    });
  }

  getDateRange() {
    // retu
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
    const { mapData } = this.data;

    const elementsContainer = document.createElement('div');
    elementsContainer.id = 'epidemics';
    parentContainer.appendChild(elementsContainer);

    const chartsContainer = document.createElement('div');
    chartsContainer.classList.add('charts-container');
    elementsContainer.appendChild(chartsContainer);

    let chartItem = document.createElement('div');
    chartItem.classList.add('chart-item');
    chartsContainer.appendChild(chartItem);
    this.worldMap = new WorldMap(chartItem, mapData);

    this.slider = document.createElement('input');
    const { slider } = this;
    slider.setAttribute('type', 'range');
    slider.setAttribute('min', 0);
    slider.setAttribute('max', mapData.length);
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
