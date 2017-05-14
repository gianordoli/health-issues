// @flow weak

// Libraries
import log from 'loglevel';

export class Intro {

  constructor(parentContainer: HTMLElement) {
    this.createElements(parentContainer);
  }

  createElements(parentContainer: HTMLElement) {

    const elementsContainer = document.createElement('div');
    elementsContainer.id = 'intro';
    elementsContainer.classList.add('page');
    parentContainer.appendChild(elementsContainer);

    let p = document.createElement('p');
    p.innerHTML = '';
  }
}
