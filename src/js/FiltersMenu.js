// @flow weak

import { countries } from './util.js';

export class FiltersMenu {

  constructor(parentContainer: HTMLElement, diseases: string[]){
    this.parentContainer = parentContainer;
    this.diseases = diseases;
  }

  render() {

    const { parentContainer, diseases } = this;

    const container = document.createElement('div');
    container.id = 'filters-menu'
    const elements = [];
      
    const text1 = document.createElement('span');
    text1.innerHTML = 'Search interest for ';
    elements.push(text1);

    const diseaseSelect = document.createElement('select');
    diseases.forEach((d, i) => {
      const option = document.createElement('option');
      option.setAttribute('value', d);
      option.innerHTML = d;
      diseaseSelect.appendChild(option);
    });
    elements.push(diseaseSelect);

    const text2 = document.createElement('span');
    text2.innerHTML = ' in the ';
    elements.push(text2);    

    const countrySelect = document.createElement('select');
    countries.forEach((c, i) => {
      const option = document.createElement('option');
      option.setAttribute('value', c.iso);
      option.innerHTML = c.name;
      countrySelect.appendChild(option);
    });
    elements.push(countrySelect);

    elements.forEach((el, i) => {
      container.appendChild(el);
    });

    parentContainer.appendChild(container);
  }
}