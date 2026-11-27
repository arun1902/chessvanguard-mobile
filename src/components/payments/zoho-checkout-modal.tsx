import { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import { Brand } from '@/constants/brand';
import {
  buildZohoCheckoutHtml,
  resolveZohoWidgetConfig,
  zohoErrorMessage,
  type ZohoCheckoutOptions,
  type ZohoPaymentSuccess,
} from '@/utils/zoho-payments';

type ZohoCheckoutModalProps = {
  visible: boolean;
  title?: string;
  options: ZohoCheckoutOptions | null;
  onSuccess: (result: ZohoPaymentSuccess) => void;
  onCancel: () => void;
  onError: (message: string) => void;
};

type BridgeMessage =
  | { type: 'success'; result: ZohoPaymentSuccess }
  | { type: 'error'; code?: string; message?: string };

export function ZohoCheckoutModal({
  visible,
  title = 'Secure Payment',
  options,
  onSuccess,
  onCancel,
  onError,
}: ZohoCheckoutModalProps) {
  const [loading, setLoading] = useState(true);
  const settledRef = useRef(false);

  const html = useMemo(() => {
    if (!visible || !options) return null;
    try {
      return buildZohoCheckoutHtml(resolveZohoWidgetConfig(), options);
    } catch (err) {
      return null;
    }
  }, [visible, options]);

  const configError = useMemo(() => {
    if (!visible || !options) return null;
    try {
      resolveZohoWidgetConfig();
      return null;
    } catch (err) {
      return err instanceof Error ? err.message : 'Zoho Payments is not configured.';
    }
  }, [visible, options]);

  const handleMessage = (event: WebViewMessageEvent) => {
    if (settledRef.current) return;
    let payload: BridgeMessage | null = null;
    try {
      payload = JSON.parse(event.nativeEvent.data) as BridgeMessage;
    } catch {
      return;
    }

    if (payload.type === 'success') {
      settledRef.current = true;
      onSuccess(payload.result || { payment_id: '' });
      return;
    }

    if (payload.type === 'error') {
      settledRef.current = true;
      if (payload.code === 'widget_closed') {
        onCancel();
        return;
      }
      onError(zohoErrorMessage(payload));
    }
  };

  const handleClose = () => {
    if (settledRef.current) return;
    settledRef.current = true;
    onCancel();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Pressable onPress={handleClose} hitSlop={12} accessibilityRole="button">
            <Text style={styles.close}>Close</Text>
          </Pressable>
        </View>

        {configError || !html ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>
              {configError || 'Unable to start Zoho checkout. Check EXPO_PUBLIC_ZOHO_* env vars.'}
            </Text>
            <Pressable style={styles.retryBtn} onPress={handleClose}>
              <Text style={styles.retryText}>Close</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.webWrap}>
            {loading ? (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator color={Brand.gold} size="large" />
                <Text style={styles.loadingText}>Loading Zoho Payments…</Text>
              </View>
            ) : null}
            <WebView
              key={options?.payments_session_id || 'zoho'}
              originWhitelist={['*']}
              source={{
                html,
                baseUrl: 'https://payments.zoho.in',
              }}
              onLoadStart={() => {
                settledRef.current = false;
                setLoading(true);
              }}
              onLoadEnd={() => setLoading(false)}
              onMessage={handleMessage}
              javaScriptEnabled
              domStorageEnabled
              startInLoadingState
              setSupportMultipleWindows={false}
              mixedContentMode="always"
              style={styles.webview}
            />
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Brand.navy,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  title: {
    color: Brand.white,
    fontSize: 16,
    fontWeight: '700',
  },
  close: {
    color: Brand.gold,
    fontSize: 15,
    fontWeight: '600',
  },
  webWrap: {
    flex: 1,
    backgroundColor: Brand.white,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: Brand.navy,
  },
  loadingText: {
    color: Brand.white,
    fontSize: 14,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  errorText: {
    color: Brand.white,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: Brand.gold,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  retryText: {
    color: Brand.navy,
    fontWeight: '700',
  },
});
