package com.laraibpi.dhansetumerchantportal

import android.Manifest
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.database.Cursor
import android.net.Uri
import android.os.Build
import android.provider.Telephony
import android.util.Log
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule

/**
 * React Native Native Module for SMS listening and inbox reading.
 *
 * Exposes methods to:
 * - Check and request SMS permissions
 * - Start/stop listening for incoming bank SMS (via BroadcastReceiver)
 * - Read historical SMS inbox filtered by bank senders
 *
 * Events emitted:
 * - "onBankSmsReceived": { sender: string, body: string, timestamp: number }
 */
class SmsListenerModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        private const val TAG = "DhanSetu.SmsModule"
        private const val EVENT_NAME = "onBankSmsReceived"

        // Static reference to emit events from the BroadcastReceiver
        private var moduleInstance: SmsListenerModule? = null

        /**
         * Called by SmsReceiver when a bank SMS is detected.
         * Emits the event to the React Native JavaScript layer.
         */
        fun onBankSmsReceived(sender: String, body: String, timestamp: Long) {
            val instance = moduleInstance ?: return

            try {
                val params = Arguments.createMap().apply {
                    putString("sender", sender)
                    putString("body", body)
                    putDouble("timestamp", timestamp.toDouble())
                }

                instance.reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit(EVENT_NAME, params)

                Log.i(TAG, "Bank SMS event emitted to JS: sender=$sender amount_chars=${body.length}")
            } catch (e: Exception) {
                Log.e(TAG, "Failed to emit SMS event to JS", e)
            }
        }
    }

    private var smsReceiver: SmsReceiver? = null
    private var isListening = false

    override fun getName(): String = "SmsListenerModule"

    override fun initialize() {
        super.initialize()
        moduleInstance = this
    }

    override fun invalidate() {
        stopListeningInternal()
        moduleInstance = null
        super.invalidate()
    }

    /* ─── Permission Methods ────────────────────────────────────── */

    @ReactMethod
    fun checkPermission(promise: Promise) {
        try {
            val hasRead = ContextCompat.checkSelfPermission(
                reactContext, Manifest.permission.READ_SMS
            ) == PackageManager.PERMISSION_GRANTED

            val hasReceive = ContextCompat.checkSelfPermission(
                reactContext, Manifest.permission.RECEIVE_SMS
            ) == PackageManager.PERMISSION_GRANTED

            val result = Arguments.createMap().apply {
                putBoolean("hasReadSmsPermission", hasRead)
                putBoolean("hasReceiveSmsPermission", hasReceive)
                putBoolean("allGranted", hasRead && hasReceive)
            }

            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("PERMISSION_CHECK_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun requestPermission(promise: Promise) {
        try {
            val activity = reactApplicationContext.currentActivity
            if (activity == null) {
                promise.reject("NO_ACTIVITY", "No activity available to request permissions")
                return
            }

            val permissions = arrayOf(
                Manifest.permission.READ_SMS,
                Manifest.permission.RECEIVE_SMS
            )

            // Check if already granted
            val allGranted = permissions.all {
                ContextCompat.checkSelfPermission(reactContext, it) == PackageManager.PERMISSION_GRANTED
            }

            if (allGranted) {
                val result = Arguments.createMap().apply {
                    putBoolean("granted", true)
                }
                promise.resolve(result)
                return
            }

            ActivityCompat.requestPermissions(activity!!, permissions, 1001)

            // Note: We can't await the result here in the traditional sense.
            // The permission result will be available on the next checkPermission call.
            // For simplicity, we resolve immediately indicating the request was made.
            val result = Arguments.createMap().apply {
                putBoolean("requested", true)
            }
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("PERMISSION_REQUEST_ERROR", e.message, e)
        }
    }

    /* ─── Listener Methods ──────────────────────────────────────── */

    @ReactMethod
    fun startListening(promise: Promise) {
        try {
            if (isListening) {
                promise.resolve(true)
                return
            }

            // Check permissions first
            val hasReceive = ContextCompat.checkSelfPermission(
                reactContext, Manifest.permission.RECEIVE_SMS
            ) == PackageManager.PERMISSION_GRANTED

            if (!hasReceive) {
                promise.reject("NO_PERMISSION", "RECEIVE_SMS permission not granted")
                return
            }

            smsReceiver = SmsReceiver()
            val filter = IntentFilter(Telephony.Sms.Intents.SMS_RECEIVED_ACTION).apply {
                priority = 999
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                reactContext.registerReceiver(smsReceiver, filter, android.content.Context.RECEIVER_EXPORTED)
            } else {
                reactContext.registerReceiver(smsReceiver, filter)
            }

            isListening = true
            Log.i(TAG, "SMS listener started")
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start SMS listener", e)
            promise.reject("START_LISTENER_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun stopListening(promise: Promise) {
        try {
            stopListeningInternal()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("STOP_LISTENER_ERROR", e.message, e)
        }
    }

    private fun stopListeningInternal() {
        if (isListening && smsReceiver != null) {
            try {
                reactContext.unregisterReceiver(smsReceiver)
            } catch (e: Exception) {
                Log.w(TAG, "Receiver already unregistered", e)
            }
            smsReceiver = null
            isListening = false
            Log.i(TAG, "SMS listener stopped")
        }
    }

    @ReactMethod
    fun isCurrentlyListening(promise: Promise) {
        promise.resolve(isListening)
    }

    /* ─── Historical SMS Inbox Reading ──────────────────────────── */

    /**
     * Reads SMS inbox messages from known bank senders.
     * Used for historical scan on first enable.
     *
     * @param maxDaysBack  How many days of history to scan (default 30)
     * @param maxMessages  Maximum number of messages to return (default 500)
     * @param promise      React Native promise
     */
    @ReactMethod
    fun readBankSmsInbox(maxDaysBack: Int, maxMessages: Int, promise: Promise) {
        try {
            val hasRead = ContextCompat.checkSelfPermission(
                reactContext, Manifest.permission.READ_SMS
            ) == PackageManager.PERMISSION_GRANTED

            if (!hasRead) {
                promise.reject("NO_PERMISSION", "READ_SMS permission not granted")
                return
            }

            val results: WritableArray = Arguments.createArray()
            val cutoffTimestamp = System.currentTimeMillis() - (maxDaysBack.toLong() * 24 * 60 * 60 * 1000)

            val cursor: Cursor? = reactContext.contentResolver.query(
                Uri.parse("content://sms/inbox"),
                arrayOf("address", "body", "date"),
                "date > ?",
                arrayOf(cutoffTimestamp.toString()),
                "date DESC"
            )

            cursor?.use { c ->
                val addressIdx = c.getColumnIndex("address")
                val bodyIdx = c.getColumnIndex("body")
                val dateIdx = c.getColumnIndex("date")
                var count = 0

                while (c.moveToNext() && count < maxMessages) {
                    val address = c.getString(addressIdx) ?: continue
                    val body = c.getString(bodyIdx) ?: continue
                    val date = c.getLong(dateIdx)

                    // For the hackathon/testing, allow all senders in the inbox scan too
                    // Let the JS side parser filter/validate the message body
                    val smsMap: WritableMap = Arguments.createMap().apply {
                        putString("sender", address)
                        putString("body", body)
                        putDouble("timestamp", date.toDouble())
                    }
                    results.pushMap(smsMap)
                    count++
                }
            }

            Log.i(TAG, "Historical bank SMS scan: found ${results.size()} messages")
            promise.resolve(results)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to read SMS inbox", e)
            promise.reject("READ_INBOX_ERROR", e.message, e)
        }
    }

    /* ─── Required for RN event emitter ─────────────────────────── */

    @ReactMethod
    fun addListener(eventName: String) {
        // Required for NativeEventEmitter compatibility
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Required for NativeEventEmitter compatibility
    }
}
