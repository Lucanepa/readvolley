package com.openvolley.readvolley;

import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.webkit.WebView;

import androidx.activity.OnBackPressedCallback;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        keepWebViewInsideSystemBars();
        handleBackButton();
    }

    /**
     * Back walks back through the pages the user opened (the app moves
     * between pages with history.pushState). On the first page the app goes
     * to the background instead of closing, so it reopens where it was.
     */
    private void handleBackButton() {
        WebView webView = getBridge().getWebView();
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack();
                } else {
                    moveTaskToBack(true);
                }
            }
        });
    }

    /**
     * Android 15+ draws every app edge-to-edge, and older WebViews report
     * env(safe-area-inset-*) as 0, so the page would sit under the status and
     * navigation bars. Pad the WebView natively instead; the strips behind the
     * bars show the page background (dark icons: SystemBars style LIGHT in
     * capacitor.config.json, which also disables Capacitor's own handling).
     */
    private void keepWebViewInsideSystemBars() {
        View container = (View) getBridge().getWebView().getParent();
        container.setBackgroundColor(Color.parseColor("#F5F5F4"));
        ViewCompat.setOnApplyWindowInsetsListener(container, (v, windowInsets) -> {
            Insets bars = windowInsets.getInsets(
                WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout());
            v.setPadding(bars.left, bars.top, bars.right, bars.bottom);
            return WindowInsetsCompat.CONSUMED;
        });
        ViewCompat.requestApplyInsets(container);
    }
}
