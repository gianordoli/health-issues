// @flow weak

import type { TrendsAPIRegionsList } from '../util/types';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import log from 'loglevel'; // Pretty handy log tool. Use log.info(something), instead of console.log()!

export class WorldMap {

  data: {
     regionCode: string,
     regionName: string,
     value: number,
  }[];
  width: number;
  height: number;
  margin: { top: number, left: number, bottom: number, right: number };
  svg: () => {};

  constructor(parentContainer: HTMLElement, data: TrendsAPIRegionsList) {
    this.data = data;
    this.margin = {top: 4, right: 4, bottom: 32, left: 32};
    this.width  = parentContainer.offsetWidth - (this.margin.left + this.margin.right);
    this.height = parentContainer.offsetHeight - (this.margin.top + this.margin.bottom);
    this.createElements(parentContainer);
  }

  updateData(data) {
    this.data = data;
    // console.log('D3 ->', this.data);
    this.updateElements();
  }

  createElements(parentContainer: HTMLElement) {
    log.info('createElements');
    const parentContainerSelection = d3.select(parentContainer);
    const { data, width, height, margin } = this;

    const chart = this.svg = parentContainerSelection.append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .attr('class', 'chart-canvas');
  }

  updateElements() {
    const { data, width, height, margin, svg} = this;

    // To Do:
    // 1. change the projection
    // 2. fix the black color, this is when the region is undefined in our dataset
    const projection = d3.geoMercator()
        .scale((width - 3) / (2 * Math.PI))
        .translate([width / 2, height / 2]);
    const path = d3.geoPath().projection(projection);

    var color = d3.scaleThreshold()
        .domain([0, 10, 20, 30, 40, 50, 60, 70, 80, 90])
        .range(["#fff5eb",
          "#fee6ce",
          "#fdd0a2",
          "#fdae6b",
          "#fd8d3c",
          "#f16913",
          "#d94801",
          "#a63603",
          "#7f2704"
        ]);

    d3.json("https://gist.githubusercontent.com/alexwebgr/10249781/raw/2df84591a9e1fb891bcfde3a3c41d6cfc70cb5ee/world-topo.json", function(error, world) {
      if (error) throw error;

      const valueByRegion = {};
      const worldFeatures = topojson.feature(world, world.objects.countries).features;

      data.forEach(d => { valueByRegion[d.regionCode] = +d.value; });
      //if the country doesnt have any value (undefined), set d.value to zero
      worldFeatures.forEach(d => { valueByRegion[d.properties.countryCode] ? d.value = valueByRegion[d.properties.countryCode] : d.value = 0; });
      // log.info(valueByRegion);

      const worldMap = svg.append('g')
        .attr('class', 'map');

      worldMap.selectAll('.country')
        .data(worldFeatures)
        .enter().append('path')
          .attr("class", "country")
          .attr("fill", "none")
          .attr("id", function(d) { return "code-" + d.properties.countryCode; }, true)
          .attr("fill", function(d) { return color(valueByRegion[d.properties.countryCode]); })
          .attr("d", path);
    });

  }
}
