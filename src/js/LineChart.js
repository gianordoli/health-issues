// @flow weak

import * as d3 from 'd3';

export class LineChart {

  data: {date: Date, value: number}[];
  type: string;
  svg: () => {};
  x: () => {};
  y: () => {};
  xAxis: () => {};
  yAxis: () => {};
  line: () => {};

  constructor(parentContainer: HTMLElement, type: string) {
    this.data = [];
    this.type = type;
    this.createElements(parentContainer);
  }

  hide() {
    this.svg.classed('hidden-chart', !this.svg.classed('hidden-chart'));
  }

  updateData(data: {date: Date, value: number}[]) {
    this.data = data;
    this.updateElements();
  }

  createElements(_parentContainer: HTMLElement) {
    const parentContainer = d3.select(_parentContainer);
    const { data } = this;

    const margin = {top: 10, right: 0, bottom: 30, left: 30};
    const width  = 800;
    const height = 400;
    const obj = {};
    this.x = d3.scaleTime().range([0, width]);
    this.y = d3.scaleLinear().range([height, 0]);
    
    // TO-DO
    // Parse time: const parseTime = d3.timeParse('%Y-%m-%d');

    const { x, y } = this;
    this.xAxis = d3.axisBottom(x);

    // Displaying months for seasonal chart
    if (this.type == 'seasonal') {
      this.xAxis = this.xAxis.tickFormat(d3.timeFormat("%b"));
    }
    
    this.yAxis = d3.axisLeft(y);

    this.line = d3.line()
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d.value); });

    this.svg = parentContainer.append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .classed('chart', true);

    const chart = this.svg
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    this.x.domain(d3.extent(data, function(d) { return d.date; }));
    this.y.domain(d3.extent(data, function(d) { return d.value; }));

    chart.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(this.xAxis);

    chart.append('g')
      .attr('class', 'y axis')
      .call(this.yAxis)

    chart.append('path')
      .datum(data)
      .attr('class', 'line')
      .attr('stroke', 'black')
      .attr('d', this.line);
  }

  updateElements() {
    const { data } = this;
    let { svg, x, y, xAxis, yAxis, line  } = this;

    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain(d3.extent(data, function(d) { return d.value; }));        

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