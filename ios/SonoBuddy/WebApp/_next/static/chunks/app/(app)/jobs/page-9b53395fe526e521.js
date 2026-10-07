(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[853],{2902:function(e,t,n){Promise.resolve().then(n.bind(n,1449))},1449:function(e,t,n){"use strict";n.r(t),n.d(t,{default:function(){return y}});var a=n(7437),s=n(2265),r=n(5912),l=n(4817),c=n(4697),i=n(8030);/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let o=(0,i.Z)("MapPin",[["path",{d:"M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z",key:"2oe9fu"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}]]);var d=n(933);/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let u=(0,i.Z)("DollarSign",[["line",{x1:"12",x2:"12",y1:"2",y2:"22",key:"7eqyqh"}],["path",{d:"M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",key:"1b0p4s"}]]);var x=n(7592),h=n(4453),p=n(9058),m=n(7740);function y(){let[e,t]=(0,s.useState)(null),[n,i]=(0,s.useState)(!1),[y,f]=(0,s.useState)(""),[k,g]=(0,s.useState)(""),{isPremium:b,paywallOpen:j,openPaywall:w,closePaywall:N,requestPurchase:v,requestRestore:Z,shareUnlocked:C,requestShare:M,requestDiscountPurchase:z,purchaseError:E,clearPurchaseError:S}=(0,p.gw)();return(0,s.useEffect)(()=>{let e=setTimeout(()=>g(y.trim()),500);return()=>clearTimeout(e)},[y]),(0,s.useEffect)(()=>{t(null),i(!1),fetch("".concat("https://www.sonobuddy.com","/api/jobs/").concat(k?"?location=".concat(encodeURIComponent(k)):"")).then(e=>e.ok?e.json():Promise.reject()).then(e=>t(Array.isArray(e)?e:[])).catch(()=>i(!0))},[k]),(0,a.jsxs)("div",{className:"min-h-screen bg-white pb-nav",children:[j&&(0,a.jsx)(m.Z,{onClose:N,onPurchase:v,onRestore:Z,shareUnlocked:C,onShare:M,onDiscountPurchase:z,purchaseError:E,onClearError:S}),(0,a.jsxs)("div",{className:"bg-white border-b border-slate-100 px-5 pt-14 pb-4 sticky top-0 z-10",children:[(0,a.jsxs)("div",{className:"flex items-center gap-2.5",children:[(0,a.jsx)(r.Z,{size:20,className:"text-sky-500",strokeWidth:2}),(0,a.jsx)("h1",{className:"text-[22px] font-black tracking-tight text-slate-900",children:"Jobs"})]}),(0,a.jsx)("p",{className:"text-[13px] text-slate-400 mt-0.5",children:"Sonographer openings, updated regularly"}),(0,a.jsxs)("div",{className:"relative mt-3",children:[(0,a.jsx)(l.Z,{size:15,className:"absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300"}),(0,a.jsx)("input",{type:"text",value:y,onChange:e=>f(e.target.value),placeholder:"Filter by city, state, or country",className:"w-full bg-slate-50 rounded-xl pl-10 pr-9 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-sky-200"}),y&&(0,a.jsx)("button",{onClick:()=>f(""),className:"absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 active:text-slate-500","aria-label":"Clear location filter",children:(0,a.jsx)(c.Z,{size:15})})]})]}),(0,a.jsxs)("div",{className:"px-4 pt-4 space-y-3",children:[n&&(0,a.jsx)("p",{className:"text-slate-400 text-sm text-center py-12",children:"Couldn't load jobs right now. Connect to the internet and try again."}),!n&&null===e&&(0,a.jsx)("div",{className:"space-y-3",children:[1,2,3].map(e=>(0,a.jsxs)("div",{className:"bg-white border border-slate-100 rounded-2xl px-4 py-4 space-y-2",children:[(0,a.jsx)("div",{className:"h-4 w-2/3 bg-slate-100 rounded animate-pulse"}),(0,a.jsx)("div",{className:"h-3 w-1/2 bg-slate-100 rounded animate-pulse"}),(0,a.jsx)("div",{className:"h-3 w-full bg-slate-100 rounded animate-pulse"})]},e))}),!n&&(null==e?void 0:e.length)===0&&(0,a.jsx)("p",{className:"text-slate-400 text-sm text-center py-12",children:k?'No openings found for "'.concat(k,'" — try a broader search.'):"No openings found right now — check back soon."}),null==e?void 0:e.map(e=>{let t=function(e,t,n){let a=e||null,s=t||null;if(!a&&!s)return null;let r=e=>"$".concat(Math.round(e/1e3),"k"),l=n?"Est. ":"";return a&&s&&a!==s?"".concat(l).concat(r(a),"–").concat(r(s),"/yr"):"".concat(l).concat(r(null!=a?a:s),"/yr")}(e.salaryMin,e.salaryMax,e.salaryEstimated);return(0,a.jsxs)("button",{onClick:()=>b?window.open(e.redirectUrl,"_blank","noopener,noreferrer"):w("jobs"),className:"w-full flex items-start justify-between gap-3 bg-white border border-slate-100 rounded-2xl px-4 py-4 shadow-sm active:bg-slate-50 transition-colors text-left",children:[(0,a.jsxs)("div",{className:"flex-1 min-w-0",children:[(0,a.jsx)("p",{className:"text-[15px] font-bold text-slate-900 leading-snug mb-1",children:e.title}),(0,a.jsx)("p",{className:"text-[13px] text-slate-500 mb-2 w-fit ".concat(b?"":"blur-[4px] select-none"),children:e.company}),(0,a.jsxs)("div",{className:"flex flex-wrap items-center gap-x-3 gap-y-1 mb-2",children:[e.location&&(0,a.jsxs)("span",{className:"inline-flex items-center gap-1 text-[11px] text-slate-400",children:[(0,a.jsx)(o,{size:11})," ",e.location]}),(0,a.jsxs)("span",{className:"inline-flex items-center gap-1 text-[11px] text-slate-400",children:[(0,a.jsx)(d.Z,{size:11})," ",function(e){let t=Math.floor((Date.now()-new Date(e).getTime())/864e5);if(t<=0)return"Today";if(1===t)return"1 day ago";if(t<30)return"".concat(t," days ago");let n=Math.floor(t/30);return 1===n?"1 month ago":"".concat(n," months ago")}(e.created)]}),t&&(0,a.jsxs)("span",{className:"inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold",children:[(0,a.jsx)(u,{size:11})," ",t]})]}),(0,a.jsx)("p",{className:"text-[13px] text-slate-500 leading-relaxed line-clamp-2",children:e.description})]}),b?(0,a.jsx)(x.Z,{size:16,className:"text-slate-300 shrink-0 mt-1"}):(0,a.jsx)(h.Z,{size:14,className:"text-slate-300 shrink-0 mt-1"})]},e.id)}),e&&e.length>0&&(0,a.jsx)("p",{className:"text-slate-300 text-[11px] text-center pt-2 pb-4",children:b?"Listings via Adzuna \xb7 Opens in your browser to apply":"Unlock SonoBuddy Premium to apply to any listing"})]})]})}},8030:function(e,t,n){"use strict";n.d(t,{Z:function(){return i}});var a=n(2265);/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),r=function(){for(var e=arguments.length,t=Array(e),n=0;n<e;n++)t[n]=arguments[n];return t.filter((e,t,n)=>!!e&&n.indexOf(e)===t).join(" ")};/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var l={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let c=(0,a.forwardRef)((e,t)=>{let{color:n="currentColor",size:s=24,strokeWidth:c=2,absoluteStrokeWidth:i,className:o="",children:d,iconNode:u,...x}=e;return(0,a.createElement)("svg",{ref:t,...l,width:s,height:s,stroke:n,strokeWidth:i?24*Number(c)/Number(s):c,className:r("lucide",o),...x},[...u.map(e=>{let[t,n]=e;return(0,a.createElement)(t,n)}),...Array.isArray(d)?d:[d]])}),i=(e,t)=>{let n=(0,a.forwardRef)((n,l)=>{let{className:i,...o}=n;return(0,a.createElement)(c,{ref:l,iconNode:t,className:r("lucide-".concat(s(e)),i),...o})});return n.displayName="".concat(e),n}},5912:function(e,t,n){"use strict";n.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,n(8030).Z)("Briefcase",[["path",{d:"M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16",key:"jecpp"}],["rect",{width:"20",height:"14",x:"2",y:"6",rx:"2",key:"i6l2r4"}]])},7592:function(e,t,n){"use strict";n.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,n(8030).Z)("ChevronRight",[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]])},3231:function(e,t,n){"use strict";n.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,n(8030).Z)("CircleCheck",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]])},933:function(e,t,n){"use strict";n.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,n(8030).Z)("Clock",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]])},4453:function(e,t,n){"use strict";n.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,n(8030).Z)("Lock",[["rect",{width:"18",height:"11",x:"3",y:"11",rx:"2",ry:"2",key:"1w4ew1"}],["path",{d:"M7 11V7a5 5 0 0 1 10 0v4",key:"fwvmzm"}]])},4622:function(e,t,n){"use strict";n.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,n(8030).Z)("PartyPopper",[["path",{d:"M5.8 11.3 2 22l10.7-3.79",key:"gwxi1d"}],["path",{d:"M4 3h.01",key:"1vcuye"}],["path",{d:"M22 8h.01",key:"1mrtc2"}],["path",{d:"M15 2h.01",key:"1cjtqr"}],["path",{d:"M22 20h.01",key:"1mrys2"}],["path",{d:"m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10",key:"hbicv8"}],["path",{d:"m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11c-.11.7-.72 1.22-1.43 1.22H17",key:"1i94pl"}],["path",{d:"m11 2 .33.82c.34.86-.2 1.82-1.11 1.98C9.52 4.9 9 5.52 9 6.23V7",key:"1cofks"}],["path",{d:"M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z",key:"4kbmks"}]])},4817:function(e,t,n){"use strict";n.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,n(8030).Z)("Search",[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["path",{d:"m21 21-4.3-4.3",key:"1qie3q"}]])},1510:function(e,t,n){"use strict";n.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,n(8030).Z)("Share2",[["circle",{cx:"18",cy:"5",r:"3",key:"gq8acd"}],["circle",{cx:"6",cy:"12",r:"3",key:"w7nqdw"}],["circle",{cx:"18",cy:"19",r:"3",key:"1xt0gg"}],["line",{x1:"8.59",x2:"15.42",y1:"13.51",y2:"17.49",key:"47mynk"}],["line",{x1:"15.41",x2:"8.59",y1:"6.51",y2:"10.49",key:"1n3mei"}]])},4697:function(e,t,n){"use strict";n.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,n(8030).Z)("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]])}},function(e){e.O(0,[740,971,23,744],function(){return e(e.s=2902)}),_N_E=e.O()}]);