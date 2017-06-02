// @flow weak

import log from 'loglevel';
// import '../../sass/stories.scss';

export default class StoriesNavBar {

  constructor(parentContainer: HTMLElement, cases: string[], onChange: (currCase: string) => void) {
    log.info('StoriesContainer');
    this.createElements(parentContainer, cases, onChange);
  }

  createElements(parentContainer: HTMLElement, cases: string[], onChange: (currCase: string) => void) {

    const elementsContainer = document.createElement('div');
    parentContainer.appendChild(elementsContainer);

    for(const c of cases) {
      const p = document.createElement('p');
      p.innerHTML = c;
      elementsContainer.appendChild(p);
    }
  }
}
