package com.sonobuddy.app;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @Override
    public void onStart() {
        super.onStart();
        // Inject custom user agent so web layer can detect native Android app
        WebView webView = getBridge().getWebView();
        WebSettings settings = webView.getSettings();
        String defaultUA = settings.getUserAgentString();
        settings.setUserAgentString(defaultUA + " SonoBuddyApp/Android");
    }
}
