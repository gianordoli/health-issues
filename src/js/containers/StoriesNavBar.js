// @flow weak

import StoriesContainer from './StoriesContainer';
import log from 'loglevel';
// import '../../sass/stories.scss';

export default class StoriesNavBar {
  constructor(
    parentContainer: HTMLElement,
    cases: string[],
    self: StoriesContainer,
    onChange: (self: StoriesContainer, currCase: number) => void
  ) {
    log.info('StoriesContainer');
    log.info(onChange);
    this.createElements(parentContainer, cases, self, onChange);
  }

  createElements(
    parentContainer: HTMLElement,
    cases: string[],
    self: StoriesContainer,
    onChange: (currCase: number) => void
  ) {
    const elementsContainer = document.createElement('div');
    elementsContainer.classList.add('stories-nav-bar');
    parentContainer.appendChild(elementsContainer);

    for (let i = 0; i < cases.length; i++) {
      const p = document.createElement('p');
      p.innerHTML = cases[i];
      const bindClick = evt => onChange(evt, self, i);
      p.addEventListener('click', bindClick);
      elementsContainer.appendChild(p);
    }
  }
}
