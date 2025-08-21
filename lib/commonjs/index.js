"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  isReady: true,
  startConnection: true,
  buy: true,
  subscribe: true,
  queryProductDetails: true,
  querySingleProductDetails: true,
  querySubscriptionDetails: true,
  querySingleSubscriptionDetails: true,
  queryPurchases: true,
  onPurchasesUpdated: true
};
exports.buy = buy;
exports.isReady = isReady;
exports.onPurchasesUpdated = onPurchasesUpdated;
exports.queryProductDetails = queryProductDetails;
exports.queryPurchases = queryPurchases;
exports.querySingleProductDetails = querySingleProductDetails;
exports.querySingleSubscriptionDetails = querySingleSubscriptionDetails;
exports.querySubscriptionDetails = querySubscriptionDetails;
exports.startConnection = startConnection;
exports.subscribe = subscribe;
var _reactNative = require("react-native");
var _types = require("./types");
Object.keys(_types).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _types[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _types[key];
    }
  });
});
const LINKING_ERROR = `The package 'react-native-google-play-billing' doesn't seem to be linked. Make sure: \n\n` + _reactNative.Platform.select({
  ios: "- You have run 'pod install'\n",
  default: ''
}) + '- You rebuilt the app after installing the package\n' + '- You are not using Expo Go\n';

// @ts-expect-error
const isTurboModuleEnabled = global.__turboModuleProxy != null;
const GooglePlayBillingModule = isTurboModuleEnabled ? require('./NativeGooglePlayBilling').default : _reactNative.NativeModules.GooglePlayBilling;
const GooglePlayBilling = GooglePlayBillingModule ? GooglePlayBillingModule : new Proxy({}, {
  get() {
    throw new Error(LINKING_ERROR);
  }
});
async function isReady() {
  if (_reactNative.Platform.OS === 'android') {
    return await GooglePlayBilling.isReady();
  }
  return false;
}
async function startConnection() {
  if (_reactNative.Platform.OS === 'android') {
    return await GooglePlayBilling.startConnection();
  }
}
async function buy(productId, userID, orderNumber) {
  if (_reactNative.Platform.OS === 'android') {
    return await GooglePlayBilling.buy(productId, userID ?? null, orderNumber ?? null);
  }
}
async function subscribe(productId, offerToken, userID, orderNumber) {
  if (_reactNative.Platform.OS === 'android') {
    return await GooglePlayBilling.subscribe(productId, offerToken, userID ?? null, orderNumber ?? null);
  }
}

/**
 * 批量查询一次性商品详情
 * @param productIds
 */
async function queryProductDetails(productIds) {
  if (_reactNative.Platform.OS === 'android') {
    return await GooglePlayBilling.queryProductDetails(productIds, _types.ProductType.INAPP);
  }
}

/**
 * 查询一次性商品详情
 * @param productId
 */
async function querySingleProductDetails(productId) {
  if (_reactNative.Platform.OS === 'android') {
    return await GooglePlayBilling.querySingleProductDetails(productId, _types.ProductType.INAPP);
  }
}

/**
 * 批量查询订阅商品详情
 * @param productIds
 */
async function querySubscriptionDetails(productIds) {
  if (_reactNative.Platform.OS === 'android') {
    return await GooglePlayBilling.queryProductDetails(productIds, _types.ProductType.SUBS);
  }
}

/**
 * 查询订阅商品详情
 * @param productId
 */
async function querySingleSubscriptionDetails(productId) {
  if (_reactNative.Platform.OS === 'android') {
    return await GooglePlayBilling.querySingleProductDetails(productId, _types.ProductType.SUBS);
  }
}
function queryPurchases() {
  if (_reactNative.Platform.OS === 'android') {
    return GooglePlayBilling.queryPurchases();
  }
}
function onPurchasesUpdated(listener) {
  const eventEmitter = new _reactNative.NativeEventEmitter(GooglePlayBilling);
  return eventEmitter.addListener('onPurchasesUpdated', event => {
    if (typeof listener === 'function') {
      listener(event === null || event === void 0 ? void 0 : event.data);
    }
  });
}
//# sourceMappingURL=index.js.map