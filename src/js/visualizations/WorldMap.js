// @flow weak

import type { TrendsAPIRegionsList } from '../util/types';
import * as d3 from 'd3';
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

  constructor(parentContainer: HTMLElement, data: TrendsAPIRegionsList) {
    this.data = data;
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
    const { data } = this;
    // log.info(data);
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

      // testing some random year
      // replace this '10' with the index data passed from the slider....
      data[10].regions.forEach(d => { valueByRegion[d.regionCode] = +d.value; });
      //if the country doesnt have any value (undefined), set d.value to zero
      worldFeatures.forEach(d => { valueByRegion[d.properties.countryCode] ? d.value = valueByRegion[d.properties.countryCode] : d.value = 0; });
      log.info(valueByRegion);

      worldMap.selectAll('.country')
        .data(worldFeatures)
        .enter().append('path')
          .attr("class", "country")
          .attr("fill", "none")
          .attr("id", function(d) { return "code-" + d.properties.countryCode; }, true)
          .attr("fill", function(d) { log.info(d); return color(valueByRegion[d.properties.countryCode]); })
          .attr("d", path);
    });
  }

  updateElements() {
    const { data, svg } = this;

    // log.info("data:" + JSON.stringify(data));
    // log.info("svgggg:" + JSON.stringify(svg));

  }
}
