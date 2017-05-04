// @flow weak

// Types
import type { TrendsAPIData } from './types'

// Libraries
import * as d3 from 'd3';

export class LineChart {

  data: {
    term: string,
    points: {date: Date, value: number}[]
  }[];
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
    this.svg.classed('hidden-canvas', !this.svg.classed('hidden-canvas'));
  }

  updateData(data: TrendsAPIData[]) {
    this.data = this.parseDates(data);
    console.log('D3 ->', this.data);
    this.updateElements();
  }

  parseDates(data: TrendsAPIData[]) {
    const parseTime = d3.timeParse('%Y-%m-%d');
    return data.map((d, i) => {
      return {
        term: d.term,
        points: d.points.map((p, i) => {
          return { date: parseTime(p.date), value: p.value }
        })
      }
    });
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
      this.xAxis = this.xAxis.tickFormat(d3.timeFormat('%b'));
    }

    this.yAxis = d3.axisLeft(y);

    this.line = d3.line()
      .curve(d3.curveBasis)
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d.value); });

    this.svg = parentContainer.append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .attr('class', 'chart-canvas');

    const chart = this.svg
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
      .attr('class', 'chart');

    this.x.domain( d3.extent(data, function(d, i) {
        return d3.extent(d.points, function(p) { return p.date }) })
    );
    this.y.domain([
      d3.min(data, function(d, i) { return d3.min(d.points, function(p) { return p.value; }); }),
      d3.max(data, function(d, i) { return d3.max(d.points, function(p) { return p.value; }); })
    ]);

    chart.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(this.xAxis);

    chart.append('g')
      .attr('class', 'y axis')
      .call(this.yAxis);

    const disease = chart.selectAll('.disease')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'disease');

    // const self = this;
    // disease.append('path')
    //   .attr('class', 'line')
    //   .attr('stroke', 'black')
    //   .attr('d', function(d) { return self.line(d.points) });

    // chart.append('path')
    //   .datum(data)
    //   .attr('class', 'line')
    //   .attr('stroke', 'black')
    //   .attr('d', this.line);
  }

  updateElements() {
    const { data } = this;
    let { svg, x, y, xAxis, yAxis, line  } = this;

    this.x.domain( d3.extent(data[0].points, function(p) { return p.date }) );
    this.y.domain([
      d3.min(data, function(d, i) { return d3.min(d.points, function(p) { return p.value; }); }),
      d3.max(data, function(d, i) { return d3.max(d.points, function(p) { return p.value; }); })
    ]);

    svg.select('g.y')
      .transition()
      .duration(1000)
      .call(yAxis);

    svg.select('g.x')
      .transition()
      .duration(1000)
      .call(xAxis);

    const chart = svg.select('.chart');

    if (chart.selectAll('.disease').size() === 0) {
      const diseases = chart.selectAll('.disease')
        .data(data)
        .enter()
        .append('g')
        .attr('class', 'disease');

      diseases.append('path')
        .attr('class', 'line')
        .attr('stroke', 'black')
        .attr('d', function(d) { console.log(d); return line(d.points) });
    } else {
      // diseases.selectAll('path.line')
      //   .datum(data)
      //   .transition()
      //   .duration(1000)
      //   .attr('d', line);
    }

    // disease.append('path')
    //   .attr('class', 'line')
    //   .attr('stroke', 'black')
    //   .attr('d', function(d) { return this.line(d.points) });

    // svg.selectAll('path.line')
    //   .datum(data)
    //   .transition()
    //   .duration(1000)
    //   .attr('d', line);
  }
}
