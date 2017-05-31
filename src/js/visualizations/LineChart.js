// @flow weak

import type { TrendsAPIGraph } from '../util/types';
import * as d3 from 'd3';

export class LineChart {

  data: {
    term: string,
    points: {date: Date, value: number}[]
  }[];
  type: string;
  width: number;
  height: number;
  margin: { top: number, left: number, bottom: number, right: number };
  svg: () => {};

  constructor(parentContainer: HTMLElement, type: string) {
    this.data = [];
    this.type = type;
    this.margin = {top: 4, right: 4, bottom: 32, left: 32};
    this.width  = parentContainer.offsetWidth - (this.margin.left + this.margin.right);
    this.height = parentContainer.offsetHeight - (this.margin.top + this.margin.bottom);
    this.createElements(parentContainer);
  }

  hide() {
    this.svg.classed('hidden-canvas', !this.svg.classed('hidden-canvas'));
  }

  updateData(data: TrendsAPIGraph[]) {
    this.data = this.parseDates(data);
    console.log('D3 ->', this.data);
    this.updateElements();
  }

  parseDates(data: TrendsAPIGraph[]) {
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

  createElements(parentContainer: HTMLElement) {
    const parentContainerSelection = d3.select(parentContainer);
    const { data, width, height, margin } = this;

    this.svg = parentContainerSelection.append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .attr('class', 'chart-canvas');

    const chart = this.svg
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
      .attr('class', 'chart');

    chart.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')');

    chart.append('g')
      .attr('class', 'y axis');

    chart.append('g')
      .attr('class', 'time-series');
  }

  updateElements() {
    const { data, width, height, margin, svg, type } = this;
    const transitionDuration = 500;

    const x = d3.scaleTime()
      .range([0, width])
      .domain( d3.extent(data[0].points, function(p) { return p.date }) );

    let yMin, yMax;

    if (type === 'seasonal') {
      yMin = d3.min(data, function(d, i) { return d3.min(d.points, function(p) { return p.value; }); });
      yMax = d3.max(data, function(d, i) { return d3.max(d.points, function(p) { return p.value; }); });
      const maxRange = Math.abs(yMin) > Math.abs(yMax) ? yMin : yMax;
      yMin = maxRange > 20 ? -maxRange : -20;
      yMax = maxRange > 20 ? maxRange : 20;
      // yMin = Math.abs(yMin) > Math.abs(yMax) ? yMin : -yMax;
      // yMax = Math.abs(yMin) > Math.abs(yMax) ? -yMin : yMax;

    } else {
      yMin = 0;
      yMax = 100;
    }

    const y = d3.scaleLinear()
      .range([height, 0])
      .domain([yMin, yMax]);

    const xAxis = d3.axisBottom(x)
      .tickSize(0)
      .tickPadding(12)
      .tickFormat(d3.timeFormat(type === 'seasonal' ? '%b' : '%Y'));

    const yAxis = d3.axisLeft(y)
      .tickSize(12);

    const line = d3.line()
      // .curve(d3.curveBasis)
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d.value); });

    const chart = svg.select('.chart');

    chart.select('g.y')
      .transition()
      .duration(transitionDuration)
      .call(yAxis);
    chart.select('g.y')
      .selectAll(".tick text")
      .each(function(d,i){
        d3.select(this).classed('hidden', i%2 !== 0 ? true : false);
      });

    chart.select('g.x')
      .transition()
      .duration(transitionDuration)
      .call(xAxis);

    if (type === 'seasonal') {
      chart.select('g.x path')
        .style('transform', 'translate(0, -'+height/2+'px)');
    } else {
      chart.select('g.x')
        .selectAll(".tick text")
        .each(function(d,i){
          d3.select(this).classed('hidden', i%2 !== 0 ? true : false);
        });
    }

    const timeSeries = chart.selectAll('.time-series');

    const diseases = timeSeries.selectAll('.disease').data(data);

    const diseasesEnterUpdate = diseases.enter()
      .append('path')
      .attr('class', 'line disease')
      .merge(diseases)
      .transition()
      .duration(transitionDuration)
      .attr('d', function(d) {
        return line(d.points)
      });

    const diseasesExit = diseases.exit().remove();
  }
}
