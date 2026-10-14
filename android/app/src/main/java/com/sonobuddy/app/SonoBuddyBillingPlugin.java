package com.sonobuddy.app;

import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Build;

import androidx.core.content.ContextCompat;

import com.android.billingclient.api.AcknowledgePurchaseParams;
import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.android.billingclient.api.QueryPurchasesParams;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.Collections;
import java.util.List;

/**
 * Android counterpart to PurchaseManager.swift / WebView.swift's "sonobuddy"
 * message handler. Same two non-consumable products, same unlock semantics —
 * usePremium.ts calls this plugin on Android instead of
 * window.webkit.messageHandlers.sonobuddy, then drives the exact same
 * window.__onPremiumUnlocked / window.__onPurchaseError callbacks either way,
 * so the rest of the web layer doesn't need to know which platform it's on.
 */
@CapacitorPlugin(name = "SonoBuddyBilling")
public class SonoBuddyBillingPlugin extends Plugin implements PurchasesUpdatedListener {

    static final String PRODUCT_ID = "app.sonobuddy.unlock";
    static final String DISCOUNT_PRODUCT_ID = "app.sonobuddy.unlock.share";
    private static final String SHARE_COMPLETE_ACTION = "com.sonobuddy.app.SHARE_CHOSEN";

    private BillingClient billingClient;
    private PluginCall pendingPurchaseCall;
    private PluginCall pendingShareCall;

    @Override
    public void load() {
        billingClient = BillingClient.newBuilder(getContext())
                .setListener(this)
                .enablePendingPurchases()
                .build();
        billingClient.startConnection(new BillingClientStateListener() {
            @Override
            public void onBillingSetupFinished(BillingResult billingResult) {
                // No-op — purchase()/restore() each check connection state implicitly
                // by just trying the call; Billing Library queues briefly if needed.
            }

            @Override
            public void onBillingServiceDisconnected() {
                // Library reconnects automatically on the next call.
            }
        });
    }

    @PluginMethod
    public void purchase(PluginCall call) {
        launchPurchase(call, PRODUCT_ID);
    }

    @PluginMethod
    public void purchaseDiscount(PluginCall call) {
        launchPurchase(call, DISCOUNT_PRODUCT_ID);
    }

    private void launchPurchase(PluginCall call, String productId) {
        if (pendingPurchaseCall != null) {
            call.reject("A purchase is already in progress — please wait.");
            return;
        }
        pendingPurchaseCall = call;

        QueryProductDetailsParams.Product product = QueryProductDetailsParams.Product.newBuilder()
                .setProductId(productId)
                .setProductType(BillingClient.ProductType.INAPP)
                .build();
        QueryProductDetailsParams params = QueryProductDetailsParams.newBuilder()
                .setProductList(Collections.singletonList(product))
                .build();

        billingClient.queryProductDetailsAsync(params, (billingResult, productDetailsList) -> {
            if (billingResult.getResponseCode() != BillingClient.BillingResponseCode.OK
                    || productDetailsList == null || productDetailsList.isEmpty()) {
                PluginCall c = pendingPurchaseCall;
                pendingPurchaseCall = null;
                if (c != null) c.reject("That's not available yet — try again in a moment.");
                return;
            }

            ProductDetails productDetails = productDetailsList.get(0);
            BillingFlowParams.ProductDetailsParams productDetailsParams =
                    BillingFlowParams.ProductDetailsParams.newBuilder()
                            .setProductDetails(productDetails)
                            .build();
            BillingFlowParams flowParams = BillingFlowParams.newBuilder()
                    .setProductDetailsParamsList(Collections.singletonList(productDetailsParams))
                    .build();

            getActivity().runOnUiThread(() -> billingClient.launchBillingFlow(getActivity(), flowParams));
        });
    }

    @Override
    public void onPurchasesUpdated(BillingResult billingResult, List<Purchase> purchases) {
        PluginCall call = pendingPurchaseCall;
        pendingPurchaseCall = null;
        if (call == null) return;

        int code = billingResult.getResponseCode();
        if (code == BillingClient.BillingResponseCode.USER_CANCELED) {
            // Matches iOS's .userCancelled — not a failure, no grant, no error shown.
            JSObject ret = new JSObject();
            ret.put("cancelled", true);
            call.resolve(ret);
            return;
        }
        if (code != BillingClient.BillingResponseCode.OK || purchases == null || purchases.isEmpty()) {
            call.reject("Something went wrong — please try again.");
            return;
        }

        for (Purchase purchase : purchases) {
            if (purchase.getPurchaseState() == Purchase.PurchaseState.PENDING) {
                call.reject("Your purchase needs approval — it'll unlock automatically once approved.");
                return;
            }
            if (purchase.getPurchaseState() == Purchase.PurchaseState.PURCHASED) {
                acknowledgeIfNeeded(purchase);
                JSObject ret = new JSObject();
                ret.put("success", true);
                call.resolve(ret);
                return;
            }
        }
        call.reject("Something went wrong — please try again.");
    }

    private void acknowledgeIfNeeded(Purchase purchase) {
        if (!purchase.isAcknowledged()) {
            AcknowledgePurchaseParams params = AcknowledgePurchaseParams.newBuilder()
                    .setPurchaseToken(purchase.getPurchaseToken())
                    .build();
            billingClient.acknowledgePurchase(params, billingResult -> { /* best-effort */ });
        }
    }

    /**
     * Shared by both restore() and checkStatus() — Play's local purchase
     * cache is already server-reconciled, so there's no separate "sync then
     * check" step the way iOS splits AppStore.sync() from checkStatus().
     */
    @PluginMethod
    public void restore(PluginCall call) {
        queryOwnership(call);
    }

    @PluginMethod
    public void checkStatus(PluginCall call) {
        queryOwnership(call);
    }

    private void queryOwnership(PluginCall call) {
        QueryPurchasesParams params = QueryPurchasesParams.newBuilder()
                .setProductType(BillingClient.ProductType.INAPP)
                .build();
        billingClient.queryPurchasesAsync(params, (billingResult, purchases) -> {
            boolean owns = false;
            if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                for (Purchase purchase : purchases) {
                    if (purchase.getPurchaseState() == Purchase.PurchaseState.PURCHASED
                            && (purchase.getProducts().contains(PRODUCT_ID)
                            || purchase.getProducts().contains(DISCOUNT_PRODUCT_ID))) {
                        acknowledgeIfNeeded(purchase);
                        owns = true;
                    }
                }
            }
            JSObject ret = new JSObject();
            ret.put("success", owns);
            call.resolve(ret);
        });
    }

    /**
     * Android has no built-in "did the user actually complete the share"
     * signal the way iOS's UIActivityViewController completion handler does.
     * EXTRA_CHOSEN_COMPONENT_INTENT_SENDER is the standard workaround: it
     * fires only once a target app is actually picked, never on back-out —
     * matching the iOS behavior this mirrors (cancelling leaves the
     * discount locked, no silent unlock for someone who backed out).
     */
    @PluginMethod
    public void share(PluginCall call) {
        if (pendingShareCall != null) {
            call.reject("Share already in progress.");
            return;
        }
        pendingShareCall = call;

        String shareText = "I've been using SonoBuddy for ultrasound reference on the job — "
                + "measurements, protocols, calculators, and pathology, all offline. Worth a look: "
                + "https://play.google.com/store/apps/details?id=" + getContext().getPackageName();

        Intent sendIntent = new Intent(Intent.ACTION_SEND);
        sendIntent.setType("text/plain");
        sendIntent.putExtra(Intent.EXTRA_TEXT, shareText);
        Intent chooserIntent = Intent.createChooser(sendIntent, "Share SonoBuddy");

        Intent receiverIntent = new Intent(SHARE_COMPLETE_ACTION).setPackage(getContext().getPackageName());
        PendingIntent pendingIntent = PendingIntent.getBroadcast(
                getContext(), 0, receiverIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_MUTABLE
        );
        chooserIntent.putExtra(Intent.EXTRA_CHOSEN_COMPONENT_INTENT_SENDER, pendingIntent.getIntentSender());

        BroadcastReceiver receiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                try {
                    context.unregisterReceiver(this);
                } catch (IllegalArgumentException ignored) { /* already unregistered */ }
                PluginCall c = pendingShareCall;
                pendingShareCall = null;
                if (c != null) {
                    JSObject ret = new JSObject();
                    ret.put("completed", true);
                    c.resolve(ret);
                }
            }
        };

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            ContextCompat.registerReceiver(getContext(), receiver, new IntentFilter(SHARE_COMPLETE_ACTION),
                    ContextCompat.RECEIVER_NOT_EXPORTED);
        } else {
            getContext().registerReceiver(receiver, new IntentFilter(SHARE_COMPLETE_ACTION));
        }

        getActivity().startActivity(chooserIntent);
    }
}
