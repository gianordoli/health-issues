// @flow weak

import ranking from '../data/ranking';
import log from 'loglevel';

export default class StoriesRanking {

  constructor(parentContainer: HTMLElement) {
    this.createElements(parentContainer);
  }

  itemClick(event: Event, className: string, parent: HTMLElement) {
    const allItems = parent.querySelectorAll('li');
    if (allItems) {
      allItems.forEach(function(i) {
        i.classList.remove('active');
      });
    }
    const items = parent.querySelectorAll(`.${className}`);
    if (items) {
      items.forEach(function(i) {
        i.classList.add('active');
      });
    }
  }

  itemMouseOut(event: Event, className: string, parent: HTMLElement) {
    const items = parent.querySelectorAll(`.${className}`);
    if (items) {
      items.forEach(function(i) {
        i.classList.remove('hover');
      });
    }
  }

  itemMouseOver(event: Event, className: string, parent: HTMLElement) {
    const items = parent.querySelectorAll(`.${className}`);
    if (items) {
      items.forEach(function(i) {
        i.classList.add('hover');
      });
    }
  }

  scroll(event: Event, element: HTMLElement, parent: HTMLElement, direction: string) {
    const { target } = event;
    const currPos = element.offsetLeft;

    if (parent) {
      const parentWidth = parent.offsetWidth;
      const parentScroll = parent.scrollWidth;
      let offset = 0;
      if (direction === 'forward') {
        offset = (parentScroll - parentWidth) < parentWidth ? parentScroll - parentWidth : parentWidth;
      } else if (direction === 'back') {
        offset = Math.abs(currPos) < parentWidth ? Math.abs(currPos) : parentWidth;
      }
      const nextPos = direction === 'forward' ? currPos - offset : currPos + offset;
      element.style.left = `${(nextPos)}px`;
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
    // btBack.disabled = true;
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
      rankingColumn.appendChild(header);

      let span = document.createElement('span');
      span.innerHTML = r.year;
      header.appendChild(span);

      const list = document.createElement('ul');
      list.classList.add('body');
      rankingColumn.appendChild(list);

      for(const d of r.diseases) {
        const item = document.createElement('li');
        const className = d.toLowerCase().replace('/', '-');
        item.classList.add(className);
        const bindClick = evt => this.itemClick(evt, className, rankingTable);
        const bindMouseOver = evt => this.itemMouseOver(evt, className, rankingTable);
        const bindMouseOut = evt => this.itemMouseOut(evt, className, rankingTable);
        item.addEventListener('click', bindClick);
        item.addEventListener('mouseover', bindMouseOver);
        item.addEventListener('mouseout', bindMouseOut);
        list.appendChild(item);

        span = document.createElement('span');
        span.innerHTML = d;
        item.appendChild(span);
      }
    }

    const btForward = document.createElement('button');
    btForward.classList.add('bt-arrow', 'forward');
    bindClick = evt => this.scroll(evt, rankingTable, rankingTableContainer, 'forward');
    btForward.addEventListener('click', bindClick);
    slideshow.appendChild(btForward);
  }
}
