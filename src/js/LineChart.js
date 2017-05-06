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
  width: number;
  height: number;
  margin: { top: number, left: number, bottom: number, right: number };
  svg: () => {};

  constructor(parentContainer: HTMLElement, type: string) {
    this.data = [];
    this.type = type;
    this.margin = {top: 10, right: 0, bottom: 30, left: 30};
    this.width  = 800;
    this.height = 400;
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
    const { data, width, height, margin } = this;

    this.svg = parentContainer.append('svg')
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

    const x = d3.scaleTime()
      .range([0, width])
      .domain( d3.extent(data[0].points, function(p) { return p.date }) );

    const y = d3.scaleLinear()
      .range([height, 0])
      y.domain([
        d3.min(data, function(d, i) { return d3.min(d.points, function(p) { return p.value; }); }),
        d3.max(data, function(d, i) { return d3.max(d.points, function(p) { return p.value; }); })
      ]);

    let xAxis = d3.axisBottom(x);
    if (type == 'seasonal') {
      xAxis = xAxis.tickFormat(d3.timeFormat('%b'));
    }
    const yAxis = d3.axisLeft(y);

    const line = d3.line()
      // .curve(d3.curveBasis)
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d.value); });

    const chart = svg.select('.chart');

    chart.select('g.y')
      .transition()
      .duration(1000)
      .call(yAxis);

    chart.select('g.x')
      .transition()
      .duration(1000)
      .call(xAxis);

    const timeSeries = chart.selectAll('.time-series');

    const diseases = timeSeries.selectAll('.disease').data(data);

    const diseasesEnterUpdate = diseases.enter()
      .append('path')
      .attr('class', 'line disease')
      .merge(diseases)
      .transition()
      .duration(1000)
      .attr('d', function(d) {
        return line(d.points)
      });

    const diseasesExit = diseases.exit().remove();
  }
}
