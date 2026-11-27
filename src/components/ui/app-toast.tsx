import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Brand } from '@/constants/brand';

type ToastTone = 'success' | 'error';

type ToastState = {
  id: number;
  message: string;
  tone: ToastTone;
};

type ToastContextValue = {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;
  const insets = useSafeAreaInsets();

  const clearHideTimer = () => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  };

  const hide = useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 16, duration: 180, useNativeDriver: true }),
    ]).start(() => setToast(null));
  }, [opacity, translateY]);

  const show = useCallback(
    (message: string, tone: ToastTone) => {
      clearHideTimer();
      setToast({ id: Date.now(), message, tone });
      opacity.setValue(0);
      translateY.setValue(16);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start();
      hideTimer.current = setTimeout(hide, 2800);
    },
    [hide, opacity, translateY]
  );

  useEffect(() => () => clearHideTimer(), []);

  const value = useMemo<ToastContextValue>(
    () => ({
      showSuccess: (message) => show(message, 'success'),
      showError: (message) => show(message, 'error'),
    }),
    [show]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.wrap,
            {
              bottom: Math.max(insets.bottom, 12) + 12,
              opacity,
              transform: [{ translateY }],
            },
          ]}>
          <View style={[styles.toast, toast.tone === 'error' ? styles.toastError : styles.toastSuccess]}>
            <View style={[styles.accent, toast.tone === 'error' ? styles.accentError : styles.accentSuccess]} />
            <View style={[styles.icon, toast.tone === 'error' ? styles.iconError : styles.iconSuccess]}>
              <Text style={styles.iconText}>{toast.tone === 'error' ? '!' : '✓'}</Text>
            </View>
            <Text style={styles.message} numberOfLines={3}>
              {toast.message}
            </Text>
          </View>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 1000,
    alignItems: 'center',
  },
  toast: {
    maxWidth: 420,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Brand.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Brand.border,
    paddingVertical: 12,
    paddingRight: 14,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  toastSuccess: {},
  toastError: {},
  accent: {
    width: 4,
    alignSelf: 'stretch',
  },
  accentSuccess: {
    backgroundColor: '#22C55E',
  },
  accentError: {
    backgroundColor: Brand.error,
  },
  icon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  iconSuccess: {
    backgroundColor: '#111827',
  },
  iconError: {
    backgroundColor: Brand.error,
  },
  iconText: {
    color: Brand.white,
    fontSize: 12,
    fontWeight: '800',
  },
  message: {
    flex: 1,
    color: Brand.navy,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 19,
  },
});
