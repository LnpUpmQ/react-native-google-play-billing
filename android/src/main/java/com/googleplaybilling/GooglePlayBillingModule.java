package com.googleplaybilling;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.PendingPurchasesParams;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.PurchasesResponseListener;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.android.billingclient.api.QueryPurchasesParams;
import com.facebook.common.internal.ImmutableList;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

public class GooglePlayBillingModule extends GooglePlayBillingSpec implements PurchasesUpdatedListener, PurchasesResponseListener {
  public static final String NAME = "GooglePlayBilling";

  private final ReactApplicationContext reactContext;

  private final BillingClient billingClient;

  private Boolean billingClientConnected = false;

  public GooglePlayBillingModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;

    // 初始化 BillingClient
    this.billingClient = BillingClient.newBuilder(reactContext)
      .setListener(this)
      .enablePendingPurchases(PendingPurchasesParams.newBuilder().enableOneTimeProducts().enablePrepaidPlans().build())
      .enableAutoServiceReconnection()
      .build();

    GooglePlayBillingModule _thisModule = this;
    // 使用 PurchasesUpdatedListener 监听购买交易更新不足以确保您的应用会处理所有购买交易。有时您的应用可能不知道用户进行的部分购买交易。
    // 为了处理这些情况，请确保您的应用在 onResume() 方法中调用 BillingClient.queryPurchasesAsync()，以确保所有购买交易都得到成功处理
    reactContext.addLifecycleEventListener(new LifecycleEventListener() {
      @Override
      public void onHostResume() {
        _thisModule.queryPurchases();
      }

      @Override
      public void onHostPause() {
      }

      @Override
      public void onHostDestroy() {
      }
    });
  }

  @Override
  @NonNull
  public String getName() {
    return NAME;
  }

  public Map<String, Object> getConstants() {
    final Map<String, Object> constants = new HashMap<>();
    constants.put("PRODUCT_TYPE_INAPP", BillingClient.ProductType.INAPP);
    constants.put("PRODUCT_TYPE_SUBS", BillingClient.ProductType.SUBS);
    return constants;
  }

  /**
   * 购买结果的回调
   */
  @Override
  public void onPurchasesUpdated(@NonNull BillingResult billingResult, @Nullable List<Purchase> list) {
    WritableMap params = Arguments.createMap();

    if (list != null) {
      WritableArray data = Arguments.createArray();
      for (Purchase purchase : list) {
        data.pushMap(Utils.parsePurchase(purchase));
      }
      params.putArray("data", data);
      sendEvent("onPurchasesUpdated", params);
    }
  }

  /**
   * 使用 PurchasesUpdatedListener 监听购买交易更新不足以确保您的应用会处理所有购买交易。有时您的应用可能不知道用户进行的部分购买交易。
   * 为了处理这些情况，请确保您的应用在 onResume() 方法中调用 BillingClient.queryPurchasesAsync()，以确保所有购买交易都得到成功处理
   */
  @Override
  public void onQueryPurchasesResponse(@NonNull BillingResult billingResult, @NonNull List<Purchase> list) {
    onPurchasesUpdated(billingResult, list);
  }

  /**
   * 查询未完成的交易
   */
  @ReactMethod
  public void queryPurchases() {
    QueryPurchasesParams queryPurchasesParams = QueryPurchasesParams.newBuilder().setProductType(BillingClient.ProductType.SUBS).build();
    billingClient.queryPurchasesAsync(queryPurchasesParams, this);
    QueryPurchasesParams queryPurchasesParams2 = QueryPurchasesParams.newBuilder().setProductType(BillingClient.ProductType.INAPP).build();
    billingClient.queryPurchasesAsync(queryPurchasesParams2, this);
  }


  /**
   * @noinspection unused
   */
  @ReactMethod
  public void isReady(Promise promise) {
    promise.resolve(billingClientConnected);
  }

  /**
   * 创建 BillingClient 后，您需要与 Google Play 建立连接。
   *
   * @noinspection unused
   */
  @ReactMethod
  public void startConnection(Promise promise) {
    billingClient.startConnection(new BillingClientStateListener() {
      @Override
      public void onBillingSetupFinished(@NonNull BillingResult billingResult) {
        if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
          billingClientConnected = true;
          promise.resolve(null);
        } else {
          billingClientConnected = false;
          promise.reject(new Throwable(billingResult.toString()));
        }
      }

      @Override
      public void onBillingServiceDisconnected() {
        billingClientConnected = false;
        promise.reject(new Throwable("The billing service disconnected."));
      }
    });
  }


  /**
   * 购买（一次性商品）
   *
   * @noinspection unused
   */
  @ReactMethod
  public void buy(String productId, @Nullable String userID, @Nullable String orderNumber, Promise promise) {
    querySingleProductDetailsAsync(productId, BillingClient.ProductType.INAPP, (billingResult, productDetails) -> {
      if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
        launchBillingFlow(productDetails, userID, orderNumber, promise);
      } else {
        promise.reject(new Throwable(billingResult.toString()));
      }
    });
  }

  /**
   * 订阅内容
   *
   * @noinspection unused
   */
  @ReactMethod
  public void subscribe(String productId, String offerToken, @Nullable String userID, @Nullable String orderNumber, Promise promise) {
    querySingleProductDetailsAsync(productId, BillingClient.ProductType.SUBS, (billingResult, productDetails) -> {
      if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
        launchBillingFlow(productDetails, offerToken, userID, orderNumber, promise);
      } else {
        promise.reject(new Throwable(billingResult.toString()));
      }
    });
  }


  interface SingleProductDetailsResponseListener {
    void onSingleProductDetailsResponse(@NonNull BillingResult billingResult, @Nullable ProductDetails productDetails);
  }

  /**
   * 查询商品详情(单个)
   */
  private void querySingleProductDetailsAsync(String productId, String productType, SingleProductDetailsResponseListener singleProductDetailsResponseListener) {
    QueryProductDetailsParams queryProductDetailsParams = QueryProductDetailsParams.newBuilder().setProductList(ImmutableList.of(QueryProductDetailsParams.Product.newBuilder().setProductId(productId).setProductType(productType).build())).build();
    billingClient.queryProductDetailsAsync(queryProductDetailsParams, (billingResult, queryProductDetailsResult) -> {
      List<ProductDetails> productDetailsList = queryProductDetailsResult.getProductDetailsList();
      singleProductDetailsResponseListener.onSingleProductDetailsResponse(billingResult, !productDetailsList.isEmpty() ? productDetailsList.get(0) : null);
    });
  }


  /**
   * 启动购买流程
   *
   * @noinspection SameParameterValue
   * @noinspection unused
   */
  private void launchBillingFlow(ProductDetails productDetails, @Nullable String offerToken, @Nullable String obfuscatedAccountId, @Nullable String obfuscatedProfileId, Promise promise) {
    if (productDetails != null) {
      BillingFlowParams.ProductDetailsParams.Builder builder = BillingFlowParams.ProductDetailsParams.newBuilder();
      builder.setProductDetails(productDetails);
      if (productDetails.getProductType().equals(BillingClient.ProductType.SUBS) && offerToken != null) {
        builder.setOfferToken(offerToken);
      }

      ImmutableList<BillingFlowParams.ProductDetailsParams> productDetailsParamsList = ImmutableList.of(builder.build());

      BillingFlowParams billingFlowParams = BillingFlowParams.newBuilder()
        .setProductDetailsParamsList(productDetailsParamsList)
        .setObfuscatedAccountId(obfuscatedAccountId == null ? "" : obfuscatedAccountId)
        .setObfuscatedProfileId(obfuscatedProfileId == null ? "" : obfuscatedProfileId)
        .build();

      // Launch the billing flow
      BillingResult billingResult = billingClient.launchBillingFlow(Objects.requireNonNull(getCurrentActivity()), billingFlowParams);
      if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
        promise.resolve(null);
      } else {
        promise.reject(new Throwable(billingResult.toString()));
      }
    } else {
      promise.reject(new Throwable("Undefined productDetails."));
    }
  }

  private void launchBillingFlow(ProductDetails productDetails, @Nullable String obfuscatedAccountId, @Nullable String obfuscatedProfileId, Promise promise) {
    launchBillingFlow(productDetails, null, obfuscatedAccountId, obfuscatedProfileId, promise);
  }


  /**
   * 查询单个商品详情
   *
   * @noinspection unused
   */
  @ReactMethod
  public void querySingleProductDetails(String productId, String productType, Promise promise) {
    querySingleProductDetailsAsync(productId, productType, (billingResult, productDetails) -> {
      if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
        promise.resolve(Utils.parseProductDetails(productDetails));
      } else {
        promise.reject(new Throwable(billingResult.toString()));
      }
    });
  }


  /**
   * 批量查询商品详情
   *
   * @noinspection unused
   */
  @ReactMethod
  public void queryProductDetails(ReadableArray productIds, String productType, Promise promise) {
    try {
      List<QueryProductDetailsParams.Product> productList = new ArrayList<>();
      for (int i = 0; i < productIds.size(); i++) {
        String productId = productIds.getString(i);
        productList.add(QueryProductDetailsParams.Product.newBuilder().setProductId(productId).setProductType(String.valueOf(productType)).build());
      }
      QueryProductDetailsParams queryProductDetailsParams = QueryProductDetailsParams.newBuilder().setProductList(productList).build();
      billingClient.queryProductDetailsAsync(queryProductDetailsParams, (billingResult, queryProductDetailsResult) -> {
        if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
          List<ProductDetails> productDetailsList = queryProductDetailsResult.getProductDetailsList();
          WritableArray result = Arguments.createArray();
          for (int i = 0; i < productDetailsList.size(); i++) {
            ProductDetails productDetails = productDetailsList.get(i);
            result.pushMap(Utils.parseProductDetails(productDetails));
          }
          promise.resolve(result);
        } else {
          promise.reject(new Throwable(billingResult.toString()));
        }
      });
    } catch (Exception e) {
      promise.reject(new Throwable(e.toString()));
    }
  }


  /**
   * @noinspection SameParameterValue
   */
  private void sendEvent(String eventName, @Nullable WritableMap params) {
    reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, params);
  }

  /**
   * @noinspection unused
   */
  @ReactMethod
  public void addListener(String eventName) {
    // Set up any upstream listeners or background tasks as necessary
  }

  /**
   * @noinspection unused
   */
  @ReactMethod
  public void removeListeners(Integer count) {
    // Remove upstream listeners, stop unnecessary background tasks
  }
}
