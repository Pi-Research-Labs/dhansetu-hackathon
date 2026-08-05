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
              <Globe size={24} color="#1E293B" />
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
                  {isSelected && <CheckCircle2 size={20} color="#1E293B" />}
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
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
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
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  title: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    color: '#64748B',
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
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  optionCardSelected: {
    backgroundColor: '#F1F5F9',
    borderColor: '#1E293B',
  },
  flagText: {
    fontSize: 22,
  },
  langNative: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '600',
  },
  langTextSelected: {
    fontWeight: '700',
  },
  langName: {
    color: '#64748B',
    fontSize: 11,
  },
  tipBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 16,
  },
  tipText: {
    color: '#92400E',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
  },
  applyBtn: {
    backgroundColor: '#1E293B',
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
