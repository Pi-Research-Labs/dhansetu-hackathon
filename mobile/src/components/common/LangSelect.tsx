import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { useMerchantStore } from '@/store/useMerchantStore';
import { SupportedLang, L } from '@/i18n/translations';
import { Globe, ChevronDown, Check } from 'lucide-react-native';

const LANGS: { code: SupportedLang; name: string }[] = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिन्दी (Hindi)' },
  { code: 'mr', name: 'मराठी (Marathi)' },
  { code: 'te', name: 'తెలుగు (Telugu)' },
];

export function LangSelect() {
  const { lang, setLang } = useMerchantStore();
  const [modalVisible, setModalVisible] = useState(false);

  const currentLangObj = LANGS.find((l) => l.code === lang) || LANGS[0];

  const handleSelect = (code: SupportedLang) => {
    setLang(code);
    setModalVisible(false);
  };

  return (
    <View>
      {/* Dropdown Trigger */}
      <TouchableOpacity
        style={styles.triggerBtn}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Globe size={14} color="#2E7D32" style={styles.icon} />
        <Text style={styles.triggerText}>{currentLangObj.name.split(' ')[0]}</Text>
        <ChevronDown size={14} color="#6F6B5E" />
      </TouchableOpacity>

      {/* Modal Dropdown Menu */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.dropdownCard}>
                <View style={styles.headerRow}>
                  <Globe size={16} color="#1D261F" />
                  <Text style={styles.dropdownTitle}>Select Language / भाषा चुनें</Text>
                </View>

                {LANGS.map((item) => {
                  const isActive = item.code === lang;
                  return (
                    <TouchableOpacity
                      key={item.code}
                      style={[styles.optionRow, isActive && styles.optionRowActive]}
                      onPress={() => handleSelect(item.code)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.optionText, isActive && styles.optionTextActive]}>
                        {item.name}
                      </Text>
                      {isActive && <Check size={16} color="#2E7D32" />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  triggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E7E5DA',
    gap: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  icon: {
    marginRight: 1,
  },
  triggerText: {
    color: '#1D261F',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(29, 38, 31, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dropdownCard: {
    width: '85%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E7E5DA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 12,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E7E5DA',
  },
  dropdownTitle: {
    color: '#1D261F',
    fontSize: 13,
    fontWeight: '700',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  optionRowActive: {
    backgroundColor: '#E7F2E7',
  },
  optionText: {
    color: '#1D261F',
    fontSize: 13,
    fontWeight: '500',
  },
  optionTextActive: {
    color: '#2E7D32',
    fontWeight: '700',
  },
});
