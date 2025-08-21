export declare enum ProductType {
    INAPP = "inapp",
    SUBS = "subs"
}
interface ProductDetailBase {
    productId: string;
    name: string;
    description: string;
    productType: ProductType;
    title: string;
}
export interface ProductDetailForOneTimePurchase extends ProductDetailBase {
    formattedPrice: string;
    priceCurrencyCode: string;
    priceAmountMicros: number;
}
export interface PricingPhase {
    formattedPrice: string;
    priceCurrencyCode: string;
    priceAmountMicros: number;
    billingPeriod: string;
    billingCycleCount: number;
    recurrenceMode: number;
}
export interface SubscriptionOffer {
    basePlanId: string;
    offerId: string;
    offerToken: string;
    offerTags: string;
    pricingPhases: PricingPhase[];
    installmentPlan?: {
        installmentPlanCommitmentPaymentsCount: number;
        subsequentInstallmentPlanCommitmentPaymentsCount: number;
    };
}
export interface ProductDetailForSubscription extends ProductDetailBase {
    subscriptionOffers: SubscriptionOffer[];
}
export type ProductDetail = ProductDetailForOneTimePurchase | ProductDetailForSubscription;
export type Purchase = {
    quantity: number;
    orderId: string;
    purchaseToken: string;
    purchaseState: number;
    purchaseTime: number;
    productIds: string[];
};
export {};
//# sourceMappingURL=types.d.ts.map