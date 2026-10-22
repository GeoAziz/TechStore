import { SupportedCurrency } from '../contracts/money';

export type JourneyIntent =
  | 'window_shopper'       // Browse only
  | 'cart_abandoner'       // View -> Add -> Abandon
  | 'checkout_abandoner'   // View -> Add -> Begin Checkout -> Abandon
  | 'successful_buyer';    // View -> Add -> Begin Checkout -> Purchase

export type ConsentStatus = 'granted' | 'denied';

export interface Persona {
  readonly id: string;
  readonly name: string;
  readonly intent: JourneyIntent;
  readonly consent: ConsentStatus;
  readonly currency: SupportedCurrency;
  readonly device: 'desktop' | 'mobile' | 'tablet';
}

export const ARCHETYPAL_PERSONAS: readonly Persona[] = [
  {
    id: 'persona_buyer_kes',
    name: 'Zizo Power Buyer (Granted, Successful, KES)',
    intent: 'successful_buyer',
    consent: 'granted',
    currency: 'KES',
    device: 'desktop',
  },
  {
    id: 'persona_window_kes',
    name: 'Casual Browser (Granted, Window Shopper, KES)',
    intent: 'window_shopper',
    consent: 'granted',
    currency: 'KES',
    device: 'mobile',
  },
  {
    id: 'persona_cart_abandoner_kes',
    name: 'Cart Abandoner (Granted, KES)',
    intent: 'cart_abandoner',
    consent: 'granted',
    currency: 'KES',
    device: 'desktop',
  },
  {
    id: 'persona_consent_denier',
    name: 'Privacy Focused Shopper (Denied Consent, KES)',
    intent: 'successful_buyer',
    consent: 'denied',
    currency: 'KES',
    device: 'mobile',
  },
];
