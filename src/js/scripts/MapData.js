// @flow weak

import { TrendsAPI } from '../api/TrendsAPI';
import type { Term, Geo, Filter, TrendsAPIRegionsList } from '../util/types';
import { terms, countries } from '../util/data.js';
import log from 'loglevel';

export default class MapData {

  data: { month: string, regions: TrendsAPIRegionsList }[];
  trendsAPI: TrendsAPI;
  term: Term;

  constructor(trendsAPI: TrendsAPI) {
    log.info('Ranking');
    this.data = [];
    this.trendsAPI = trendsAPI;
    this.term = terms.find(t => t.name === 'Zika virus');
    this.callTrendsApi();
  }

  callTrendsApi(){
    const self = this;
    const { term } = self;

    self.trendsAPI.getRegionsList({
      terms: [term],
      startDate: '2016-01',
      endDate: '2016-12',
    }, function(val){
      console.log('From Google Trends: ', val);
      log.info(`${term1.name} ${val.averages[0].value} x ${val.averages[1].value} ${term2.name}`);
      self.updateData(val.averages);
      if (averages.length < terms.length) {
      // if (index < 40) {
        setTimeout(function(){
          self.callTrendsApi(self);
        }, 2000);
      }
    });
  }

  updateData(obj) {
    // this.data.averages.push(obj);
    // log.info(this.data.averages);
  }

}
