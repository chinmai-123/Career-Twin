import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import colors from '../theme/colors';

const ScoreGauge = ({
  score = 0,
  size = 140,
  strokeWidth = 12,
  title = '',
  subtitle = '',
}) => {
  const safeScore = Math.max(0, Math.min(100, Math.round(score)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (safeScore / 100) * circumference;

  const getColor = (s) => {
    if (s >= 75) return colors.success;
    if (s >= 55) return colors.warning;
    return colors.danger;
  };

  const scoreColor = getColor(safeScore);

  return (
    <View style={styles.container}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size}>
          {/* Background Track */}
          <Circle
            stroke={colors.border}
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
          />
          {/* Progress Circle */}
          <Circle
            stroke={scoreColor}
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        {/* Inner Score Text */}
        <View style={styles.textOverlay}>
          <Text style={[styles.scoreNumber, { color: scoreColor }]}>
            {safeScore}
            <Text style={styles.percentSign}>%</Text>
          </Text>
          {title ? <Text style={styles.scoreTitle}>{title}</Text> : null}
        </View>
      </View>
      {subtitle ? <Text style={styles.subtitleText}>{subtitle}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  textOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumber: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  percentSign: {
    fontSize: 18,
    fontWeight: '600',
  },
  scoreTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  subtitleText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default ScoreGauge;
