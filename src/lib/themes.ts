import type { CityTheme, ThemeKey } from '@/types/audit'

export const themes: Record<ThemeKey, CityTheme> = {
  'los-angeles': {
    key: 'los-angeles',
    label: 'Los Angeles',
    primaryColor: '#1A6FA8',
    secondaryColor: '#F5A623',
    accentColor: '#E8754A',
    backgroundColor: '#FFF9F0',
    cardColor: '#FFFFFF',
    textColor: '#1A2332',
    mutedColor: '#6B7C93',
    emoji: '🌴',
    tagline: 'Sun, surf, and strong SEO.',
  },
  'new-york': {
    key: 'new-york',
    label: 'New York',
    primaryColor: '#1A1A2E',
    secondaryColor: '#F7C948',
    accentColor: '#E63946',
    backgroundColor: '#F2F2F2',
    cardColor: '#FFFFFF',
    textColor: '#0D0D0D',
    mutedColor: '#6B6B6B',
    emoji: '🗽',
    tagline: 'If your SEO can make it here, it can make it anywhere.',
  },
  'miami': {
    key: 'miami',
    label: 'Miami',
    primaryColor: '#0D7377',
    secondaryColor: '#FF6B9D',
    accentColor: '#F7C5A0',
    backgroundColor: '#FFF0F5',
    cardColor: '#FFFFFF',
    textColor: '#1A1A2E',
    mutedColor: '#7B6B7A',
    emoji: '🌊',
    tagline: 'Hot takes. Hotter rankings.',
  },
  'seattle': {
    key: 'seattle',
    label: 'Seattle',
    primaryColor: '#2D6A4F',
    secondaryColor: '#74C69D',
    accentColor: '#52796F',
    backgroundColor: '#F0F4F1',
    cardColor: '#FFFFFF',
    textColor: '#1B2420',
    mutedColor: '#6B7C72',
    emoji: '☕',
    tagline: 'Brewed strong. Ranked higher.',
  },
  default: {
    key: 'default',
    label: 'Your City',
    primaryColor: '#1A6FA8',
    secondaryColor: '#F5A623',
    accentColor: '#E8754A',
    backgroundColor: '#FFF9F0',
    cardColor: '#FFFFFF',
    textColor: '#1A2332',
    mutedColor: '#6B7C93',
    emoji: '📍',
    tagline: 'Local SEO, done right.',
  },
}

// Maps city name input → theme key
// V2 hook: expand this map as more themes are added
const CITY_MAP: Record<string, ThemeKey> = {
  'los angeles': 'los-angeles',
  'la': 'los-angeles',
  'l.a.': 'los-angeles',
  'new york': 'new-york',
  'new york city': 'new-york',
  'nyc': 'new-york',
  'n.y.c.': 'new-york',
  'miami': 'miami',
  'seattle': 'seattle',
}

export function getThemeForCity(city: string): CityTheme {
  const key = CITY_MAP[city.toLowerCase().trim()]
  return themes[key ?? 'default']
}
