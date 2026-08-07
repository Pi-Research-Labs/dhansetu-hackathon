import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AlertCircle, CheckCircle2, ShieldAlert, Info } from 'lucide-react-native';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
  confirmText?: string;
}

export function CustomAlert({
  visible,
  title,
  message,
  type = 'info',
  onClose,
  confirmText = 'OK',
}: CustomAlertProps) {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={36} color="#2E7D32" />;
      case 'error':
        return <ShieldAlert size={36} color="#C0392B" />;
      case 'warning':
        return <AlertCircle size={36} color="#D97706" />;
      default:
        return <Info size={36} color="#1565C0" />;
    }
  };

  const getIconBg = () => {
    switch (type) {
      case 'success':
        return '#E7F2E7';
      case 'error':
        return '#F8E6E2';
      case 'warning':
        return '#FBF0D9';
      default:
        return '#E3F2FD';
    }
  };

  const getButtonBg = () => {
    switch (type) {
      case 'success':
        return '#2E7D32';
      case 'error':
        return '#C0392B';
      case 'warning':
        return '#D97706';
      default:
        return '#1565C0';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={[styles.iconBox, { backgroundColor: getIconBg() }]}>
            {getIcon()}
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: getButtonBg() }]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.btnText}>{confirmText}</Text>
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
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#1D261F',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    color: '#6F6B5E',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  btn: {
    width: '100%',
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
