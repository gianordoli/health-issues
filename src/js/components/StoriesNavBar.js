// @flow weak

import StoriesLineCharts from '../containers/StoriesLineCharts';
import StoriesEpidemics from '../containers/StoriesEpidemics';
import log from 'loglevel';
// import '../../sass/stories.scss';

export default class StoriesNavBar {
  constructor(
    parentContainer: HTMLElement,
    cases: string[],
    self: StoriesLineCharts | StoriesEpidemics,
    onChange: (
      event: Event,
      self: StoriesLineCharts | StoriesEpidemics,
      elementsContainer: HTMLElement,
      currCase: number
    ) => void
  ) {
    this.createElements(parentContainer, cases, self, onChange);
  }

  createElements(
    parentContainer: HTMLElement,
    cases: string[],
    self: StoriesLineCharts | StoriesEpidemics,
    onChange: (
      event: Event,
      self: StoriesLineCharts | StoriesEpidemics,
      elementsContainer: HTMLElement,
      currCase: number
    ) => void
  ) {
    const elementsContainer = document.createElement('div');
    elementsContainer.classList.add('stories-nav-bar');
    parentContainer.appendChild(elementsContainer);

    const container = document.createElement('div');
    container.classList.add('container');
    elementsContainer.appendChild(container);

    for (let i = 0; i < cases.length; i++) {
      const tab = document.createElement('p');
      if (i === 0) tab.classList.add('active');
      tab.innerHTML = cases[i];
      const bindClick = evt => onChange(evt, self, elementsContainer, i);
      tab.addEventListener('click', bindClick);
      container.appendChild(tab);
    }
  }
}
