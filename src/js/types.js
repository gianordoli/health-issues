// @flow

export type Disease = string;

export type Geo = {
  iso: string,
  name: string
}

export type Filter = {
  terms: Disease[],
  geo: Geo
}