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