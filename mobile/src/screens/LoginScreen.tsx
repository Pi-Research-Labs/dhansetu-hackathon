import React, { useState } from 'react';
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
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Smartphone,
  RefreshCw,
  ArrowRight,
  HelpCircle,
  Building2,
} from 'lucide-react-native';
import { TricolorBar } from '@/components/common/TricolorBar';
import { GovHeader } from '@/components/common/GovHeader';
import { SecurityBadge } from '@/components/common/SecurityBadge';
import { useMerchantStore } from '@/store/useMerchantStore';
import { L } from '@/i18n/translations';

export function LoginScreen() {
  const router = useRouter();
  const { lang } = useMerchantStore();
  const t = L[lang];

  // Form State
  const [loginMethod, setLoginMethod] = useState<'id' | 'otp'>('id');
  const [merchantId, setMerchantId] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Captcha Generator
  const [captchaCode, setCaptchaCode] = useState('7K9M2P');

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
  };

  const handleLogin = () => {
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      // Replaces login screen from stack so hardware back press cannot return to login
      router.replace('/(tabs)');
    }, 400);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TricolorBar />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <GovHeader />
          <Text style={styles.mainTitle}>{t.merchantAccessPortal}</Text>
          <Text style={styles.subtitle}>
            {t.officialPortalSub}
          </Text>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, loginMethod === 'id' && styles.activeTabButton]}
            onPress={() => setLoginMethod('id')}
            activeOpacity={0.8}
          >
            <Building2 size={16} color={loginMethod === 'id' ? '#0F172A' : '#64748B'} />
            <Text style={[styles.tabText, loginMethod === 'id' && styles.activeTabText]}>
              GSTIN / Merchant ID
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, loginMethod === 'otp' && styles.activeTabButton]}
            onPress={() => setLoginMethod('otp')}
            activeOpacity={0.8}
          >
            <Smartphone size={16} color={loginMethod === 'otp' ? '#0F172A' : '#64748B'} />
            <Text style={[styles.tabText, loginMethod === 'otp' && styles.activeTabText]}>
              Mobile & OTP
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          {loginMethod === 'id' ? (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  GSTIN / MERCHANT ID <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <User size={18} color="#64748B" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. 27AAAAA0000A1Z5"
                    placeholderTextColor="#94A3B8"
                    value={merchantId}
                    onChangeText={setMerchantId}
                    autoCapitalize="characters"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.inputLabel}>
                    PASSWORD <Text style={styles.required}>*</Text>
                  </Text>
                  <TouchableOpacity onPress={() => Alert.alert('Password Reset', 'Contact your Nodal Officer or reset via Aadhaar OTP.')}>
                    <Text style={styles.forgotLink}>Forgot Password?</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.inputWrapper}>
                  <Lock size={18} color="#64748B" style={styles.inputIcon} />
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
                      <EyeOff size={18} color="#64748B" />
                    ) : (
                      <Eye size={18} color="#64748B" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </>
          ) : (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  REGISTERED MOBILE NUMBER <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.countryCode}>+91</Text>
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
                  <Text style={styles.inputLabel}>ENTER OTP</Text>
                  <TouchableOpacity onPress={() => Alert.alert('OTP Sent', 'OTP dispatched to registered mobile number.')}>
                    <Text style={styles.forgotLink}>Send OTP</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.inputWrapper}>
                  <Lock size={18} color="#64748B" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="6-digit OTP code"
                    placeholderTextColor="#94A3B8"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={otp}
                    onChangeText={setOtp}
                  />
                </View>
              </View>
            </>
          )}

          {/* CAPTCHA */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              SECURITY CODE (CAPTCHA) <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.captchaRow}>
              <View style={styles.captchaBox}>
                <Text style={styles.captchaCodeText}>{captchaCode}</Text>
              </View>
              <TouchableOpacity style={styles.refreshBtn} onPress={generateCaptcha}>
                <RefreshCw size={18} color="#475569" />
              </TouchableOpacity>
              <View style={[styles.inputWrapper, { flex: 1 }]}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter code"
                  placeholderTextColor="#94A3B8"
                  value={captchaInput}
                  onChangeText={setCaptchaInput}
                  autoCapitalize="characters"
                  maxLength={6}
                />
              </View>
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
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
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
          <TouchableOpacity style={styles.helpButton} onPress={() => Alert.alert('Merchant Helpdesk', 'Toll Free: 1800-11-2244\nEmail: support@dhansetu.gov.in')}>
            <HelpCircle size={15} color="#64748B" />
            <Text style={styles.helpText}>Need Help logging in? Contact Nodal Support</Text>
          </TouchableOpacity>
          <Text style={styles.disclaimerText}>
            Unauthorized access to this government system is strictly prohibited under the IT Act 2000.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
    color: '#0F172A',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  subtitle: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 18,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  tabText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#0F172A',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    color: '#475569',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  required: {
    color: '#EF4444',
  },
  forgotLink: {
    color: '#2563EB',
    fontSize: 11,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    height: 46,
  },
  inputIcon: {
    marginRight: 10,
  },
  countryCode: {
    color: '#0F172A',
    fontWeight: '600',
    marginRight: 10,
    fontSize: 14,
  },
  textInput: {
    flex: 1,
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '500',
  },
  eyeIcon: {
    padding: 4,
  },
  captchaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  captchaBox: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  captchaCodeText: {
    color: '#1E293B',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 3,
  },
  refreshBtn: {
    width: 46,
    height: 46,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
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
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#1E293B',
    borderColor: '#1E293B',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  checkboxLabel: {
    color: '#64748B',
    fontSize: 12,
  },
  submitButton: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  submitButtonDisabled: {
    opacity: 0.7,
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
    color: '#64748B',
    fontSize: 11,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  disclaimerText: {
    color: '#94A3B8',
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 14,
    paddingHorizontal: 12,
  },
});
