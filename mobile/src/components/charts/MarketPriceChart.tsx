import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Rect, Path, Circle, Line, Text as SvgText, G } from 'react-native-svg';
import { MarketChartPoint } from '@/utils/api-config';

interface MarketPriceChartProps {
  chartData?: MarketChartPoint[];
}

export function MarketPriceChart({ chartData }: MarketPriceChartProps) {
  const months = chartData && chartData.length > 0
    ? chartData.map((d) => d.month)
    : ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  // Rainfall in mm
  const rainfallData = chartData && chartData.length > 0
    ? chartData.map((d) => d.rainfall_mm)
    : [185, 210, 145, 60, 15, 5, 0, 10, 25, 40, 85, 160];

  // Price Index (100 base)
  const priceIndexData = chartData && chartData.length > 0
    ? chartData.map((d) => d.price_index)
    : [102, 104, 107, 112, 118, 122, 120, 119, 123, 125, 128, 131];

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const chartHeight = 190;
  const paddingLeft = 42;
  const paddingRight = 32;
  const paddingTop = 20;
  const paddingBottom = 30;

  const maxRain = chartData && chartData.length > 0
    ? Math.max(...rainfallData, 50)
    : 250;

  const minPrice = chartData && chartData.length > 0
    ? Math.max(0, Math.min(...priceIndexData) - 5)
    : 90;

  const maxPrice = chartData && chartData.length > 0
    ? Math.max(...priceIndexData) + 5
    : 140;

  const activeItem = selectedIndex !== null
    ? { month: months[selectedIndex], price: priceIndexData[selectedIndex], rain: rainfallData[selectedIndex] }
    : { month: months[months.length - 1], price: priceIndexData[priceIndexData.length - 1], rain: rainfallData[rainfallData.length - 1] };

  const chartWidth = 320 - paddingLeft - paddingRight;
  const step = chartWidth / months.length;
  const usableH = chartHeight - paddingTop - paddingBottom;

  return (
    <View style={styles.container}>
      
      {/* Legend Header */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: '#1565C0', opacity: 0.45 }]} />
          <Text style={styles.legendText}>Rainfall (mm)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { borderColor: '#2E7D32' }]} />
          <Text style={styles.legendText}>Price (Base 100)</Text>
        </View>
      </View>

      {/* SVG Combo Chart */}
      <View style={styles.chartWrapper}>
        <Svg width={320} height={chartHeight} viewBox={`0 0 320 ${chartHeight}`}>
          {/* Y Axis Gridlines */}
          {[0, 0.5, 1].map((pct, i) => {
            const y = paddingTop + (1 - pct) * usableH;
            return (
              <G key={i}>
                <Line
                  x1={paddingLeft}
                  y1={y}
                  x2={320 - paddingRight}
                  y2={y}
                  stroke="#E7E5DA"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                {/* Left Y-Axis (Rainfall) */}
                <SvgText
                  x={paddingLeft - 6}
                  y={y + 3}
                  fill="#6F6B5E"
                  fontSize="9"
                  textAnchor="end"
                >
                  {Math.round(pct * maxRain)}
                </SvgText>
                {/* Right Y-Axis (Price) */}
                <SvgText
                  x={320 - paddingRight + 6}
                  y={y + 3}
                  fill="#6F6B5E"
                  fontSize="9"
                  textAnchor="start"
                >
                  {Math.round(minPrice + pct * (maxPrice - minPrice))}
                </SvgText>
              </G>
            );
          })}

          {/* Rainfall Bars & Selection Highlights */}
          {months.map((m, idx) => {
            const isSelected = selectedIndex === idx;
            const xCenter = paddingLeft + step * idx + step / 2;
            const barW = 12;
            const barX = xCenter - barW / 2;

            const rainH = (rainfallData[idx] / maxRain) * usableH;
            const rainY = paddingTop + usableH - rainH;

            return (
              <G key={idx}>
                {/* Active Selection Highlight Column */}
                {isSelected && (
                  <Rect
                    x={paddingLeft + step * idx}
                    y={paddingTop}
                    width={step}
                    height={usableH}
                    fill="#E7F2E7"
                    rx="4"
                    opacity="0.6"
                  />
                )}

                {/* Rainfall Bar */}
                <Rect
                  x={barX}
                  y={rainY}
                  width={barW}
                  height={rainH}
                  fill={isSelected ? '#0D47A1' : '#1565C0'}
                  fillOpacity={isSelected ? 1.0 : 0.45}
                  rx="3"
                />
              </G>
            );
          })}

          {/* Price Line */}
          {(() => {
            const points = priceIndexData.map((val, idx) => {
              const xCenter = paddingLeft + step * idx + step / 2;
              const norm = (val - minPrice) / (maxPrice - minPrice);
              const y = paddingTop + (1 - norm) * usableH;
              return `${xCenter},${y}`;
            });

            return (
              <G>
                <Path d={`M ${points.join(' L ')}`} fill="none" stroke="#2E7D32" strokeWidth="2.5" />
                {priceIndexData.map((val, idx) => {
                  const isSelected = selectedIndex === idx;
                  const xCenter = paddingLeft + step * idx + step / 2;
                  const norm = (val - minPrice) / (maxPrice - minPrice);
                  const y = paddingTop + (1 - norm) * usableH;
                  return (
                    <Circle
                      key={idx}
                      cx={xCenter}
                      cy={y}
                      r={isSelected ? '5' : '3.5'}
                      fill="#2E7D32"
                      stroke="#FFFFFF"
                      strokeWidth={isSelected ? '2' : '1.5'}
                    />
                  );
                })}
              </G>
            );
          })()}
        </Svg>

        {/* Hotspots Overlay */}
        <View style={styles.hotspotsOverlay}>
          {months.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.hotspot,
                {
                  left: paddingLeft + step * idx,
                  width: step,
                  height: chartHeight - paddingBottom,
                },
              ]}
              onPress={() => setSelectedIndex(idx)}
              activeOpacity={0.6}
            />
          ))}
        </View>
      </View>

      {/* Selected Month Callout / Active Detail Box */}
      {activeItem && (
        <View style={styles.detailCard}>
          <View style={styles.detailHeader}>
            <Text style={styles.detailTitle}>{activeItem.month} Forecast & Trends</Text>
            <Text style={styles.detailRange}>Active Detail</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Price:</Text>
            <Text style={[styles.detailVal, { color: '#2E7D32' }]}>
              {activeItem.price.toFixed(1)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Rainfall:</Text>
            <Text style={[styles.detailVal, { color: '#1565C0' }]}>
              {activeItem.rain.toFixed(1)} mm
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginTop: 6,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendBox: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  legendLine: {
    width: 12,
    height: 0,
    borderTopWidth: 2,
  },
  legendText: {
    color: '#6F6B5E',
    fontSize: 9.5,
    fontWeight: '500',
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: 320,
    alignSelf: 'center',
  },
  hotspotsOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  hotspot: {
    position: 'absolute',
    top: 20, // paddingTop
    backgroundColor: 'transparent',
  },
  detailCard: {
    backgroundColor: '#FAFAF5',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E7E5DA',
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailTitle: {
    color: '#1D261F',
    fontSize: 12,
    fontWeight: '700',
  },
  detailRange: {
    color: '#6F6B5E',
    fontSize: 11,
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    color: '#6F6B5E',
    fontSize: 11,
  },
  detailVal: {
    fontSize: 11,
    fontWeight: '600',
  },
});
