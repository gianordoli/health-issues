// @flow

export type Term = {
  entity: string,
  name: string
}

export type Geo = {
  iso: string,
  name: string
}

export type Filter = {
  terms: Term[],
  geo: Geo
}

export type TrendsAPIPoint = {
  date: string,
  value: number
}

export type TrendsAPIGraph = {
  term: string,
  points: TrendsAPIPoint[]
}

export type TrendsAPIQuery = {
  title: string,
  value: number
}

export type TrendsAPITopQueries = {
  item: TrendsAPIQuery[]
}