// @flow weak

import type { TrendsAPIRegion } from '../util/types';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import log from 'loglevel'; // Pretty handy log tool. Use log.info(something), instead of console.log()!

export default class WorldMap {
  data: Array<TrendsAPIRegion>;
  width: number;
  height: number;
  worldFeatures;
  svg: () => {};

  constructor(parentContainer: HTMLElement, data: Array<TrendsAPIRegion>) {
    const self = this;
    self.data = data;
    self.width = parentContainer.offsetWidth;
    self.height = parentContainer.offsetHeight;
    d3.json(
      'https://gist.githubusercontent.com/alexwebgr/10249781/raw/2df84591a9e1fb891bcfde3a3c41d6cfc70cb5ee/world-topo.json',
      function(error, world) {
        self.worldFeatures = topojson.feature(world, world.objects.countries)
          .features;
        self.createElements(parentContainer);
      }
    );
  }

  updateData(data) {
    this.data = data;
    // console.log('D3 ->', this.data);
    this.updateElements();
  }

  createElements(parentContainer: HTMLElement) {
    log.info('createElements');
    const parentContainerSelection = d3.select(parentContainer);
    const { width, height } = this;

    this.svg = parentContainerSelection
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('class', 'chart-canvas');

    const worldMap = this.svg.append('g').attr('class', 'map');

    this.updateElements();
  }

  updateElements() {
    const { data, width, height, svg, worldFeatures } = this;

    // To Do:
    // 1. change the projection
    // 2. fix the black color, this is when the region is undefined in our dataset
    const projection = d3
      .geoMercator()
      .scale((width - 3) / (2 * Math.PI))
      .translate([width / 2, height / 2]);
    const path = d3.geoPath().projection(projection);

    var color = d3
      .scaleThreshold()
      .domain([0, 10, 20, 30, 40, 50, 60, 70, 80, 90])
      .range([
        '#fff5eb',
        '#fee6ce',
        '#fdd0a2',
        '#fdae6b',
        '#fd8d3c',
        '#f16913',
        '#d94801',
        '#a63603',
        '#7f2704',
      ]);

      const valueByRegion = {};
      data.forEach(d => {
        valueByRegion[d.regionCode] = +d.value;
      });

      //if the country doesnt have any value (undefined), set d.value to zero
      worldFeatures.forEach(d => {
        valueByRegion[d.properties.countryCode]
          ? (d.value = valueByRegion[d.properties.countryCode])
          : (d.value = 0);
      });

      const worldMap = svg.select('.map');

      const countries = worldMap.selectAll('.country')
        .data(worldFeatures);

      const countriesEnterUpdate = countries
        .enter()
        .append('path')
        .attr('class', 'country')
        .merge(countries)
        .attr('fill', d => `rgba(250, 130, 0, ${valueByRegion[d.properties.countryCode]/100}`)
        .attr('d', path);
  }
}
