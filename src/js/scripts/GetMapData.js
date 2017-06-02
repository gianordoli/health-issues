// @flow weak

import TrendsAPI from '../api/TrendsAPI';
import type { Term, Geo, Filter, TrendsAPIRegionsList } from '../util/types';
import { terms, countries } from '../util/data.js';
import log from 'loglevel';

export default class GetMapData {

  data: { month: string, regions: TrendsAPIRegionsList }[];
  trendsAPI: TrendsAPI;
  filters: Filter[];

  constructor(trendsAPI: TrendsAPI) {
    log.info('GetMapData');
    this.data = [];
    this.filters = [
      {
        terms: [terms.find(t => t.name === 'Zika virus')],
        startDate: '2015-04',
        endDate: '2017-01',
      }
    ]
    this.trendsAPI = trendsAPI;
    this.callTrendsApi(this.filters[0], this.filters[0].startDate);
  }

  nextMonth(date: string) {
    let year = Number(date.split('-')[0]);
    let month = Number(date.split('-')[1]) + 1;
    if (month > 12) {
      month = 1;
      year ++;
    }
    month = month < 10 ? `0${month}` : month;
    return `${year}-${month}`
  }

  callTrendsApi(filter: Filter, date: string){
    const self = this;
    const { terms } = filter;
    const startDate = date;
    const endDate = self.nextMonth(startDate);
    self.trendsAPI.getRegionsList({ terms, startDate, endDate }, function(val){
      console.log('From Google Trends: ', val);
      const { regions } = val;
      self.updateData({ date: startDate, regions });
      if (endDate !== filter.endDate) {
        setTimeout(function(){
          self.callTrendsApi(filter, endDate);
        }, 2000);
      }
    });
  }

  updateData(obj) {
    this.data.push(obj);
    log.info(this.data);
  }
}
