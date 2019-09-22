(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.tuscjs_ws = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.crypto=exports.history=exports.network=exports.db=exports.close=exports.chainId=exports.instance=exports.reset=exports.setAutoReconnect=exports.setRpcConnectionStatusCallback=void 0;var _ChainWebSocket=_interopRequireDefault(require("./ChainWebSocket")),_GrapheneApi=_interopRequireDefault(require("./GrapheneApi")),_ChainConfig=_interopRequireDefault(require("./ChainConfig"));function _interopRequireDefault(a){return a&&a.__esModule?a:{default:a}}var autoReconnect=!1,Apis=null,statusCb=null;// by default don't use reconnecting-websocket
const setRpcConnectionStatusCallback=a=>{statusCb=a,Apis&&Apis.setRpcConnectionStatusCallback(a)};exports.setRpcConnectionStatusCallback=setRpcConnectionStatusCallback;const setAutoReconnect=a=>{autoReconnect=a};exports.setAutoReconnect=setAutoReconnect;const reset=(a="ws://localhost:8090",b,c=4e3,d,e)=>close().then(()=>(Apis=newApis(),Apis.setRpcConnectionStatusCallback(statusCb),Apis&&b&&Apis.connect(a,c,d,e),Apis));exports.reset=reset;const instance=(a="ws://localhost:8090",b,c=4e3,d,e)=>(Apis||(Apis=newApis(),Apis.setRpcConnectionStatusCallback(statusCb)),Apis&&b&&Apis.connect(a,c,d),e&&(Apis.closeCb=e),Apis);exports.instance=instance;const chainId=()=>instance().chain_id;exports.chainId=chainId;const close=async()=>{Apis&&(await Apis.close(),Apis=null)};exports.close=close;const get=a=>new Proxy([],{get:(b,c)=>(...b)=>Apis[a].exec(c,[...b])}),db=get("_db");exports.db=db;const network=get("_net");exports.network=network;const history=get("_hist");exports.history=history;const crypto=get("_crypt");exports.crypto=crypto;const newApis=()=>({connect:(a,b,c={enableCrypto:!1})=>{Apis.url=a;if("undefined"!=typeof window&&window.location&&"https:"===window.location.protocol&&0>a.indexOf("wss://"))throw new Error("Secure domains require wss connection");Apis.ws_rpc&&(Apis.ws_rpc.statusCb=null,Apis.ws_rpc.keepAliveCb=null,Apis.ws_rpc.on_close=null,Apis.ws_rpc.on_reconnect=null),Apis.ws_rpc=new _ChainWebSocket.default(a,Apis.statusCb,b,autoReconnect,a=>{Apis._db&&!a&&Apis._db.exec("get_objects",[["2.1.0"]]).catch(()=>{})}),Apis.init_promise=Apis.ws_rpc.login("","").then(()=>{Apis._db=new _GrapheneApi.default(Apis.ws_rpc,"database"),Apis._net=new _GrapheneApi.default(Apis.ws_rpc,"network_broadcast"),Apis._hist=new _GrapheneApi.default(Apis.ws_rpc,"history"),c.enableCrypto&&(Apis._crypt=new _GrapheneApi.default(Apis.ws_rpc,"crypto"));var a=Apis._db.init().then(()=>Apis._db.exec("get_chain_id",[]).then(a=>(Apis.chain_id=a,_ChainConfig.default.setChainId(a))));Apis.ws_rpc.on_reconnect=()=>{Apis.ws_rpc&&Apis.ws_rpc.login("","").then(()=>{Apis._db.init().then(()=>{Apis.statusCb&&Apis.statusCb("reconnect")}),Apis._net.init(),Apis._hist.init(),c.enableCrypto&&Apis._crypt.init()})},Apis.ws_rpc.on_close=()=>{Apis.close().then(()=>{Apis.closeCb&&Apis.closeCb()})};let b=[a,Apis._net.init(),Apis._hist.init()];return c.enableCrypto&&b.push(Apis._crypt.init()),Promise.all(b)}).catch(b=>(console.error(a,"Failed to initialize with error",b&&b.message),Apis.close().then(()=>{throw b})))},close:async()=>{Apis.ws_rpc&&1===Apis.ws_rpc.ws.readyState&&(await Apis.ws_rpc.close()),Apis.ws_rpc=null},db_api:()=>Apis._db,network_api:()=>Apis._net,history_api:()=>Apis._hist,crypto_api:()=>Apis._crypt,setRpcConnectionStatusCallback:a=>Apis.statusCb=a});
},{"./ChainConfig":2,"./ChainWebSocket":3,"./GrapheneApi":5}],2:[function(require,module,exports){
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var config={core_asset:"CORE",address_prefix:"GPH",expire_in_secs:15,expire_in_secs_proposal:86400,review_in_secs_committee:86400,networks:{TUSC:{core_asset:"TUSC",address_prefix:"TUSC",chain_id:"1c924c962905ad379a369f83f0135ec128307d2d2508b17b400125e45b547c9a"},Muse:{core_asset:"MUSE",address_prefix:"MUSE",chain_id:"45ad2d3f9ef92a49b55c2227eb06123f613bb35dd08bd876f2aea21925a67a67"},Test:{core_asset:"TEST",address_prefix:"TEST",chain_id:"39f5e2ede1f8bc1a3a54a7914414e3779e33193f1f5693510e73cb7a87617447"},Obelisk:{core_asset:"GOV",address_prefix:"FEW",chain_id:"1cfde7c388b9e8ac06462d68aadbd966b58f88797637d9af805b4560b0e9661e"}},/** Set a few properties for known chain IDs. */setChainId:a=>{let b=Object.entries(config.networks).find(([b,c])=>{if(c.chain_id===a)return config.network_name=b,c.address_prefix&&(config.address_prefix=c.address_prefix),!0});return b?{network_name:b[0],network:b[1]}:void console.log("Unknown chain id (this may be a testnet)",a)},reset:()=>{config.core_asset="CORE",config.address_prefix="GPH",config.expire_in_secs=15,config.expire_in_secs_proposal=86400,console.log("Chain config reset")},setPrefix:(a="GPH")=>config.address_prefix=a},_default=config;exports.default=_default;
},{}],3:[function(require,module,exports){
"use strict";var _isomorphicWs=_interopRequireDefault(require("isomorphic-ws"));Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;function _interopRequireDefault(a){return a&&a.__esModule?a:{default:a}}function _defineProperty(a,b,c){return b in a?Object.defineProperty(a,b,{value:c,enumerable:!0,configurable:!0,writable:!0}):a[b]=c,a}const SOCKET_DEBUG=!1,MAX_SEND_LIFE=5,MAX_RECV_LIFE=2*MAX_SEND_LIFE;class ChainWebSocket{constructor(a,b,c=5e3,d=!0,e=null){_defineProperty(this,"connect",(a,b)=>new Promise((c,d)=>{this.current_reject=d,this.current_resolve=c;try{this.ws=new _isomorphicWs.default(a)}catch(b){// DISCONNECTED
this.ws={readyState:3,close:()=>{}},d(new Error("Invalid url",a," closed"))}this.ws.onopen=this.onOpen,this.ws.onerror=this.onError,this.ws.onmessage=this.onMessage,this.ws.onclose=this.onClose,this.connectionTimeout=setTimeout(()=>{this.current_reject&&(this.current_reject=null,this.close(),d(new Error("Connection attempt timed out after "+b/1e3+"s")))},b)})),_defineProperty(this,"onOpen",()=>{clearTimeout(this.connectionTimeout),this.statusCb&&this.statusCb("open"),this.on_reconnect&&this.on_reconnect(),this.keepalive_timer=setInterval(()=>(this.recv_life--,0==this.recv_life?(console.error(this.url+" connection is dead, terminating ws"),void this.close()):void(this.send_life--,0==this.send_life&&(this.keepAliveCb&&this.keepAliveCb(this.closed),this.send_life=MAX_SEND_LIFE))),5e3),this.current_reject=null,this.current_resolve()}),_defineProperty(this,"onError",a=>{this.keepalive_timer&&(clearInterval(this.keepalive_timer),this.keepalive_timer=void 0),clearTimeout(this.connectionTimeout),this.statusCb&&this.statusCb("error"),this.current_reject&&this.current_reject(a)}),_defineProperty(this,"onMessage",a=>{this.recv_life=MAX_RECV_LIFE,this.listener(JSON.parse(a.data))}),_defineProperty(this,"onClose",()=>{this.closed=!0,this.keepalive_timer&&(clearInterval(this.keepalive_timer),this.keepalive_timer=void 0);for(var a=this.responseCbId+1;a<=this.cbId;a+=1)this.cbs[a].reject(new Error("connection closed"));this.statusCb&&this.statusCb("closed"),this._closeCb&&this._closeCb(),this.on_close&&this.on_close()}),_defineProperty(this,"call",a=>{if(1!==this.ws.readyState)return Promise.reject(new Error("websocket state error:"+this.ws.readyState));let b=a[1];if(SOCKET_DEBUG&&console.log("[ChainWebSocket] >---- call ----->  \"id\":"+(this.cbId+1),JSON.stringify(a)),this.cbId+=1,["set_subscribe_callback","subscribe_to_market","broadcast_transaction_with_callback","set_pending_transaction_callback","set_block_applied_callback"].includes(b)&&(this.subs[this.cbId]={callback:a[2][0]},a[2][0]=this.cbId),["unsubscribe_from_market","unsubscribe_from_accounts"].includes(b)){if("function"!=typeof a[2][0])throw new Error("First parameter of unsub must be the original callback");let b=a[2].splice(0,1)[0];// Find the corresponding subscription
for(let a in this.subs)if(this.subs[a].callback===b){this.unsub[this.cbId]=a;break}}var c={method:"call",params:a};return c.id=this.cbId,this.send_life=MAX_SEND_LIFE,new Promise((a,b)=>{this.cbs[this.cbId]={time:new Date,resolve:a,reject:b},this.ws.send(JSON.stringify(c))})}),_defineProperty(this,"listener",a=>{SOCKET_DEBUG&&console.log("[ChainWebSocket] <---- reply ----<",JSON.stringify(a));let b=!1,c=null;"notice"===a.method&&(b=!0,a.id=a.params[0]),b?c=this.subs[a.id].callback:(c=this.cbs[a.id],this.responseCbId=a.id),c&&!b?(a.error?c.reject(a.error):c.resolve(a.result),delete this.cbs[a.id],this.unsub[a.id]&&(delete this.subs[this.unsub[a.id]],delete this.unsub[a.id])):c&&b?c(a.params[1]):console.log("Warning: unknown websocket response: ",a)}),_defineProperty(this,"login",(a,b)=>this.connect_promise.then(()=>this.call([1,"login",[a,b]]))),_defineProperty(this,"close",()=>new Promise(a=>(clearInterval(this.keepalive_timer),this.keepalive_timer=void 0,this._closeCb=()=>{a(),this._closeCb=null},this.ws?void(this.ws.terminate?this.ws.terminate():this.ws.close(),3===this.ws.readyState&&a()):(console.log("Websocket already cleared",this),a())))),this.url=a,this.statusCb=b,this.current_reject=null,this.on_reconnect=null,this.closed=!1,this.send_life=MAX_SEND_LIFE,this.recv_life=MAX_RECV_LIFE,this.keepAliveCb=e,this.cbId=0,this.responseCbId=0,this.cbs={},this.subs={},this.unsub={},this.connect_promise=this.connect(a,c)}}var _default=ChainWebSocket;exports.default=_default;
},{"isomorphic-ws":7}],4:[function(require,module,exports){
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var Apis=_interopRequireWildcard(require("./ApiInstances")),_ChainWebSocket=_interopRequireDefault(require("./ChainWebSocket"));function _interopRequireDefault(a){return a&&a.__esModule?a:{default:a}}function _getRequireWildcardCache(){if("function"!=typeof WeakMap)return null;var a=new WeakMap;return _getRequireWildcardCache=function(){return a},a}function _interopRequireWildcard(a){if(a&&a.__esModule)return a;var b=_getRequireWildcardCache();if(b&&b.has(a))return b.get(a);var c={};if(null!=a){var d=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var e in a)if(Object.prototype.hasOwnProperty.call(a,e)){var f=d?Object.getOwnPropertyDescriptor(a,e):null;f&&(f.get||f.set)?Object.defineProperty(c,e,f):c[e]=a[e]}}return c.default=a,b&&b.set(a,c),c}function _defineProperty(a,b,c){return b in a?Object.defineProperty(a,b,{value:c,enumerable:!0,configurable:!0,writable:!0}):a[b]=c,a}class Manager{constructor({url:b,urls:c,autoFallback:d,closeCb:e,optionalApis:f,urlChangeCallback:g}){_defineProperty(this,"setCloseCb",a=>{this.closeCb=a}),_defineProperty(this,"logFailure",(a,b,c)=>{let d=c&&c.message?c.message:"";console.error(a,"Failed to connect to "+b+(d?" Error: "+JSON.stringify(d):""))}),_defineProperty(this,"_onClose",()=>{this.isConnected=!1,this.closeCb&&(this.closeCb(),this.setCloseCb(null)),this.autoFallback&&this.connectWithFallback()}),_defineProperty(this,"connect",async(a=!0,b=this.url)=>{try{let c=await Apis.instance(b,a,void 0,this.optionalApis,this._onClose).init_promise;return this.url=b,this.isConnected=!0,c}catch(a){throw await Apis.close(),a}}),_defineProperty(this,"connectWithFallback",async(a=!0,b=this.url,c=0,d=null,e=null)=>{if(c>this.urls.length)return e(new Error("Tried "+c+" connections, none of which worked: "+JSON.stringify(this.urls.concat(this.url))));try{return await this.connect(a,b)}catch(b){return this.urlChangeCallback&&this.urlChangeCallback(this.urls[c]),this.connectWithFallback(a,this.urls[c],c+1,d,e)}}),_defineProperty(this,"checkConnections",async(a="",b="",c,d)=>{let e={},f=this.urls.concat(this.url),g=f.map(async c=>{/* Use default timeout and no reconnecting-websocket */let d=new _ChainWebSocket.default(c,()=>{},void 0,!1);e[c]=new Date().getTime();try{await d.login(a,b);let f={[c]:new Date().getTime()-e[c]};return await d.close(),f}catch(a){return c===this.url?this.url=this.urls[0]:this.urls=this.urls.filter(b=>b!==c),void(await d.close())}});try{let a=await Promise.all(g),b=a.filter(b=>!!b).sort((c,a)=>Object.values(c)[0]-Object.values(a)[0]).reduce((b,c)=>{let a=Object.keys(c)[0];return b[a]=c[a],b},{});return console.log("Checked ".concat(a.length," connections, ").concat(a.length-Object.keys(b).length," failed")),b}catch(e){return this.checkConnections(a,b,c,d)}}),this.url=b,this.urls=c.filter(c=>c!==b),this.autoFallback=d,this.closeCb=e,this.optionalApis=f||{},this.isConnected=!1,this.urlChangeCallback=g}static close(){return Apis.close()}}var _default=Manager;exports.default=_default;
},{"./ApiInstances":1,"./ChainWebSocket":3}],5:[function(require,module,exports){
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;class GrapheneApi{constructor(a,b){this.ws_rpc=a,this.api_name=b}init(){var a=this;return this.ws_rpc.call([1,this.api_name,[]]).then(b=>(a.api_id=b,a))}exec(a,b){return this.ws_rpc.call([this.api_id,a,b]).catch(a=>{// console.log("!!! GrapheneApi error: ", method, params, error, JSON.stringify(error));
throw a})}}var _default=GrapheneApi;exports.default=_default;
},{}],6:[function(require,module,exports){
"use strict";var Apis=_interopRequireWildcard(require("./ApiInstances"));Object.defineProperty(exports,"__esModule",{value:!0}),Object.defineProperty(exports,"Manager",{enumerable:!0,get:function(){return _ConnectionManager.default}}),Object.defineProperty(exports,"ChainConfig",{enumerable:!0,get:function(){return _ChainConfig.default}}),exports.Apis=void 0;exports.Apis=Apis;var _ConnectionManager=_interopRequireDefault(require("./ConnectionManager")),_ChainConfig=_interopRequireDefault(require("./ChainConfig"));function _interopRequireDefault(a){return a&&a.__esModule?a:{default:a}}function _getRequireWildcardCache(){if("function"!=typeof WeakMap)return null;var a=new WeakMap;return _getRequireWildcardCache=function(){return a},a}function _interopRequireWildcard(a){if(a&&a.__esModule)return a;var b=_getRequireWildcardCache();if(b&&b.has(a))return b.get(a);var c={};if(null!=a){var d=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var e in a)if(Object.prototype.hasOwnProperty.call(a,e)){var f=d?Object.getOwnPropertyDescriptor(a,e):null;f&&(f.get||f.set)?Object.defineProperty(c,e,f):c[e]=a[e]}}return c.default=a,b&&b.set(a,c),c}
},{"./ApiInstances":1,"./ChainConfig":2,"./ConnectionManager":4}],7:[function(require,module,exports){
(function (global){
// https://github.com/maxogden/websocket-stream/blob/48dc3ddf943e5ada668c31ccd94e9186f02fafbd/ws-fallback.js

var ws = null

if (typeof WebSocket !== 'undefined') {
  ws = WebSocket
} else if (typeof MozWebSocket !== 'undefined') {
  ws = MozWebSocket
} else if (typeof global !== 'undefined') {
  ws = global.WebSocket || global.MozWebSocket
} else if (typeof window !== 'undefined') {
  ws = window.WebSocket || window.MozWebSocket
} else if (typeof self !== 'undefined') {
  ws = self.WebSocket || self.MozWebSocket
}

module.exports = ws

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}]},{},[6])(6)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvQXBpSW5zdGFuY2VzLmpzIiwibGliL0NoYWluQ29uZmlnLmpzIiwibGliL0NoYWluV2ViU29ja2V0LmpzIiwibGliL0Nvbm5lY3Rpb25NYW5hZ2VyLmpzIiwibGliL0dyYXBoZW5lQXBpLmpzIiwibGliL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2lzb21vcnBoaWMtd3MvYnJvd3Nlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7O0FDREE7O0FDQUE7QUFDQTtBQUNBOztBQ0ZBOztBQ0FBO0FBQ0E7O0FDREE7OztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIlwidXNlIHN0cmljdFwiO09iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLGV4cG9ydHMuY3J5cHRvPWV4cG9ydHMuaGlzdG9yeT1leHBvcnRzLm5ldHdvcms9ZXhwb3J0cy5kYj1leHBvcnRzLmNsb3NlPWV4cG9ydHMuY2hhaW5JZD1leHBvcnRzLmluc3RhbmNlPWV4cG9ydHMucmVzZXQ9ZXhwb3J0cy5zZXRBdXRvUmVjb25uZWN0PWV4cG9ydHMuc2V0UnBjQ29ubmVjdGlvblN0YXR1c0NhbGxiYWNrPXZvaWQgMDt2YXIgX0NoYWluV2ViU29ja2V0PV9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vQ2hhaW5XZWJTb2NrZXRcIikpLF9HcmFwaGVuZUFwaT1faW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL0dyYXBoZW5lQXBpXCIpKSxfQ2hhaW5Db25maWc9X2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi9DaGFpbkNvbmZpZ1wiKSk7ZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChhKXtyZXR1cm4gYSYmYS5fX2VzTW9kdWxlP2E6e2RlZmF1bHQ6YX19dmFyIGF1dG9SZWNvbm5lY3Q9ITEsQXBpcz1udWxsLHN0YXR1c0NiPW51bGw7Ly8gYnkgZGVmYXVsdCBkb24ndCB1c2UgcmVjb25uZWN0aW5nLXdlYnNvY2tldFxuY29uc3Qgc2V0UnBjQ29ubmVjdGlvblN0YXR1c0NhbGxiYWNrPWE9PntzdGF0dXNDYj1hLEFwaXMmJkFwaXMuc2V0UnBjQ29ubmVjdGlvblN0YXR1c0NhbGxiYWNrKGEpfTtleHBvcnRzLnNldFJwY0Nvbm5lY3Rpb25TdGF0dXNDYWxsYmFjaz1zZXRScGNDb25uZWN0aW9uU3RhdHVzQ2FsbGJhY2s7Y29uc3Qgc2V0QXV0b1JlY29ubmVjdD1hPT57YXV0b1JlY29ubmVjdD1hfTtleHBvcnRzLnNldEF1dG9SZWNvbm5lY3Q9c2V0QXV0b1JlY29ubmVjdDtjb25zdCByZXNldD0oYT1cIndzOi8vbG9jYWxob3N0OjgwOTBcIixiLGM9NGUzLGQsZSk9PmNsb3NlKCkudGhlbigoKT0+KEFwaXM9bmV3QXBpcygpLEFwaXMuc2V0UnBjQ29ubmVjdGlvblN0YXR1c0NhbGxiYWNrKHN0YXR1c0NiKSxBcGlzJiZiJiZBcGlzLmNvbm5lY3QoYSxjLGQsZSksQXBpcykpO2V4cG9ydHMucmVzZXQ9cmVzZXQ7Y29uc3QgaW5zdGFuY2U9KGE9XCJ3czovL2xvY2FsaG9zdDo4MDkwXCIsYixjPTRlMyxkLGUpPT4oQXBpc3x8KEFwaXM9bmV3QXBpcygpLEFwaXMuc2V0UnBjQ29ubmVjdGlvblN0YXR1c0NhbGxiYWNrKHN0YXR1c0NiKSksQXBpcyYmYiYmQXBpcy5jb25uZWN0KGEsYyxkKSxlJiYoQXBpcy5jbG9zZUNiPWUpLEFwaXMpO2V4cG9ydHMuaW5zdGFuY2U9aW5zdGFuY2U7Y29uc3QgY2hhaW5JZD0oKT0+aW5zdGFuY2UoKS5jaGFpbl9pZDtleHBvcnRzLmNoYWluSWQ9Y2hhaW5JZDtjb25zdCBjbG9zZT1hc3luYygpPT57QXBpcyYmKGF3YWl0IEFwaXMuY2xvc2UoKSxBcGlzPW51bGwpfTtleHBvcnRzLmNsb3NlPWNsb3NlO2NvbnN0IGdldD1hPT5uZXcgUHJveHkoW10se2dldDooYixjKT0+KC4uLmIpPT5BcGlzW2FdLmV4ZWMoYyxbLi4uYl0pfSksZGI9Z2V0KFwiX2RiXCIpO2V4cG9ydHMuZGI9ZGI7Y29uc3QgbmV0d29yaz1nZXQoXCJfbmV0XCIpO2V4cG9ydHMubmV0d29yaz1uZXR3b3JrO2NvbnN0IGhpc3Rvcnk9Z2V0KFwiX2hpc3RcIik7ZXhwb3J0cy5oaXN0b3J5PWhpc3Rvcnk7Y29uc3QgY3J5cHRvPWdldChcIl9jcnlwdFwiKTtleHBvcnRzLmNyeXB0bz1jcnlwdG87Y29uc3QgbmV3QXBpcz0oKT0+KHtjb25uZWN0OihhLGIsYz17ZW5hYmxlQ3J5cHRvOiExfSk9PntBcGlzLnVybD1hO2lmKFwidW5kZWZpbmVkXCIhPXR5cGVvZiB3aW5kb3cmJndpbmRvdy5sb2NhdGlvbiYmXCJodHRwczpcIj09PXdpbmRvdy5sb2NhdGlvbi5wcm90b2NvbCYmMD5hLmluZGV4T2YoXCJ3c3M6Ly9cIikpdGhyb3cgbmV3IEVycm9yKFwiU2VjdXJlIGRvbWFpbnMgcmVxdWlyZSB3c3MgY29ubmVjdGlvblwiKTtBcGlzLndzX3JwYyYmKEFwaXMud3NfcnBjLnN0YXR1c0NiPW51bGwsQXBpcy53c19ycGMua2VlcEFsaXZlQ2I9bnVsbCxBcGlzLndzX3JwYy5vbl9jbG9zZT1udWxsLEFwaXMud3NfcnBjLm9uX3JlY29ubmVjdD1udWxsKSxBcGlzLndzX3JwYz1uZXcgX0NoYWluV2ViU29ja2V0LmRlZmF1bHQoYSxBcGlzLnN0YXR1c0NiLGIsYXV0b1JlY29ubmVjdCxhPT57QXBpcy5fZGImJiFhJiZBcGlzLl9kYi5leGVjKFwiZ2V0X29iamVjdHNcIixbW1wiMi4xLjBcIl1dKS5jYXRjaCgoKT0+e30pfSksQXBpcy5pbml0X3Byb21pc2U9QXBpcy53c19ycGMubG9naW4oXCJcIixcIlwiKS50aGVuKCgpPT57QXBpcy5fZGI9bmV3IF9HcmFwaGVuZUFwaS5kZWZhdWx0KEFwaXMud3NfcnBjLFwiZGF0YWJhc2VcIiksQXBpcy5fbmV0PW5ldyBfR3JhcGhlbmVBcGkuZGVmYXVsdChBcGlzLndzX3JwYyxcIm5ldHdvcmtfYnJvYWRjYXN0XCIpLEFwaXMuX2hpc3Q9bmV3IF9HcmFwaGVuZUFwaS5kZWZhdWx0KEFwaXMud3NfcnBjLFwiaGlzdG9yeVwiKSxjLmVuYWJsZUNyeXB0byYmKEFwaXMuX2NyeXB0PW5ldyBfR3JhcGhlbmVBcGkuZGVmYXVsdChBcGlzLndzX3JwYyxcImNyeXB0b1wiKSk7dmFyIGE9QXBpcy5fZGIuaW5pdCgpLnRoZW4oKCk9PkFwaXMuX2RiLmV4ZWMoXCJnZXRfY2hhaW5faWRcIixbXSkudGhlbihhPT4oQXBpcy5jaGFpbl9pZD1hLF9DaGFpbkNvbmZpZy5kZWZhdWx0LnNldENoYWluSWQoYSkpKSk7QXBpcy53c19ycGMub25fcmVjb25uZWN0PSgpPT57QXBpcy53c19ycGMmJkFwaXMud3NfcnBjLmxvZ2luKFwiXCIsXCJcIikudGhlbigoKT0+e0FwaXMuX2RiLmluaXQoKS50aGVuKCgpPT57QXBpcy5zdGF0dXNDYiYmQXBpcy5zdGF0dXNDYihcInJlY29ubmVjdFwiKX0pLEFwaXMuX25ldC5pbml0KCksQXBpcy5faGlzdC5pbml0KCksYy5lbmFibGVDcnlwdG8mJkFwaXMuX2NyeXB0LmluaXQoKX0pfSxBcGlzLndzX3JwYy5vbl9jbG9zZT0oKT0+e0FwaXMuY2xvc2UoKS50aGVuKCgpPT57QXBpcy5jbG9zZUNiJiZBcGlzLmNsb3NlQ2IoKX0pfTtsZXQgYj1bYSxBcGlzLl9uZXQuaW5pdCgpLEFwaXMuX2hpc3QuaW5pdCgpXTtyZXR1cm4gYy5lbmFibGVDcnlwdG8mJmIucHVzaChBcGlzLl9jcnlwdC5pbml0KCkpLFByb21pc2UuYWxsKGIpfSkuY2F0Y2goYj0+KGNvbnNvbGUuZXJyb3IoYSxcIkZhaWxlZCB0byBpbml0aWFsaXplIHdpdGggZXJyb3JcIixiJiZiLm1lc3NhZ2UpLEFwaXMuY2xvc2UoKS50aGVuKCgpPT57dGhyb3cgYn0pKSl9LGNsb3NlOmFzeW5jKCk9PntBcGlzLndzX3JwYyYmMT09PUFwaXMud3NfcnBjLndzLnJlYWR5U3RhdGUmJihhd2FpdCBBcGlzLndzX3JwYy5jbG9zZSgpKSxBcGlzLndzX3JwYz1udWxsfSxkYl9hcGk6KCk9PkFwaXMuX2RiLG5ldHdvcmtfYXBpOigpPT5BcGlzLl9uZXQsaGlzdG9yeV9hcGk6KCk9PkFwaXMuX2hpc3QsY3J5cHRvX2FwaTooKT0+QXBpcy5fY3J5cHQsc2V0UnBjQ29ubmVjdGlvblN0YXR1c0NhbGxiYWNrOmE9PkFwaXMuc3RhdHVzQ2I9YX0pOyIsIlwidXNlIHN0cmljdFwiO09iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLGV4cG9ydHMuZGVmYXVsdD12b2lkIDA7dmFyIGNvbmZpZz17Y29yZV9hc3NldDpcIkNPUkVcIixhZGRyZXNzX3ByZWZpeDpcIkdQSFwiLGV4cGlyZV9pbl9zZWNzOjE1LGV4cGlyZV9pbl9zZWNzX3Byb3Bvc2FsOjg2NDAwLHJldmlld19pbl9zZWNzX2NvbW1pdHRlZTo4NjQwMCxuZXR3b3Jrczp7VFVTQzp7Y29yZV9hc3NldDpcIlRVU0NcIixhZGRyZXNzX3ByZWZpeDpcIlRVU0NcIixjaGFpbl9pZDpcIjFjOTI0Yzk2MjkwNWFkMzc5YTM2OWY4M2YwMTM1ZWMxMjgzMDdkMmQyNTA4YjE3YjQwMDEyNWU0NWI1NDdjOWFcIn0sTXVzZTp7Y29yZV9hc3NldDpcIk1VU0VcIixhZGRyZXNzX3ByZWZpeDpcIk1VU0VcIixjaGFpbl9pZDpcIjQ1YWQyZDNmOWVmOTJhNDliNTVjMjIyN2ViMDYxMjNmNjEzYmIzNWRkMDhiZDg3NmYyYWVhMjE5MjVhNjdhNjdcIn0sVGVzdDp7Y29yZV9hc3NldDpcIlRFU1RcIixhZGRyZXNzX3ByZWZpeDpcIlRFU1RcIixjaGFpbl9pZDpcIjM5ZjVlMmVkZTFmOGJjMWEzYTU0YTc5MTQ0MTRlMzc3OWUzMzE5M2YxZjU2OTM1MTBlNzNjYjdhODc2MTc0NDdcIn0sT2JlbGlzazp7Y29yZV9hc3NldDpcIkdPVlwiLGFkZHJlc3NfcHJlZml4OlwiRkVXXCIsY2hhaW5faWQ6XCIxY2ZkZTdjMzg4YjllOGFjMDY0NjJkNjhhYWRiZDk2NmI1OGY4ODc5NzYzN2Q5YWY4MDViNDU2MGIwZTk2NjFlXCJ9fSwvKiogU2V0IGEgZmV3IHByb3BlcnRpZXMgZm9yIGtub3duIGNoYWluIElEcy4gKi9zZXRDaGFpbklkOmE9PntsZXQgYj1PYmplY3QuZW50cmllcyhjb25maWcubmV0d29ya3MpLmZpbmQoKFtiLGNdKT0+e2lmKGMuY2hhaW5faWQ9PT1hKXJldHVybiBjb25maWcubmV0d29ya19uYW1lPWIsYy5hZGRyZXNzX3ByZWZpeCYmKGNvbmZpZy5hZGRyZXNzX3ByZWZpeD1jLmFkZHJlc3NfcHJlZml4KSwhMH0pO3JldHVybiBiP3tuZXR3b3JrX25hbWU6YlswXSxuZXR3b3JrOmJbMV19OnZvaWQgY29uc29sZS5sb2coXCJVbmtub3duIGNoYWluIGlkICh0aGlzIG1heSBiZSBhIHRlc3RuZXQpXCIsYSl9LHJlc2V0OigpPT57Y29uZmlnLmNvcmVfYXNzZXQ9XCJDT1JFXCIsY29uZmlnLmFkZHJlc3NfcHJlZml4PVwiR1BIXCIsY29uZmlnLmV4cGlyZV9pbl9zZWNzPTE1LGNvbmZpZy5leHBpcmVfaW5fc2Vjc19wcm9wb3NhbD04NjQwMCxjb25zb2xlLmxvZyhcIkNoYWluIGNvbmZpZyByZXNldFwiKX0sc2V0UHJlZml4OihhPVwiR1BIXCIpPT5jb25maWcuYWRkcmVzc19wcmVmaXg9YX0sX2RlZmF1bHQ9Y29uZmlnO2V4cG9ydHMuZGVmYXVsdD1fZGVmYXVsdDsiLCJcInVzZSBzdHJpY3RcIjt2YXIgX2lzb21vcnBoaWNXcz1faW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJpc29tb3JwaGljLXdzXCIpKTtPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cyxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxleHBvcnRzLmRlZmF1bHQ9dm9pZCAwO2Z1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoYSl7cmV0dXJuIGEmJmEuX19lc01vZHVsZT9hOntkZWZhdWx0OmF9fWZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eShhLGIsYyl7cmV0dXJuIGIgaW4gYT9PYmplY3QuZGVmaW5lUHJvcGVydHkoYSxiLHt2YWx1ZTpjLGVudW1lcmFibGU6ITAsY29uZmlndXJhYmxlOiEwLHdyaXRhYmxlOiEwfSk6YVtiXT1jLGF9Y29uc3QgU09DS0VUX0RFQlVHPSExLE1BWF9TRU5EX0xJRkU9NSxNQVhfUkVDVl9MSUZFPTIqTUFYX1NFTkRfTElGRTtjbGFzcyBDaGFpbldlYlNvY2tldHtjb25zdHJ1Y3RvcihhLGIsYz01ZTMsZD0hMCxlPW51bGwpe19kZWZpbmVQcm9wZXJ0eSh0aGlzLFwiY29ubmVjdFwiLChhLGIpPT5uZXcgUHJvbWlzZSgoYyxkKT0+e3RoaXMuY3VycmVudF9yZWplY3Q9ZCx0aGlzLmN1cnJlbnRfcmVzb2x2ZT1jO3RyeXt0aGlzLndzPW5ldyBfaXNvbW9ycGhpY1dzLmRlZmF1bHQoYSl9Y2F0Y2goYil7Ly8gRElTQ09OTkVDVEVEXG50aGlzLndzPXtyZWFkeVN0YXRlOjMsY2xvc2U6KCk9Pnt9fSxkKG5ldyBFcnJvcihcIkludmFsaWQgdXJsXCIsYSxcIiBjbG9zZWRcIikpfXRoaXMud3Mub25vcGVuPXRoaXMub25PcGVuLHRoaXMud3Mub25lcnJvcj10aGlzLm9uRXJyb3IsdGhpcy53cy5vbm1lc3NhZ2U9dGhpcy5vbk1lc3NhZ2UsdGhpcy53cy5vbmNsb3NlPXRoaXMub25DbG9zZSx0aGlzLmNvbm5lY3Rpb25UaW1lb3V0PXNldFRpbWVvdXQoKCk9Pnt0aGlzLmN1cnJlbnRfcmVqZWN0JiYodGhpcy5jdXJyZW50X3JlamVjdD1udWxsLHRoaXMuY2xvc2UoKSxkKG5ldyBFcnJvcihcIkNvbm5lY3Rpb24gYXR0ZW1wdCB0aW1lZCBvdXQgYWZ0ZXIgXCIrYi8xZTMrXCJzXCIpKSl9LGIpfSkpLF9kZWZpbmVQcm9wZXJ0eSh0aGlzLFwib25PcGVuXCIsKCk9PntjbGVhclRpbWVvdXQodGhpcy5jb25uZWN0aW9uVGltZW91dCksdGhpcy5zdGF0dXNDYiYmdGhpcy5zdGF0dXNDYihcIm9wZW5cIiksdGhpcy5vbl9yZWNvbm5lY3QmJnRoaXMub25fcmVjb25uZWN0KCksdGhpcy5rZWVwYWxpdmVfdGltZXI9c2V0SW50ZXJ2YWwoKCk9Pih0aGlzLnJlY3ZfbGlmZS0tLDA9PXRoaXMucmVjdl9saWZlPyhjb25zb2xlLmVycm9yKHRoaXMudXJsK1wiIGNvbm5lY3Rpb24gaXMgZGVhZCwgdGVybWluYXRpbmcgd3NcIiksdm9pZCB0aGlzLmNsb3NlKCkpOnZvaWQodGhpcy5zZW5kX2xpZmUtLSwwPT10aGlzLnNlbmRfbGlmZSYmKHRoaXMua2VlcEFsaXZlQ2ImJnRoaXMua2VlcEFsaXZlQ2IodGhpcy5jbG9zZWQpLHRoaXMuc2VuZF9saWZlPU1BWF9TRU5EX0xJRkUpKSksNWUzKSx0aGlzLmN1cnJlbnRfcmVqZWN0PW51bGwsdGhpcy5jdXJyZW50X3Jlc29sdmUoKX0pLF9kZWZpbmVQcm9wZXJ0eSh0aGlzLFwib25FcnJvclwiLGE9Pnt0aGlzLmtlZXBhbGl2ZV90aW1lciYmKGNsZWFySW50ZXJ2YWwodGhpcy5rZWVwYWxpdmVfdGltZXIpLHRoaXMua2VlcGFsaXZlX3RpbWVyPXZvaWQgMCksY2xlYXJUaW1lb3V0KHRoaXMuY29ubmVjdGlvblRpbWVvdXQpLHRoaXMuc3RhdHVzQ2ImJnRoaXMuc3RhdHVzQ2IoXCJlcnJvclwiKSx0aGlzLmN1cnJlbnRfcmVqZWN0JiZ0aGlzLmN1cnJlbnRfcmVqZWN0KGEpfSksX2RlZmluZVByb3BlcnR5KHRoaXMsXCJvbk1lc3NhZ2VcIixhPT57dGhpcy5yZWN2X2xpZmU9TUFYX1JFQ1ZfTElGRSx0aGlzLmxpc3RlbmVyKEpTT04ucGFyc2UoYS5kYXRhKSl9KSxfZGVmaW5lUHJvcGVydHkodGhpcyxcIm9uQ2xvc2VcIiwoKT0+e3RoaXMuY2xvc2VkPSEwLHRoaXMua2VlcGFsaXZlX3RpbWVyJiYoY2xlYXJJbnRlcnZhbCh0aGlzLmtlZXBhbGl2ZV90aW1lciksdGhpcy5rZWVwYWxpdmVfdGltZXI9dm9pZCAwKTtmb3IodmFyIGE9dGhpcy5yZXNwb25zZUNiSWQrMTthPD10aGlzLmNiSWQ7YSs9MSl0aGlzLmNic1thXS5yZWplY3QobmV3IEVycm9yKFwiY29ubmVjdGlvbiBjbG9zZWRcIikpO3RoaXMuc3RhdHVzQ2ImJnRoaXMuc3RhdHVzQ2IoXCJjbG9zZWRcIiksdGhpcy5fY2xvc2VDYiYmdGhpcy5fY2xvc2VDYigpLHRoaXMub25fY2xvc2UmJnRoaXMub25fY2xvc2UoKX0pLF9kZWZpbmVQcm9wZXJ0eSh0aGlzLFwiY2FsbFwiLGE9PntpZigxIT09dGhpcy53cy5yZWFkeVN0YXRlKXJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoXCJ3ZWJzb2NrZXQgc3RhdGUgZXJyb3I6XCIrdGhpcy53cy5yZWFkeVN0YXRlKSk7bGV0IGI9YVsxXTtpZihTT0NLRVRfREVCVUcmJmNvbnNvbGUubG9nKFwiW0NoYWluV2ViU29ja2V0XSA+LS0tLSBjYWxsIC0tLS0tPiAgXFxcImlkXFxcIjpcIisodGhpcy5jYklkKzEpLEpTT04uc3RyaW5naWZ5KGEpKSx0aGlzLmNiSWQrPTEsW1wic2V0X3N1YnNjcmliZV9jYWxsYmFja1wiLFwic3Vic2NyaWJlX3RvX21hcmtldFwiLFwiYnJvYWRjYXN0X3RyYW5zYWN0aW9uX3dpdGhfY2FsbGJhY2tcIixcInNldF9wZW5kaW5nX3RyYW5zYWN0aW9uX2NhbGxiYWNrXCIsXCJzZXRfYmxvY2tfYXBwbGllZF9jYWxsYmFja1wiXS5pbmNsdWRlcyhiKSYmKHRoaXMuc3Vic1t0aGlzLmNiSWRdPXtjYWxsYmFjazphWzJdWzBdfSxhWzJdWzBdPXRoaXMuY2JJZCksW1widW5zdWJzY3JpYmVfZnJvbV9tYXJrZXRcIixcInVuc3Vic2NyaWJlX2Zyb21fYWNjb3VudHNcIl0uaW5jbHVkZXMoYikpe2lmKFwiZnVuY3Rpb25cIiE9dHlwZW9mIGFbMl1bMF0pdGhyb3cgbmV3IEVycm9yKFwiRmlyc3QgcGFyYW1ldGVyIG9mIHVuc3ViIG11c3QgYmUgdGhlIG9yaWdpbmFsIGNhbGxiYWNrXCIpO2xldCBiPWFbMl0uc3BsaWNlKDAsMSlbMF07Ly8gRmluZCB0aGUgY29ycmVzcG9uZGluZyBzdWJzY3JpcHRpb25cbmZvcihsZXQgYSBpbiB0aGlzLnN1YnMpaWYodGhpcy5zdWJzW2FdLmNhbGxiYWNrPT09Yil7dGhpcy51bnN1Ylt0aGlzLmNiSWRdPWE7YnJlYWt9fXZhciBjPXttZXRob2Q6XCJjYWxsXCIscGFyYW1zOmF9O3JldHVybiBjLmlkPXRoaXMuY2JJZCx0aGlzLnNlbmRfbGlmZT1NQVhfU0VORF9MSUZFLG5ldyBQcm9taXNlKChhLGIpPT57dGhpcy5jYnNbdGhpcy5jYklkXT17dGltZTpuZXcgRGF0ZSxyZXNvbHZlOmEscmVqZWN0OmJ9LHRoaXMud3Muc2VuZChKU09OLnN0cmluZ2lmeShjKSl9KX0pLF9kZWZpbmVQcm9wZXJ0eSh0aGlzLFwibGlzdGVuZXJcIixhPT57U09DS0VUX0RFQlVHJiZjb25zb2xlLmxvZyhcIltDaGFpbldlYlNvY2tldF0gPC0tLS0gcmVwbHkgLS0tLTxcIixKU09OLnN0cmluZ2lmeShhKSk7bGV0IGI9ITEsYz1udWxsO1wibm90aWNlXCI9PT1hLm1ldGhvZCYmKGI9ITAsYS5pZD1hLnBhcmFtc1swXSksYj9jPXRoaXMuc3Vic1thLmlkXS5jYWxsYmFjazooYz10aGlzLmNic1thLmlkXSx0aGlzLnJlc3BvbnNlQ2JJZD1hLmlkKSxjJiYhYj8oYS5lcnJvcj9jLnJlamVjdChhLmVycm9yKTpjLnJlc29sdmUoYS5yZXN1bHQpLGRlbGV0ZSB0aGlzLmNic1thLmlkXSx0aGlzLnVuc3ViW2EuaWRdJiYoZGVsZXRlIHRoaXMuc3Vic1t0aGlzLnVuc3ViW2EuaWRdXSxkZWxldGUgdGhpcy51bnN1YlthLmlkXSkpOmMmJmI/YyhhLnBhcmFtc1sxXSk6Y29uc29sZS5sb2coXCJXYXJuaW5nOiB1bmtub3duIHdlYnNvY2tldCByZXNwb25zZTogXCIsYSl9KSxfZGVmaW5lUHJvcGVydHkodGhpcyxcImxvZ2luXCIsKGEsYik9PnRoaXMuY29ubmVjdF9wcm9taXNlLnRoZW4oKCk9PnRoaXMuY2FsbChbMSxcImxvZ2luXCIsW2EsYl1dKSkpLF9kZWZpbmVQcm9wZXJ0eSh0aGlzLFwiY2xvc2VcIiwoKT0+bmV3IFByb21pc2UoYT0+KGNsZWFySW50ZXJ2YWwodGhpcy5rZWVwYWxpdmVfdGltZXIpLHRoaXMua2VlcGFsaXZlX3RpbWVyPXZvaWQgMCx0aGlzLl9jbG9zZUNiPSgpPT57YSgpLHRoaXMuX2Nsb3NlQ2I9bnVsbH0sdGhpcy53cz92b2lkKHRoaXMud3MudGVybWluYXRlP3RoaXMud3MudGVybWluYXRlKCk6dGhpcy53cy5jbG9zZSgpLDM9PT10aGlzLndzLnJlYWR5U3RhdGUmJmEoKSk6KGNvbnNvbGUubG9nKFwiV2Vic29ja2V0IGFscmVhZHkgY2xlYXJlZFwiLHRoaXMpLGEoKSkpKSksdGhpcy51cmw9YSx0aGlzLnN0YXR1c0NiPWIsdGhpcy5jdXJyZW50X3JlamVjdD1udWxsLHRoaXMub25fcmVjb25uZWN0PW51bGwsdGhpcy5jbG9zZWQ9ITEsdGhpcy5zZW5kX2xpZmU9TUFYX1NFTkRfTElGRSx0aGlzLnJlY3ZfbGlmZT1NQVhfUkVDVl9MSUZFLHRoaXMua2VlcEFsaXZlQ2I9ZSx0aGlzLmNiSWQ9MCx0aGlzLnJlc3BvbnNlQ2JJZD0wLHRoaXMuY2JzPXt9LHRoaXMuc3Vicz17fSx0aGlzLnVuc3ViPXt9LHRoaXMuY29ubmVjdF9wcm9taXNlPXRoaXMuY29ubmVjdChhLGMpfX12YXIgX2RlZmF1bHQ9Q2hhaW5XZWJTb2NrZXQ7ZXhwb3J0cy5kZWZhdWx0PV9kZWZhdWx0OyIsIlwidXNlIHN0cmljdFwiO09iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLGV4cG9ydHMuZGVmYXVsdD12b2lkIDA7dmFyIEFwaXM9X2ludGVyb3BSZXF1aXJlV2lsZGNhcmQocmVxdWlyZShcIi4vQXBpSW5zdGFuY2VzXCIpKSxfQ2hhaW5XZWJTb2NrZXQ9X2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi9DaGFpbldlYlNvY2tldFwiKSk7ZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChhKXtyZXR1cm4gYSYmYS5fX2VzTW9kdWxlP2E6e2RlZmF1bHQ6YX19ZnVuY3Rpb24gX2dldFJlcXVpcmVXaWxkY2FyZENhY2hlKCl7aWYoXCJmdW5jdGlvblwiIT10eXBlb2YgV2Vha01hcClyZXR1cm4gbnVsbDt2YXIgYT1uZXcgV2Vha01hcDtyZXR1cm4gX2dldFJlcXVpcmVXaWxkY2FyZENhY2hlPWZ1bmN0aW9uKCl7cmV0dXJuIGF9LGF9ZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQoYSl7aWYoYSYmYS5fX2VzTW9kdWxlKXJldHVybiBhO3ZhciBiPV9nZXRSZXF1aXJlV2lsZGNhcmRDYWNoZSgpO2lmKGImJmIuaGFzKGEpKXJldHVybiBiLmdldChhKTt2YXIgYz17fTtpZihudWxsIT1hKXt2YXIgZD1PYmplY3QuZGVmaW5lUHJvcGVydHkmJk9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I7Zm9yKHZhciBlIGluIGEpaWYoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGEsZSkpe3ZhciBmPWQ/T2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihhLGUpOm51bGw7ZiYmKGYuZ2V0fHxmLnNldCk/T2JqZWN0LmRlZmluZVByb3BlcnR5KGMsZSxmKTpjW2VdPWFbZV19fXJldHVybiBjLmRlZmF1bHQ9YSxiJiZiLnNldChhLGMpLGN9ZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KGEsYixjKXtyZXR1cm4gYiBpbiBhP09iamVjdC5kZWZpbmVQcm9wZXJ0eShhLGIse3ZhbHVlOmMsZW51bWVyYWJsZTohMCxjb25maWd1cmFibGU6ITAsd3JpdGFibGU6ITB9KTphW2JdPWMsYX1jbGFzcyBNYW5hZ2Vye2NvbnN0cnVjdG9yKHt1cmw6Yix1cmxzOmMsYXV0b0ZhbGxiYWNrOmQsY2xvc2VDYjplLG9wdGlvbmFsQXBpczpmLHVybENoYW5nZUNhbGxiYWNrOmd9KXtfZGVmaW5lUHJvcGVydHkodGhpcyxcInNldENsb3NlQ2JcIixhPT57dGhpcy5jbG9zZUNiPWF9KSxfZGVmaW5lUHJvcGVydHkodGhpcyxcImxvZ0ZhaWx1cmVcIiwoYSxiLGMpPT57bGV0IGQ9YyYmYy5tZXNzYWdlP2MubWVzc2FnZTpcIlwiO2NvbnNvbGUuZXJyb3IoYSxcIkZhaWxlZCB0byBjb25uZWN0IHRvIFwiK2IrKGQ/XCIgRXJyb3I6IFwiK0pTT04uc3RyaW5naWZ5KGQpOlwiXCIpKX0pLF9kZWZpbmVQcm9wZXJ0eSh0aGlzLFwiX29uQ2xvc2VcIiwoKT0+e3RoaXMuaXNDb25uZWN0ZWQ9ITEsdGhpcy5jbG9zZUNiJiYodGhpcy5jbG9zZUNiKCksdGhpcy5zZXRDbG9zZUNiKG51bGwpKSx0aGlzLmF1dG9GYWxsYmFjayYmdGhpcy5jb25uZWN0V2l0aEZhbGxiYWNrKCl9KSxfZGVmaW5lUHJvcGVydHkodGhpcyxcImNvbm5lY3RcIixhc3luYyhhPSEwLGI9dGhpcy51cmwpPT57dHJ5e2xldCBjPWF3YWl0IEFwaXMuaW5zdGFuY2UoYixhLHZvaWQgMCx0aGlzLm9wdGlvbmFsQXBpcyx0aGlzLl9vbkNsb3NlKS5pbml0X3Byb21pc2U7cmV0dXJuIHRoaXMudXJsPWIsdGhpcy5pc0Nvbm5lY3RlZD0hMCxjfWNhdGNoKGEpe3Rocm93IGF3YWl0IEFwaXMuY2xvc2UoKSxhfX0pLF9kZWZpbmVQcm9wZXJ0eSh0aGlzLFwiY29ubmVjdFdpdGhGYWxsYmFja1wiLGFzeW5jKGE9ITAsYj10aGlzLnVybCxjPTAsZD1udWxsLGU9bnVsbCk9PntpZihjPnRoaXMudXJscy5sZW5ndGgpcmV0dXJuIGUobmV3IEVycm9yKFwiVHJpZWQgXCIrYytcIiBjb25uZWN0aW9ucywgbm9uZSBvZiB3aGljaCB3b3JrZWQ6IFwiK0pTT04uc3RyaW5naWZ5KHRoaXMudXJscy5jb25jYXQodGhpcy51cmwpKSkpO3RyeXtyZXR1cm4gYXdhaXQgdGhpcy5jb25uZWN0KGEsYil9Y2F0Y2goYil7cmV0dXJuIHRoaXMudXJsQ2hhbmdlQ2FsbGJhY2smJnRoaXMudXJsQ2hhbmdlQ2FsbGJhY2sodGhpcy51cmxzW2NdKSx0aGlzLmNvbm5lY3RXaXRoRmFsbGJhY2soYSx0aGlzLnVybHNbY10sYysxLGQsZSl9fSksX2RlZmluZVByb3BlcnR5KHRoaXMsXCJjaGVja0Nvbm5lY3Rpb25zXCIsYXN5bmMoYT1cIlwiLGI9XCJcIixjLGQpPT57bGV0IGU9e30sZj10aGlzLnVybHMuY29uY2F0KHRoaXMudXJsKSxnPWYubWFwKGFzeW5jIGM9PnsvKiBVc2UgZGVmYXVsdCB0aW1lb3V0IGFuZCBubyByZWNvbm5lY3Rpbmctd2Vic29ja2V0ICovbGV0IGQ9bmV3IF9DaGFpbldlYlNvY2tldC5kZWZhdWx0KGMsKCk9Pnt9LHZvaWQgMCwhMSk7ZVtjXT1uZXcgRGF0ZSgpLmdldFRpbWUoKTt0cnl7YXdhaXQgZC5sb2dpbihhLGIpO2xldCBmPXtbY106bmV3IERhdGUoKS5nZXRUaW1lKCktZVtjXX07cmV0dXJuIGF3YWl0IGQuY2xvc2UoKSxmfWNhdGNoKGEpe3JldHVybiBjPT09dGhpcy51cmw/dGhpcy51cmw9dGhpcy51cmxzWzBdOnRoaXMudXJscz10aGlzLnVybHMuZmlsdGVyKGI9PmIhPT1jKSx2b2lkKGF3YWl0IGQuY2xvc2UoKSl9fSk7dHJ5e2xldCBhPWF3YWl0IFByb21pc2UuYWxsKGcpLGI9YS5maWx0ZXIoYj0+ISFiKS5zb3J0KChjLGEpPT5PYmplY3QudmFsdWVzKGMpWzBdLU9iamVjdC52YWx1ZXMoYSlbMF0pLnJlZHVjZSgoYixjKT0+e2xldCBhPU9iamVjdC5rZXlzKGMpWzBdO3JldHVybiBiW2FdPWNbYV0sYn0se30pO3JldHVybiBjb25zb2xlLmxvZyhcIkNoZWNrZWQgXCIuY29uY2F0KGEubGVuZ3RoLFwiIGNvbm5lY3Rpb25zLCBcIikuY29uY2F0KGEubGVuZ3RoLU9iamVjdC5rZXlzKGIpLmxlbmd0aCxcIiBmYWlsZWRcIikpLGJ9Y2F0Y2goZSl7cmV0dXJuIHRoaXMuY2hlY2tDb25uZWN0aW9ucyhhLGIsYyxkKX19KSx0aGlzLnVybD1iLHRoaXMudXJscz1jLmZpbHRlcihjPT5jIT09YiksdGhpcy5hdXRvRmFsbGJhY2s9ZCx0aGlzLmNsb3NlQ2I9ZSx0aGlzLm9wdGlvbmFsQXBpcz1mfHx7fSx0aGlzLmlzQ29ubmVjdGVkPSExLHRoaXMudXJsQ2hhbmdlQ2FsbGJhY2s9Z31zdGF0aWMgY2xvc2UoKXtyZXR1cm4gQXBpcy5jbG9zZSgpfX12YXIgX2RlZmF1bHQ9TWFuYWdlcjtleHBvcnRzLmRlZmF1bHQ9X2RlZmF1bHQ7IiwiXCJ1c2Ugc3RyaWN0XCI7T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksZXhwb3J0cy5kZWZhdWx0PXZvaWQgMDtjbGFzcyBHcmFwaGVuZUFwaXtjb25zdHJ1Y3RvcihhLGIpe3RoaXMud3NfcnBjPWEsdGhpcy5hcGlfbmFtZT1ifWluaXQoKXt2YXIgYT10aGlzO3JldHVybiB0aGlzLndzX3JwYy5jYWxsKFsxLHRoaXMuYXBpX25hbWUsW11dKS50aGVuKGI9PihhLmFwaV9pZD1iLGEpKX1leGVjKGEsYil7cmV0dXJuIHRoaXMud3NfcnBjLmNhbGwoW3RoaXMuYXBpX2lkLGEsYl0pLmNhdGNoKGE9PnsvLyBjb25zb2xlLmxvZyhcIiEhISBHcmFwaGVuZUFwaSBlcnJvcjogXCIsIG1ldGhvZCwgcGFyYW1zLCBlcnJvciwgSlNPTi5zdHJpbmdpZnkoZXJyb3IpKTtcbnRocm93IGF9KX19dmFyIF9kZWZhdWx0PUdyYXBoZW5lQXBpO2V4cG9ydHMuZGVmYXVsdD1fZGVmYXVsdDsiLCJcInVzZSBzdHJpY3RcIjt2YXIgQXBpcz1faW50ZXJvcFJlcXVpcmVXaWxkY2FyZChyZXF1aXJlKFwiLi9BcGlJbnN0YW5jZXNcIikpO09iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLFwiTWFuYWdlclwiLHtlbnVtZXJhYmxlOiEwLGdldDpmdW5jdGlvbigpe3JldHVybiBfQ29ubmVjdGlvbk1hbmFnZXIuZGVmYXVsdH19KSxPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cyxcIkNoYWluQ29uZmlnXCIse2VudW1lcmFibGU6ITAsZ2V0OmZ1bmN0aW9uKCl7cmV0dXJuIF9DaGFpbkNvbmZpZy5kZWZhdWx0fX0pLGV4cG9ydHMuQXBpcz12b2lkIDA7ZXhwb3J0cy5BcGlzPUFwaXM7dmFyIF9Db25uZWN0aW9uTWFuYWdlcj1faW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL0Nvbm5lY3Rpb25NYW5hZ2VyXCIpKSxfQ2hhaW5Db25maWc9X2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi9DaGFpbkNvbmZpZ1wiKSk7ZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChhKXtyZXR1cm4gYSYmYS5fX2VzTW9kdWxlP2E6e2RlZmF1bHQ6YX19ZnVuY3Rpb24gX2dldFJlcXVpcmVXaWxkY2FyZENhY2hlKCl7aWYoXCJmdW5jdGlvblwiIT10eXBlb2YgV2Vha01hcClyZXR1cm4gbnVsbDt2YXIgYT1uZXcgV2Vha01hcDtyZXR1cm4gX2dldFJlcXVpcmVXaWxkY2FyZENhY2hlPWZ1bmN0aW9uKCl7cmV0dXJuIGF9LGF9ZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQoYSl7aWYoYSYmYS5fX2VzTW9kdWxlKXJldHVybiBhO3ZhciBiPV9nZXRSZXF1aXJlV2lsZGNhcmRDYWNoZSgpO2lmKGImJmIuaGFzKGEpKXJldHVybiBiLmdldChhKTt2YXIgYz17fTtpZihudWxsIT1hKXt2YXIgZD1PYmplY3QuZGVmaW5lUHJvcGVydHkmJk9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I7Zm9yKHZhciBlIGluIGEpaWYoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGEsZSkpe3ZhciBmPWQ/T2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihhLGUpOm51bGw7ZiYmKGYuZ2V0fHxmLnNldCk/T2JqZWN0LmRlZmluZVByb3BlcnR5KGMsZSxmKTpjW2VdPWFbZV19fXJldHVybiBjLmRlZmF1bHQ9YSxiJiZiLnNldChhLGMpLGN9IiwiLy8gaHR0cHM6Ly9naXRodWIuY29tL21heG9nZGVuL3dlYnNvY2tldC1zdHJlYW0vYmxvYi80OGRjM2RkZjk0M2U1YWRhNjY4YzMxY2NkOTRlOTE4NmYwMmZhZmJkL3dzLWZhbGxiYWNrLmpzXG5cbnZhciB3cyA9IG51bGxcblxuaWYgKHR5cGVvZiBXZWJTb2NrZXQgIT09ICd1bmRlZmluZWQnKSB7XG4gIHdzID0gV2ViU29ja2V0XG59IGVsc2UgaWYgKHR5cGVvZiBNb3pXZWJTb2NrZXQgIT09ICd1bmRlZmluZWQnKSB7XG4gIHdzID0gTW96V2ViU29ja2V0XG59IGVsc2UgaWYgKHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnKSB7XG4gIHdzID0gZ2xvYmFsLldlYlNvY2tldCB8fCBnbG9iYWwuTW96V2ViU29ja2V0XG59IGVsc2UgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG4gIHdzID0gd2luZG93LldlYlNvY2tldCB8fCB3aW5kb3cuTW96V2ViU29ja2V0XG59IGVsc2UgaWYgKHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJykge1xuICB3cyA9IHNlbGYuV2ViU29ja2V0IHx8IHNlbGYuTW96V2ViU29ja2V0XG59XG5cbm1vZHVsZS5leHBvcnRzID0gd3NcbiJdfQ==
