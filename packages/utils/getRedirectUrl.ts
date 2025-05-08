// packages/utils/getRedirectUrl.ts
import { Platform } from 'react-native'

export const getRedirectUrl = () => {
  const isWeb = typeof window !== 'undefined'

  if (!isWeb && Platform.OS !== 'web') {
    return 'laburando://auth/callback'
  }

  const hostname = window?.location?.hostname

  if (hostname === 'localhost') {
    return 'http://localhost:3000/auth/callback'
  }

  return 'https://tuapp.com/auth/callback' // <--- ajustalo a tu dominio real
}
