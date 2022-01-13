// constants

export enum category {
  APPLICATION = 'APPLICATION',
  ANDROID_WEAR = 'ANDROID_WEAR',
  ART_AND_DESIGN = 'ART_AND_DESIGN',
  AUTO_AND_VEHICLES = 'AUTO_AND_VEHICLES',
  BEAUTY = 'BEAUTY',
  BOOKS_AND_REFERENCE = 'BOOKS_AND_REFERENCE',
  BUSINESS = 'BUSINESS',
  COMICS = 'COMICS',
  COMMUNICATION = 'COMMUNICATION',
  DATING = 'DATING',
  EDUCATION = 'EDUCATION',
  ENTERTAINMENT = 'ENTERTAINMENT',
  EVENTS = 'EVENTS',
  FINANCE = 'FINANCE',
  FOOD_AND_DRINK = 'FOOD_AND_DRINK',
  HEALTH_AND_FITNESS = 'HEALTH_AND_FITNESS',
  HOUSE_AND_HOME = 'HOUSE_AND_HOME',
  LIBRARIES_AND_DEMO = 'LIBRARIES_AND_DEMO',
  LIFESTYLE = 'LIFESTYLE',
  MAPS_AND_NAVIGATION = 'MAPS_AND_NAVIGATION',
  MEDICAL = 'MEDICAL',
  MUSIC_AND_AUDIO = 'MUSIC_AND_AUDIO',
  NEWS_AND_MAGAZINES = 'NEWS_AND_MAGAZINES',
  PARENTING = 'PARENTING',
  PERSONALIZATION = 'PERSONALIZATION',
  PHOTOGRAPHY = 'PHOTOGRAPHY',
  PRODUCTIVITY = 'PRODUCTIVITY',
  SHOPPING = 'SHOPPING',
  SOCIAL = 'SOCIAL',
  SPORTS = 'SPORTS',
  TOOLS = 'TOOLS',
  TRAVEL_AND_LOCAL = 'TRAVEL_AND_LOCAL',
  VIDEO_PLAYERS = 'VIDEO_PLAYERS',
  WATCH_FACE = 'WATCH_FACE',
  WEATHER = 'WEATHER',
  GAME = 'GAME',
  GAME_ACTION = 'GAME_ACTION',
  GAME_ADVENTURE = 'GAME_ADVENTURE',
  GAME_ARCADE = 'GAME_ARCADE',
  GAME_BOARD = 'GAME_BOARD',
  GAME_CARD = 'GAME_CARD',
  GAME_CASINO = 'GAME_CASINO',
  GAME_CASUAL = 'GAME_CASUAL',
  GAME_EDUCATIONAL = 'GAME_EDUCATIONAL',
  GAME_MUSIC = 'GAME_MUSIC',
  GAME_PUZZLE = 'GAME_PUZZLE',
  GAME_RACING = 'GAME_RACING',
  GAME_ROLE_PLAYING = 'GAME_ROLE_PLAYING',
  GAME_SIMULATION = 'GAME_SIMULATION',
  GAME_SPORTS = 'GAME_SPORTS',
  GAME_STRATEGY = 'GAME_STRATEGY',
  GAME_TRIVIA = 'GAME_TRIVIA',
  GAME_WORD = 'GAME_WORD',
  FAMILY = 'FAMILY'
}

export enum collection {
  TOP_FREE = 'topselling_free',
  TOP_PAID = 'topselling_paid',
  NEW_FREE = 'topselling_new_free',
  NEW_PAID = 'topselling_new_paid',
  GROSSING = 'topgrossing',
  TRENDING = 'movers_shakers',
  TOP_FREE_GAMES = 'topselling_free_games',
  TOP_PAID_GAMES = 'topselling_paid_games',
  TOP_GROSSING_GAMES = 'topselling_grossing_games'
}

export enum sort {
  NEWEST = 2,
  RATING = 3,
  HELPFULNESS = 1
}

export enum age {
  FIVE_UNDER = 'AGE_RANGE1',
  SIX_EIGHT = 'AGE_RANGE2',
  NINE_UP = 'AGE_RANGE3'
}

export enum permission {
  COMMON = 0,
  OTHER = 1
}

// entity

export interface IAppItem {
  url: string
  appId: string
  title: string
  summary: string
  developer: string
  developerId: string
  icon: string
  score: number
  scoreText: string
  priceText: string
  free: boolean
}

export interface IAppItemFullDetail extends IAppItem {
  appId: string
  url: string
  title: string
  description: string
  descriptionHTML: string
  summary: string
  installs: string
  minInstalls: number
  maxInstalls: number
  score: number
  scoreText: string
  ratings: number
  reviews: number
  histogram: { '1': number, '2': number, '3': number, '4': number, '5': number }
  price: number
  free: boolean
  currency: string
  priceText: string
  available: boolean,
  offersIAP: boolean,
  IAPRange: string
  size: string
  androidVersion: string
  androidVersionText: string
  developer: string
  developerId: string
  developerInternalID: string
  developerEmail: string
  developerWebsite: string
  developerAddress: string
  genre: string
  genreId: string
  familyGenre: string
  familyGenreId: string
  icon: string
  headerImage: string
  screenshots: string[]
  video: string
  videoImage: string
  contentRating: string
  contentRatingDescription: string
  adSupported: boolean
  released: string
  updated: number
  version: string
  recentChanges: string
  comments: string[]
}

export interface IReviewsItem {
  id: string
  userName: string
  userImage: string
  date: string
  score: number
  scoreText: string
  url: string
  title: string
  text: string
  replyDate: string
  replyText: string
  version: string
  thumbsUp: number
  criterias: Array<{
    criteria: string
    rating: number
  }>
}

export interface IPermissionItem {
  permission: string
  type: string
}

// functions

interface IOptions {
  throttle?: number
}

// -- app()
export interface IFnAppOptions extends IOptions {
  appId: string
  lang?: string
  country?: string
}

export interface IFnApp {
  (options: IFnAppOptions): Promise<IAppItemFullDetail>
}

// -- list()
export interface IFnListOptions extends IOptions {
  collection?: collection
  category?: category
  age?: age
  num?: number
  lang?: string
  country?: string
  fullDetail?: boolean
}

export interface IFnList {
  (options?: IFnListOptions): Promise<IAppItem[]>
}

// -- search()
export interface IFnSearchOptions extends IOptions {
  term: string
  num?: number
  lang?: string
  country?: string
  fullDetail?: boolean
  price?: 'all' | 'free' | 'paid'
}

export interface IFnSearch {
  (options: IFnSearchOptions): Promise<IAppItem[]>
}

// -- developer()
export interface IFnDeveloperOptions extends IOptions {
  devId: string
  lang?: string
  country?: string
  num?: number
  fullDetail?: boolean
}

export interface IFnDeveloper {
  (options: IFnDeveloperOptions): Promise<IAppItem[]>
}

// -- suggest()
export interface IFnSuggestOptions extends IOptions {
  term: string
  lang?: string
  country?: string
}

export interface IFnSuggest {
  (options: IFnSuggestOptions): Promise<string[]>
}

// -- reviews()
export interface IFnReviewsOptions extends IOptions {
  appId: string
  lang?: string
  country?: string
  sort?: sort
  num?: number,
  paginate?: boolean
  nextPaginationToken?: string
}

export interface IFnReviews {
  (options: IFnReviewsOptions): Promise<IReviewsItem[]>
}

// -- similar
export interface IFnSimilarOptions extends IOptions {
  appId: string
  lang?: string
  country?: string
  fullDetail?: boolean
}

export interface IFnSimilar {
  (options: IFnReviewsOptions): Promise<IAppItem[]>
}

// -- permissions
export interface IFnPermissionsOptions extends IOptions {
  appId: string
  lang?: string
  short?: string
}

export interface IFnPermissions {
  (options: IFnPermissionsOptions): Promise<IPermissionItem[]>
}

// -- categories
export interface IFnCategoriesOptions extends IOptions {}

export interface IFnCategories {
  (options?: IFnCategoriesOptions): Promise<string[]>
}

// memoization

export interface IMemoizedResult {
  category: category,
  collection: collection,
  sort: sort,
  age: age,
  permission: permission,
  app: IFnApp
  list: IFnList
  search: IFnSearch
  developer: IFnDeveloper
  suggest: IFnSuggest
  reviews: IFnReviews
  similar: IFnSimilar
  permissions: IFnPermissions
  categories: IFnCategories
}

export interface IFnMemoized {
  (options?: any): IMemoizedResult
}

export const app: IFnApp
export const list: IFnList
export const search: IFnSearch
export const developer: IFnDeveloper
export const suggest: IFnSuggest
export const reviews: IFnReviews
export const similar: IFnSimilar
export const permissions: IFnPermissions
export const categories: IFnCategories
export const memoized: IFnMemoized
