import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Loads EXPO_PUBLIC_* into the Expo config so the app can read them
 * reliably via Constants (and process.env after a clean Metro start).
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  const apiUrl =
    process.env.EXPO_PUBLIC_API_URL?.trim() || 'http://10.0.2.2:5000/api/v1';
  const zohoAccountId = process.env.EXPO_PUBLIC_ZOHO_ACCOUNT_ID?.trim() || '';
  const zohoApiKey = process.env.EXPO_PUBLIC_ZOHO_API_KEY?.trim() || '';
  const zohoDomain = process.env.EXPO_PUBLIC_ZOHO_DOMAIN?.trim() || 'IN';
  const zohoTestMode = process.env.EXPO_PUBLIC_ZOHO_TEST_MODE?.trim() || 'false';

  return {
    ...config,
    name: config.name ?? 'chessvanguard-mobile',
    slug: config.slug ?? 'chessvanguard-mobile',
    extra: {
      ...(typeof config.extra === 'object' && config.extra ? config.extra : {}),
      apiUrl,
      zohoAccountId,
      zohoApiKey,
      zohoDomain,
      zohoTestMode,
      eas: config.extra && typeof config.extra === 'object' ? (config.extra as { eas?: unknown }).eas : undefined,
    },
  };
};
