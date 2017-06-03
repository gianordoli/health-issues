// @flow weak

import StoriesContainer from './StoriesContainer';
import log from 'loglevel';
// import '../../sass/stories.scss';

export default class FiltersMenu {
  constructor(
    parentContainer: HTMLElement | Node,
    terms: string[],
    geoList: string[],
    self?: StoriesContainer,
    onGeoChange?: (event: Event, self: StoriesContainer, geo: string) => void
  ) {

    let elementsContainer = parentContainer.querySelector('.filters-menu');
    if (elementsContainer) {
      elementsContainer.innerHTML = '';
    } else {
      elementsContainer = document.createElement('div');
      elementsContainer.classList.add('filters-menu');
      parentContainer.appendChild(elementsContainer);  
    }

    this.createElements(elementsContainer, terms, geoList, self, onGeoChange);
    return elementsContainer;
  }

  createElements(
    elementsContainer: HTMLElement,
    terms: string[],
    geoList: string[],
    self?: StoriesContainer,
    onGeoChange?: (event: Event, self: StoriesContainer, geo: string) => void
  ) {
    let text = document.createElement('span');
    text.innerHTML = 'Search interest from 2004 to today for ';
    elementsContainer.appendChild(text);

    const termsList = document.createElement('span');
    termsList.classList.add('terms-list');
    elementsContainer.appendChild(termsList);

    for (const t of terms) {
      const s = document.createElement('span');
      s.innerHTML = t;
      termsList.appendChild(s);
    }

    text = document.createElement('span');
    text.innerHTML = ' in ';
    elementsContainer.appendChild(text);

    if (geoList.length === 1) {
      const geo = document.createElement('span');
      geo.innerHTML = geoList[0];
      elementsContainer.appendChild(geo);
    }
  }
}
