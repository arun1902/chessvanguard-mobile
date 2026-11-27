/**
 * Zoho Payments helpers for Expo (WebView widget).
 * Env: EXPO_PUBLIC_ZOHO_ACCOUNT_ID, EXPO_PUBLIC_ZOHO_API_KEY,
 * EXPO_PUBLIC_ZOHO_TEST_MODE, EXPO_PUBLIC_ZOHO_DOMAIN
 * Also mirrored in app.config.ts → Constants.expoConfig.extra for reliability.
 */

import Constants from 'expo-constants';

export type ZohoWidgetConfig = {
  account_id: string;
  domain: string;
  otherOptions: {
    api_key?: string;
    is_test_mode: boolean;
  };
};

export type ZohoCheckoutOptions = {
  payments_session_id: string;
  amount: string;
  currency_code: 'INR';
  currency_symbol?: string;
  description: string;
  business?: string;
  invoice_number?: string;
  address?: {
    name?: string;
    email?: string;
    phone?: string;
  };
};

export type ZohoPaymentSuccess = {
  payment_id: string;
  signature?: string;
  mandate_id?: string;
  message?: string;
};

type ZohoExtra = {
  zohoAccountId?: string;
  zohoApiKey?: string;
  zohoDomain?: string;
  zohoTestMode?: string;
};

const trim = (value?: string | null) => (value ?? '').trim();

function zohoExtra(): ZohoExtra {
  const extra = Constants.expoConfig?.extra;
  return extra && typeof extra === 'object' ? (extra as ZohoExtra) : {};
}

function zohoAccountId(): string {
  return (
    trim(process.env.EXPO_PUBLIC_ZOHO_ACCOUNT_ID) ||
    trim(zohoExtra().zohoAccountId)
  );
}

function zohoApiKey(): string {
  return trim(process.env.EXPO_PUBLIC_ZOHO_API_KEY) || trim(zohoExtra().zohoApiKey);
}

function zohoDomain(): string {
  return trim(process.env.EXPO_PUBLIC_ZOHO_DOMAIN) || trim(zohoExtra().zohoDomain) || 'IN';
}

function zohoTestModeRaw(): string {
  return (
    trim(process.env.EXPO_PUBLIC_ZOHO_TEST_MODE) ||
    trim(zohoExtra().zohoTestMode) ||
    'false'
  ).toLowerCase();
}

export function isZohoConfigured(): boolean {
  return Boolean(zohoAccountId());
}

export function resolveZohoWidgetConfig(): ZohoWidgetConfig {
  const accountId = zohoAccountId();
  const apiKey = zohoApiKey();
  const domain = zohoDomain();
  const testModeRaw = zohoTestModeRaw();

  if (!accountId) {
    throw new Error('EXPO_PUBLIC_ZOHO_ACCOUNT_ID is required for Zoho checkout.');
  }

  if (testModeRaw && testModeRaw !== 'true' && testModeRaw !== 'false') {
    throw new Error('EXPO_PUBLIC_ZOHO_TEST_MODE must be "true" or "false".');
  }

  const isTestMode = testModeRaw === 'true';
  if (isTestMode && !apiKey) {
    throw new Error('Zoho test mode requires EXPO_PUBLIC_ZOHO_API_KEY.');
  }

  return {
    account_id: accountId,
    domain,
    otherOptions: {
      is_test_mode: isTestMode,
      ...(apiKey ? { api_key: apiKey } : {}),
    },
  };
}

/** Amount is stored in rupees; Zoho expects a 2-decimal rupee string. */
export function formatAmountForZoho(rupees: number): string {
  return Number(rupees).toFixed(2);
}

export function formatPhoneForZoho(phone?: string | null): string | undefined {
  if (!phone) return undefined;
  const digits = phone.replace(/\D/g, '');
  if (!digits) return undefined;
  if (digits.startsWith('91') && digits.length >= 12) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  return `+${digits}`;
}

export function zohoErrorMessage(error: { code?: string; message?: string } | null | undefined): string {
  const code = error?.code;
  if (code === 'widget_closed') return 'Payment cancelled';
  if (code === 'session_expired') return 'Payment session expired. Please try again.';
  if (code === 'invalid_payment_session') return 'Invalid payment session. Please start over.';
  if (code === 'paymentmethods_validation') return 'Payment methods not enabled. Contact support.';
  if (code === 'widget_validation_error') return 'Payment error. Please try again.';
  return error?.message || 'Payment failed. Please try again.';
}

/** HTML document that loads zpayments.js and runs checkout, posting results to RN. */
export function buildZohoCheckoutHtml(
  config: ZohoWidgetConfig,
  options: ZohoCheckoutOptions,
): string {
  const payload = JSON.stringify({ config, options });
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <title>ChessVanguard Payment</title>
  <style>
    html, body { margin: 0; padding: 0; background: #0B1F3A; color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    #status { padding: 24px 20px; text-align: center; font-size: 15px; line-height: 1.5; }
  </style>
  <script src="https://static.zohocdn.com/zpay/zpay-js/v1/zpayments.js"></script>
</head>
<body>
  <div id="status">Opening secure Zoho checkout…</div>
  <script>
    (function () {
      var DATA = ${payload};

      function post(msg) {
        try {
          if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
            window.ReactNativeWebView.postMessage(JSON.stringify(msg));
          }
        } catch (e) {}
      }

      function setStatus(text) {
        var el = document.getElementById('status');
        if (el) el.textContent = text;
      }

      async function run() {
        try {
          if (!window.ZPayments) {
            throw { code: 'script_missing', message: 'Zoho Payments script failed to load.' };
          }
          var instance = new window.ZPayments(DATA.config);
          setStatus('Complete payment in the checkout window.');
          var result = await instance.requestPaymentMethod(DATA.options);
          post({ type: 'success', result: result || {} });
          try { await instance.close(); } catch (e) {}
        } catch (err) {
          var code = (err && err.code) || 'payment_failed';
          var message = (err && err.message) || 'Payment failed';
          post({ type: 'error', code: code, message: message });
        }
      }

      if (document.readyState === 'complete') run();
      else window.addEventListener('load', run);
    })();
  </script>
</body>
</html>`;
}
