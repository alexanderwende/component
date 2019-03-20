import{render as t}from"lit-html";export{SVGTemplateResult,TemplateResult,html,svg}from"lit-html";const e={fromAttribute:t=>{if(null===t||""===t)return null;try{return JSON.parse(t)}catch(e){return t}},toAttribute:t=>{switch(typeof t){case"boolean":return t?"":null;case"object":return null==t?t:JSON.stringify(t);case"undefined":case"string":return t;default:return t.toString()}}},r={fromAttribute:t=>null!==t,toAttribute:t=>t?"":null},s={fromAttribute:t=>null===t?null:t,toAttribute:t=>t},i={fromAttribute:t=>null===t?null:Number(t),toAttribute:t=>null==t?t:t.toString()},n={fromAttribute:t=>null===t||""===t?null:JSON.parse(t),toAttribute:t=>null==t?t:JSON.stringify(t)},o={fromAttribute:t=>null===t||""===t?null:JSON.parse(t),toAttribute:t=>null==t?t:JSON.stringify(t)},c={fromAttribute:t=>null===t||""===t?null:new Date(t),toAttribute:t=>null==t?t:t.toString()},l=/\s+([\S])/g,a=/[a-z]([A-Z])/g;function h(t){let e;if(t){for(t=t.trim();e=l.exec(t);)t=t.replace(e[0],"-"+e[1]),l.lastIndex=0;for(;e=a.exec(t);)t=t.replace(e[0],e[0][0]+"-"+e[1]),a.lastIndex=0}return t?t.toLowerCase():t}function u(t){return"function"==typeof t}function p(t){return"function"==typeof t}function f(t){return"function"==typeof t}function d(t){return"function"==typeof t}function y(t){return"string"==typeof t||"number"==typeof t||"symbol"==typeof t}function b(t){return h(t.replace(/\W+/g,"-").replace(/\-$/,""))}function g(t){return"string"==typeof t?h(t):`attr-${b(String(t))}`}function _(t,e,r){let s="";return s="string"==typeof t?h(t):b(String(t)),`${e?`${h(e)}-`:""}${s}${r?`-${h(r)}`:""}`}const m=(t,e)=>t!==e&&(t==t||e==e),w={attribute:!0,converter:e,reflectAttribute:!0,reflectProperty:!0,notify:!0,observe:m},P=t=>new Error(`Error executing attribute reflector ${String(t)}.`),S=t=>new Error(`Error executing property reflector ${String(t)}.`),v=t=>new Error(`Error executing property notifier ${String(t)}.`),A=t=>new Error(`Error executing property change detector ${String(t)}.`);class E extends HTMLElement{constructor(){super(),this._updateRequest=Promise.resolve(!0),this._changedProperties=new Map,this._reflectingProperties=new Map,this._notifyingProperties=new Map,this._listenerDeclarations=[],this._hasUpdated=!1,this._hasRequestedUpdate=!1,this._isReflecting=!1,this.renderRoot=this._createRenderRoot()}static get styleSheet(){if(this.styles.length&&!this.hasOwnProperty("_styleSheet"))try{this._styleSheet=new CSSStyleSheet,this._styleSheet.replaceSync(this.styles.join("\n"))}catch(t){}return this._styleSheet}static get styleElement(){return this.styles.length&&!this.hasOwnProperty("_styleElement")&&(this._styleElement=document.createElement("style"),this._styleElement.title=this.selector,this._styleElement.textContent=this.styles.join("\n")),this._styleElement}static get styles(){return[]}static get observedAttributes(){return[]}adoptedCallback(){this._notifyLifecycle("adopted")}connectedCallback(){this.requestUpdate(),this._notifyLifecycle("connected")}disconnectedCallback(){this._unlisten(),this._notifyLifecycle("disconnected"),this._hasUpdated=!1}attributeChangedCallback(t,e,r){this._isReflecting||e===r||this.reflectAttribute(t,e,r)}updateCallback(t,e){}notify(t,e){this.dispatchEvent(new CustomEvent(t,e))}watch(t){const e=new Map(this._changedProperties);t();for(const[t,r]of this._changedProperties){const s=!e.has(t),i=!s&&this.hasChanged(t,e.get(t),r);(s||i)&&this._notifyingProperties.set(t,r)}}requestUpdate(t,e,r){if(t){if(!this.hasChanged(t,e,r))return this._updateRequest;this._changedProperties.set(t,e),this._isReflecting||this._reflectingProperties.set(t,e)}return this._hasRequestedUpdate||this._enqueueUpdate(),this._updateRequest}render(...e){const r=this.constructor,s=r.template&&r.template(this,...e);s&&t(s,this.renderRoot,{eventContext:this})}update(t){this.render(),this._reflectingProperties.forEach((t,e)=>{this.reflectProperty(e,t,this[e])}),this._notifyingProperties.forEach((t,e)=>{this.notifyProperty(e,t,this[e])})}hasChanged(t,e,r){const s=this.getPropertyDeclaration(t);if(s&&d(s.observe))try{return s.observe.call(null,e,r)}catch(t){throw A(s.observe)}return!1}getPropertyDeclaration(t){return this.constructor.properties.get(t)}reflectAttribute(t,e,r){const s=this.constructor.attributes.get(t);if(!s)return void console.log(`observed attribute "${t}" not found... ignoring...`);const i=this.getPropertyDeclaration(s);if(i.reflectAttribute){if(this._isReflecting=!0,u(i.reflectAttribute))try{i.reflectAttribute.call(this,t,e,r)}catch(t){throw P(i.reflectAttribute)}else if(y(i.reflectAttribute))try{this[i.reflectAttribute](t,e,r)}catch(t){throw P(i.reflectAttribute)}else this._reflectAttribute(t,e,r);this._isReflecting=!1}}reflectProperty(t,e,r){const s=this.getPropertyDeclaration(t);if(s&&s.reflectProperty){if(this._isReflecting=!0,p(s.reflectProperty))try{s.reflectProperty.call(this,t,e,r)}catch(t){throw S(s.reflectProperty)}else if(y(s.reflectProperty))try{this[s.reflectProperty](t,e,r)}catch(t){throw S(s.reflectProperty)}else this._reflectProperty(t,e,r);this._isReflecting=!1}}notifyProperty(t,e,r){const s=this.getPropertyDeclaration(t);if(s&&s.notify)if(f(s.notify))try{s.notify.call(this,t,e,r)}catch(t){throw v(s.notify.toString())}else if(y(s.notify))try{this[s.notify](t,e,r)}catch(t){throw v(s.notify)}else this._notifyProperty(t,e,r)}_createRenderRoot(){return this.constructor.shadow?this.attachShadow({mode:"open"}):this}_adoptStyles(){const t=this.constructor,e=t.styleSheet,r=t.styleElement;t.styles;if(e)if(t.shadow)this.renderRoot.adoptedStyleSheets=[e];else{if(document.adoptedStyleSheets.includes(e))return;document.adoptedStyleSheets=[...document.adoptedStyleSheets,e]}else if(r){if(!t.shadow&&!!Array.from(document.styleSheets).find(e=>e.title===t.selector))return;const e=r.cloneNode(!0);t.shadow?this.renderRoot.appendChild(e):document.head.appendChild(e)}}_reflectAttribute(t,e,r){const s=this.constructor.attributes.get(t),i=this.getPropertyDeclaration(s).converter.fromAttribute(r);this[s]=i}_reflectProperty(t,e,r){const s=this.getPropertyDeclaration(t);if(!s.attribute)return;const i=s.attribute,n=s.converter.toAttribute(r);void 0!==n&&(null===n?this.removeAttribute(i):this.setAttribute(i,n))}_notifyProperty(t,e,r){const s=_(t,"","changed");this.dispatchEvent(new CustomEvent(s,{bubbles:!0,composed:!0,cancelable:!0,detail:{property:t,previous:e,current:r}}))}_notifyLifecycle(t,e){this.dispatchEvent(new CustomEvent(t,Object.assign({composed:!0},e?{detail:e}:{})))}_listen(){this.constructor.listeners.forEach((t,e)=>{const r={event:t.event,options:t.options,listener:this[e].bind(this),target:t.target?"function"==typeof t.target?t.target.call(this):t.target:this};r.target.addEventListener(r.event,r.listener,r.options),this._listenerDeclarations.push(r)})}_unlisten(){this._listenerDeclarations.forEach(t=>{t.target.removeEventListener(t.event,t.listener,t.options)})}async _enqueueUpdate(){let t;const e=this._updateRequest;this._hasRequestedUpdate=!0,this._updateRequest=new Promise(e=>t=e),await e;const r=this._scheduleUpdate();r&&await r,t(!this._hasRequestedUpdate)}_scheduleUpdate(){if(this._hasUpdated)return new Promise(t=>requestAnimationFrame(()=>{this._performUpdate(),t()}));this._performUpdate()}_performUpdate(){if(this.isConnected){const t=new Map(this._changedProperties);this.update(t),this._changedProperties=new Map,this._reflectingProperties=new Map,this._notifyingProperties=new Map,this._hasUpdated||(this._adoptStyles(),this._listen()),this.updateCallback(t,!this._hasUpdated),this._notifyLifecycle("update",{changes:t,firstUpdate:!this._hasUpdated}),this._hasUpdated=!0}this._hasRequestedUpdate=!1}}E.attributes=new Map,E.properties=new Map,E.listeners=new Map;const R={selector:"",shadow:!0,define:!0};function O(t={}){const e=Object.assign({},R,t);return t=>{const r=t;r.selector=e.selector||t.selector,r.shadow=e.shadow,r.template=e.template||t.template;const s=[...new Set(r.observedAttributes.reduce((t,e)=>t.concat(r.overridden&&r.overridden.has(e)?[]:e),[]).concat([...t.attributes.keys()]))];delete r.overridden;const i=[...new Set((r.hasOwnProperty("styles")?r.styles:[]).concat(e.styles||[]))];Reflect.defineProperty(r,"observedAttributes",{configurable:!0,enumerable:!1,get:()=>s}),Reflect.defineProperty(r,"styles",{configurable:!0,enumerable:!0,get:()=>i}),e.define&&window.customElements.define(r.selector,r)}}function U(t){return function(e,r,s){const i=e.constructor;!function(t){t.hasOwnProperty("listeners")||(t.listeners=new Map(t.listeners))}(i),null===t.event?i.listeners.delete(r):i.listeners.set(r,Object.assign({},t))}}function C(t={}){return function(e,r,s){const i=s||function(t,e){if(e in t)for(;t!==Object.prototype;){if(t.hasOwnProperty(e))return Object.getOwnPropertyDescriptor(t,e);t=Object.getPrototypeOf(t)}}(e,r),n="string"==typeof r?`__${r}`:Symbol(),o=i&&i.get||function(){return this[n]},c=i&&i.set||function(t){this[n]=t},l={configurable:!0,enumerable:!0,get(){return o.call(this)},set(t){const e=this[r];c.call(this,t),this.requestUpdate(r,e,o.call(this))}},a=e.constructor,h=Object.assign({},w,t);!0===h.attribute&&(h.attribute=g(r)),!0===h.observe&&(h.observe=w.observe),function(t){t.hasOwnProperty("properties")||(t.properties=new Map(t.properties));t.hasOwnProperty("attributes")||(t.attributes=new Map(t.attributes));t.hasOwnProperty("overridden")||(t.overridden=new Set)}(a);const u=a.properties.has(r)?a.properties.get(r).attribute:void 0;if(u&&(a.attributes.delete(u),a.overridden.add(u)),h.attribute&&a.attributes.set(h.attribute,r),a.properties.set(r,h),s)return l;Object.defineProperty(e,r,l)}}export{o as AttributeConverterArray,r as AttributeConverterBoolean,c as AttributeConverterDate,e as AttributeConverterDefault,i as AttributeConverterNumber,n as AttributeConverterObject,s as AttributeConverterString,E as Component,R as DEFAULT_COMPONENT_DECLARATION,m as DEFAULT_PROPERTY_CHANGE_DETECTOR,w as DEFAULT_PROPERTY_DECLARATION,O as component,g as createAttributeName,_ as createEventName,b as encodeAttribute,u as isAttributeReflector,d as isPropertyChangeDetector,y as isPropertyKey,f as isPropertyNotifier,p as isPropertyReflector,U as listener,C as property};
//# sourceMappingURL=index.esm.js.map
