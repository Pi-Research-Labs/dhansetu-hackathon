/**
 * SMS Parser Engine — On-Device Transaction Extraction
 *
 * Parses Indian bank SMS messages to extract structured transaction data.
 * All processing happens entirely on-device — no raw SMS text is ever sent
 * to any server. Only the extracted structured data flows to the backend.
 *
 * Supports:
 *  - Amount extraction (Rs., INR, ₹ formats with Indian comma notation)
 *  - Direction detection (debit/credit via keyword matching)
 *  - Account fragment extraction (last 4 digits)
 *  - Payment method inference (UPI, NEFT, IMPS, ATM, POS, etc.)
 *  - Merchant/reference extraction
 *  - Confidence scoring
 */

import { identifyBank, looksLikeTransactionSms, type BankProfile } from './bank-sms-registry';

/* ─── Output Types ──────────────────────────────────────────────── */

export interface ParsedTransaction {
  /** Whether parsing succeeded */
  success: boolean;
  /** Identified bank name */
  bankName: string;
  /** Transaction direction */
  direction: 'inflow' | 'outflow';
  /** Extracted amount in INR */
  amount: number;
  /** Masked account fragment, e.g. "XX1234" */
  accountFragment?: string;
  /** Merchant or payee name if found */
  merchant?: string;
  /** Transaction reference ID (UPI Ref, IMPS Ref, etc.) */
  referenceId?: string;
  /** Payment method tender */
  tender: 'digital' | 'cash' | 'card';
  /** Inferred transaction category */
  category: string;
  /** Entry type for the Zustand store */
  entryType: 'income' | 'expense';
  /** Parsing confidence */
  confidence: 'high' | 'medium' | 'low';
  /** A dedup key to prevent duplicate entries from the same SMS */
  dedupKey: string;
}

/* ─── Generic Amount Patterns ───────────────────────────────────── */

const GENERIC_AMOUNT_PATTERNS: RegExp[] = [
  // "Rs. 2,500.00" or "Rs 2500" or "Rs.2,500"
  /(?:Rs\.?\s?)([\d,]+\.?\d*)/i,
  // "INR 2,500.00" or "INR 2500"
  /(?:INR\s?)([\d,]+\.?\d*)/i,
  // "₹2,500.00" or "₹ 2500"
  /(?:₹\s?)([\d,]+\.?\d*)/i,
  // Fallback: amount after "debited" or "credited" keywords
  /(?:debited|credited|withdrawn|deposited|received|paid|sent)\s+(?:for|by|with|of)?\s*(?:Rs\.?|INR|₹)?\s*([\d,]+\.?\d*)/i,
];

/* ─── Account Pattern ───────────────────────────────────────────── */

const ACCOUNT_PATTERNS: RegExp[] = [
  // "A/c XX1234" or "A/c no. XX1234" or "Acct XX1234"
  /(?:A\/c|Acct|Account)\s*(?:no\.?\s*)?(?:(?:XX|xx|X+|x+|\*+)(\d{2,4}))/i,
  // "Card ending 1234" or "Card **1234"
  /(?:Card)\s*(?:ending|no\.?|number)?\s*(?:\*+)?(\d{4})/i,
  // "a/c ****1234" format
  /(?:A\/c|Acct|Account)\s*(?:\*{2,})(\d{2,4})/i,
  // "XX1234" standalone with nearby context
  /(?:XX|xx)(\d{4})/,
];

/* ─── Reference ID Patterns ─────────────────────────────────────── */

const REFERENCE_PATTERNS: RegExp[] = [
  /(?:UPI\s*(?:Ref|ref\.?|Ref\.?\s*(?:No|no)\.?)\s*[:.]?\s*)(\d{8,12})/i,
  /(?:IMPS\s*(?:Ref|ref)\.?\s*[:.]?\s*)(\d{8,12})/i,
  /(?:NEFT\s*(?:Ref|ref)\.?\s*[:.]?\s*)([A-Z0-9]{8,20})/i,
  /(?:Ref\s*(?:No|no)?\.?\s*[:.]?\s*)(\d{8,16})/i,
  /(?:txn\s*(?:no|id)?\.?\s*[:.]?\s*)([A-Za-z0-9]{6,20})/i,
];

/* ─── Merchant Extraction Patterns ──────────────────────────────── */

const MERCHANT_PATTERNS: RegExp[] = [
  // "at MERCHANT_NAME" pattern
  /(?:\bat\s+)([A-Za-z0-9][A-Za-z0-9\s&.\-']{2,30})(?:\s*(?:on|\.|\s*Avl|\s*Bal|\s*Ref))/i,
  // "to VPA user@bank" pattern (UPI)
  /(?:\bto\s+(?:VPA\s+)?)([a-zA-Z0-9._]+@[a-zA-Z]+)/i,
  // "to MERCHANT" pattern
  /(?:\bto\s+)([A-Za-z][A-Za-z0-9\s&.\-']{2,25})(?:\s*(?:on|\.|\s*Avl|\s*Bal|\s*Ref|\s*UPI))/i,
  // "from SENDER" for credit
  /(?:\bfrom\s+)([A-Za-z][A-Za-z0-9\s&.\-']{2,25})(?:\s*(?:on|\.|\s*Avl|\s*Bal|\s*Ref))/i,
];

/* ─── Payment Method Keywords ───────────────────────────────────── */

const PAYMENT_METHOD_KEYWORDS = {
  digital: ['upi', 'imps', 'neft', 'rtgs', 'netbanking', 'internet banking', 'online', 'mobile banking', 'phonepe', 'gpay', 'google pay', 'paytm', 'amazonpay', 'bhim'],
  cash: ['atm', 'cash', 'cdm', 'cash deposit'],
  card: ['pos', 'ecom', 'card', 'debit card', 'credit card', 'swipe', 'contactless', 'tap'],
};

/* ─── Category Keywords ─────────────────────────────────────────── */

const CATEGORY_KEYWORDS: { pattern: RegExp; category: string }[] = [
  { pattern: /\bupi\b/i, category: 'upi_payment' },
  { pattern: /\bneft\b/i, category: 'neft_transfer' },
  { pattern: /\bimps\b/i, category: 'imps_transfer' },
  { pattern: /\brtgs\b/i, category: 'rtgs_transfer' },
  { pattern: /\batm\b/i, category: 'atm_withdrawal' },
  { pattern: /\bpos\b/i, category: 'pos_purchase' },
  { pattern: /\becom\b/i, category: 'online_purchase' },
  { pattern: /\bemi\b/i, category: 'emi_payment' },
  { pattern: /\bloan\b/i, category: 'loan_disbursement' },
  { pattern: /\bsalary\b/i, category: 'salary' },
  { pattern: /\brefund\b/i, category: 'refund' },
  { pattern: /\bcashback\b/i, category: 'cashback' },
  { pattern: /\binterest\b/i, category: 'interest' },
  { pattern: /\bdividend\b/i, category: 'dividend' },
  { pattern: /\binsurance\b/i, category: 'insurance' },
  { pattern: /\bbill\s*pay/i, category: 'bill_payment' },
  { pattern: /\brecharge\b/i, category: 'recharge' },
  { pattern: /\btransfer\b/i, category: 'fund_transfer' },
];

/* ─── Core Parser ───────────────────────────────────────────────── */

/**
 * Parses a bank SMS message body and extracts structured transaction data.
 *
 * @param smsBody  The raw SMS message text
 * @param senderId The sender address/ID (e.g. "VM-HDFCBK")
 * @returns ParsedTransaction with success=true if parsing succeeded
 */
export function parseBankSms(smsBody: string, senderId: string): ParsedTransaction {
  const failResult: ParsedTransaction = {
    success: false,
    bankName: 'Unknown',
    direction: 'outflow',
    amount: 0,
    tender: 'digital',
    category: 'unknown',
    entryType: 'expense',
    confidence: 'low',
    dedupKey: '',
  };

  // Step 1: Identify the bank from sender
  const bank = identifyBank(senderId);

  // If no bank matched but SMS looks transactional, still try to parse
  if (!bank && !looksLikeTransactionSms(smsBody)) {
    return failResult;
  }

  const bankName = bank?.bankName || 'Unknown Bank';

  // Step 2: Extract amount
  const amount = extractAmount(smsBody, bank);
  if (!amount || amount <= 0) {
    return { ...failResult, bankName };
  }

  // Step 3: Determine direction
  const direction = detectDirection(smsBody, bank);

  // Step 4: Extract account fragment
  const accountFragment = extractAccountFragment(smsBody);

  // Step 5: Extract reference ID
  const referenceId = extractReferenceId(smsBody);

  // Step 6: Extract merchant
  const merchant = extractMerchant(smsBody);

  // Step 7: Detect payment method
  const tender = detectPaymentMethod(smsBody);

  // Step 8: Infer category
  const category = inferCategory(smsBody, direction);

  // Step 9: Map direction to entry type
  const entryType = direction === 'inflow' ? 'income' : 'expense';

  // Step 10: Compute confidence
  const confidence = computeConfidence(amount, direction, bank, accountFragment);

  // Step 11: Generate dedup key
  // Combines amount + direction + account fragment + date to prevent duplicates
  const today = new Date().toISOString().split('T')[0];
  const dedupKey = `sms_${bankName}_${direction}_${amount}_${accountFragment || 'noac'}_${referenceId || today}`;

  return {
    success: true,
    bankName,
    direction,
    amount,
    accountFragment,
    merchant,
    referenceId,
    tender,
    category,
    entryType,
    confidence,
    dedupKey,
  };
}

/* ─── Extraction Helpers ────────────────────────────────────────── */

function extractAmount(body: string, bank: BankProfile | null): number | null {
  // Try bank-specific patterns first
  if (bank) {
    for (const pattern of bank.amountPatterns) {
      const match = body.match(pattern);
      if (match && match[1]) {
        const amt = parseIndianAmount(match[1]);
        if (amt > 0) return amt;
      }
    }
  }

  // Fall back to generic patterns
  for (const pattern of GENERIC_AMOUNT_PATTERNS) {
    const match = body.match(pattern);
    if (match && match[1]) {
      const amt = parseIndianAmount(match[1]);
      if (amt > 0) return amt;
    }
  }

  return null;
}

/**
 * Parses an Indian-formatted amount string (e.g. "2,50,000.50") to a number.
 */
function parseIndianAmount(raw: string): number {
  // Remove Indian-style commas: "2,50,000" -> "250000"
  const cleaned = raw.replace(/,/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function detectDirection(body: string, bank: BankProfile | null): 'inflow' | 'outflow' {
  const lowerBody = body.toLowerCase();

  // Use bank-specific keywords if available
  const creditKeywords = bank?.directionKeywords.credit || ['credited', 'received', 'deposited', 'added', 'credit', 'refund'];
  const debitKeywords = bank?.directionKeywords.debit || ['debited', 'withdrawn', 'spent', 'paid', 'debit', 'purchase'];

  // Find the position of the first matching keyword for each direction
  let creditPos = Infinity;
  let debitPos = Infinity;

  for (const kw of creditKeywords) {
    const idx = lowerBody.indexOf(kw);
    if (idx !== -1 && idx < creditPos) {
      creditPos = idx;
    }
  }

  for (const kw of debitKeywords) {
    const idx = lowerBody.indexOf(kw);
    if (idx !== -1 && idx < debitPos) {
      debitPos = idx;
    }
  }

  // The keyword that appears first in the SMS body wins
  if (creditPos < debitPos) return 'inflow';
  if (debitPos < creditPos) return 'outflow';

  // Default: if we can't determine, assume outflow (safer for merchants)
  return 'outflow';
}

function extractAccountFragment(body: string): string | undefined {
  for (const pattern of ACCOUNT_PATTERNS) {
    const match = body.match(pattern);
    if (match && match[1]) {
      return `XX${match[1]}`;
    }
  }
  return undefined;
}

function extractReferenceId(body: string): string | undefined {
  for (const pattern of REFERENCE_PATTERNS) {
    const match = body.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return undefined;
}

function extractMerchant(body: string): string | undefined {
  for (const pattern of MERCHANT_PATTERNS) {
    const match = body.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return undefined;
}

function detectPaymentMethod(body: string): 'digital' | 'cash' | 'card' {
  const lowerBody = body.toLowerCase();

  // Check card first (more specific)
  for (const kw of PAYMENT_METHOD_KEYWORDS.card) {
    if (lowerBody.includes(kw)) return 'card';
  }

  // Check cash
  for (const kw of PAYMENT_METHOD_KEYWORDS.cash) {
    if (lowerBody.includes(kw)) return 'cash';
  }

  // Check digital
  for (const kw of PAYMENT_METHOD_KEYWORDS.digital) {
    if (lowerBody.includes(kw)) return 'digital';
  }

  // Default to digital (most common for SMS alerts)
  return 'digital';
}

function inferCategory(body: string, direction: 'inflow' | 'outflow'): string {
  for (const { pattern, category } of CATEGORY_KEYWORDS) {
    if (pattern.test(body)) {
      return category;
    }
  }

  // Fallback based on direction
  return direction === 'inflow' ? 'sale' : 'expense';
}

function computeConfidence(
  amount: number,
  direction: 'inflow' | 'outflow',
  bank: BankProfile | null,
  accountFragment?: string,
): 'high' | 'medium' | 'low' {
  let score = 0;

  // Bank identified from registry = strong signal
  if (bank) score += 3;

  // Amount successfully extracted
  if (amount > 0) score += 2;

  // Account fragment found
  if (accountFragment) score += 1;

  // Direction was determinable (we always assign one, but bank-specific is better)
  if (bank) score += 1;

  if (score >= 6) return 'high';
  if (score >= 4) return 'medium';
  return 'low';
}

/* ─── Batch / Historical Parsing ────────────────────────────────── */

export interface RawSmsMessage {
  sender: string;
  body: string;
  timestamp: number;   // Unix ms
}

/**
 * Parses a batch of SMS messages (for historical scan).
 * Returns only successfully parsed transactions, sorted newest-first.
 */
export function parseBatchSms(messages: RawSmsMessage[]): (ParsedTransaction & { timestamp: number })[] {
  const results: (ParsedTransaction & { timestamp: number })[] = [];

  for (const msg of messages) {
    const parsed = parseBankSms(msg.body, msg.sender);
    if (parsed.success) {
      results.push({ ...parsed, timestamp: msg.timestamp });
    }
  }

  // Sort newest first
  results.sort((a, b) => b.timestamp - a.timestamp);

  return results;
}
