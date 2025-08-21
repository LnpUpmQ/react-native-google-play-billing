package com.googleplaybilling;

import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.Purchase;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

import java.util.List;

public class Utils {
  static public ReadableMap parseProductDetails(ProductDetails productDetails) {
    WritableMap item = Arguments.createMap();

    if (productDetails != null) {
      item.putString("productId", productDetails.getProductId());
      item.putString("name", productDetails.getName());
      item.putString("description", productDetails.getDescription());
      item.putString("productType", productDetails.getProductType());
      item.putString("title", productDetails.getTitle());

      // 一次性商品价格
      ProductDetails.OneTimePurchaseOfferDetails oneTimePurchaseOfferDetails = productDetails.getOneTimePurchaseOfferDetails();
      System.out.print(oneTimePurchaseOfferDetails);
      if (oneTimePurchaseOfferDetails != null) {
        item.putString("formattedPrice", oneTimePurchaseOfferDetails.getFormattedPrice());
        item.putString("priceCurrencyCode", oneTimePurchaseOfferDetails.getPriceCurrencyCode());
        item.putDouble("priceAmountMicros", oneTimePurchaseOfferDetails.getPriceAmountMicros());
      }

      // 订阅计划
      List<ProductDetails.SubscriptionOfferDetails> listOfSubscriptionOfferDetails = productDetails.getSubscriptionOfferDetails();
      if (listOfSubscriptionOfferDetails != null) {
        WritableArray offers = Arguments.createArray();
        for (int j = 0; j < listOfSubscriptionOfferDetails.size(); j++) {
          WritableMap offer = Arguments.createMap();
          ProductDetails.SubscriptionOfferDetails subscriptionOfferDetails = listOfSubscriptionOfferDetails.get(j);
          offer.putString("basePlanId", subscriptionOfferDetails.getBasePlanId());
          offer.putString("offerId", subscriptionOfferDetails.getOfferId());
          offer.putString("offerToken", subscriptionOfferDetails.getOfferToken());
          offer.putString("offerTags", subscriptionOfferDetails.getOfferTags().toString());

          // 分期计划
          ProductDetails.InstallmentPlanDetails installmentPlanDetails = subscriptionOfferDetails.getInstallmentPlanDetails();
          if (installmentPlanDetails != null) {
            WritableMap installmentPlan = Arguments.createMap();
            installmentPlan.putInt("installmentPlanCommitmentPaymentsCount", installmentPlanDetails.getInstallmentPlanCommitmentPaymentsCount());
            installmentPlan.putInt("subsequentInstallmentPlanCommitmentPaymentsCount", installmentPlanDetails.getSubsequentInstallmentPlanCommitmentPaymentsCount());
            offer.putMap("installmentPlan", installmentPlan);
          }

          // 价格列表
          WritableArray pricingPhases = Arguments.createArray();
          List<ProductDetails.PricingPhase> _prices = subscriptionOfferDetails.getPricingPhases().getPricingPhaseList();
          for (int k = 0; k < _prices.size(); k++) {
            WritableMap pricingPhase = Arguments.createMap();
            ProductDetails.PricingPhase _price = _prices.get(k);
            pricingPhase.putString("formattedPrice", _price.getFormattedPrice());
            pricingPhase.putString("priceCurrencyCode", _price.getPriceCurrencyCode());
            pricingPhase.putDouble("priceAmountMicros", _price.getPriceAmountMicros());
            pricingPhase.putString("billingPeriod", _price.getBillingPeriod());
            pricingPhase.putInt("billingCycleCount", _price.getBillingCycleCount());
            pricingPhase.putInt("recurrenceMode", _price.getRecurrenceMode());
            pricingPhases.pushMap(pricingPhase);
          }
          offer.putArray("pricingPhases", pricingPhases);
          offers.pushMap(offer);
        }
        item.putArray("subscriptionOffers", offers);
      }
    }

    return item;
  }

  static public ReadableMap parsePurchase(Purchase purchase) {
    WritableMap item = Arguments.createMap();
    item.putString("orderId", purchase.getOrderId());
    item.putString("packageName", purchase.getPackageName());
    item.putArray("productIds", Arguments.fromList(purchase.getProducts()));
    item.putInt("purchaseTime", (int) purchase.getPurchaseTime());
    item.putInt("purchaseState", purchase.getPurchaseState());
    item.putString("purchaseToken", purchase.getPurchaseToken());
    item.putInt("quantity", purchase.getQuantity());
    item.putBoolean("acknowledged", purchase.isAcknowledged());
    return item;
  }
}
