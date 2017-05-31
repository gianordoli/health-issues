// @flow weak

import type { TrendsAPIRegionsList } from '../util/types';
import * as d3 from 'd3';
import log from 'loglevel'; // Pretty handy log tool. Use log.info(something), instead of console.log()!

export class WorldMap {

  // Notice that the chart gets one list of regions/values at a time,
  // never the full timeline!
  data: {
     regionCode: string,
     regionName: string,
     value: number,
  }[];
  svg: () => {};

  constructor(parentContainer: HTMLElement) {
    this.data = [];
    this.createElements(parentContainer);
  }

  updateData(data) {
    this.data = data;
    console.log('D3 ->', this.data);
    this.updateElements();
  }

  createElements(parentContainer: HTMLElement) {
    const parentContainerSelection = d3.select(parentContainer);
    const { data } = this;

    // Dimensions are set by the parent div, which in turn is defined via css.
    // No need to worry about it!
    const width = parentContainer.offsetWidth;
    const height = parentContainer.offsetHeight;

    this.svg = parentContainerSelection.append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('class', 'chart-canvas');

    // I'm storing the svg D3selection (not the actual svg node) so that
    // you can access it in the updateElements function

    // Now keep appending the paths to draw the map
  }

  updateElements() {
    const { data, svg } = this;
    // Your update function goes here
    // you should be able to access any children of your svg by doing
    // svg.select(...)

    // The data won't always send all of the countries.
    // I could have written a script to fill out the missing ones with zeros,
    // but decided to leave that to you... :P
    // You could simply reset all country values and then update the new ones?
  }
}
