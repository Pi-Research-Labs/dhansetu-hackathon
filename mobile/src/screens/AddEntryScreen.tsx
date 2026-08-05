import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PlusCircle, CheckCircle2, History } from 'lucide-react-native';
import { useMerchantStore, Entry } from '@/store/useMerchantStore';
import { L } from '@/i18n/translations';

export function AddEntryScreen() {
  const insets = useSafeAreaInsets();
  const { lang, entries, addEntry } = useMerchantStore();
  const t = L[lang];

  const [type, setType] = useState<Entry['type']>('income');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const typeKeys: Entry['type'][] = ['income', 'expense', 'savdep', 'savwd', 'emi', 'newloan'];

  const handleSave = () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid positive number for the amount.');
      return;
    }

    addEntry({
      type,
      amount: numAmount,
      note: note.trim() || 'Recorded transaction',
    });

    setAmount('');
    setNote('');
    Alert.alert('Entry Saved', 'Transaction entry successfully recorded into your digital ledger.');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <PlusCircle size={20} color="#1E293B" />
          <Text style={styles.headerTitle}>{t.recordEntryTitle}</Text>
        </View>
        <Text style={styles.headerSubtitle}>{t.recordEntrySub}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Entry Form Card */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>{t.newLedgerEntry}</Text>

          {/* Select Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t.transTypeLabel}</Text>
            <View style={styles.pillsContainer}>
              {typeKeys.map((k) => (
                <TouchableOpacity
                  key={k}
                  style={[styles.pill, type === k && styles.pillActive]}
                  onPress={() => setType(k)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.pillText, type === k && styles.pillTextActive]}>
                    {t.entryTypes[k] || k}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Amount */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t.amountLabel}</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.textInput}
                placeholder="2500"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
            </View>
          </View>

          {/* Note */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t.noteLabel}</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder={t.notePh}
                placeholderTextColor="#94A3B8"
                value={note}
                onChangeText={setNote}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSave} activeOpacity={0.85}>
            <CheckCircle2 size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.submitBtnText}>{t.saveEntryBtn}</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Ledger Entries */}
        <View style={styles.historyCard}>
          <View style={styles.historyHeader}>
            <History size={16} color="#0F172A" />
            <Text style={styles.historyTitle}>{t.recentLedgerEntries} ({entries.length})</Text>
          </View>

          {entries.map((en) => (
            <View key={en.id} style={styles.entryRowItem}>
              <View style={styles.entryMainInfo}>
                <Text style={styles.entryTypeTitle}>{t.entryTypes[en.type] || en.type}</Text>
                <Text style={styles.entryNoteText}>{en.note}</Text>
              </View>
              <View style={styles.entryAmountInfo}>
                <Text style={[styles.entryAmtText, en.type === 'expense' || en.type === 'emi' ? styles.textRed : styles.textGreen]}>
                  {en.type === 'expense' || en.type === 'emi' ? `-₹ ${en.amount.toLocaleString('en-IN')}` : `+₹ ${en.amount.toLocaleString('en-IN')}`}
                </Text>
                <Text style={styles.entryDateText}>{en.date}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    color: '#0F172A',
    fontSize: 17,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 4,
    lineHeight: 16,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  cardSectionTitle: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  pillActive: {
    backgroundColor: '#1E293B',
    borderColor: '#1E293B',
  },
  pillText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500',
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
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
  currencySymbol: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 16,
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    color: '#0F172A',
    fontSize: 14,
  },
  submitBtn: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  historyTitle: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
  },
  entryRowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  entryMainInfo: {
    flex: 1,
  },
  entryTypeTitle: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '600',
  },
  entryNoteText: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  entryAmountInfo: {
    alignItems: 'flex-end',
  },
  entryAmtText: {
    fontSize: 13,
    fontWeight: '700',
  },
  entryDateText: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 2,
  },
  textRed: {
    color: '#991B1B',
  },
  textGreen: {
    color: '#166534',
  },
});
