// @flow weak

// Components
import { TrendsAPI } from '../api/TrendsAPI';

// Types
import type { Term, Geo, Filter, TrendsAPIData } from '../util/types'

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


    const titleContainer = document.createElement('div');
    elementsContainer.appendChild(titleContainer);
    
    const title = document.createElement('h1');
    title.innerHTML = 'Project Title';
    titleContainer.appendChild(title);

    const projectDescription = document.createElement('p');
    projectDescription.id = 'project-description'
    projectDescription.innerHTML = 'Here goes a project projectDescription. no longer than 2 sentences.'
    titleContainer.appendChild(projectDescription);


    const logosContainer = document.createElement('div');
    logosContainer.id = 'logos-container';
    elementsContainer.appendChild(logosContainer);
    
    const fuguLogo = document.createElement('p');
    fuguLogo.innerHTML = 'Fugu.Studio';
    logosContainer.appendChild(fuguLogo);
    
    const forP = document.createElement('p');
    forP.innerHTML = 'for';
    logosContainer.appendChild(forP);

    const newsLabLogo = document.createElement('p');
    newsLabLogo.innerHTML = 'Google News Lab';
    logosContainer.appendChild(newsLabLogo);
  }
}
