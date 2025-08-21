import type { EmitterSubscription } from 'react-native';
import { type ProductDetailForOneTimePurchase, type ProductDetailForSubscription, type Purchase } from './types';
export * from './types';
export declare function isReady(): Promise<boolean>;
export declare function startConnection(): Promise<void>;
export declare function buy(productId: string, userID?: string, orderNumber?: string): Promise<void>;
export declare function subscribe(productId: string, offerToken: string, userID?: string, orderNumber?: string): Promise<void>;
/**
 * 批量查询一次性商品详情
 * @param productIds
 */
export declare function queryProductDetails(productIds: string[]): Promise<ProductDetailForOneTimePurchase[] | void>;
/**
 * 查询一次性商品详情
 * @param productId
 */
export declare function querySingleProductDetails(productId: string): Promise<ProductDetailForOneTimePurchase | void>;
/**
 * 批量查询订阅商品详情
 * @param productIds
 */
export declare function querySubscriptionDetails(productIds: string[]): Promise<ProductDetailForSubscription[] | void>;
/**
 * 查询订阅商品详情
 * @param productId
 */
export declare function querySingleSubscriptionDetails(productId: string): Promise<ProductDetailForSubscription | void>;
export declare function queryPurchases(): void;
export declare function onPurchasesUpdated(listener: (data: Purchase[]) => void): EmitterSubscription;
//# sourceMappingURL=index.d.ts.map