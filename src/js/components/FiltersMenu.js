// @flow weak

import type { Geo } from '../util/types';
import StoriesLineCharts from '../containers/StoriesLineCharts';
import Explore from '../pages/Explore';
import countries from '../data/countries';
import log from 'loglevel';
import selectize from 'selectize';
import $ from 'jquery';
import 'selectize/dist/css/selectize.css';

export default class FiltersMenu {

  // data: {
  //   geo: Geo,
  // };
  // geoSelect?: selectize;

  constructor(
    parentContainer: ?Element,
    terms: string[],
    geoList: string[],
    geoIso: string,
    self?: StoriesLineCharts,
    onGeoChange?: (geoIso: string, self: StoriesLineCharts) => void
  ) {

    let elementsContainer;
    if (parentContainer) elementsContainer = parentContainer.querySelector('.filters-menu');

    if (elementsContainer) {
      elementsContainer.innerHTML = '';
    } else {
      elementsContainer = document.createElement('div');
      elementsContainer.classList.add('filters-menu');
      if (parentContainer) parentContainer.appendChild(elementsContainer);
    }

    this.createElements(elementsContainer, terms, geoList, geoIso, self, onGeoChange);
    return elementsContainer;
  }

  createElements(
    elementsContainer: HTMLElement,
    terms: string[],
    geoList: string[],
    geoIso: string,
    self?: StoriesLineCharts,
    onGeoChange?: (geoIso: string, self: StoriesLineCharts) => void
  ) {
    let text = document.createElement('span');
    text.innerHTML = 'Search interest from 2004 to 2016 for ';
    elementsContainer.appendChild(text);

    const termsList = document.createElement('span');
    termsList.classList.add('terms-list');
    elementsContainer.appendChild(termsList);

    for (const t of terms) {
      const s = document.createElement('span');
      s.innerHTML = t;
      termsList.appendChild(s);
    }

    text = document.createElement('span');
    text.innerHTML = ' in ';
    elementsContainer.appendChild(text);

    if (geoList.length === 1) {
      const geo = document.createElement('span');
      geo.innerHTML = countries.find(c => c.iso === geoList[0]).name;
      elementsContainer.appendChild(geo);
    } else {
      const geoSelect = document.createElement('select');
      geoSelect.classList.add('geo-select');
      geoSelect.name = 'geo-select';
      const geoEntities = countries.filter(c => {
        if (geoList.indexOf(c.iso) > -1) return c
      });
      geoEntities.forEach((c, i) => {
        const option = document.createElement('option');
        option.setAttribute('value', c.iso);
        option.innerHTML = c.name;
        geoSelect.appendChild(option);
      });

      if (self && onGeoChange) {
        const bindHandleChange = value => onGeoChange(value, self);
        elementsContainer.appendChild(geoSelect);
        const geoSelectize = $(geoSelect).selectize({
          maxItems: 1,
          onChange: bindHandleChange
        });
        geoSelectize[0].selectize.setValue(geoIso, true);
      }
    }
  }
}