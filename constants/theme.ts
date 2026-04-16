export const Colors = {
  primary: '#0B3D2E',
  primaryDark: '#083024',
  accent: '#C89B3C',
  accentSoft: '#E7C98A',
  bg: '#F5F6F3',
  surface: '#FFFFFF',
  surfaceAlt: '#F0F2EE',
  text: '#0F172A',
  textMuted: '#4B5563',
  success: '#0E7C4A',
  successSoft: '#DCF3E6',
  warning: '#D97706',
  warningSoft: '#FEF3C7',
  error: '#B42318',
  errorSoft: '#FEE2E2',
  info: '#1D4ED8',
  infoSoft: '#DBEAFE',
  muted: '#8B95A1',
  border: '#E5E7EB',
  borderStrong: '#CBD5E1',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const Radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  pill: 999,
} as const;

export const Typography = {
  display: 'Inter_700Bold',
  heading: 'Inter_600SemiBold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemibold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
} as const;

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
} as const;
