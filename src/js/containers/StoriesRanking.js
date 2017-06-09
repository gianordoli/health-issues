// @flow weak

import ranking from '../data/ranking';
import log from 'loglevel';

export default class StoriesRanking {

  constructor(parentContainer: HTMLElement) {
    this.createElements(parentContainer);
  }

  createElements(parentContainer: HTMLElement) {

    const elementsContainer = document.createElement('div');
    elementsContainer.classList.add('story-section');
    parentContainer.appendChild(elementsContainer);

    const pageBody = document.createElement('div');
    pageBody.classList.add('page-body');
    elementsContainer.appendChild(pageBody);

    const sectionHeader = document.createElement('div');
    sectionHeader.classList.add('section-header', 'container');
    pageBody.appendChild(sectionHeader);

    const title = document.createElement('h3');
    title.innerHTML = 'Top 10';
    sectionHeader.appendChild(title);

    const intro = document.createElement('p');
    intro.innerHTML = "These are the main health-related worries in the world, by year.";
    sectionHeader.appendChild(intro);

    const sectionBody = document.createElement('div');
    sectionBody.classList.add('section-body', 'container');
    pageBody.appendChild(sectionBody);

    const rankingTable = document.createElement('div');
    rankingTable.classList.add('ranking-table');
    sectionBody.appendChild(rankingTable);

    for(const r of ranking) {
      const rankingColumn = document.createElement('div');
      rankingColumn.classList.add('ranking-column');
      rankingTable.appendChild(rankingColumn);

      const header = document.createElement('div');
      header.classList.add('header');
      header.innerHTML = r.year;
      rankingColumn.appendChild(header);

      const list = document.createElement('ul');
      list.classList.add('body');
      rankingColumn.appendChild(list);

      for(const d of r.diseases) {
        const item = document.createElement('li');
        item.innerHTML = d;
        list.appendChild(item);
      }
    }
  }
}
