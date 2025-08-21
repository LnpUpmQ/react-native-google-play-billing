import { NativeEventEmitter, NativeModules, Platform } from 'react-native';
import { ProductType } from './types';
export * from './types';
const LINKING_ERROR = `The package 'react-native-google-play-billing' doesn't seem to be linked. Make sure: \n\n` + Platform.select({
  ios: "- You have run 'pod install'\n",
  default: ''
}) + '- You rebuilt the app after installing the package\n' + '- You are not using Expo Go\n';

// @ts-expect-error
const isTurboModuleEnabled = global.__turboModuleProxy != null;
const GooglePlayBillingModule = isTurboModuleEnabled ? require('./NativeGooglePlayBilling').default : NativeModules.GooglePlayBilling;
const GooglePlayBilling = GooglePlayBillingModule ? GooglePlayBillingModule : new Proxy({}, {
  get() {
    throw new Error(LINKING_ERROR);
  }
});
export async function isReady() {
  if (Platform.OS === 'android') {
    return await GooglePlayBilling.isReady();
  }
  return false;
}
export async function startConnection() {
  if (Platform.OS === 'android') {
    return await GooglePlayBilling.startConnection();
  }
}
export async function buy(productId, userID, orderNumber) {
  if (Platform.OS === 'android') {
    return await GooglePlayBilling.buy(productId, userID ?? null, orderNumber ?? null);
  }
}
export async function subscribe(productId, offerToken, userID, orderNumber) {
  if (Platform.OS === 'android') {
    return await GooglePlayBilling.subscribe(productId, offerToken, userID ?? null, orderNumber ?? null);
  }
}

/**
 * 批量查询一次性商品详情
 * @param productIds
 */
export async function queryProductDetails(productIds) {
  if (Platform.OS === 'android') {
    return await GooglePlayBilling.queryProductDetails(productIds, ProductType.INAPP);
  }
}

/**
 * 查询一次性商品详情
 * @param productId
 */
export async function querySingleProductDetails(productId) {
  if (Platform.OS === 'android') {
    return await GooglePlayBilling.querySingleProductDetails(productId, ProductType.INAPP);
  }
}

/**
 * 批量查询订阅商品详情
 * @param productIds
 */
export async function querySubscriptionDetails(productIds) {
  if (Platform.OS === 'android') {
    return await GooglePlayBilling.queryProductDetails(productIds, ProductType.SUBS);
  }
}

/**
 * 查询订阅商品详情
 * @param productId
 */
export async function querySingleSubscriptionDetails(productId) {
  if (Platform.OS === 'android') {
    return await GooglePlayBilling.querySingleProductDetails(productId, ProductType.SUBS);
  }
}
export function queryPurchases() {
  if (Platform.OS === 'android') {
    return GooglePlayBilling.queryPurchases();
  }
}
export function onPurchasesUpdated(listener) {
  const eventEmitter = new NativeEventEmitter(GooglePlayBilling);
  return eventEmitter.addListener('onPurchasesUpdated', event => {
    if (typeof listener === 'function') {
      listener(event === null || event === void 0 ? void 0 : event.data);
    }
  });
}
//# sourceMappingURL=index.js.map