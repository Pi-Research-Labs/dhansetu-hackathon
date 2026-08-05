import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';

interface SecurityBadgeProps {
  label?: string;
}

export function SecurityBadge({
  label = 'Protected by National Cyber Security Audit • NIC Verified',
}: SecurityBadgeProps) {
  return (
    <View style={styles.container}>
      <ShieldCheck size={16} color="#10B981" />
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  text: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '500',
  },
});
