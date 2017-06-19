// @flow weak

import StoriesEpidemics from '../containers/StoriesEpidemics';
import { map } from '../util/util';
import type { TrendsAPIRegion } from '../util/types';
import * as d3 from 'd3';
import d3tip from 'd3-tip';
import * as topojson from 'topojson-client';
import log from 'loglevel';

export default class WorldMap {
  data: Array<TrendsAPIRegion>;
  width: number;
  height: number;
  worldFeatures;
  svg: () => {};
  tip: () => {};
  colorScale: () => {};

  constructor(parentContainer: HTMLElement, data: Array<TrendsAPIRegion>) {
    const self = this;
    self.data = data;
    self.width = parentContainer.offsetWidth;
    self.height = self.width * 0.5;

    self.colorScale = d3
      .scaleThreshold()
      .domain([10, 20, 30, 40, 50, 60, 70, 80, 90])
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

    d3.json(
      './data/world-topo.json',
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
    const { width, height, worldFeatures, colorScale } = this;

    this.svg = parentContainerSelection
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('class', 'chart-canvas');
    const { svg } = this;

    this.tip = d3tip()
      .attr('class', 'd3-tip')
      .html(function(content: string) {
        return content;
      });

    svg.call(this.tip);

    const projection = d3.geoEquirectangular()
      .scale((width - 3) / (2 * Math.PI))
      .translate([width * 0.5, height * 0.5]);

    const path = d3.geoPath().projection(projection);

    const worldMap = svg.append('g')
      .attr('class', 'map');

    const countries = worldMap.selectAll('.country')
      .data(worldFeatures)
      .enter()
      .append('path')
      .attr('class', 'country')
      .attr('d', path);

    // Legend
    const x = d3.scaleLinear()
      .domain([10, 90])
      .rangeRound([height, width]);

    const legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', 'translate(' + -30 + ',' + (height-30) + ')');

    legend.selectAll('rect')
      .data(colorScale.range().map(function(d) {
        d = colorScale.invertExtent(d);
        if (d[0] == null) d[0] = x.domain()[0];
        if (d[1] == null) d[1] = x.domain()[1];
        return d;
      }))
      .enter().append('rect')
        .attr('height', 5)
        .attr('x', d => x(d[0]))
        .attr('width', d => x(d[1]) - x(d[0]))
        .attr('fill', d => colorScale(d[0]));

    legend.append('text')
      .attr('class', 'legend')
      .attr('x', x.range()[0])
      .attr('y', -6)
      .attr('text-anchor', 'start')
      .text('Search amount:');

    legend.call(d3.axisBottom(x)
      .tickSize(9)
      .tickFormat(function(x, i) { return x })
      .tickValues(colorScale.domain()))
      .select('.domain')
      .remove();

    this.updateElements();
  }

  updateElements() {
    const { data, width, height, svg, tip, colorScale, worldFeatures } = this;

    const valueByRegion = {};
    data.forEach(d => {
      valueByRegion[d.regionCode] = +d.value;
    });

    worldFeatures.forEach(d => {
      valueByRegion[d.properties.countryCode]
        ? (d.value = valueByRegion[d.properties.countryCode])
        : (d.value = 0);
    });

    const worldMap = svg.select('.map');
    worldMap.selectAll('.country')
      // .attr('fill', d => {
      //   let value = valueByRegion[d.properties.countryCode];
      //   if (value === undefined) value = 0;
      //   return colorScale(value);
      // })
      .attr('fill', d => {
        const value = valueByRegion[d.properties.countryCode];
        const alpha = value === undefined || value === 0 ? 0 : map(value, 0, 100, 0.1, 1);
        return `rgba(250, 130, 0, ${alpha})`
      })
      .style('cursor', d => valueByRegion[d.properties.countryCode] ? 'pointer' : 'auto')
      .on('mouseover', function(d) {
        const val = valueByRegion[d.properties.countryCode];
        if (val) {
          const tooltipHed = `<span class="country">${d.properties.name}:</span>`;
          const tooltipVal = `<span class="value">${valueByRegion[d.properties.countryCode]}</span>`;
          tip.show(tooltipHed + tooltipVal);
        }
      })
      .on('mouseout', tip.hide);
  }
}
