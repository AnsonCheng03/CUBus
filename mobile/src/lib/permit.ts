import type { PermitFormValue } from '../types/mobile';

export const EMPTY_PERMIT: PermitFormValue = { name: '', sid: '', major: '', expiry: '' };

export const shuttleBusImage = require('../../../src/assets/schbus_d.png');
export const meetClassBusImage = require('../../../src/assets/schbus_l.png');
export const cuhkLogo = require('../../../src/assets/cuhk_logo.png');

export const permitBusRoutes = {
  meet_class_bus: {
    '5': ['#c2d6ea', '#29a1d8'],
    '6A': ['#7c8644', '#585823'],
    '6B': ['#4f88c1', '#3f438f'],
    '7': ['#c2c2c2', '#666666'],
  },
  shuttle_bus: {
    '1': ['#fff149', '#f3b53a'],
    '2': ['#fff149', '#f3b53a'],
    '3': ['#a4cc39', '#318761'],
    '4': ['#f1a63b', '#e75a24'],
    '8': ['#ffe3a8', '#ffc55a'],
    'N': ['#d1b4d5', '#7961a8'],
    'H': ['#896391', '#453087'],
  },
} as const;
