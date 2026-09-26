export interface CurrencyCountry {
  code: string;
  name: string;
  flag: string;
  currency: string;
  currencySymbol: string;
  dialCode: string;
  rateFromUSD: number;
}

export const eastAfricanCountries: CurrencyCountry[] = [
  { code: 'US', name: 'United States', flag: '🇺🇸', currency: 'USD', currencySymbol: '$', dialCode: '+1', rateFromUSD: 1 },
  { code: 'UG', name: 'Uganda', flag: '🇺🇬', currency: 'UGX', currencySymbol: 'USh', dialCode: '+256', rateFromUSD: 3780 },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', currency: 'KES', currencySymbol: 'KSh', dialCode: '+254', rateFromUSD: 129 },
  { code: 'TZ', name: 'Tanzania', flag: '🇹🇿', currency: 'TZS', currencySymbol: 'TSh', dialCode: '+255', rateFromUSD: 2540 },
  { code: 'RW', name: 'Rwanda', flag: '🇷🇼', currency: 'RWF', currencySymbol: 'RF', dialCode: '+250', rateFromUSD: 1280 },
  { code: 'BI', name: 'Burundi', flag: '🇧🇮', currency: 'BIF', currencySymbol: 'FBu', dialCode: '+257', rateFromUSD: 2860 },
  { code: 'SS', name: 'South Sudan', flag: '🇸🇸', currency: 'SSP', currencySymbol: 'SSP', dialCode: '+211', rateFromUSD: 600 },
  { code: 'ET', name: 'Ethiopia', flag: '🇪🇹', currency: 'ETB', currencySymbol: 'Br', dialCode: '+251', rateFromUSD: 128 },
  { code: 'SO', name: 'Somalia', flag: '🇸🇴', currency: 'SOS', currencySymbol: 'SoSh', dialCode: '+252', rateFromUSD: 571 },
  { code: 'CD', name: 'DR Congo', flag: '🇨🇩', currency: 'CDF', currencySymbol: 'FC', dialCode: '+243', rateFromUSD: 2750 },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', currency: 'NGN', currencySymbol: '₦', dialCode: '+234', rateFromUSD: 1580 },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭', currency: 'GHS', currencySymbol: 'GH₵', dialCode: '+233', rateFromUSD: 15 },
  { code: 'SN', name: 'Senegal', flag: '🇸🇳', currency: 'XOF', currencySymbol: 'CFA', dialCode: '+221', rateFromUSD: 600 },
  { code: 'MW', name: 'Malawi', flag: '🇲🇼', currency: 'MWK', currencySymbol: 'MK', dialCode: '+265', rateFromUSD: 1740 },
  { code: 'ZM', name: 'Zambia', flag: '🇿🇲', currency: 'ZMW', currencySymbol: 'ZK', dialCode: '+260', rateFromUSD: 26 },
  { code: 'ZW', name: 'Zimbabwe', flag: '🇿🇼', currency: 'ZWL', currencySymbol: 'ZWL', dialCode: '+263', rateFromUSD: 360 },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', currency: 'CAD', currencySymbol: 'C$', dialCode: '+1', rateFromUSD: 1.36 },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', currencySymbol: '£', dialCode: '+44', rateFromUSD: 0.79 },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', currency: 'AUD', currencySymbol: 'A$', dialCode: '+61', rateFromUSD: 1.52 },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', currency: 'NZD', currencySymbol: 'NZ$', dialCode: '+64', rateFromUSD: 1.64 },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', currency: 'EUR', currencySymbol: '€', dialCode: '+49', rateFromUSD: 0.92 },
  { code: 'FR', name: 'France', flag: '🇫🇷', currency: 'EUR', currencySymbol: '€', dialCode: '+33', rateFromUSD: 0.92 },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', currency: 'EUR', currencySymbol: '€', dialCode: '+31', rateFromUSD: 0.92 },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪', currency: 'EUR', currencySymbol: '€', dialCode: '+353', rateFromUSD: 0.92 },
  { code: 'NO', name: 'Norway', flag: '🇳🇴', currency: 'NOK', currencySymbol: 'kr', dialCode: '+47', rateFromUSD: 10.8 },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', currency: 'SEK', currencySymbol: 'kr', dialCode: '+46', rateFromUSD: 10.5 },
  { code: 'FI', name: 'Finland', flag: '🇫🇮', currency: 'EUR', currencySymbol: '€', dialCode: '+358', rateFromUSD: 0.92 },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰', currency: 'DKK', currencySymbol: 'kr', dialCode: '+45', rateFromUSD: 6.8 },
  { code: 'PL', name: 'Poland', flag: '🇵🇱', currency: 'PLN', currencySymbol: 'zł', dialCode: '+48', rateFromUSD: 4.0 },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', currency: 'JPY', currencySymbol: '¥', dialCode: '+81', rateFromUSD: 149 },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', currency: 'KRW', currencySymbol: '₩', dialCode: '+82', rateFromUSD: 1330 },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', currency: 'SGD', currencySymbol: 'S$', dialCode: '+65', rateFromUSD: 1.34 },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', currency: 'AED', currencySymbol: 'AED', dialCode: '+971', rateFromUSD: 3.67 },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦', currency: 'QAR', currencySymbol: 'QR', dialCode: '+974', rateFromUSD: 3.64 },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', currency: 'SAR', currencySymbol: 'SR', dialCode: '+966', rateFromUSD: 3.75 },
  { code: 'OM', name: 'Oman', flag: '🇴🇲', currency: 'OMR', currencySymbol: 'OMR', dialCode: '+968', rateFromUSD: 0.385 },
  { code: 'KW', name: 'Kuwait', flag: '🇰🇼', currency: 'KWD', currencySymbol: 'KD', dialCode: '+965', rateFromUSD: 0.31 },
  { code: 'BH', name: 'Bahrain', flag: '🇧🇭', currency: 'BHD', currencySymbol: 'BD', dialCode: '+973', rateFromUSD: 0.376 },
];

export const defaultCountry = eastAfricanCountries.find(c => c.code === 'KE') || eastAfricanCountries[0];

export function getCountryByCode(code: string): CurrencyCountry {
  return eastAfricanCountries.find((c) => c.code === code) || defaultCountry;
}

export function getCountryByName(name: string): CurrencyCountry | undefined {
  const normalizedName = name.trim().toLowerCase();
  return eastAfricanCountries.find((c) => c.name.toLowerCase() === normalizedName || c.code.toLowerCase() === normalizedName);
}

export function convertFromUSD(usdAmount: number, currency: string): { amount: number; symbol: string; formatted: string } {
  const country = eastAfricanCountries.find((c) => c.currency === currency);
  if (!country) return { amount: usdAmount, symbol: '$', formatted: `$${usdAmount.toLocaleString()}` };
  const converted = Math.round(usdAmount * country.rateFromUSD);
  return { amount: converted, symbol: country.currencySymbol, formatted: `${country.currencySymbol} ${converted.toLocaleString()}` };
}

export function formatCurrency(usdAmount: number, country: CurrencyCountry): string {
  const converted = Math.round(usdAmount * country.rateFromUSD);
  return `${country.currencySymbol} ${converted.toLocaleString()}`;
}
