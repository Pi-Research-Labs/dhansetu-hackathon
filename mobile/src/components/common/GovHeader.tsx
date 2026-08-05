import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Landmark } from 'lucide-react-native';

interface GovHeaderProps {
  title?: string;
  subtitle?: string;
}

export function GovHeader({
  title = 'GOVERNMENT OF INDIA',
  subtitle = 'Ministry of Commerce & Industry',
}: GovHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        <Landmark size={20} color="#1E293B" />
      </View>
      <View>
        <Text style={styles.govTitle}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  govTitle: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  subtitle: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '500',
  },
});
