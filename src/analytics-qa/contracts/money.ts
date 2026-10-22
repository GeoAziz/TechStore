export type SupportedCurrency = 'KES' | 'USD';

export class Money {
  readonly cents: number;
  readonly currency: SupportedCurrency;

  private constructor(cents: number, currency: SupportedCurrency) {
    if (!Number.isSafeInteger(cents) || cents < 0) {
      throw new Error(`[Money Error] Cents must be a non-negative safe integer. Received: ${cents}`);
    }
    this.cents = cents;
    this.currency = currency;
  }

  static fromCents(cents: number, currency: SupportedCurrency = 'KES'): Money {
    this.validateCurrency(currency);
    return new Money(cents, currency);
  }

  static fromDecimal(decimal: number, currency: SupportedCurrency = 'KES'): Money {
    this.validateCurrency(currency);
    if (typeof decimal !== 'number' || isNaN(decimal) || !isFinite(decimal)) {
      throw new Error(`[Money Error] Invalid decimal monetary value: ${decimal}`);
    }
    const cents = Math.round(decimal * 100);
    return new Money(cents, currency);
  }

  private static validateCurrency(currency: string): asserts currency is SupportedCurrency {
    if (currency !== 'KES' && currency !== 'USD') {
      throw new Error(`[Money Error] Unsupported currency: ${currency}. Only KES and USD are allowed.`);
    }
  }

  toDecimal(): number {
    return Number((this.cents / 100).toFixed(2));
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    const sum = this.cents + other.cents;
    if (!Number.isSafeInteger(sum)) {
      throw new Error(`[Money Error] Integer overflow adding moneys: ${this.cents} + ${other.cents}`);
    }
    return new Money(sum, this.currency);
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    const diff = this.cents - other.cents;
    if (diff < 0) {
      throw new Error(`[Money Error] Subtraction results in negative money: ${this.cents} - ${other.cents}`);
    }
    return new Money(diff, this.currency);
  }

  multiply(quantity: number): Money {
    if (!Number.isSafeInteger(quantity) || quantity < 0) {
      throw new Error(`[Money Error] Quantity must be a non-negative safe integer: ${quantity}`);
    }
    const product = this.cents * quantity;
    if (!Number.isSafeInteger(product)) {
      throw new Error(`[Money Error] Integer overflow multiplying money: ${this.cents} * ${quantity}`);
    }
    return new Money(product, this.currency);
  }

  equals(other: Money): boolean {
    return this.currency === other.currency && this.cents === other.cents;
  }

  private assertSameCurrency(other: Money) {
    if (this.currency !== other.currency) {
      throw new Error(`[Money Error] Currency mismatch: ${this.currency} vs ${other.currency}`);
    }
  }
}
