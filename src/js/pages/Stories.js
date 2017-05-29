// @flow weak

// Libraries
import log from 'loglevel';
import '../../sass/stories.scss';

export class Stories {

  constructor(parentContainer: HTMLElement) {
    this.createElements(parentContainer);
  }

  createElements(parentContainer: HTMLElement) {

    const elementsContainer = document.createElement('div');
    elementsContainer.id = 'stories';
    elementsContainer.classList.add('page');
    parentContainer.appendChild(elementsContainer);

    const div = document.createElement('div');
    elementsContainer.appendChild(div);
    let p = document.createElement('p');
    p.innerHTML = 'Now go and explore!'
    div.appendChild(p);

  }
}
