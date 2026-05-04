// Comprehensive list of Indian banks for the bank name searchable dropdown.
// Covers PSU, private, small-finance, payments, regional rural, and foreign banks.

export type BankCategory =
  | 'psu'
  | 'private'
  | 'small-finance'
  | 'payments'
  | 'rrb'
  | 'cooperative'
  | 'foreign';

export interface IndianBank {
  ifscPrefix: string;  // First 4 chars of IFSC, used for badge color + IFSC auto-detect
  name: string;
  category: BankCategory;
}

export const INDIAN_BANKS: IndianBank[] = [
  // ── Public Sector Banks ────────────────────────────────────────────────────
  { ifscPrefix: 'SBIN', name: 'State Bank of India',       category: 'psu' },
  { ifscPrefix: 'PUNB', name: 'Punjab National Bank',      category: 'psu' },
  { ifscPrefix: 'BARB', name: 'Bank of Baroda',            category: 'psu' },
  { ifscPrefix: 'CNRB', name: 'Canara Bank',               category: 'psu' },
  { ifscPrefix: 'UBIN', name: 'Union Bank of India',       category: 'psu' },
  { ifscPrefix: 'IDIB', name: 'Indian Bank',               category: 'psu' },
  { ifscPrefix: 'CBIN', name: 'Central Bank of India',     category: 'psu' },
  { ifscPrefix: 'BKID', name: 'Bank of India',             category: 'psu' },
  { ifscPrefix: 'UCBA', name: 'UCO Bank',                  category: 'psu' },
  { ifscPrefix: 'MAHB', name: 'Bank of Maharashtra',       category: 'psu' },
  { ifscPrefix: 'PSIB', name: 'Punjab & Sind Bank',        category: 'psu' },
  { ifscPrefix: 'IOBA', name: 'Indian Overseas Bank',      category: 'psu' },

  // ── Private Banks ──────────────────────────────────────────────────────────
  { ifscPrefix: 'HDFC', name: 'HDFC Bank',                 category: 'private' },
  { ifscPrefix: 'ICIC', name: 'ICICI Bank',                category: 'private' },
  { ifscPrefix: 'UTIB', name: 'Axis Bank',                 category: 'private' },
  { ifscPrefix: 'KKBK', name: 'Kotak Mahindra Bank',       category: 'private' },
  { ifscPrefix: 'INDB', name: 'IndusInd Bank',             category: 'private' },
  { ifscPrefix: 'YESB', name: 'Yes Bank',                  category: 'private' },
  { ifscPrefix: 'FDRL', name: 'Federal Bank',              category: 'private' },
  { ifscPrefix: 'SIBL', name: 'South Indian Bank',         category: 'private' },
  { ifscPrefix: 'IDFB', name: 'IDFC First Bank',           category: 'private' },
  { ifscPrefix: 'BDBL', name: 'Bandhan Bank',              category: 'private' },
  { ifscPrefix: 'RATN', name: 'RBL Bank',                  category: 'private' },
  { ifscPrefix: 'DCBL', name: 'DCB Bank',                  category: 'private' },
  { ifscPrefix: 'KVBL', name: 'Karur Vysya Bank',          category: 'private' },
  { ifscPrefix: 'CIUB', name: 'City Union Bank',           category: 'private' },
  { ifscPrefix: 'CSBK', name: 'CSB Bank',                  category: 'private' },
  { ifscPrefix: 'TMBL', name: 'Tamilnad Mercantile Bank',  category: 'private' },
  { ifscPrefix: 'JAKA', name: 'Jammu & Kashmir Bank',      category: 'private' },
  { ifscPrefix: 'NKGS', name: 'NKGSB Co-operative Bank',  category: 'cooperative' },
  { ifscPrefix: 'SVCB', name: 'SVC Co-operative Bank',     category: 'cooperative' },
  { ifscPrefix: 'APGB', name: 'Andhra Pragathi Grameena Bank', category: 'rrb' },
  { ifscPrefix: 'KGBK', name: 'Karnataka Gramin Bank',     category: 'rrb' },

  // ── Small Finance Banks ────────────────────────────────────────────────────
  { ifscPrefix: 'AUBL', name: 'AU Small Finance Bank',     category: 'small-finance' },
  { ifscPrefix: 'ESFB', name: 'Equitas Small Finance Bank', category: 'small-finance' },
  { ifscPrefix: 'ESAF', name: 'ESAF Small Finance Bank',   category: 'small-finance' },
  { ifscPrefix: 'JSFB', name: 'Jana Small Finance Bank',   category: 'small-finance' },
  { ifscPrefix: 'NESF', name: 'Northeast Small Finance Bank', category: 'small-finance' },
  { ifscPrefix: 'SURY', name: 'Suryoday Small Finance Bank', category: 'small-finance' },
  { ifscPrefix: 'UJVN', name: 'Ujjivan Small Finance Bank', category: 'small-finance' },
  { ifscPrefix: 'UNIB', name: 'Unity Small Finance Bank',  category: 'small-finance' },
  { ifscPrefix: 'SMCB', name: 'Shivalik Small Finance Bank', category: 'small-finance' },
  { ifscPrefix: 'CLBL', name: 'Capital Small Finance Bank', category: 'small-finance' },
  { ifscPrefix: 'UTKS', name: 'Utkarsh Small Finance Bank', category: 'small-finance' },
  { ifscPrefix: 'NSFB', name: 'North East Small Finance Bank', category: 'small-finance' },

  // ── Payments Banks ─────────────────────────────────────────────────────────
  { ifscPrefix: 'AIRP', name: 'Airtel Payments Bank',      category: 'payments' },
  { ifscPrefix: 'IPOS', name: 'India Post Payments Bank',  category: 'payments' },
  { ifscPrefix: 'FINO', name: 'Fino Payments Bank',        category: 'payments' },
  { ifscPrefix: 'NSPB', name: 'NSDL Payments Bank',        category: 'payments' },
  { ifscPrefix: 'JIOP', name: 'Jio Payments Bank',         category: 'payments' },

  // ── Foreign Banks ──────────────────────────────────────────────────────────
  { ifscPrefix: 'HSBC', name: 'HSBC Bank',                 category: 'foreign' },
  { ifscPrefix: 'SCBL', name: 'Standard Chartered Bank',   category: 'foreign' },
  { ifscPrefix: 'CITI', name: 'Citi Bank',                 category: 'foreign' },
  { ifscPrefix: 'DBSS', name: 'DBS Bank India',            category: 'foreign' },
  { ifscPrefix: 'DEUT', name: 'Deutsche Bank',             category: 'foreign' },
  { ifscPrefix: 'BNPA', name: 'BNP Paribas',               category: 'foreign' },
  { ifscPrefix: 'BARC', name: 'Barclays Bank',             category: 'foreign' },
  { ifscPrefix: 'CHAS', name: 'JP Morgan Chase Bank',      category: 'foreign' },
];

// ── Badge helper ──────────────────────────────────────────────────────────────

const BADGE_PALETTES = [
  'bg-blue-600',
  'bg-emerald-600',
  'bg-purple-600',
  'bg-rose-600',
  'bg-amber-500',
  'bg-teal-600',
  'bg-orange-500',
  'bg-indigo-600',
  'bg-cyan-600',
  'bg-lime-600',
  'bg-pink-600',
  'bg-violet-600',
];

/** Returns a Tailwind bg class and the 2-letter initials for a bank name or IFSC prefix. */
export function getBankBadge(bankNameOrPrefix: string): { initials: string; bg: string } {
  const upper  = bankNameOrPrefix.trim().toUpperCase();
  const words  = upper.split(/\s+/);
  const initials =
    words.length >= 2
      ? words[0][0] + words[1][0]
      : upper.slice(0, 2);

  const hash = upper.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return { initials, bg: BADGE_PALETTES[hash % BADGE_PALETTES.length] };
}

/**
 * Given the first 4 characters of an IFSC code typed by the user, tries to find
 * a matching bank from the list and returns its name (or undefined).
 */
export function detectBankFromIfsc(ifsc: string): IndianBank | undefined {
  if (ifsc.length < 4) return undefined;
  const prefix = ifsc.slice(0, 4).toUpperCase();
  return INDIAN_BANKS.find(b => b.ifscPrefix === prefix);
}

/** Filters the bank list by name (case-insensitive partial match). */
export function filterBanks(query: string): IndianBank[] {
  if (!query.trim()) return INDIAN_BANKS;
  const q = query.toLowerCase();
  return INDIAN_BANKS.filter(b => b.name.toLowerCase().includes(q) || b.ifscPrefix.toLowerCase().includes(q));
}
