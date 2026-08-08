import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Rect, Path, Circle, Line, Text as SvgText, G } from 'react-native-svg';

interface WeeklyData {
  week: string;
  weekLabel: string;
  dateRange: string;
  inflow: number;
  outflow: number;
  net: number;
}

interface Props {
  data: WeeklyData[];
}

export function WeeklyCashflowChart({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { paddingVertical: 40, alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: '#6F6B5E', fontSize: 13, fontWeight: '700' }}>
          No cashflow records available yet
        </Text>
        <Text style={{ color: '#94A3B8', fontSize: 11, marginTop: 4, textAlign: 'center', paddingHorizontal: 20 }}>
          Add daily entries to generate weekly cashflow analytics.
        </Text>
      </View>
    );
  }

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const chartHeight = 190;
  const paddingLeft = 42;
  const paddingRight = 15;
  const paddingTop = 20;
  const paddingBottom = 30;

  const displayData = data.slice(-5); // Last 5 weeks
  const activeItem = selectedIndex !== null ? displayData[selectedIndex] : displayData[displayData.length - 1];

  // Scale calculations (unified scale for inflow, outflow, and net cashflow)
  const allValues = displayData.flatMap((d) => [d.inflow, d.outflow, d.net]);
  const minVal = Math.min(0, ...allValues);
  const maxVal = Math.max(...allValues) || 500000;

  const formatK = (val: number) => {
    if (val === 0) return '0';
    const isNeg = val < 0;
    const absVal = Math.abs(val);
    let formatted = '';
    if (absVal >= 100000) {
      formatted = `${(absVal / 100000).toFixed(1)}L`;
    } else if (absVal >= 1000) {
      formatted = `${(absVal / 1000).toFixed(1)}k`;
    } else {
      formatted = `${Math.round(absVal)}`;
    }
    // Remove trailing .0 if present
    if (formatted.endsWith('.0')) {
      formatted = formatted.slice(0, -2);
    }
    return isNeg ? `-${formatted}` : formatted;
  };

  const chartWidth = 320 - paddingLeft - paddingRight;
  const step = chartWidth / displayData.length;
  const usableH = chartHeight - paddingTop - paddingBottom;

  const getPrefY = (val: number) => {
    const pct = (val - minVal) / (maxVal - minVal || 1);
    return paddingTop + (1 - pct) * usableH;
  };
  const zeroY = getPrefY(0);

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
            const val = minVal + pct * (maxVal - minVal);
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

          {/* Zero Baseline Line */}
          <Line
            x1={paddingLeft}
            y1={zeroY}
            x2={320 - paddingRight}
            y2={zeroY}
            stroke="#6F6B5E"
            strokeWidth="1.5"
            opacity="0.8"
          />

          {/* Grouped Inflow / Outflow Bars */}
          {displayData.map((item, idx) => {
            const isSelected = selectedIndex === idx;
            const xCenter = paddingLeft + step * idx + step / 2;

            const inflowY = getPrefY(item.inflow);
            const inflowH = Math.max(zeroY - inflowY, 4);
            const inY = zeroY - inflowH;

            const outflowY = getPrefY(item.outflow);
            const outflowH = Math.max(zeroY - outflowY, 4);
            const outY = zeroY - outflowH;

            const barW = 10;
            const inX = xCenter - barW - 1;
            const outX = xCenter + 1;

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
              const netY = getPrefY(item.net);
              return `${xCenter},${netY}`;
            });

            return <Path d={`M ${points.join(' L ')}`} fill="none" stroke="#1D261F" strokeWidth="2.5" />;
          })()}

          {/* Net Dots */}
          {displayData.map((item, idx) => {
            const isSelected = selectedIndex === idx;
            const xCenter = paddingLeft + step * idx + step / 2;
            const netY = getPrefY(item.net);

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
          <View style={styles.detailHeader}>
            <Text style={styles.detailTitle}>{activeItem.weekLabel}</Text>
            <Text style={styles.detailRange}>{activeItem.dateRange}</Text>
          </View>
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
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
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
