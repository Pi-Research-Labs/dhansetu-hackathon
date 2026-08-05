import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Path, Circle, Line, Text as SvgText, G } from 'react-native-svg';

export function MarketPriceChart() {
  const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  // Rainfall in mm
  const rainfallData = [185, 210, 145, 60, 15, 5, 0, 10, 25, 40, 85, 160];
  // Price Index (100 base)
  const priceIndexData = [102, 104, 107, 112, 118, 122, 120, 119, 123, 125, 128, 131];

  const chartHeight = 170;
  const paddingLeft = 32;
  const paddingRight = 32;
  const paddingTop = 15;
  const paddingBottom = 25;

  const maxRain = 250;
  const minPrice = 90;
  const maxPrice = 140;

  return (
    <View style={styles.container}>
      <Text style={styles.chartTitle}>12-Month Commodity Price Index & Rainfall (ECharts Dual Axis)</Text>
      
      {/* Legend */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: '#93C5FD' }]} />
          <Text style={styles.legendText}>Rainfall (mm)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { borderColor: '#166534' }]} />
          <Text style={styles.legendText}>Price Index (Base 100)</Text>
        </View>
      </View>

      {/* SVG Canvas */}
      <Svg width="100%" height={chartHeight} viewBox={`0 0 320 ${chartHeight}`}>
        {/* Gridlines */}
        {[0, 0.5, 1].map((pct, i) => {
          const y = paddingTop + (1 - pct) * (chartHeight - paddingTop - paddingBottom);
          return (
            <G key={i}>
              <Line x1={paddingLeft} y1={y} x2={320 - paddingRight} y2={y} stroke="#F1F5F9" strokeWidth="1" />
              <SvgText x={paddingLeft - 4} y={y + 3} fill="#94A3B8" fontSize="8" textAnchor="end">
                {Math.round(pct * maxRain)}
              </SvgText>
              <SvgText x={320 - paddingRight + 4} y={y + 3} fill="#94A3B8" fontSize="8" textAnchor="start">
                {Math.round(minPrice + pct * (maxPrice - minPrice))}
              </SvgText>
            </G>
          );
        })}

        {/* Rainfall Bars */}
        {months.map((m, idx) => {
          const chartWidth = 320 - paddingLeft - paddingRight;
          const step = chartWidth / months.length;
          const x = paddingLeft + step * idx + 2;
          const barW = Math.max(step - 4, 4);

          const usableH = chartHeight - paddingTop - paddingBottom;
          const rainH = (rainfallData[idx] / maxRain) * usableH;
          const rainY = paddingTop + usableH - rainH;

          return (
            <G key={idx}>
              <Rect x={x} y={rainY} width={barW} height={rainH} fill="#93C5FD" opacity="0.6" rx="1" />
              <SvgText x={x + barW / 2} y={chartHeight - 6} fill="#64748B" fontSize="8" textAnchor="middle">
                {m}
              </SvgText>
            </G>
          );
        })}

        {/* Price Index Line */}
        {(() => {
          const chartWidth = 320 - paddingLeft - paddingRight;
          const step = chartWidth / months.length;
          const usableH = chartHeight - paddingTop - paddingBottom;

          const points = priceIndexData.map((val, idx) => {
            const x = paddingLeft + step * idx + step / 2;
            const norm = (val - minPrice) / (maxPrice - minPrice);
            const y = paddingTop + (1 - norm) * usableH;
            return `${x},${y}`;
          });

          return (
            <G>
              <Path d={`M ${points.join(' L ')}`} fill="none" stroke="#166534" strokeWidth="2" />
              {priceIndexData.map((val, idx) => {
                const x = paddingLeft + step * idx + step / 2;
                const norm = (val - minPrice) / (maxPrice - minPrice);
                const y = paddingTop + (1 - norm) * usableH;
                return <Circle key={idx} cx={x} cy={y} r="2.5" fill="#166534" stroke="#FFFFFF" strokeWidth="1" />;
              })}
            </G>
          );
        })()}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  chartTitle: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  legendRow: {
    flexDirection: 'row',
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
    color: '#64748B',
    fontSize: 10,
    fontWeight: '500',
  },
});
