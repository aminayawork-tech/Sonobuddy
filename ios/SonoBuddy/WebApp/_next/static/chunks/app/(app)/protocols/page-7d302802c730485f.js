(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[520],{821:function(e,t,r){Promise.resolve().then(r.bind(r,9965))},9965:function(e,t,r){"use strict";r.r(t),r.d(t,{default:function(){return p}});var s=r(7437),n=r(2265),o=r(6463),a=r(2919),c=r(933),l=r(5430),i=r(4453),d=r(4930),u=r(9058),h=r(7740),x=r(4839);let m=Object.entries(d.SL);function p(){let{isPremium:e,paywallOpen:t,openPaywall:r,closePaywall:p,requestPurchase:f,requestRestore:y,shareUnlocked:b,requestShare:k,requestDiscountPurchase:g,purchaseError:j,clearPurchaseError:N}=(0,u.gw)(),[v,w]=(0,n.useState)(""),[Z,C]=(0,n.useState)("all"),M=(0,o.useRouter)(),P=(0,n.useMemo)(()=>{let e=v?(0,d._l)(v):d.a_;return"all"!==Z&&(e=e.filter(e=>e.category===Z)),e},[v,Z]);return(0,s.jsxs)("div",{className:"min-h-screen pb-nav",children:[t&&(0,s.jsx)(h.Z,{onClose:p,onPurchase:f,onRestore:y,shareUnlocked:b,onShare:k,onDiscountPurchase:g,purchaseError:j,onClearError:N}),(0,s.jsxs)("div",{className:"sticky top-0 z-40 bg-sono-dark/95 backdrop-blur-sm border-b border-sono-border",children:[(0,s.jsxs)("div",{className:"px-4 pt-12 pb-3",children:[(0,s.jsxs)("h1",{className:"text-xl font-black tracking-tight text-slate-900 mb-3 flex items-center gap-2",children:[(0,s.jsx)(a.Z,{className:"w-5 h-5 text-sono-blue"})," Protocols"]}),(0,s.jsx)("input",{type:"text",value:v,onChange:e=>w(e.target.value),placeholder:'Search "carotid", "DVT", "thyroid"…',className:"w-full bg-sono-card border border-sono-border rounded-xl px-4 py-2.5 text-slate-900 placeholder-sono-muted focus:outline-none focus:border-sono-blue text-sm shadow-sm"})]}),(0,s.jsxs)("div",{className:"flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide",children:[(0,s.jsx)("button",{onClick:()=>C("all"),className:(0,x.Z)("shrink-0 text-xs px-3 py-1.5 rounded-full border font-medium transition-colors","all"===Z?"bg-sono-blue text-white border-sono-blue":"bg-transparent text-sono-muted border-sono-border"),children:"All"}),m.map(e=>{let[t,r]=e;return(0,s.jsx)("button",{onClick:()=>C(t),className:(0,x.Z)("shrink-0 text-xs px-3 py-1.5 rounded-full border font-medium transition-colors",Z===t?"bg-sono-blue text-white border-sono-blue":"bg-transparent text-sono-muted border-sono-border"),children:r},t)})]})]}),(0,s.jsx)("div",{className:"px-4 py-2",children:(0,s.jsxs)("p",{className:"text-xs text-sono-muted",children:[P.length," protocol",1!==P.length?"s":""]})}),(0,s.jsxs)("div",{className:"px-4 space-y-3 pb-4",children:[0===P.length&&(0,s.jsx)("div",{className:"text-center py-12",children:(0,s.jsxs)("p",{className:"text-sono-muted text-sm",children:["No protocols found for “",v,"”"]})}),P.map(t=>{let n=!e&&!u.iN.has(t.id);return(0,s.jsxs)("button",{onClick:()=>n?r("protocols"):M.push("/protocols/".concat(t.id)),className:"w-full bg-sono-card border border-sono-border rounded-2xl p-4 text-left hover:border-sono-blue/50 transition-all active:scale-[0.98] shadow-sm ".concat(n?"opacity-60":""),children:[(0,s.jsxs)("div",{className:"flex items-start justify-between gap-3",children:[(0,s.jsxs)("div",{className:"min-w-0 flex-1",children:[(0,s.jsx)("h3",{className:"font-semibold text-slate-900 text-[15px] mb-1",children:t.name}),(0,s.jsxs)("div",{className:"flex items-center gap-2 flex-wrap",children:[(0,s.jsx)("span",{className:(0,x.Z)("text-[11px] px-2 py-0.5 rounded border font-medium",d.xC[t.difficulty]),children:t.difficulty}),(0,s.jsxs)("span",{className:"text-[11px] text-sono-muted flex items-center gap-0.5",children:[(0,s.jsx)(c.Z,{className:"w-3 h-3"})," ",t.duration]}),(0,s.jsxs)("span",{className:"text-[11px] text-sono-muted flex items-center gap-0.5",children:[(0,s.jsx)(l.Z,{className:"w-3 h-3"})," ",t.probe.split(" ")[0]]})]}),(0,s.jsx)("p",{className:"text-[12px] text-slate-500 mt-2 line-clamp-2 leading-relaxed",children:t.indication})]}),n?(0,s.jsx)(i.Z,{className:"w-4 h-4 text-sono-muted shrink-0 mt-1"}):(0,s.jsx)("span",{className:"text-sono-muted shrink-0 mt-1",children:"›"})]}),(0,s.jsxs)("div",{className:"flex items-center gap-1 mt-3 text-[11px] text-sono-muted",children:[(0,s.jsxs)("span",{children:[t.steps.length," steps"]}),(0,s.jsx)("span",{children:"\xb7"}),(0,s.jsxs)("span",{children:[t.keyImages.length," key images"]}),(0,s.jsx)("span",{children:"\xb7"}),(0,s.jsxs)("span",{children:[t.reportChecklist.length," report items"]})]})]},t.id)})]})]})}},8030:function(e,t,r){"use strict";r.d(t,{Z:function(){return l}});var s=r(2265);/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),o=function(){for(var e=arguments.length,t=Array(e),r=0;r<e;r++)t[r]=arguments[r];return t.filter((e,t,r)=>!!e&&r.indexOf(e)===t).join(" ")};/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var a={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let c=(0,s.forwardRef)((e,t)=>{let{color:r="currentColor",size:n=24,strokeWidth:c=2,absoluteStrokeWidth:l,className:i="",children:d,iconNode:u,...h}=e;return(0,s.createElement)("svg",{ref:t,...a,width:n,height:n,stroke:r,strokeWidth:l?24*Number(c)/Number(n):c,className:o("lucide",i),...h},[...u.map(e=>{let[t,r]=e;return(0,s.createElement)(t,r)}),...Array.isArray(d)?d:[d]])}),l=(e,t)=>{let r=(0,s.forwardRef)((r,a)=>{let{className:l,...i}=r;return(0,s.createElement)(c,{ref:a,iconNode:t,className:o("lucide-".concat(n(e)),l),...i})});return r.displayName="".concat(e),r}},3231:function(e,t,r){"use strict";r.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,r(8030).Z)("CircleCheck",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]])},2919:function(e,t,r){"use strict";r.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,r(8030).Z)("ClipboardList",[["rect",{width:"8",height:"4",x:"8",y:"2",rx:"1",ry:"1",key:"tgr4d6"}],["path",{d:"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2",key:"116196"}],["path",{d:"M12 11h4",key:"1jrz19"}],["path",{d:"M12 16h4",key:"n85exb"}],["path",{d:"M8 11h.01",key:"1dfujw"}],["path",{d:"M8 16h.01",key:"18s6g9"}]])},933:function(e,t,r){"use strict";r.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,r(8030).Z)("Clock",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]])},4453:function(e,t,r){"use strict";r.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,r(8030).Z)("Lock",[["rect",{width:"18",height:"11",x:"3",y:"11",rx:"2",ry:"2",key:"1w4ew1"}],["path",{d:"M7 11V7a5 5 0 0 1 10 0v4",key:"fwvmzm"}]])},4622:function(e,t,r){"use strict";r.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,r(8030).Z)("PartyPopper",[["path",{d:"M5.8 11.3 2 22l10.7-3.79",key:"gwxi1d"}],["path",{d:"M4 3h.01",key:"1vcuye"}],["path",{d:"M22 8h.01",key:"1mrtc2"}],["path",{d:"M15 2h.01",key:"1cjtqr"}],["path",{d:"M22 20h.01",key:"1mrys2"}],["path",{d:"m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10",key:"hbicv8"}],["path",{d:"m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11c-.11.7-.72 1.22-1.43 1.22H17",key:"1i94pl"}],["path",{d:"m11 2 .33.82c.34.86-.2 1.82-1.11 1.98C9.52 4.9 9 5.52 9 6.23V7",key:"1cofks"}],["path",{d:"M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z",key:"4kbmks"}]])},1510:function(e,t,r){"use strict";r.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,r(8030).Z)("Share2",[["circle",{cx:"18",cy:"5",r:"3",key:"gq8acd"}],["circle",{cx:"6",cy:"12",r:"3",key:"w7nqdw"}],["circle",{cx:"18",cy:"19",r:"3",key:"1xt0gg"}],["line",{x1:"8.59",x2:"15.42",y1:"13.51",y2:"17.49",key:"47mynk"}],["line",{x1:"15.41",x2:"8.59",y1:"6.51",y2:"10.49",key:"1n3mei"}]])},4697:function(e,t,r){"use strict";r.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,r(8030).Z)("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]])},5430:function(e,t,r){"use strict";r.d(t,{Z:function(){return s}});/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,r(8030).Z)("Zap",[["path",{d:"M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",key:"1xq2db"}]])},6463:function(e,t,r){"use strict";var s=r(1169);r.o(s,"useParams")&&r.d(t,{useParams:function(){return s.useParams}}),r.o(s,"usePathname")&&r.d(t,{usePathname:function(){return s.usePathname}}),r.o(s,"useRouter")&&r.d(t,{useRouter:function(){return s.useRouter}}),r.o(s,"useSearchParams")&&r.d(t,{useSearchParams:function(){return s.useSearchParams}})},4839:function(e,t,r){"use strict";t.Z=function(){for(var e,t,r=0,s="",n=arguments.length;r<n;r++)(e=arguments[r])&&(t=function e(t){var r,s,n="";if("string"==typeof t||"number"==typeof t)n+=t;else if("object"==typeof t){if(Array.isArray(t)){var o=t.length;for(r=0;r<o;r++)t[r]&&(s=e(t[r]))&&(n&&(n+=" "),n+=s)}else for(s in t)t[s]&&(n&&(n+=" "),n+=s)}return n}(e))&&(s&&(s+=" "),s+=t);return s}}},function(e){e.O(0,[591,930,971,23,744],function(){return e(e.s=821)}),_N_E=e.O()}]);