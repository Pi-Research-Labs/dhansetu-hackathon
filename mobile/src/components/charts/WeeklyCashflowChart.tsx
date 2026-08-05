import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Rect, Path, Circle, Line, Text as SvgText, G } from 'react-native-svg';

interface WeeklyData {
  week: string;
  inflow: number;
  outflow: number;
  net: number;
}

interface Props {
  data: WeeklyData[];
}

export function WeeklyCashflowChart({ data }: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const chartHeight = 190;
  const paddingLeft = 42;
  const paddingRight = 15;
  const paddingTop = 20;
  const paddingBottom = 30;

  const displayData = data.slice(-5); // Last 5 weeks
  const activeItem = selectedIndex !== null ? displayData[selectedIndex] : displayData[displayData.length - 1];

  // Scale calculations
  const maxVal = Math.max(...displayData.map((d) => Math.max(d.inflow, d.outflow))) || 500000;
  const minNet = Math.min(...displayData.map((d) => d.net), 0);
  const maxNet = Math.max(...displayData.map((d) => d.net), 300000);

  const formatK = (val: number) => {
    if (val >= 100000) return `${(val / 100000).toFixed(1)}L`;
    return `${Math.round(val / 1000)}k`;
  };

  const chartWidth = 320 - paddingLeft - paddingRight;
  const step = chartWidth / displayData.length;
  const usableH = chartHeight - paddingTop - paddingBottom;

  return (
    <View style={styles.container}>
      {/* Legend Header */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: '#2E7D32' }]} />
          <Text style={styles.legendText}>Inflow (₹)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: '#C0392B' }]} />
          <Text style={styles.legendText}>Outflow (₹)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { borderColor: '#1D261F' }]} />
          <Text style={styles.legendText}>Net Line</Text>
        </View>
      </View>

      {/* SVG Combo Chart (Runs on Phone App Android/iOS & Web) */}
      <View style={styles.chartWrapper}>
        <Svg width={320} height={chartHeight} viewBox={`0 0 320 ${chartHeight}`}>
          {/* Y Axis Gridlines */}
          {[0, 0.33, 0.66, 1].map((pct, i) => {
            const y = paddingTop + (1 - pct) * usableH;
            const val = maxVal * pct;
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
                <SvgText
                  x={paddingLeft - 6}
                  y={y + 3}
                  fill="#6F6B5E"
                  fontSize="9"
                  textAnchor="end"
                >
                  {formatK(val)}
                </SvgText>
              </G>
            );
          })}

          {/* Grouped Inflow / Outflow Bars */}
          {displayData.map((item, idx) => {
            const isSelected = selectedIndex === idx;
            const xCenter = paddingLeft + step * idx + step / 2;

            const inflowH = Math.max((item.inflow / maxVal) * usableH, 4);
            const outflowH = Math.max((item.outflow / maxVal) * usableH, 4);

            const barW = 10;
            const inX = xCenter - barW - 1;
            const outX = xCenter + 1;

            const inY = paddingTop + usableH - inflowH;
            const outY = paddingTop + usableH - outflowH;

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
                {/* Inflow Bar */}
                <Rect
                  x={inX}
                  y={inY}
                  width={barW}
                  height={inflowH}
                  fill={isSelected ? '#1B5E20' : '#2E7D32'}
                  fillOpacity={isSelected ? 1.0 : 0.45}
                  rx="3"
                />
                {/* Outflow Bar */}
                <Rect
                  x={outX}
                  y={outY}
                  width={barW}
                  height={outflowH}
                  fill={isSelected ? '#801A10' : '#C0392B'}
                  fillOpacity={isSelected ? 1.0 : 0.4}
                  rx="3"
                />
                {/* X Axis Label */}
                <SvgText
                  x={xCenter}
                  y={chartHeight - 8}
                  fill={isSelected ? '#1D261F' : '#6F6B5E'}
                  fontSize="10"
                  fontWeight={isSelected ? '700' : '600'}
                  textAnchor="middle"
                >
                  {item.week}
                </SvgText>
              </G>
            );
          })}

          {/* Connecting Line for Net Cashflow */}
          {(() => {
            const points = displayData.map((item, idx) => {
              const xCenter = paddingLeft + step * idx + step / 2;
              const netNormalized = (item.net - minNet) / (maxNet - minNet || 1);
              const netY = paddingTop + (1 - netNormalized) * usableH;
              return `${xCenter},${netY}`;
            });

            return <Path d={`M ${points.join(' L ')}`} fill="none" stroke="#1D261F" strokeWidth="2.5" />;
          })()}

          {/* Net Dots */}
          {displayData.map((item, idx) => {
            const isSelected = selectedIndex === idx;
            const xCenter = paddingLeft + step * idx + step / 2;
            const netNormalized = (item.net - minNet) / (maxNet - minNet || 1);
            const netY = paddingTop + (1 - netNormalized) * usableH;

            return (
              <Circle
                key={`dot_${idx}`}
                cx={xCenter}
                cy={netY}
                r={isSelected ? '5' : '3.5'}
                fill="#1D261F"
                stroke="#FFFFFF"
                strokeWidth={isSelected ? '2' : '1.5'}
              />
            );
          })}
        </Svg>

        {/* Invisible touch hotspots overlay to prevent onStartShouldSetResponder warnings on Web/Mobile */}
        <View style={styles.hotspotsOverlay}>
          {displayData.map((item, idx) => (
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

      {/* Selected Week Callout / Active Detail Box */}
      {activeItem && (
        <View style={styles.detailCard}>
          <Text style={styles.detailTitle}>Week of {activeItem.week}</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Inflow:</Text>
            <Text style={[styles.detailVal, { color: '#2E7D32' }]}>
              +₹ {activeItem.inflow.toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Outflow:</Text>
            <Text style={[styles.detailVal, { color: '#C0392B' }]}>
              -₹ {activeItem.outflow.toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={[styles.detailRow, styles.borderTop]}>
            <Text style={styles.detailLabelBold}>Net Cashflow:</Text>
            <Text style={[styles.detailValBold, { color: activeItem.net >= 0 ? '#2E7D32' : '#C0392B' }]}>
              {activeItem.net >= 0 ? '+' : ''}₹ {activeItem.net.toLocaleString('en-IN')}
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
    gap: 16,
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
    fontSize: 11,
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
  detailTitle: {
    color: '#1D261F',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
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
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: '#E7E5DA',
    paddingTop: 4,
    marginTop: 2,
  },
  detailLabelBold: {
    color: '#1D261F',
    fontSize: 11,
    fontWeight: '700',
  },
  detailValBold: {
    fontSize: 12,
    fontWeight: '700',
  },
});
