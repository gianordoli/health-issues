// @flow weak

// Libraries
import log from 'loglevel';

export class Home {

  constructor(parentContainer: HTMLElement) {
    this.createElements(parentContainer);
  }

  createElements(parentContainer: HTMLElement) {

    const elementsContainer = document.createElement('div');
    elementsContainer.id = 'home';
    elementsContainer.classList.add('page');
    parentContainer.appendChild(elementsContainer);
  }
}
