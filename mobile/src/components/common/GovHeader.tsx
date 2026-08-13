import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface GovHeaderProps {
  title?: string;
  subtitle?: string;
}

export function GovHeader({
  title = 'DHANSETU',
  subtitle = 'Verified Merchant Gateway',
}: GovHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        <Image
          source={require('../../../assets/splash-icon.png')}
          style={{ width: 36, height: 36, borderRadius: 18, resizeMode: 'cover' }}
        />
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
    borderRadius: 18,
    backgroundColor: '#E7F2E7',
    borderWidth: 1,
    borderColor: '#E7E5DA',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
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
