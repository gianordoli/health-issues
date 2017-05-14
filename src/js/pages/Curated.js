// @flow weak

// Libraries
import log from 'loglevel';

export class Curated {

  constructor(parentContainer: HTMLElement) {
    this.createElements(parentContainer);
  }

  createElements(parentContainer: HTMLElement) {

    const elementsContainer = document.createElement('div');
    elementsContainer.id = 'curated';
    elementsContainer.classList.add('page');
    parentContainer.appendChild(elementsContainer);
  }
}
