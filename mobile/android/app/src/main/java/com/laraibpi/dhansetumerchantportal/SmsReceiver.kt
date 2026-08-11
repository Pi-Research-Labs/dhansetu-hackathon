package com.laraibpi.dhansetumerchantportal

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Telephony
import android.util.Log

/**
 * BroadcastReceiver that listens for incoming SMS messages.
 * Filters by bank sender IDs and forwards matching messages
 * to the SmsListenerModule for emission to React Native.
 *
 * Privacy note: Only bank-identified SMS are forwarded.
 * Personal / non-financial SMS are silently ignored.
 */
class SmsReceiver : BroadcastReceiver() {

    companion object {
        private const val TAG = "DhanSetu.SmsReceiver"

        /**
         * Known Indian bank sender shortcodes.
         * The SMS sender ID format is typically: <prefix>-<shortcode>
         * e.g., "VM-HDFCBK", "AD-SBIBNK", "JD-ICICIB"
         */
        val BANK_SHORTCODES = setOf(
            // Private Banks
            "HDFCBK", "HDFCBN", "HDFCB",
            "ICICIB", "ICICIS", "ICICBK",
            "AXISBK", "AXISBN",
            "KOTAKB", "KOTAK", "KOTBKL",
            "YESBKL", "YESBNK",
            "INDUSB", "IBLBNK",
            "FEDBKL", "FEDBNK",
            "RBLBNK", "RBLBKL",
            "IDFCFB", "IDFCBK",
            // Public Sector Banks
            "SBIBNK", "SBIPSG", "SBISMS", "SBIINB", "SBICRD",
            "PNBSMS", "PNBBNK", "PUNBNK",
            "BOBBKN", "BABORL", "BOBBNK", "BOBIBN",
            "CANABN", "CANBKL", "CANBNK",
            "UBIONL", "UNIONB", "UNBISF",
            "IDBIBK", "IDBIBL",
            "BOIIND", "BOIBNK",
            "INDBNK", "INDBKL",
            "UCOBKL", "UCOBNK",
            "CBIINL", "CBIBNK",
            "IOBBNK", "IOBINL",
            "BOMBNK", "MAHABN",
            "PSBBNK", "PSINDB",
            // Payment Wallets
            "PAYTMB", "PYTM", "PAYTM",
            "GPAY", "GOOGLEPAY", "GOOGLP",
            "PHONEPE", "PHNEPE", "PHNPE",
            "AMAZONP", "AMZNPY"
        )

        /**
         * Checks if the sender address matches a known bank shortcode.
         * Extracts the shortcode after the last '-' in the sender ID.
         */
        fun isBankSender(sender: String): Boolean {
            val upper = sender.trim().uppercase()

            // Try to extract shortcode after last dash
            val dashIndex = upper.lastIndexOf('-')
            val shortcode = if (dashIndex >= 0 && dashIndex < upper.length - 1) {
                upper.substring(dashIndex + 1)
            } else {
                // Remove leading +/digits (e.g. +91)
                upper.replace(Regex("^\\+?\\d+"), "")
            }

            if (shortcode.length < 3) return false

            // Check if shortcode matches or is contained in any known pattern
            return BANK_SHORTCODES.any { code ->
                shortcode.contains(code) || code.contains(shortcode)
            }
        }
    }

    override fun onReceive(context: Context?, intent: Intent?) {
        if (intent?.action != Telephony.Sms.Intents.SMS_RECEIVED_ACTION) return

        try {
            val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent)
            if (messages.isNullOrEmpty()) return

            for (smsMessage in messages) {
                val sender = smsMessage.originatingAddress ?: continue
                val body = smsMessage.messageBody ?: continue
                val timestamp = smsMessage.timestampMillis

                // For the hackathon, allow all senders to make testing easier from personal phone numbers
                Log.i(TAG, "SMS received from: $sender - forwarding to parser")
                SmsListenerModule.onBankSmsReceived(sender, body, timestamp)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error processing incoming SMS", e)
        }
    }
}
