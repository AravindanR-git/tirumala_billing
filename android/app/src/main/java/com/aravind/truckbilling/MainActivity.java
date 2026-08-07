package com.aravind.truckbilling;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.WebView;
import android.widget.Toast;

import androidx.core.content.FileProvider;

import com.getcapacitor.BridgeActivity;

import java.io.File;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        WebView webView = getBridge().getWebView();
        webView.addJavascriptInterface(this, "Android");
    }

    // ==========================
    // Open/Print PDF
    // ==========================
    @android.webkit.JavascriptInterface
    public void openPdf(String filePath) {
        try {
            if (filePath.startsWith("file:/")) {
                filePath = filePath.replaceFirst("file:/+", "/");
            }

            File file = new File(filePath);
            if (!file.exists()) {
                Toast.makeText(this, "❌ PDF not found: " + filePath, Toast.LENGTH_LONG).show();
                return;
            }

            Uri uri = FileProvider.getUriForFile(
                    this,
                    this.getPackageName() + ".fileprovider",
                    file
            );

            // 1️⃣ RawBT
            Intent rawbtIntent = new Intent(Intent.ACTION_VIEW);
            rawbtIntent.setDataAndType(uri, "application/pdf");
            rawbtIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            rawbtIntent.setPackage("ru.a402d.rawbtprinter");

            if (rawbtIntent.resolveActivity(getPackageManager()) != null) {
                startActivity(rawbtIntent);
                Toast.makeText(this, "📄 Sending to RawBT...", Toast.LENGTH_SHORT).show();
                return;
            }

            // 2️⃣ Adobe
            Intent adobeIntent = new Intent(Intent.ACTION_VIEW);
            adobeIntent.setDataAndType(uri, "application/pdf");
            adobeIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            adobeIntent.setPackage("com.adobe.reader");

            if (adobeIntent.resolveActivity(getPackageManager()) != null) {
                startActivity(adobeIntent);
                Toast.makeText(this, "📄 Opening in Adobe Acrobat...", Toast.LENGTH_SHORT).show();
                return;
            }

            // 3️⃣ System chooser
            Intent chooser = new Intent(Intent.ACTION_VIEW);
            chooser.setDataAndType(uri, "application/pdf");
            chooser.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);

            startActivity(Intent.createChooser(chooser, "Open PDF with..."));
            Toast.makeText(this, "📄 Choose app to open PDF", Toast.LENGTH_SHORT).show();

        } catch (Exception e) {
            e.printStackTrace();
            Toast.makeText(this, "❌ Failed to open PDF. Install a PDF viewer.", Toast.LENGTH_LONG).show();
        }
    }
}
