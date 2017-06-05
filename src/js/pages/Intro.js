// @flow weak

import FiltersMenu from '../components/FiltersMenu';
import LineChart from '../visualizations/LineChart';
import * as d3 from 'd3';
import { graphScroll } from 'graph-scroll';
import log from 'loglevel';
import '../../sass/intro.scss';

import { dummyData } from '../scripts/data';

export default class Intro {
  chart: LineChart;

  constructor(parentContainer: HTMLElement) {
    this.createElements(parentContainer);
  }

  createStoryBlock(content: string[]) {
    const div = document.createElement('div');
    div.classList.add('slide');

    for (const c of content) {
      const p = document.createElement('p');
      p.innerHTML = c;
      div.appendChild(p);
    }
    return div;
  }

  createElements(parentContainer: HTMLElement) {
    const elementsContainer = document.createElement('div');
    elementsContainer.id = 'intro';
    elementsContainer.classList.add('page');
    parentContainer.appendChild(elementsContainer);

    const sectionHeader = document.createElement('div');
    sectionHeader.classList.add('section-header');
    elementsContainer.appendChild(sectionHeader);

    const title = document.createElement('h1');
    title.innerHTML = 'Trends and Seasonality';
    sectionHeader.appendChild(title);

    const intro = document.createElement('p');
    intro.innerHTML =
      'Is the search interest for a given disease increasing? Are there different times of the year when people search for a particular health issue? We can answer both questions using Google Trends, but we might need to split its data into 2 different formats first. Let’s take a look into the searches for the flu in the world to see how.';
    sectionHeader.appendChild(intro);

    const sectionBody = document.createElement('div');
    sectionBody.classList.add('section-body');
    elementsContainer.appendChild(sectionBody);

    const chartsContainer = document.createElement('div');
    chartsContainer.classList.add('charts-container');
    sectionBody.appendChild(chartsContainer);

    const filtersMenu = new FiltersMenu(
      chartsContainer,
      ['Influenza'],
      ['world'],
      'world',
    );

    const chartItem = document.createElement('div');
    chartItem.classList.add('chart-item');
    chartsContainer.appendChild(chartItem);
    this.chart = new LineChart(chartItem, 'seasonal');
    // this.chart.updateData([dummyData.seasonal[0]]);
    const { chart } = this;

    const slidesContainer = document.createElement('div');
    slidesContainer.classList.add('slides-container');
    sectionBody.appendChild(slidesContainer);

    slidesContainer.appendChild(
      this.createStoryBlock([
        'We can see some clear spikes in 2009, corresponding to the period of the Swine Flu epidemics. The rest of the graph has a lot of variation, that could be due to a seasonal cycle, but it’s hard to tell on this view.',
      ])
    );

    slidesContainer.appendChild(
      this.createStoryBlock([
        'Taking a closer look on the chart year by year, it looks like a general pattern repeats over and over. In general, the interest is low during Spring and Summer, and starts rising as we approach the Fall.',
        'Though the general curves are similar, the values vary a lot from one year to another — with 2009 being the obvious extreme of that.',
        'Can we deduce a “normal” cycle for the influenza based on this data? Let’s step back to our 12-year period chart.',
      ])
    );

    slidesContainer.appendChild(
      this.createStoryBlock([
        'First, let’s draw what seems to be the variation independent of the spikes. This gives us the <b>trend over time.</b>',
        'The counterpart of this data would be the variation independent of the trend:',
      ])
    );

    slidesContainer.appendChild(
      this.createStoryBlock([
        'Say we flatten out the trend line, make it our baseline, and plot the remaining values relative to it.',
        'Notice that we are still using a 100-point range scale, but now our values go from negative to positive because they are relative to our trend line, not to the actual search interest.',
        'Now, some of this data is made of variations that don’t correspond to a yearly repetition.',
      ])
    );

    slidesContainer.appendChild(
      this.createStoryBlock([
        'To take that out, we combine all years into a single cycle, leaving what doesn’t seem to represent a seasonal pattern out. This gives us <b>seasonal interest per year</b> for influenza.',
      ])
    );


    const containerD3 = d3.select('#intro.page .section-body');
    const graphD3 = containerD3.select('.charts-container');
    const slidesContainerD3 = containerD3.selectAll('.slides-container');
    const slidesD3 = slidesContainerD3.selectAll('.slide');

    graphScroll()
      .graph(graphD3)
      .container(containerD3)
      .sections(slidesD3)
      .offset(window.innerHeight / 2)
      .on('active', function(i) {
        chart.updateData([dummyData.seasonal[i]]);
      });
  }
}
