import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  NativeModules,
} from 'react-native';
import { useRouter } from 'expo-router';
import { requestRecordingPermissionsAsync } from 'expo-audio';
import {
  Lock,
  Eye,
  EyeOff,
  Smartphone,
  ArrowRight,
  HelpCircle,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GovHeader } from '@/components/common/GovHeader';
import { SecurityBadge } from '@/components/common/SecurityBadge';
import { useMerchantStore } from '@/store/useMerchantStore';
import { L } from '@/i18n/translations';
import { authLogin } from '@/utils/api-config';
import { CustomAlert } from '@/components/common/CustomAlert';

export function LoginScreen() {
  const router = useRouter();
  const { lang } = useMerchantStore();
  const t = L[lang];

  // Form State
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Custom Alert State
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'warning' | 'info'
  });

  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setAlertConfig({ title, message, type });
    setAlertVisible(true);
  };

  // Pre-fill credentials on mount (no silent auto-login)
  useEffect(() => {
    const loadSavedCredentials = async () => {
      setIsLoading(true);
      try {
        const savedPhone = await AsyncStorage.getItem('@dhansetu_phone');
        const savedPassword = await AsyncStorage.getItem('@dhansetu_password');
        if (savedPhone && savedPassword) {
          setPhone(savedPhone);
          setPassword(savedPassword);
          setRememberMe(true);
        }
      } catch (error) {
        console.log('Failed to load saved credentials:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedCredentials();
  }, []);

  const handleLogin = async () => {
    const trimmedPhone = phone.trim();
    if (trimmedPhone.length !== 10) {
      showAlert('Validation Error', 'Please enter a valid 10-digit mobile number.', 'warning');
      return;
    }
    if (password.length < 4) {
      showAlert('Validation Error', 'Password must be at least 4 characters long.', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      // Call authentication API
      const data = await authLogin(trimmedPhone, password);

      // Persist credentials locally if Remember Me is checked
      if (rememberMe) {
        await AsyncStorage.setItem('@dhansetu_phone', trimmedPhone);
        await AsyncStorage.setItem('@dhansetu_password', password);
      } else {
        await AsyncStorage.removeItem('@dhansetu_phone');
        await AsyncStorage.removeItem('@dhansetu_password');
      }
      
      // Update merchant store state
      const { login: storeLogin } = useMerchantStore.getState();
      await storeLogin(trimmedPhone, data.access_token, data.enterprise_id, data.proprietor_name);

      // Request microphone and SMS permissions if not already granted
      try {
        await requestRecordingPermissionsAsync();
      } catch (audioErr) {
        console.warn('Failed to request microphone permission on login:', audioErr);
      }

      try {
        if (Platform.OS === 'android') {
          const SmsListener = NativeModules.SmsListenerModule;
          if (SmsListener) {
            await SmsListener.requestPermission();
          }
        }
      } catch (smsErr) {
        console.warn('Failed to request SMS permission on login:', smsErr);
      }

      // Redirect to main screens
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Login error:', error);
      const errMsg = error.response?.data?.detail || 'Invalid credentials or connection timeout. Please check your login details and try again.';
      showAlert('Access Denied', errMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const isSubmitDisabled = phone.trim().length !== 10 || password.trim().length < 4 || isLoading;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <GovHeader subtitle={t.verifiedMerchantGateway} />
          <Text style={styles.mainTitle}>{t.merchantAccessPortal}</Text>
          <Text style={styles.subtitle}>
            {t.officialPortalSub}
          </Text>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              REGISTERED MOBILE NUMBER <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <Smartphone size={18} color="#6F6B5E" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="10-digit mobile number"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={setPhone}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.inputLabel}>
                PASSWORD <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity onPress={() => showAlert('Password Reset', 'Contact your Nodal Officer or reset via Aadhaar OTP.', 'info')}>
                <Text style={styles.forgotLink}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputWrapper}>
              <Lock size={18} color="#6F6B5E" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Enter password"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                {showPassword ? (
                  <EyeOff size={18} color="#6F6B5E" />
                ) : (
                  <Eye size={18} color="#6F6B5E" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Remember Me */}
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setRememberMe(!rememberMe)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
              {rememberMe && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>Remember GSTIN / Device Credentials</Text>
          </TouchableOpacity>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitButton, isSubmitDisabled && styles.submitButtonDisabled]}
            onPress={handleLogin}
            disabled={isSubmitDisabled}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>SECURE MERCHANT LOGIN</Text>
                <ArrowRight size={18} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>

          <SecurityBadge />
        </View>

        {/* Footer Support */}
        <View style={styles.footerSection}>
          <TouchableOpacity style={styles.helpButton} onPress={() => showAlert('Merchant Helpdesk', 'Toll Free: 1800-11-2244\nEmail: support@dhansetu.example', 'info')}>
            <HelpCircle size={15} color="#6F6B5E" />
            <Text style={styles.helpText}>Need Help logging in? Contact Nodal Support</Text>
          </TouchableOpacity>
          <Text style={styles.disclaimerText}>
            {t.disclaimer}
          </Text>
        </View>
      </ScrollView>

      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF5',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 40,
  },
  headerSection: {
    marginBottom: 20,
    gap: 12,
  },
  mainTitle: {
    color: '#1D261F',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  subtitle: {
    color: '#6F6B5E',
    fontSize: 13,
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E7E5DA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  inputLabel: {
    color: '#6F6B5E',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  required: {
    color: '#C0392B',
  },
  forgotLink: {
    color: '#2E7D32',
    fontSize: 11,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAF5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E7E5DA',
    paddingHorizontal: 12,
    height: 46,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    color: '#1D261F',
    fontSize: 14,
    fontWeight: '500',
  },
  eyeIcon: {
    padding: 4,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 6,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#6F6B5E',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  checkboxLabel: {
    color: '#6F6B5E',
    fontSize: 12,
  },
  submitButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  submitButtonDisabled: {
    backgroundColor: '#BDC5BD',
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footerSection: {
    marginTop: 24,
    alignItems: 'center',
    gap: 12,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  helpText: {
    color: '#6F6B5E',
    fontSize: 11,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  disclaimerText: {
    color: '#6F6B5E',
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 14,
    paddingHorizontal: 12,
  },
});
