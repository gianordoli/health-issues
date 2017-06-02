// @flow weak

// Libraries
import log from 'loglevel';

export default class About {

  constructor(parentContainer: HTMLElement) {
    this.createElements(parentContainer);
  }

  createElements(parentContainer: HTMLElement) {

    const elementsContainer = document.createElement('div');
    elementsContainer.id = 'about';
    elementsContainer.classList.add('page');
    parentContainer.appendChild(elementsContainer);
  }
}
