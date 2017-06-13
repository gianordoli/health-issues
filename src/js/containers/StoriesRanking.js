// @flow weak

import ranking from '../data/ranking';
import log from 'loglevel';

export default class StoriesRanking {

  constructor(parentContainer: HTMLElement) {
    this.createElements(parentContainer);
  }

  scroll(event: Event, target: HTMLElement, direction: string) {
    const currPos = target.offsetLeft;
    const parent = target.parentElement;

    if (parent) {
      const parentWidth = parent.offsetWidth;
      const parentScroll = parent.scrollWidth;
      let offset;
      if (direction === 'forward') {
        offset = (parentScroll - parentWidth) < parentWidth ? parentScroll - parentWidth : parentWidth;
      } else {
        offset = Math.abs(currPos) < parentWidth ? Math.abs(currPos) : parentWidth;
      }
      const nextPos = direction === 'forward' ? currPos - offset : currPos + offset;
      target.style.left = `${(nextPos)}px`;
    }
  }

  createElements(parentContainer: HTMLElement) {

    const elementsContainer = document.createElement('div');
    elementsContainer.classList.add('story-section', 'ranking');
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

    const slideshow = document.createElement('div');
    slideshow.classList.add('slideshow');
    sectionBody.appendChild(slideshow);

    const btBack = document.createElement('button');
    btBack.classList.add('bt-arrow', 'back');
    let bindClick = evt => this.scroll(evt, rankingTable, 'back');
    btBack.addEventListener('click', bindClick);
    slideshow.appendChild(btBack);

    const rankingTableContainer = document.createElement('div');
    rankingTableContainer.classList.add('ranking-table-container');
    slideshow.appendChild(rankingTableContainer);

    const rankingTable = document.createElement('div');
    rankingTable.classList.add('ranking-table');
    rankingTableContainer.appendChild(rankingTable);

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

    const btForward = document.createElement('button');
    btForward.classList.add('bt-arrow', 'forward');
    bindClick = evt => this.scroll(evt, rankingTable, 'forward');
    btForward.addEventListener('click', bindClick);
    slideshow.appendChild(btForward);
  }
}
