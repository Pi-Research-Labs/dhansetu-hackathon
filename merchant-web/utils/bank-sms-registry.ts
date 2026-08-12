/**
 * Bank SMS Registry — Comprehensive Indian Bank Sender ID & Pattern Database
 *
 * This registry maps bank sender IDs (the alphanumeric codes that appear as the
 * SMS sender, e.g. "VM-HDFCBK") to bank profiles containing recognition patterns.
 *
 * Indian bank SMS senders follow the TRAI DLT format:
 *   <prefix>-<shortcode>  e.g. VM-HDFCBK, AD-ICICIB, JD-SBIBNK
 *
 * The prefix (VM, AD, JD, etc.) indicates the telecom circle but the shortcode
 * is what identifies the bank. We match on the shortcode portion.
 */

export interface BankProfile {
  /** Human-readable bank name */
  bankName: string;
  /** Sender shortcode patterns (case-insensitive, matched against the sender ID) */
  senderPatterns: string[];
  /** Bank-specific amount regex patterns (tried in order, first match wins) */
  amountPatterns: RegExp[];
  /** Keywords that indicate credit (inflow) or debit (outflow) */
  directionKeywords: {
    credit: string[];
    debit: string[];
  };
}

/**
 * Master bank registry. Each entry covers one bank/payment provider.
 * Sender patterns are the shortcode portion of the sender ID after the prefix dash.
 */
export const BANK_REGISTRY: BankProfile[] = [
  // ─── Major Private Banks ──────────────────────────────────────────
  {
    bankName: 'HDFC Bank',
    senderPatterns: ['HDFCBK', 'HDFCBN', 'HDFCB'],
    amountPatterns: [
      /(?:Rs\.?|INR|₹)\s?([\d,]+\.?\d*)/i,
      /(?:debited|credited)\s+(?:for|by|with)?\s*(?:Rs\.?|INR|₹)?\s?([\d,]+\.?\d*)/i,
    ],
    directionKeywords: {
      credit: ['credited', 'received', 'deposited', 'added', 'credit', 'refund'],
      debit: ['debited', 'withdrawn', 'spent', 'paid', 'debit', 'purchase', 'txn'],
    },
  },
  {
    bankName: 'ICICI Bank',
    senderPatterns: ['ICICIB', 'ICICIS', 'ICICBK'],
    amountPatterns: [
      /(?:Rs\.?|INR|₹)\s?([\d,]+\.?\d*)/i,
      /(?:debited|credited)\s+(?:for|by|with)?\s*(?:Rs\.?|INR|₹)?\s?([\d,]+\.?\d*)/i,
    ],
    directionKeywords: {
      credit: ['credited', 'received', 'deposited', 'credit', 'refund'],
      debit: ['debited', 'withdrawn', 'spent', 'paid', 'debit', 'purchase'],
    },
  },
  {
    bankName: 'Axis Bank',
    senderPatterns: ['AXISBK', 'AXISBN'],
    amountPatterns: [
      /(?:Rs\.?|INR|₹)\s?([\d,]+\.?\d*)/i,
    ],
    directionKeywords: {
      credit: ['credited', 'received', 'deposited', 'credit', 'refund'],
      debit: ['debited', 'withdrawn', 'spent', 'paid', 'debit', 'purchase', 'used at'],
    },
  },
  {
    bankName: 'Kotak Mahindra Bank',
    senderPatterns: ['KOTAKB', 'KOTAK', 'KOTBKL'],
    amountPatterns: [
      /(?:Rs\.?|INR|₹)\s?([\d,]+\.?\d*)/i,
    ],
    directionKeywords: {
      credit: ['credited', 'received', 'deposited', 'credit', 'refund'],
      debit: ['debited', 'withdrawn', 'spent', 'paid', 'debit'],
    },
  },
  {
    bankName: 'Yes Bank',
    senderPatterns: ['YESBKL', 'YESBNK'],
    amountPatterns: [
      /(?:Rs\.?|INR|₹)\s?([\d,]+\.?\d*)/i,
    ],
    directionKeywords: {
      credit: ['credited', 'received', 'deposited', 'credit', 'refund'],
      debit: ['debited', 'withdrawn', 'spent', 'paid', 'debit'],
    },
  },
  {
    bankName: 'IndusInd Bank',
    senderPatterns: ['INDUSB', 'INDBNK', 'IBLBNK'],
    amountPatterns: [
      /(?:Rs\.?|INR|₹)\s?([\d,]+\.?\d*)/i,
    ],
    directionKeywords: {
      credit: ['credited', 'received', 'deposited', 'credit', 'refund'],
      debit: ['debited', 'withdrawn', 'spent', 'paid', 'debit'],
    },
  },
  {
    bankName: 'Federal Bank',
    senderPatterns: ['FEDBKL', 'FEDBNK'],
    amountPatterns: [
      /(?:Rs\.?|INR|₹)\s?([\d,]+\.?\d*)/i,
    ],
    directionKeywords: {
      credit: ['credited', 'received', 'deposited', 'credit', 'refund'],
      debit: ['debited', 'withdrawn', 'spent', 'paid', 'debit'],
    },
  },
  {
    bankName: 'RBL Bank',
    senderPatterns: ['RBLBNK', 'RBLBKL'],
    amountPatterns: [
      /(?:Rs\.?|INR|₹)\s?([\d,]+\.?\d*)/i,
    ],
    directionKeywords: {
      credit: ['credited', 'received', 'deposited', 'credit', 'refund'],
      debit: ['debited', 'withdrawn', 'spent', 'paid', 'debit'],
    },
  },
  {
    bankName: 'IDFC First Bank',
    senderPatterns: ['IDFCFB', 'IDFCBK'],
    amountPatterns: [
      /(?:Rs\.?|INR|₹)\s?([\d,]+\.?\d*)/i,
    ],
    directionKeywords: {
      credit: ['credited', 'received', 'deposited', 'credit', 'refund'],
      debit: ['debited', 'withdrawn', 'spent', 'paid', 'debit'],
    },
  },

  // ─── Major Public Sector Banks ────────────────────────────────────
  {
    bankName: 'State Bank of India',
    senderPatterns: ['SBIBNK', 'SBIPSG', 'SBISMS', 'SBIINB', 'SBICRD'],
    amountPatterns: [
      /(?:Rs\.?|INR|₹)\s?([\d,]+\.?\d*)/i,
      /(?:debited|credited)\s+(?:by)?\s*(?:Rs\.?)?\s?([\d,]+\.?\d*)/i,
    ],
    directionKeywords: {
      credit: ['credited', 'received', 'deposited', 'credit', 'refund', 'cr'],
      debit: ['debited', 'withdrawn', 'spent', 'paid', 'debit', 'dr', 'transfer to'],
    },
  },
  {
    bankName: 'Punjab National Bank',
    senderPatterns: ['PNBSMS', 'PNBBNK', 'PUNBNK'],
    amountPatterns: [
      /(?:Rs\.?|INR|₹)\s?([\d,]+\.?\d*)/i,
    ],
    directionKeywords: {
      credit: ['credited', 'received', 'deposited', 'credit', 'refund'],
      debit: ['debited', 'withdrawn', 'spent', 'paid', 'debit'],
    },
  },
  {
    bankName: 'Bank of Baroda',
    senderPatterns: ['BOBBKN', 'BABORL', 'BOBBNK', 'BOBIBN'],
    amountPatterns: [
      /(?:Rs\.?|INR|₹)\s?([\d,]+\.?\d*)/i,
    ],
    directionKeywords: {
      credit: ['credited', 'received', 'deposited', 'credit', 'refund'],
      debit: ['debited', 'withdrawn', 'spent', 'paid', 'debit'],
    },
  },
  {
    bankName: 'Canara Bank',
    senderPatterns: ['CANABN', 'CANBKL', 'CANBNK'],
    amountPatterns: [
      /(?:Rs\.?|INR|₹)\s?([\d,]+\.?\d*)/i,
    ],
    directionKeywords: {
      credit: ['credited', 'received', 'deposited', 'credit', 'refund'],
      debit: ['debited', 'withdrawn', 'spent', 'paid', 'debit'],
    },
  },
  {
    bankName: 'Union Bank of India',
    senderPatterns: ['UBIONL', 'UNIONB', 'UNBISF'],
    amountPatterns: [
      /(?:Rs\.?|INR|₹)\s?([\d,]+\.?\d*)/i,
    ],
    directionKeywords: {
      credit: ['credited', 'received', 'deposited', 'credit', 'refund'],
      debit: ['debited', 'withdrawn', 'spent', 'paid', 'debit'],
    },
  },
  {
    bankName: 'IDBI Bank',
    senderPatterns: ['IDBIBK', 'IDBIBL'],
    amountPatterns: [
      /(?:Rs\.?|INR|₹)\s?([\d,]+\.?\d*)/i,
    ],
    directionKeywords: {
      credit: ['credited', 'received', 'deposited', 'credit', 'refund'],
      debit: ['debited', 'withdrawn', 'spent', 'paid', 'debit'],
    },
  },
  {
    bankName: 'Bank of India',
    senderPatterns: ['BOIIND', 'BOIBNK'],
    amountPatterns: [
      /(?:Rs\.?|INR|₹)\s?([\d,]+\.?\d*)/i,
    ],
    directionKeywords: {
      credit: ['credited', 'received', 'deposited', 'credit', 'refund'],
      debit: ['debited', 'withdrawn', 'spent', 'paid', 'debit'],
    },
  },
  {
    bankName: 'Indian Bank',
    senderPatterns: ['INDBNK', 'INDBKL'],
    amountPatterns: [
      /(?:Rs\.?|INR|₹)\s?([\d,]+\.?\d*)/i,
    ],
    directionKeywords: {
      credit: ['credited', 'received', 'deposited', 'credit', 'refund'],
      debit: ['debited', 'withdrawn', 'spent', 'paid', 'debit'],
    },
  },
  {
    bankName: 'UCO Bank',
    senderPatterns: ['UCOBKL', 'UCOBNK'],
    amountPatterns: [
      /(?:Rs\.?|INR|₹)\s?([\d,]+\.?\d*)/i,
    ],
    directionKeywords: {
      credit: ['credited', 'received', 'deposited', 'credit', 'refund'],
      debit: ['debited', 'withdrawn', 'spent', 'paid', 'debit'],
    },
  },
  {
    bankName: 'Central Bank of India',
    senderPatterns: ['CBIINL', 'CBIBNK'],
    amountPatterns: [
      /(?:Rs\.?|INR|₹)\s?([\d,]+\.?\d*)/i,
    ],
    directionKeywords: {
      credit: ['credited', 'received', 'deposited', 'credit', 'refund'],
      debit: ['debited', 'withdrawn', 'spent', 'paid', 'debit'],
    },
  },
  {
    bankName: 'Indian Overseas Bank',
    senderPatterns: ['IOBBNK', 'IOBINL'],
    amountPatterns: [
      /(?:Rs\.?|INR|₹)\s?([\d,]+\.?\d*)/i,
    ],
    directionKeywords: {
      credit: ['credited', 'received', 'deposited', 'credit', 'refund'],
      debit: ['debited', 'withdrawn', 'spent', 'paid', 'debit'],
    },
  },
  {
    bankName: 'Bank of Maharashtra',
    senderPatterns: ['BOMBNK', 'MAHABN'],
    amountPatterns: [
      /(?:Rs\.?|INR|₹)\s?([\d,]+\.?\d*)/i,
    ],
    directionKeywords: {
      credit: ['credited', 'received', 'deposited', 'credit', 'refund'],
      debit: ['debited', 'withdrawn', 'spent', 'paid', 'debit'],
    },
  },
  {
    bankName: 'Punjab & Sind Bank',
    senderPatterns: ['PSBBNK', 'PSINDB'],
    amountPatterns: [
      /(?:Rs\.?|INR|₹)\s?([\d,]+\.?\d*)/i,
    ],
    directionKeywords: {
      credit: ['credited', 'received', 'deposited', 'credit', 'refund'],
      debit: ['debited', 'withdrawn', 'spent', 'paid', 'debit'],
    },
  },

  // ─── Payment Wallets & Digital Banks ──────────────────────────────
  {
    bankName: 'Paytm Payments Bank',
    senderPatterns: ['PAYTMB', 'PYTM', 'PAYTM'],
    amountPatterns: [
      /(?:Rs\.?|INR|₹)\s?([\d,]+\.?\d*)/i,
    ],
    directionKeywords: {
      credit: ['credited', 'received', 'deposited', 'added', 'credit', 'refund', 'cashback'],
      debit: ['debited', 'withdrawn', 'spent', 'paid', 'debit', 'sent'],
    },
  },
  {
    bankName: 'Google Pay',
    senderPatterns: ['GPAY', 'GOOGLEPAY', 'GOOGLP'],
    amountPatterns: [
      /(?:Rs\.?|INR|₹)\s?([\d,]+\.?\d*)/i,
    ],
    directionKeywords: {
      credit: ['received', 'credited', 'got', 'refund'],
      debit: ['sent', 'paid', 'debited'],
    },
  },
  {
    bankName: 'PhonePe',
    senderPatterns: ['PHONEPE', 'PHNEPE', 'PHNPE'],
    amountPatterns: [
      /(?:Rs\.?|INR|₹)\s?([\d,]+\.?\d*)/i,
    ],
    directionKeywords: {
      credit: ['received', 'credited', 'refund', 'cashback'],
      debit: ['sent', 'paid', 'debited'],
    },
  },
  {
    bankName: 'Amazon Pay',
    senderPatterns: ['AMAZONP', 'AMZNPY'],
    amountPatterns: [
      /(?:Rs\.?|INR|₹)\s?([\d,]+\.?\d*)/i,
    ],
    directionKeywords: {
      credit: ['received', 'credited', 'refund', 'cashback'],
      debit: ['sent', 'paid', 'debited', 'charged'],
    },
  },
];

/**
 * Common bank sender ID prefixes used in Indian telecom DLT framework.
 * SMS sender looks like: <prefix>-<shortcode>
 * We strip the prefix when matching.
 */
export const SENDER_PREFIXES = ['VM', 'AD', 'JD', 'BZ', 'DM', 'HP', 'MD', 'TM', 'AX', 'BW', 'TD', 'TA', 'JK', 'RJ', 'UP', 'MH', 'KA', 'TN', 'DL', 'GJ'];

/**
 * Extracts the shortcode from a sender ID string.
 * e.g. "VM-HDFCBK" -> "HDFCBK", "+91HDFCBK" -> "HDFCBK", "HDFCBK" -> "HDFCBK"
 */
export function extractShortcode(senderId: string): string {
  const trimmed = senderId.trim().toUpperCase();

  // Handle "XX-SHORTCODE" format
  const dashIndex = trimmed.lastIndexOf('-');
  if (dashIndex >= 0 && dashIndex < trimmed.length - 1) {
    return trimmed.substring(dashIndex + 1);
  }

  // Handle plain shortcode or +91 prefix
  return trimmed.replace(/^\+?\d+/, '');
}

/**
 * Finds the matching BankProfile for a given sender ID.
 * Returns null if no bank matches (not a bank SMS).
 */
export function identifyBank(senderId: string): BankProfile | null {
  const shortcode = extractShortcode(senderId);
  if (!shortcode || shortcode.length < 3) return null;

  for (const bank of BANK_REGISTRY) {
    for (const pattern of bank.senderPatterns) {
      if (shortcode.includes(pattern) || pattern.includes(shortcode)) {
        return bank;
      }
    }
  }

  return null;
}

/**
 * Quick check if a sender ID looks like it could be from any bank.
 * Used for fast pre-filtering in the native layer.
 * Returns all known shortcode patterns as a flat array.
 */
export function getAllBankShortcodes(): string[] {
  const codes: string[] = [];
  for (const bank of BANK_REGISTRY) {
    codes.push(...bank.senderPatterns);
  }
  return codes;
}

/**
 * Check if SMS body looks like a transaction alert (quick heuristic).
 * This supplements sender-based detection for generic/unknown senders.
 */
export function looksLikeTransactionSms(body: string): boolean {
  const lowerBody = body.toLowerCase();

  // Must contain an amount indicator
  const hasAmount = /(?:rs\.?|inr|₹)\s?[\d,]+/i.test(body);
  if (!hasAmount) return false;

  // Must contain a transaction keyword
  const transactionKeywords = [
    'debited', 'credited', 'withdrawn', 'deposited', 'transferred',
    'spent', 'received', 'paid', 'sent', 'purchase', 'refund',
    'avl bal', 'avl. bal', 'available balance', 'a/c', 'acct', 'account',
    'upi ref', 'imps ref', 'neft ref', 'txn',
  ];

  return transactionKeywords.some(keyword => lowerBody.includes(keyword));
}
