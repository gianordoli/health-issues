// @flow weak

// Components
import { TrendsAPI } from './TrendsAPI';

// Types
import type { Term, Geo, Filter, TrendsAPIData } from './types'

// Data
import { terms, countries } from './util.js';

export class Ranking {

  data: {
    diseases: string,
    i: number
  }
  trendsAPI: TrendsAPI;

  constructor() {
    this.data = {
      diseases: '',
      i: 0
    }
    const self = this;
    this.trendsAPI = new TrendsAPI();
    this.trendsAPI.setup(function(){
      self.callTrendsApi();
    });

  }

  callTrendsApi(){
    const { i } = this.data;
    console.log(terms[i]);
    const self = this;

    self.trendsAPI.getTrends({terms: [terms[i]], geo: countries[0]}, function(val){
      console.log('From Google Trends: ', val);
      // const total = val.lines.map((l, i) => {
      //   return { term: diseases[i].name, points: l.points}
      // });
      // self.updateData({ total: total, seasonal: [], trend: [] });
      // self.parseDataToR();
    });
  }
}
