// @flow weak

import type { TrendsAPIRegionsList } from '../util/types';
import * as d3 from 'd3';
// import * as topojson from 'topojson';
import * as topojson from 'topojson-client';
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
    // const width = parentContainer.offsetWidth;
    // const height = parentContainer.offsetHeight;
    const width = window.innerWidth;
    const height = window.innerHeight;

    const chart = this.svg = parentContainerSelection.append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('class', 'chart-canvas');

    const worldMap = chart.append('g')
      .attr('class', 'map');

    const color = d3.scaleThreshold()
      .domain([10000,100000,500000,1000000,5000000,10000000,50000000,100000000,500000000,1500000000])
      .range([
        'rgb(247,251,255)',
        'rgb(222,235,247)',
        'rgb(198,219,239)',
        'rgb(158,202,225)',
        'rgb(107,174,214)',
        'rgb(66,146,198)',
        'rgb(33,113,181)',
        'rgb(8,81,156)',
        'rgb(8,48,107)',
        'rgb(3,19,43)'
      ]);

    const projection = d3.geoMercator()
        .scale((width - 3) / (2 * Math.PI))
        .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);



    log.info("data:" + data);   // how come it's empty?

    d3.json("https://d3js.org/world-110m.v1.json", function(error, world) {
      if (error) throw error;

      worldMap.insert("path")
          .datum(topojson.feature(world, world.objects.land))
          .attr("class", "land")
          .attr("d", path);

      worldMap.insert("path")
          .datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }))
          .attr("class", "boundary")
          .attr("d", path);
    });

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
