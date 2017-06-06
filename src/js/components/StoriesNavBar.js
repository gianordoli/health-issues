// @flow weak

import StoriesLineCharts from '../containers/StoriesLineCharts';
import log from 'loglevel';
// import '../../sass/stories.scss';

export default class StoriesNavBar {
  constructor(
    parentContainer: HTMLElement,
    cases: string[],
    self: StoriesLineCharts,
    onChange: (event: Event, self: StoriesLineCharts, currCase: number) => void
  ) {
    this.createElements(parentContainer, cases, self, onChange);
  }

  createElements(
    parentContainer: HTMLElement,
    cases: string[],
    self: StoriesLineCharts,
    onChange: (event: Event, self: StoriesLineCharts, currCase: number) => void
  ) {
    const elementsContainer = document.createElement('div');
    elementsContainer.classList.add('stories-nav-bar');
    parentContainer.appendChild(elementsContainer);

    for (let i = 0; i < cases.length; i++) {
      const tab = document.createElement('a');
      tab.innerHTML = cases[i];
      const bindClick = evt => onChange(evt, self, i);
      tab.addEventListener('click', bindClick);
      elementsContainer.appendChild(tab);
    }
  }
}
