System.register(["./index-legacy-BuvUHoHk.js","./__commonjsHelpers__-legacy-DUdKTVN3.js"],(function(e,t){"use strict";var n,r,s;return{setters:[e=>{n=e.i,r=e.c,s=e.a},null],execute:function(){
/*!
             * (C) Ionic http://ionicframework.com - MIT License
             */
e("createSwipeBackGesture",((e,t,c,i,o)=>{const a=e.ownerDocument.defaultView;let l=n(e);const u=e=>l?-e.deltaX:e.deltaX;return r({el:e,gestureName:"goback-swipe",gesturePriority:101,threshold:10,canStart:r=>(l=n(e),(e=>{const{startX:t}=e;return l?t>=a.innerWidth-50:t<=50})(r)&&t()),onStart:c,onMove:e=>{const t=u(e)/a.innerWidth;i(t)},onEnd:e=>{const t=u(e),n=a.innerWidth,r=t/n,c=(e=>l?-e.velocityX:e.velocityX)(e),i=c>=0&&(c>.2||t>n/2),d=(i?1-r:r)*n;let h=0;if(d>5){const e=d/Math.abs(c);h=Math.min(e,540)}o(i,r<=0?.01:s(0,r,.9999),h)}})}))}}}));
