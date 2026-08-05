import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Globe, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react-native';
import { useMerchantStore } from '@/store/useMerchantStore';
import { L, SupportedLang } from '@/i18n/translations';

const LANG_OPTIONS: { id: SupportedLang; name: string; nativeName: string; flag: string }[] = [
  { id: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { id: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { id: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { id: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
];

export function FirstLoadLangModal() {
  const { lang, setLang, hasChosenLang, setHasChosenLang } = useMerchantStore();
  const [selectedLang, setSelectedLang] = useState<SupportedLang>(lang);

  if (hasChosenLang) return null;

  const t = L[selectedLang];

  const handleApply = () => {
    setLang(selectedLang);
    setHasChosenLang(true);
  };

  return (
    <Modal visible={!hasChosenLang} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.globeIconBox}>
              <Globe size={24} color="#2E7D32" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{t.firstLoadLangTitle}</Text>
              <Text style={styles.subtitle}>{t.firstLoadLangSub}</Text>
            </View>
          </View>

          {/* Options */}
          <View style={styles.optionsList}>
            {LANG_OPTIONS.map((item) => {
              const isSelected = item.id === selectedLang;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                  onPress={() => setSelectedLang(item.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.flagText}>{item.flag}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.langNative, isSelected && styles.langTextSelected]}>
                      {item.nativeName}
                    </Text>
                    <Text style={styles.langName}>{item.name}</Text>
                  </View>
                  {isSelected && <CheckCircle2 size={20} color="#2E7D32" />}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Dynamic Tip Text at bottom (changes instantly based on selected language) */}
          <View style={styles.tipBox}>
            <Text style={styles.tipText}>{t.firstLoadLangTip}</Text>
          </View>

          {/* OK Apply Button */}
          <TouchableOpacity style={styles.applyBtn} onPress={handleApply} activeOpacity={0.85}>
            <Text style={styles.applyBtnText}>{t.applyLangBtn}</Text>
            <ArrowRight size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(29, 38, 31, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  globeIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E7F2E7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E7E5DA',
  },
  title: {
    color: '#1D261F',
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    color: '#6F6B5E',
    fontSize: 11,
    marginTop: 2,
  },
  optionsList: {
    gap: 10,
    marginBottom: 14,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FAFAF5',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E7E5DA',
  },
  optionCardSelected: {
    backgroundColor: '#E7F2E7',
    borderColor: '#2E7D32',
  },
  flagText: {
    fontSize: 22,
  },
  langNative: {
    color: '#1D261F',
    fontSize: 14,
    fontWeight: '600',
  },
  langTextSelected: {
    fontWeight: '700',
  },
  langName: {
    color: '#6F6B5E',
    fontSize: 11,
  },
  tipBox: {
    backgroundColor: '#FBF0D9',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#C7770033',
    marginBottom: 16,
  },
  tipText: {
    color: '#C77700',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
  },
  applyBtn: {
    backgroundColor: '#2E7D32',
    borderRadius: 10,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
