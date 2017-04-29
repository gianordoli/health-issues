// @flow weak

import * as d3 from 'd3';

export class ChartTrend {

  data: [];
  svg: () => {};
  x: () => {};
  y: () => {};
  xAxis: () => {};
  yAxis: () => {};
  line: () => {};

  constructor(parentContainer: HTMLElement, data: []) {
    this.data = data;
    this.createElements(parentContainer, data);
  }

  updateData(data: []) {
    this.data = data;
    this.updateElements();
  }

  createElements(_parentContainer: HTMLElement) {
    const parentContainer = d3.select(_parentContainer);
    const { data } = this;

    const margin = {top: 10, right: 0, bottom: 10, left: 30};
    const width  = 800;
    const height = 400;
    const obj = {};
    this.x = d3.scaleLinear().range([0, width]);
    this.y = d3.scaleLinear().range([height, 0]);
    
    const { x, y } = this;
    this.xAxis = d3.axisBottom(x);
    this.yAxis = d3.axisLeft(y);

    this.line = d3.line()
      .x(function(d) { return x(d.x); })
      .y(function(d) { return y(d.y); });

    this.svg = parentContainer.append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    this.x.domain(d3.extent(data, function(d) { return d.x; }));
    this.y.domain(d3.extent(data, function(d) { return d.y; }));

    this.svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(this.xAxis);

    this.svg.append('g')
      .attr('class', 'y axis')
      .call(this.yAxis)

    this.svg.append('path')
      .datum(data)
      .attr('class', 'line')
      .attr('stroke', 'black')
      .attr('d', this.line);
  }

  updateElements() {
    const { data } = this;
    let { svg, x, y, xAxis, yAxis, line  } = this;

    x.domain(d3.extent(data, function(d) { return d.x; }));
    y.domain(d3.extent(data, function(d) { return d.y; }));        

    svg.select('g.y')
      .transition()
      .duration(1000)
      .call(yAxis);

    svg.select('g.x')
      .transition()
      .duration(1000)
      .call(xAxis);

    svg.selectAll('path.line')
      .datum(data)
      .transition()
      .duration(1000)
      .attr('d', line);    
  }
}