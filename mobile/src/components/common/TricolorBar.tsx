import React from 'react';
import { View, StyleSheet } from 'react-native';

export function TricolorBar() {
  return (
    <View style={styles.container}>
      <View style={[styles.bar, { backgroundColor: '#FF9933' }]} />
      <View style={[styles.bar, { backgroundColor: '#FFFFFF' }]} />
      <View style={[styles.bar, { backgroundColor: '#138808' }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 2,
    width: '100%',
    opacity: 0.8,
  },
  bar: {
    flex: 1,
    height: '100%',
  },
});
