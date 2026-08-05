import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, PlusCircle, Store, Bell, User } from 'lucide-react-native';
import { useDoubleBackExit } from '@/hooks/useDoubleBackExit';
import { useMerchantStore } from '@/store/useMerchantStore';
import { FirstLoadLangModal } from '@/components/common/FirstLoadLangModal';

const TAB_TITLES: Record<string, { home: string; add: string; market: string; alerts: string; account: string }> = {
  en: { home: 'Home', add: 'Add Entry', market: 'Market', alerts: 'Alerts', account: 'Account' },
  hi: { home: 'होम', add: 'प्रविष्टि जोड़ें', market: 'बाज़ार', alerts: 'अलर्ट', account: 'खाता' },
  mr: { home: 'होम', add: 'नोंद करा', market: 'बाजार', alerts: 'सूचना', account: 'खाते' },
  te: { home: 'హోమ్', add: 'ఎంట్రీ', market: 'మార్కెట్', alerts: 'అలర్ట్స్', account: 'ఖాతా' },
};

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { lang } = useMerchantStore();
  
  // Intercepts hardware back press: double tap to exit app
  useDoubleBackExit();

  const bottomInset = Math.max(insets.bottom, 12);
  const tabBarHeight = 62 + bottomInset;
  const titles = TAB_TITLES[lang] || TAB_TITLES.en;

  return (
    <>
      <FirstLoadLangModal />

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: true,
          tabBarActiveTintColor: '#2E7D32',
          tabBarInactiveTintColor: '#6F6B5E',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#E7E5DA',
            height: tabBarHeight,
            paddingBottom: bottomInset,
            paddingTop: 8,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.05,
            shadowRadius: 6,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            letterSpacing: 0.1,
            marginTop: 2,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: titles.home,
            tabBarIcon: ({ color, focused }) => (
              <View style={[styles.iconBox, focused && styles.activeIconBox]}>
                <Home size={focused ? 21 : 19} color={color} />
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="add-entry"
          options={{
            title: titles.add,
            tabBarIcon: ({ color, focused }) => (
              <View style={[styles.iconBox, focused && styles.activeIconBox]}>
                <PlusCircle size={focused ? 23 : 21} color={color} />
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="market"
          options={{
            title: titles.market,
            tabBarIcon: ({ color, focused }) => (
              <View style={[styles.iconBox, focused && styles.activeIconBox]}>
                <Store size={focused ? 21 : 19} color={color} />
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="alerts"
          options={{
            title: titles.alerts,
            tabBarIcon: ({ color, focused }) => (
              <View style={[styles.iconBox, focused && styles.activeIconBox]}>
                <Bell size={focused ? 21 : 19} color={color} />
                <View style={styles.alertBadgeDot} />
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="account"
          options={{
            title: titles.account,
            tabBarIcon: ({ color, focused }) => (
              <View style={[styles.iconBox, focused && styles.activeIconBox]}>
                <User size={focused ? 21 : 19} color={color} />
              </View>
            ),
          }}
        />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  iconBox: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 34,
    height: 26,
    borderRadius: 13,
  },
  activeIconBox: {
    backgroundColor: '#E7F2E7',
  },
  alertBadgeDot: {
    position: 'absolute',
    top: 2,
    right: 4,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#C0392B',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
});
