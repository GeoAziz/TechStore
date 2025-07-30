// Customer type definition (replace import if module is missing)
export type Customer = { 
  name: string; 
  email: string; 
  role: string; 
  status: string; 
  segment?: string; 
  failedLoginAttempts?: number; 
  flagged?: boolean; 
};

export function flagSuspiciousCustomer(customer: Customer): boolean {
  // Example: flag if email is suspicious or multiple failed logins
  if ((customer.failedLoginAttempts ?? 0) > 5 || /test|fake|spam/.test(customer.email)) {
    customer.flagged = true;
    return true;
  }
  return false;
}

export function isCustomerFlagged(customer: Customer): boolean {
  return !!customer.flagged;
}
