// @flow weak

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

  createStoryBlock(id: number, content: string[]) {
    const div = document.createElement('div');
    // div.id = 'story-' + id;
    div.classList.add('slide');

    for(const c of content) {
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
      intro.innerHTML = "Is the search interest for a given disease increasing? Are there different times of the year when people search for a particular health issue? We can answer both questions using Google Trends, but we might need to split its data into 2 different formats first. Let’s take a look into the searches for the flu in the world to see how.";
      sectionHeader.appendChild(intro);

    const sectionBody = document.createElement('div');
    sectionBody.classList.add('section-body');
    elementsContainer.appendChild(sectionBody);

    const chartsContainer = document.createElement('div');
    chartsContainer.classList.add('charts-container');
    sectionBody.appendChild(chartsContainer);

    const chartItem = document.createElement('div');
    chartItem.classList.add('chart-item');
    chartsContainer.appendChild(chartItem);
    this.chart = new LineChart(chartItem, 'seasonal');
    // this.chart.updateData([dummyData.seasonal[0]]);
    const { chart } = this;

    const slidesContainer = document.createElement('div')
    slidesContainer.classList.add('slides-container');
    sectionBody.appendChild(slidesContainer);

    slidesContainer.appendChild(this.createStoryBlock(
      1, ['Most searches for health issues have a clear pattern throughout the year. Notice how the interest in sore throat goes up towards the end of the year in the US and down as it gets close to the Summer.']));

    slidesContainer.appendChild(this.createStoryBlock(
      2, ['However, this cycle is also affected by an overall trend — in this case, searches for sore throat have been increasing since 2004.']));

    slidesContainer.appendChild(this.createStoryBlock(
      3, ['If we were to split the seasonal cycle and the overall trend into 2, our charts would look like this.']));

    // sections.appendChild(this.createStoryBlock(
    //   4, ['Those yearly cycles can be combined to reveal what would be a “normal” pattern. That allows us to take a closer look into how seasonal factors — in this case, the weather — affect the interest for a given health issue.']));
    //
    // sections.appendChild(this.createStoryBlock(
    //   5, ['Because they’re influenced by the weather, those cycles will look almost like mirrored images from one hemisphere to another, since their seasons are the flipped.']));
    //
    // sections.appendChild(this.createStoryBlock(
    //   6, ['But factors other than the weather can affect the cycles too. Notice how the searches for stomach bug coincide with the end-of-year holidays seasons in both the US and Brazil.',
    //     'In Brazil, 2 minor spikes also happen around  Easter and the Sep 7th, the country’s Indepence Day.']));
    //
    // sections.appendChild(this.createStoryBlock(
    //   7, ['But the overall trend is important too. It allows us to see how outbreaks developed — or at least how people reacted to them. The zyka virus didn’t really spread in the US, but it became a major concern because in the early 2016 anyway.',
    //   'A concern bigger than it was in Brazil, where most of the cases developed.']));

    // const sections = d3.select('#intro.page > .sections-container > section');
    const containerD3 = d3.select('#intro.page .section-body');
    const graphD3 = containerD3.select('.charts-container');
    const slidesContainerD3 = containerD3.selectAll('.slides-container');
    log.info(slidesContainerD3);
    const slidesD3 = slidesContainerD3.selectAll('.slide');
    log.info(slidesD3);

    graphScroll()
    	.graph(graphD3)
    	.container(containerD3)
    	.sections(slidesD3)
    	.offset(window.innerHeight/2)
    	.on('active', function(i) {
    		chart.updateData([dummyData.seasonal[i]])
    	})
  }
}
