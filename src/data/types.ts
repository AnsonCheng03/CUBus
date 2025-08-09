export type ModificationDates = Record<string, string>;

export type ServerResponse = {
  bus?: any;
  translation?: { en: Record<string, string>; zh: Record<string, string> };
  station?: any;
  notice?: any;
  GPS?: any;
  WebsiteLinks?: any;
  timetable?: any;
  token?: any;
  modificationDates?: ModificationDates;
  [key: string]: any;
};

export type AppData = {
  WebsiteLinks?: any;
  bus?: any;
  GPS?: any;
  notice?: any;
  station?: any;
  ["timetable.json"]?: any;
  token?: any;
  [key: string]: any;
};
