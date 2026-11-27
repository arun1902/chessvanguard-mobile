import { Alert, Linking } from 'react-native';

const DEFAULT_SUPPORT_WHATSAPP = process.env.EXPO_PUBLIC_SUPPORT_WHATSAPP?.replace(/\D/g, '') ?? '';

export async function openWhatsAppSupport(message: string, phoneDigits = DEFAULT_SUPPORT_WHATSAPP) {
  const text = message.trim();
  if (!text) return;

  if (!phoneDigits) {
    Alert.alert(
      'Support unavailable',
      'WhatsApp support number is not configured. Set EXPO_PUBLIC_SUPPORT_WHATSAPP in your .env.'
    );
    return;
  }

  const url = `https://wa.me/${phoneDigits}?text=${encodeURIComponent(text)}`;
  try {
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      Alert.alert('Unable to open WhatsApp', 'Please install WhatsApp and try again.');
      return;
    }
    await Linking.openURL(url);
  } catch {
    Alert.alert('Unable to open WhatsApp', 'Please try again in a moment.');
  }
}
