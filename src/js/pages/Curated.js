// @flow weak

// Libraries
import log from 'loglevel';
import '../../sass/curated.scss';

export class Curated {

  constructor(parentContainer: HTMLElement) {
    this.createElements(parentContainer);
  }

  createCuratedGroup(title: string, content: string[]) {
    const curatedGroup = document.createElement('div');
    curatedGroup.classList.add('curated-group');

    for(const c of content) {
      const curatedItem = document.createElement('button');
      curatedItem.classList.add('curated-item');
      curatedItem.innerHTML = c;
      curatedGroup.appendChild(curatedItem);
    }
    return curatedGroup;
  }

  createElements(parentContainer: HTMLElement) {

    const elementsContainer = document.createElement('div');
    elementsContainer.id = 'curated';
    elementsContainer.classList.add('page');
    parentContainer.appendChild(elementsContainer);

    const div = document.createElement('div');
    elementsContainer.appendChild(div);
    let p = document.createElement('p');
    p.innerHTML = 'Now go and explore!'
    div.appendChild(p);
    p = document.createElement('p');
    p.innerHTML = 'Start with one of the curated stories below! Or scroll to pick a topic!'
    div.appendChild(p);

    elementsContainer.appendChild(this.createCuratedGroup(
      'Seasonal', ['Winter', 'Summer', 'Holidays']));

    elementsContainer.appendChild(this.createCuratedGroup(
      'Outbreaks', ['Swine Flu', 'Measles', 'Ebola', 'Zyka']));

    elementsContainer.appendChild(this.createCuratedGroup(
      'Trending', ['Celiac Disease', 'Lupus', 'Milk Intolerance']));    

  }
}
