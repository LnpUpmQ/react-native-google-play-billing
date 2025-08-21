export enum ProductType {
  INAPP = 'inapp',
  SUBS = 'subs',
}

interface ProductDetailBase {
  productId: string;
  name: string;
  description: string;
  productType: ProductType;
  title: string;
}

export interface ProductDetailForOneTimePurchase extends ProductDetailBase {
  formattedPrice: string; // 一次性商品显示价格
  priceCurrencyCode: string; // 一次性商品价格货币编码
  priceAmountMicros: number; // 一次性商品价格
}

export interface PricingPhase {
  formattedPrice: string;
  priceCurrencyCode: string;
  priceAmountMicros: number;
  billingPeriod: string; // P1M | P3M | P1Y ...
  billingCycleCount: number;
  recurrenceMode: number; // 1 | 2 | 3
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

export type ProductDetail =
  | ProductDetailForOneTimePurchase
  | ProductDetailForSubscription;

export type Purchase = {
  quantity: number;
  orderId: string;
  purchaseToken: string;
  purchaseState: number;
  purchaseTime: number;
  productIds: string[];
};
