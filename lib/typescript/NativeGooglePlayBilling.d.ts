import type { TurboModule } from 'react-native';
import type { ProductDetailForOneTimePurchase } from './types';
export interface Spec extends TurboModule {
    readonly getConstants: () => {};
    isReady(): Promise<boolean>;
    startConnection(): Promise<void>;
    queryProductDetails(productIds: string[], productType: string): Promise<ProductDetailForOneTimePurchase[] | void>;
    querySingleProductDetails(productId: string, productType: string): Promise<ProductDetailForOneTimePurchase | void>;
    buy(productId: string, userID?: string, orderNumber?: string): Promise<void>;
    subscribe(productId: string, offerToken: string, userID?: string, orderNumber?: string): Promise<void>;
    queryPurchases(): void;
}
declare const _default: Spec | null;
export default _default;
//# sourceMappingURL=NativeGooglePlayBilling.d.ts.map