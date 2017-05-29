// @flow

export type Term = {
  entity: string,
  name: string,
  alias: string | null,
}

export type Geo = {
  iso: string,
  name: string,
}

export type Filter = {
  terms: Term[],
  geo: Geo,
  startDate?: '',
  endDate?: '',
}

export type TrendsAPIPoint = {
  date: string,
  value: number,
}

export type TrendsAPIGraph = {
  term: string,
  points: TrendsAPIPoint[],
}

export type TrendsAPIQuery = {
  title: string,
  value: number,
}

export type TrendsAPITopQueries = {
  item: TrendsAPIQuery[],
}

export type TrendsAPITopic = {
  title: string,
  mid: string,
  value: number,
}

export type TrendsAPITopTopics = {
  item: TrendsAPITopic[],
}

export type TrendsAPIAverage = {
  term: string,
  value: number,
}

export type TrendsAPIGraphAverages = {
  averages: TrendsAPIAverage[],
}
