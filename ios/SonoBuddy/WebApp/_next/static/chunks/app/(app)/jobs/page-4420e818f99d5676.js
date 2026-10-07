(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[853],{2902:function(e,t,s){Promise.resolve().then(s.bind(s,1449))},1449:function(e,t,s){"use strict";s.r(t),s.d(t,{default:function(){return d}});var a=s(7437),n=s(2265),r=s(5912),l=s(8030);/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,l.Z)("MapPin",[["path",{d:"M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z",key:"2oe9fu"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}]]);var c=s(933);/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let o=(0,l.Z)("DollarSign",[["line",{x1:"12",x2:"12",y1:"2",y2:"22",key:"7eqyqh"}],["path",{d:"M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",key:"1b0p4s"}]]);function d(){let[e,t]=(0,n.useState)(null),[s,l]=(0,n.useState)(!1);return(0,n.useEffect)(()=>{fetch("".concat("https://www.sonobuddy.com","/api/jobs/")).then(e=>e.ok?e.json():Promise.reject()).then(e=>t(Array.isArray(e)?e:[])).catch(()=>l(!0))},[]),(0,a.jsxs)("div",{className:"min-h-screen bg-white pb-nav",children:[(0,a.jsxs)("div",{className:"bg-white border-b border-slate-100 px-5 pt-14 pb-4 sticky top-0 z-10",children:[(0,a.jsxs)("div",{className:"flex items-center gap-2.5",children:[(0,a.jsx)(r.Z,{size:20,className:"text-sky-500",strokeWidth:2}),(0,a.jsx)("h1",{className:"text-[22px] font-black tracking-tight text-slate-900",children:"Jobs"})]}),(0,a.jsx)("p",{className:"text-[13px] text-slate-400 mt-0.5",children:"Sonographer openings across the US, updated regularly"})]}),(0,a.jsxs)("div",{className:"px-4 pt-4 space-y-3",children:[s&&(0,a.jsx)("p",{className:"text-slate-400 text-sm text-center py-12",children:"Couldn't load jobs right now. Connect to the internet and try again."}),!s&&null===e&&(0,a.jsx)("div",{className:"space-y-3",children:[1,2,3].map(e=>(0,a.jsxs)("div",{className:"bg-white border border-slate-100 rounded-2xl px-4 py-4 space-y-2",children:[(0,a.jsx)("div",{className:"h-4 w-2/3 bg-slate-100 rounded animate-pulse"}),(0,a.jsx)("div",{className:"h-3 w-1/2 bg-slate-100 rounded animate-pulse"}),(0,a.jsx)("div",{className:"h-3 w-full bg-slate-100 rounded animate-pulse"})]},e))}),!s&&(null==e?void 0:e.length)===0&&(0,a.jsx)("p",{className:"text-slate-400 text-sm text-center py-12",children:"No openings found right now — check back soon."}),null==e?void 0:e.map(e=>{let t=function(e,t){if(!e&&!t)return null;let s=e=>"$".concat(Math.round(e/1e3),"k");return e&&t&&e!==t?"".concat(s(e),"–").concat(s(t),"/yr"):"".concat(s(null!=e?e:t),"/yr")}(e.salaryMin,e.salaryMax);return(0,a.jsxs)("a",{href:e.redirectUrl,target:"_blank",rel:"noopener noreferrer",className:"block bg-white border border-slate-100 rounded-2xl px-4 py-4 shadow-sm active:bg-slate-50 transition-colors",children:[(0,a.jsx)("p",{className:"text-[15px] font-bold text-slate-900 leading-snug mb-1",children:e.title}),(0,a.jsx)("p",{className:"text-[13px] text-slate-500 mb-2",children:e.company}),(0,a.jsxs)("div",{className:"flex flex-wrap items-center gap-x-3 gap-y-1 mb-2",children:[e.location&&(0,a.jsxs)("span",{className:"inline-flex items-center gap-1 text-[11px] text-slate-400",children:[(0,a.jsx)(i,{size:11})," ",e.location]}),(0,a.jsxs)("span",{className:"inline-flex items-center gap-1 text-[11px] text-slate-400",children:[(0,a.jsx)(c.Z,{size:11})," ",function(e){let t=Math.floor((Date.now()-new Date(e).getTime())/864e5);if(t<=0)return"Today";if(1===t)return"1 day ago";if(t<30)return"".concat(t," days ago");let s=Math.floor(t/30);return 1===s?"1 month ago":"".concat(s," months ago")}(e.created)]}),t&&(0,a.jsxs)("span",{className:"inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold",children:[(0,a.jsx)(o,{size:11})," ",t]})]}),(0,a.jsx)("p",{className:"text-[13px] text-slate-500 leading-relaxed line-clamp-2",children:e.description})]},e.id)}),e&&e.length>0&&(0,a.jsx)("p",{className:"text-slate-300 text-[11px] text-center pt-2 pb-4",children:"Listings via Adzuna \xb7 Opens in your browser to apply"})]})]})}},8030:function(e,t,s){"use strict";s.d(t,{Z:function(){return c}});var a=s(2265);/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),r=function(){for(var e=arguments.length,t=Array(e),s=0;s<e;s++)t[s]=arguments[s];return t.filter((e,t,s)=>!!e&&s.indexOf(e)===t).join(" ")};/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var l={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,a.forwardRef)((e,t)=>{let{color:s="currentColor",size:n=24,strokeWidth:i=2,absoluteStrokeWidth:c,className:o="",children:d,iconNode:x,...p}=e;return(0,a.createElement)("svg",{ref:t,...l,width:n,height:n,stroke:s,strokeWidth:c?24*Number(i)/Number(n):i,className:r("lucide",o),...p},[...x.map(e=>{let[t,s]=e;return(0,a.createElement)(t,s)}),...Array.isArray(d)?d:[d]])}),c=(e,t)=>{let s=(0,a.forwardRef)((s,l)=>{let{className:c,...o}=s;return(0,a.createElement)(i,{ref:l,iconNode:t,className:r("lucide-".concat(n(e)),c),...o})});return s.displayName="".concat(e),s}},5912:function(e,t,s){"use strict";s.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,s(8030).Z)("Briefcase",[["path",{d:"M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16",key:"jecpp"}],["rect",{width:"20",height:"14",x:"2",y:"6",rx:"2",key:"i6l2r4"}]])},933:function(e,t,s){"use strict";s.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,s(8030).Z)("Clock",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]])}},function(e){e.O(0,[971,23,744],function(){return e(e.s=2902)}),_N_E=e.O()}]);