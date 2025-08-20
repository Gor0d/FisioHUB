export interface ThemeConfig {
  id: string;
  name: string;
  colors: {
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    accent: string;
    accentForeground: string;
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    border: string;
    input: string;
    ring: string;
    muted: string;
    mutedForeground: string;
    destructive: string;
    destructiveForeground: string;
  };
  logo?: string;
  companyName?: string;
  favicon?: string;
}

export const defaultTheme: ThemeConfig = {
  id: 'default',
  name: 'FisioHub Default',
  colors: {
    primary: '218 89% 51%', // Logo Blue (#4F75B8)
    primaryForeground: '210 40% 98%',
    secondary: '218 20% 96%',
    secondaryForeground: '222.2 84% 4.9%',
    accent: '218 20% 96%',
    accentForeground: '222.2 84% 4.9%',
    background: '0 0% 100%',
    foreground: '222.2 84% 4.9%',
    card: '0 0% 100%',
    cardForeground: '222.2 84% 4.9%',
    border: '214.3 31.8% 91.4%',
    input: '214.3 31.8% 91.4%',
    ring: '218 89% 51%',
    muted: '218 20% 96%',
    mutedForeground: '215.4 16.3% 46.9%',
    destructive: '0 84.2% 60.2%',
    destructiveForeground: '210 40% 98%'
  }
};

export const medicalTheme: ThemeConfig = {
  id: 'medical',
  name: 'Medical Green',
  colors: {
    primary: '142 76% 36%', // Medical Green
    primaryForeground: '210 40% 98%',
    secondary: '142 20% 96%',
    secondaryForeground: '222.2 84% 4.9%',
    accent: '142 20% 96%',
    accentForeground: '222.2 84% 4.9%',
    background: '0 0% 100%',
    foreground: '222.2 84% 4.9%',
    card: '0 0% 100%',
    cardForeground: '222.2 84% 4.9%',
    border: '214.3 31.8% 91.4%',
    input: '214.3 31.8% 91.4%',
    ring: '142 76% 36%',
    muted: '142 20% 96%',
    mutedForeground: '215.4 16.3% 46.9%',
    destructive: '0 84.2% 60.2%',
    destructiveForeground: '210 40% 98%'
  }
};

export const corporateTheme: ThemeConfig = {
  id: 'corporate',
  name: 'Corporate Blue',
  colors: {
    primary: '213 94% 68%', // Corporate Blue
    primaryForeground: '210 40% 98%',
    secondary: '213 20% 96%',
    secondaryForeground: '222.2 84% 4.9%',
    accent: '213 20% 96%',
    accentForeground: '222.2 84% 4.9%',
    background: '0 0% 100%',
    foreground: '222.2 84% 4.9%',
    card: '0 0% 100%',
    cardForeground: '222.2 84% 4.9%',
    border: '214.3 31.8% 91.4%',
    input: '214.3 31.8% 91.4%',
    ring: '213 94% 68%',
    muted: '213 20% 96%',
    mutedForeground: '215.4 16.3% 46.9%',
    destructive: '0 84.2% 60.2%',
    destructiveForeground: '210 40% 98%'
  }
};

export const availableThemes = [defaultTheme, medicalTheme, corporateTheme];

export function applyTheme(theme: ThemeConfig) {
  const root = document.documentElement;
  
  Object.entries(theme.colors).forEach(([key, value]) => {
    const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    root.style.setProperty(cssVar, value);
  });
}