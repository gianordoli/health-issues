// @flow weak

import StoriesEpidemics from '../containers/StoriesEpidemics';
import { map } from '../util/util';
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
  tooltip: () => {};

  constructor(parentContainer: HTMLElement, data: Array<TrendsAPIRegion>) {
    const self = this;
    self.data = data;
    self.width = parentContainer.offsetWidth;
    self.height = parentContainer.offsetHeight;
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
    const { width, height } = this;

    this.svg = parentContainerSelection
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('class', 'chart-canvas');

    const worldMap = this.svg.append('g').attr('class', 'map');

    this.tooltip = parentContainerSelection
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    this.updateElements();
  }

  updateElements() {
    const { data, width, height, svg, tooltip, worldFeatures } = this;

    const projection = d3
      .geoMercator()
      .scale((width - 3) / (2 * Math.PI))
      .translate([width / 2, height / 2]);
    const path = d3.geoPath().projection(projection);

    var color = d3
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
    const countries = worldMap.selectAll('.country')
      .data(worldFeatures);

    // Legend
    const x = d3.scaleLinear()
      .domain([10, 90])
      .rangeRound([height, width]);

    const legend = svg.append('g')
      .attr('class', 'legend')
      .attr("transform", "translate(" + -30 + "," + (height-30) + ")");

    legend.selectAll("rect")
      .data(color.range().map(function(d) {
        d = color.invertExtent(d);
        if (d[0] == null) d[0] = x.domain()[0];
        if (d[1] == null) d[1] = x.domain()[1];
        return d;
      }))
      .enter().append("rect")
        .attr("height", 5)
        .attr("x", function(d) { return x(d[0]); })
        .attr("width", function(d) { log.info("legend width"+ d); return x(d[1]) - x(d[0]); })
        .attr("fill", function(d) { return color(d[0]); });

    legend.append("text")
      .attr("class", "legend")
      .attr("x", x.range()[0])
      .attr("y", -6)
      .attr("fill", "#000")
      .attr("text-anchor", "start")
      .attr("font-weight", "bold")
      .text("Search amount:");

    legend.call(d3.axisBottom(x)
      .tickSize(9)
      .tickFormat(function(x, i) { return x })
      .tickValues(color.domain()))
    .select(".domain")
      .remove();

    // update
    const countriesEnterUpdate = countries
      .enter()
      .append('path')
      .attr('class', 'country')
      .merge(countries)
      .attr('fill', d => {
        const value = valueByRegion[d.properties.countryCode];
        // const alpha = value === undefined ? 0 : value/100;
        // let alpha;
        // if (value === undefined || value ==) {
        //   alpha = 0;
        // }
        const alpha = value === undefined || value === 0 ? 0 : map(value, 0, 100, 0.1, 1);
        return `rgba(250, 130, 0, ${alpha})`
        // return `rgba(68, 34, 179, ${alpha})`
      })
      .attr('d', path)
      .on("mouseover", function(d) {
        d3.select(this)
          .transition().duration(100)
          .style("opacity", 0.8);

        (d.value !== 0) ? tooltip.transition().duration(100).style("opacity", 1) : tooltip.style("opacity", 0);
        const tooltipHed = "<h4>" + d.properties.name + "</h4>"
        const tooltipVal = "<span>" + valueByRegion[d.properties.countryCode] + "</span>"

        tooltip.html(tooltipHed + tooltipVal)
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY -30) + "px");
      })
      .on("mouseout", function() {
        d3.select(this)
          .transition().duration(100)
          .style("opacity", 1);
        tooltip.transition().duration(100)
          .style("opacity", 0);
      })
  }
}
