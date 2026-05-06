import { Platform } from 'react-native';

const tintColorLight = '#3B82F6';
const tintColorDark = '#60A5FA';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export type AppColorScheme = {
  fresh: string;
  expiring: string;
  expired: string;
  primary: string;
  cardBackground: string;
  screenBackground: string;
  separator: string;
  secondaryText: string;
  primaryText: string;
  inputBackground: string;
  navBackground: string;
};

export function getAppColors(scheme: 'light' | 'dark'): AppColorScheme {
  if (scheme === 'dark') {
    return {
      fresh: '#66BB6A',
      expiring: '#FFA726',
      expired: '#EF5350',
      primary: '#60A5FA',
      cardBackground: '#1C1C1E',
      screenBackground: '#000000',
      separator: '#38383A',
      secondaryText: '#8E8E93',
      primaryText: '#FFFFFF',
      inputBackground: '#2C2C2E',
      navBackground: '#1C1C1E',
    };
  }
  return {
    fresh: '#4CAF50',
    expiring: '#FF9800',
    expired: '#F44336',
    primary: '#3B82F6',
    cardBackground: '#FFFFFF',
    screenBackground: '#F2F2F7',
    separator: '#E5E5EA',
    secondaryText: '#8E8E93',
    primaryText: '#1C1C1E',
    inputBackground: '#FFFFFF',
    navBackground: '#FFFFFF',
  };
}

// Legacy static export — kept for backward compat during migration
export const AppColors = getAppColors('light');

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
