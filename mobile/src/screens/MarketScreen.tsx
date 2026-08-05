import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Store, TrendingUp, Calendar, ShieldAlert } from 'lucide-react-native';
import { useMerchantStore } from '@/store/useMerchantStore';
import { L } from '@/i18n/translations';
import { MarketPriceChart } from '@/components/charts/MarketPriceChart';

interface SegmentIntel {
  commodity: string;
  productivity: string;
  seasonal: string;
  risks: { tag: string; severity: 'high' | 'medium' | 'low'; desc: string }[];
  prices: { name: string; location: string; price: string; change: string; isUp: boolean }[];
}

const MARKET_INTEL: Record<string, SegmentIntel> = {
  'Kirana Store': {
    commodity: 'FMCG & Food Staples Basket',
    productivity: 'Staple supplies steady; distributor credit tightening reducing margins by ~2% YoY on packaged goods.',
    seasonal: 'Demand peaks during Dussehra–Diwali & Sankranti; 5–10% dip during monsoon months due to reduced rural daily wages.',
    risks: [
      { tag: 'Price fluctuation', severity: 'medium', desc: 'Edible oil & pulse price swings compress fixed-MRP margins.' },
      { tag: 'Local disruption', severity: 'low', desc: 'New highway retail cluster may divert weekly haat footfall.' },
    ],
    prices: [
      { name: 'Wheat Flour (Atta 10kg)', location: 'Karimnagar Wholesale', price: '₹ 340 / bag', change: '+1.2%', isUp: true },
      { name: 'Refined Edible Oil (1L)', location: 'Telangana Mandi Index', price: '₹ 128 / L', change: '-0.8%', isUp: false },
      { name: 'Toor Dal (Grade A)', location: 'Nizamabad APMC', price: '₹ 142 / kg', change: '+2.5%', isUp: true },
    ],
  },
  'Dairy Producer': {
    commodity: 'Milk Procurement Price (per Litre)',
    productivity: 'Yield per animal up ~1.5% YoY with improved fodder; flush season yields significantly higher.',
    seasonal: 'Flush season (Nov–Feb) volume up ~20%; feed cost per litre escalates during lean summer months.',
    risks: [
      { tag: 'Weather shock', severity: 'high', desc: 'Apr–Jun heatwaves reduce milk yield by 8–12% in low-rainfall years.' },
      { tag: 'Price fluctuation', severity: 'medium', desc: 'Maize & soya feed cost surges compress per-litre margins.' },
    ],
    prices: [
      { name: 'Cow Milk (3.5% Fat)', location: 'Karimnagar Dairy Co-op', price: '₹ 38.50 / L', change: '+1.5%', isUp: true },
      { name: 'Buffalo Milk (6.0% Fat)', location: 'Warangal Collection Center', price: '₹ 54.00 / L', change: '+2.0%', isUp: true },
      { name: 'Cattle Feed (50kg)', location: 'Regional APMC Feed Depot', price: '₹ 1,350 / bag', change: '+0.5%', isUp: true },
    ],
  },
  'FPO': {
    commodity: 'Paddy & Groundnut Mandi Index',
    productivity: 'Regional paddy yields +0.8% YoY long-term baseline; groundnut highly dependent on monsoon timing.',
    seasonal: 'Cashflows concentrated in Rabi (Mar–Apr) and Kharif (Oct–Nov) procurement windows.',
    risks: [
      { tag: 'Weather shock', severity: 'high', desc: 'Deficient monsoons directly cut Kharif volumes; irrigation provides only partial buffer.' },
      { tag: 'Price fluctuation', severity: 'medium', desc: 'MSP vs open-market spreads cause 5–15% swing in net realizations.' },
      { tag: 'Local disruption', severity: 'low', desc: 'Mandi transport strikes delay buyer settlements by 1–3 weeks.' },
    ],
    prices: [
      { name: 'Paddy (Grade A MSP)', location: 'Karimnagar Procurement Center', price: '₹ 2,320 / Qtl', change: '+4.0%', isUp: true },
      { name: 'Groundnut (Bold)', location: 'Kurnool APMC Mandi', price: '₹ 6,450 / Qtl', change: '-1.2%', isUp: false },
      { name: 'Maize (Yellow)', location: 'Nizamabad Mandi', price: '₹ 2,090 / Qtl', change: '+1.8%', isUp: true },
    ],
  },
  'Poultry Unit': {
    commodity: 'Egg / Broiler Realization vs Feed Index',
    productivity: 'Feed conversion ratio improving steadily; disease management remains primary productivity driver.',
    seasonal: 'Strong winter demand; summer heat lowers egg laying rates and elevates mortality risk.',
    risks: [
      { tag: 'Weather shock', severity: 'high', desc: 'Extreme heat spike causes mortality and 5–10% drop in egg laying.' },
      { tag: 'Price fluctuation', severity: 'high', desc: 'Maize/soya feed constitutes ~65% of costs and is highly volatile.' },
      { tag: 'Local disruption', severity: 'medium', desc: 'Bird-flu scares temporarily suppress local consumer demand.' },
    ],
    prices: [
      { name: 'Layer Eggs (NECC Index)', location: 'Hyderabad/Karimnagar Zone', price: '₹ 4.85 / pc', change: '+3.2%', isUp: true },
      { name: 'Broiler (Live Weight)', location: 'Farm Gate Realization', price: '₹ 112 / kg', change: '-2.1%', isUp: false },
    ],
  },
};

export function MarketScreen() {
  const insets = useSafeAreaInsets();
  const { lang, segment } = useMerchantStore();
  const t = L[lang];

  const segments = Object.keys(MARKET_INTEL);
  
  // Try to find a matching segment key or default to 'FPO'
  const matchedSegment = segments.find(
    (s) => s.toLowerCase().includes(segment.toLowerCase()) || segment.toLowerCase().includes(s.toLowerCase())
  ) || 'FPO';
  const [selectedSegment, setSelectedSegment] = useState<string>(matchedSegment);

  const intel = MARKET_INTEL[selectedSegment] || MARKET_INTEL['FPO'];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Store size={22} color="#2E7D32" />
          <Text style={styles.headerTitle}>{t.marketTitle}</Text>
        </View>
        <Text style={styles.headerSubtitle}>{t.marketSub}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Segment Selector */}
        <View style={styles.segmentContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {segments.map((seg) => (
              <TouchableOpacity
                key={seg}
                style={[styles.segTab, selectedSegment === seg && styles.segTabActive]}
                onPress={() => setSelectedSegment(seg)}
                activeOpacity={0.8}
              >
                <Text style={[styles.segText, selectedSegment === seg && styles.segTextActive]}>
                  {seg}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Commodity Basket Banner */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>{t.trackedCommodity}</Text>
          <Text style={styles.commodityTitle}>{intel.commodity}</Text>
          <View style={styles.liveTagRow}>
            <View style={styles.liveDot} />
            <Text style={styles.liveTagText}>{t.liveFeed}</Text>
          </View>
        </View>

        {/* ECharts Price Index & Rainfall Chart */}
        <MarketPriceChart />

        {/* Commodity Prices */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t.realtimeRates}</Text>
        </View>

        {intel.prices.map((p, idx) => (
          <View key={idx} style={styles.priceCard}>
            <View style={styles.priceMain}>
              <Text style={styles.priceName}>{p.name}</Text>
              <Text style={styles.priceLoc}>{p.location}</Text>
            </View>
            <View style={styles.priceRight}>
              <Text style={styles.priceVal}>{p.price}</Text>
              <View style={[styles.changeChip, p.isUp ? styles.chipUp : styles.chipDown]}>
                <Text style={[styles.changeText, p.isUp ? styles.textUp : styles.textDown]}>{p.change}</Text>
              </View>
            </View>
          </View>
        ))}

        {/* Productivity Outlook */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <TrendingUp size={16} color="#2E7D32" />
            <Text style={styles.cardHeaderTitle}>{t.productivityTitle}</Text>
          </View>
          <Text style={styles.cardDescText}>{intel.productivity}</Text>
        </View>

        {/* Seasonal Pattern */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Calendar size={16} color="#1565C0" />
            <Text style={styles.cardHeaderTitle}>{t.seasonalTitle}</Text>
          </View>
          <Text style={styles.cardDescText}>{intel.seasonal}</Text>
        </View>

        {/* Climate & Market Risks */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <ShieldAlert size={16} color="#C0392B" />
            <Text style={styles.cardHeaderTitle}>{t.climateRisksTitle}</Text>
          </View>

          {intel.risks.map((r, idx) => (
            <View key={idx} style={styles.riskItem}>
              <View style={styles.riskHeader}>
                <Text style={styles.riskTag}>{r.tag}</Text>
                <View style={[styles.sevBadge, r.severity === 'high' ? styles.sevHigh : r.severity === 'medium' ? styles.sevMed : styles.sevLow]}>
                  <Text style={styles.sevText}>{t.severityLabel(r.severity)}</Text>
                </View>
              </View>
              <Text style={styles.riskDesc}>{r.desc}</Text>
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
    backgroundColor: '#FAFAF5',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E7E5DA',
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    color: '#1D261F',
    fontSize: 17,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#6F6B5E',
    fontSize: 11,
    marginTop: 4,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  segmentContainer: {
    marginBottom: 14,
  },
  segTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7E5DA',
  },
  segTabActive: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  segText: {
    color: '#6F6B5E',
    fontSize: 12,
    fontWeight: '500',
  },
  segTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E7E5DA',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  cardLabel: {
    color: '#6F6B5E',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  commodityTitle: {
    color: '#1D261F',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  liveTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2E7D32',
  },
  liveTagText: {
    color: '#2E7D32',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#1D261F',
    fontSize: 14,
    fontWeight: '700',
  },
  priceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E7E5DA',
    marginBottom: 10,
  },
  priceMain: {
    flex: 1,
  },
  priceName: {
    color: '#1D261F',
    fontSize: 13,
    fontWeight: '600',
  },
  priceLoc: {
    color: '#6F6B5E',
    fontSize: 11,
    marginTop: 2,
  },
  priceRight: {
    alignItems: 'flex-end',
  },
  priceVal: {
    color: '#1D261F',
    fontSize: 14,
    fontWeight: '700',
  },
  changeChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  chipUp: {
    backgroundColor: '#E7F2E7',
  },
  chipDown: {
    backgroundColor: '#F8E6E2',
  },
  changeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  textUp: {
    color: '#2E7D32',
  },
  textDown: {
    color: '#C0392B',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  cardHeaderTitle: {
    color: '#1D261F',
    fontSize: 13,
    fontWeight: '700',
  },
  cardDescText: {
    color: '#1D261F',
    fontSize: 12,
    lineHeight: 18,
  },
  riskItem: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E7E5DA',
  },
  riskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  riskTag: {
    color: '#1D261F',
    fontSize: 12,
    fontWeight: '600',
  },
  sevBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sevHigh: {
    backgroundColor: '#F8E6E2',
  },
  sevMed: {
    backgroundColor: '#FBF0D9',
  },
  sevLow: {
    backgroundColor: '#FAFAF5',
  },
  sevText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#1D261F',
  },
  riskDesc: {
    color: '#6F6B5E',
    fontSize: 11,
    lineHeight: 16,
  },
});
