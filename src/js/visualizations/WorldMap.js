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
    // const { data } = this;
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

    const projection = d3.geoMercator()
        .scale((width - 3) / (2 * Math.PI))
        .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    d3.json("https://gist.githubusercontent.com/alexwebgr/10249781/raw/2df84591a9e1fb891bcfde3a3c41d6cfc70cb5ee/world-topo.json", function(error, world) {
      if (error) throw error;

      // later - needs to double loop between our data & the map to compare the country/region code
      var countries = world.objects.countries.geometries;
      // log.info(countries);
      //
      //

      
      worldMap.insert("path")
          .datum(topojson.feature(world, world.objects.countries))
          .attr("class", "countries")
          .attr("d", path);
    });
  }

  updateElements() {
    const { data, svg } = this;

    log.info("data:" + JSON.stringify(data));
    log.info("svgggg:" + JSON.stringify(svg));
    // Your update function goes here
    // you should be able to access any children of your svg by doing

    //testing
    svg.selectAll('.countries')
      .style("fill", "red");




    // The data won't always send all of the countries.
    // I could have written a script to fill out the missing ones with zeros,
    // but decided to leave that to you... :P
    // You could simply reset all country values and then update the new ones?
  }
}
