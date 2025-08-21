import type { EmitterSubscription } from 'react-native';
import { NativeEventEmitter, NativeModules, Platform } from 'react-native';
import {
  type ProductDetailForOneTimePurchase,
  type ProductDetailForSubscription,
  ProductType,
  type Purchase,
} from './types';

export * from './types';

const LINKING_ERROR =
  `The package 'react-native-google-play-billing' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

// @ts-expect-error
const isTurboModuleEnabled = global.__turboModuleProxy != null;

const GooglePlayBillingModule = isTurboModuleEnabled
  ? require('./NativeGooglePlayBilling').default
  : NativeModules.GooglePlayBilling;

const GooglePlayBilling = GooglePlayBillingModule
  ? GooglePlayBillingModule
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export async function isReady(): Promise<boolean> {
  if (Platform.OS === 'android') {
    return await GooglePlayBilling.isReady();
  }
  return false;
}

export async function startConnection(): Promise<void> {
  if (Platform.OS === 'android') {
    return await GooglePlayBilling.startConnection();
  }
}

export async function buy(
  productId: string,
  userID?: string,
  orderNumber?: string
): Promise<void> {
  if (Platform.OS === 'android') {
    return await GooglePlayBilling.buy(
      productId,
      userID ?? null,
      orderNumber ?? null
    );
  }
}

export async function subscribe(
  productId: string,
  offerToken: string,
  userID?: string,
  orderNumber?: string
): Promise<void> {
  if (Platform.OS === 'android') {
    return await GooglePlayBilling.subscribe(
      productId,
      offerToken,
      userID ?? null,
      orderNumber ?? null
    );
  }
}

/**
 * 批量查询一次性商品详情
 * @param productIds
 */
export async function queryProductDetails(
  productIds: string[]
): Promise<ProductDetailForOneTimePurchase[] | void> {
  if (Platform.OS === 'android') {
    return await GooglePlayBilling.queryProductDetails(
      productIds,
      ProductType.INAPP
    );
  }
}

/**
 * 查询一次性商品详情
 * @param productId
 */
export async function querySingleProductDetails(
  productId: string
): Promise<ProductDetailForOneTimePurchase | void> {
  if (Platform.OS === 'android') {
    return await GooglePlayBilling.querySingleProductDetails(
      productId,
      ProductType.INAPP
    );
  }
}

/**
 * 批量查询订阅商品详情
 * @param productIds
 */
export async function querySubscriptionDetails(
  productIds: string[]
): Promise<ProductDetailForSubscription[] | void> {
  if (Platform.OS === 'android') {
    return await GooglePlayBilling.queryProductDetails(
      productIds,
      ProductType.SUBS
    );
  }
}

/**
 * 查询订阅商品详情
 * @param productId
 */
export async function querySingleSubscriptionDetails(
  productId: string
): Promise<ProductDetailForSubscription | void> {
  if (Platform.OS === 'android') {
    return await GooglePlayBilling.querySingleProductDetails(
      productId,
      ProductType.SUBS
    );
  }
}

export function queryPurchases(): void {
  if (Platform.OS === 'android') {
    return GooglePlayBilling.queryPurchases();
  }
}

export function onPurchasesUpdated(
  listener: (data: Purchase[]) => void
): EmitterSubscription {
  const eventEmitter = new NativeEventEmitter(GooglePlayBilling);
  return eventEmitter.addListener('onPurchasesUpdated', (event) => {
    if (typeof listener === 'function') {
      listener(event?.data);
    }
  });
}
