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
        <Landmark size={20} color="#2E7D32" />
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
    backgroundColor: '#E7F2E7',
    borderWidth: 1,
    borderColor: '#E7E5DA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  govTitle: {
    color: '#1D261F',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  subtitle: {
    color: '#6F6B5E',
    fontSize: 10,
    fontWeight: '500',
  },
});
