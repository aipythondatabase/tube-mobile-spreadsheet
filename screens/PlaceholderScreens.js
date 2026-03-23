import React, { useState, useContext, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SettingsContext } from '../App';

const PlaceholderScreen = ({ name, icon, description }) => (
  <View style={styles.container}>
    <Ionicons name={icon} size={64} color="#3d322d" />
    <Text style={styles.title}>{name}</Text>
    <Text style={styles.description}>{description}</Text>
    <View style={styles.statusBox}>
      <Text style={styles.statusText}>システム準備中...</Text>
    </View>
  </View>
);

// 対象国リストの拡充
const REGIONS = [
  { name: '日本', code: 'JP', lang: 'ja' },
  { name: 'アメリカ', code: 'US', lang: 'en' },
  { name: 'イスラエル', code: 'IL', lang: 'he' },
  { name: 'イギリス', code: 'GB', lang: 'en' },
  { name: '韓国', code: 'KR', lang: 'ko' },
  { name: '台湾', code: 'TW', lang: 'zh-TW' },
  { name: 'フランス', code: 'FR', lang: 'fr' },
  { name: 'ドイツ', code: 'DE', lang: 'de' },
  { name: 'ブラジル', code: 'BR', lang: 'pt' },
  { name: 'インド', code: 'IN', lang: 'hi' },
  { name: 'タイ', code: 'TH', lang: 'th' },
  { name: 'ベトナム', code: 'VN', lang: 'vi' },
  { name: 'イタリア', code: 'IT', lang: 'it' },
  { name: 'スペイン', code: 'ES', lang: 'es' }
];

// 自作スライダーコンポーネント
const CustomSlider = ({ label, value, onValueChange, hint, activeColor = '#8b5e3c', type = 'percent', onToggleScroll }) => {
  const [sliderWidth, setSliderWidth] = useState(0);

  const handleTouch = (event) => {
    if (sliderWidth === 0) return;
    const touchX = event.nativeEvent.locationX;
    let newValue = touchX / sliderWidth;
    newValue = Math.max(0, Math.min(1, newValue));
    onValueChange(newValue);
  };

  const getDisplayValue = () => {
    if (type === 'region') {
      const index = Math.round(value * (REGIONS.length - 1));
      return `${REGIONS[index].name} (${REGIONS[index].code})`;
    }
    return `${(value * 100).toFixed(0)}%`;
  };

  return (
    <View style={styles.settingItem}>
      <View style={styles.settingHeader}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={[styles.settingValue, { color: activeColor }]}>
          {getDisplayValue()}
        </Text>
      </View>
      <Text style={styles.settingHint}>{hint}</Text>
      
      <View 
        style={styles.sliderTrackContainer}
        onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderTerminationRequest={() => false}
        onResponderGrant={(e) => {
          if (onToggleScroll) onToggleScroll(false); // スクロール固定
          handleTouch(e);
        }}
        onResponderMove={handleTouch}
        onResponderRelease={() => {
          if (onToggleScroll) onToggleScroll(true); // スクロール解除
        }}
        onResponderTerminate={() => {
          if (onToggleScroll) onToggleScroll(true); // スクロール解除
        }}
      >
        <View style={styles.sliderTrack} pointerEvents="none">
          <View style={[styles.sliderFill, { width: `${value * 100}%`, backgroundColor: activeColor }]} />
        </View>
        <View style={[styles.sliderThumb, { left: `${value * 100}%`, borderColor: activeColor }]} pointerEvents="none" />
      </View>
    </View>
  );
};

export const AnalysisScreen = () => (
  <PlaceholderScreen 
    name="分析" 
    icon="bar-chart-outline" 
    description="視聴履歴からあなたの『成分』を解析し、特定ジャンルの影響力を調整できます。" 
  />
);

export const PostScreen = () => (
  <PlaceholderScreen 
    name="投稿" 
    icon="add-circle-outline" 
    description="外部の情報をこの深淵へと同期します。" 
  />
);

export const RealtimeScreen = () => (
  <PlaceholderScreen 
    name="リアルタイム" 
    icon="pulse-outline" 
    description="世界中で今この瞬間に行われている『選別』のパルスを受信します。" 
  />
);

export const SettingsScreen = () => {
  const { settings, updateSetting } = useContext(SettingsContext);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>精度設定</Text>
      </View>
      
      <ScrollView 
        style={styles.settingsList} 
        showsVerticalScrollIndicator={false}
        scrollEnabled={scrollEnabled}
      >
        <CustomSlider 
          label="カオス度（精度低下）"
          value={settings.chaosLevel}
          onValueChange={(val) => updateSetting('chaosLevel', val)}
          onToggleScroll={setScrollEnabled}
          hint="値を上げると、アルゴリズムの予測を無視した『未知の情報』が入り込む確率が上がります。"
          activeColor={settings.chaosLevel > 0.7 ? '#ff4444' : '#8b5e3c'}
        />

        <CustomSlider 
          label="マイナー度"
          value={settings.minorLevel}
          onValueChange={(val) => updateSetting('minorLevel', val)}
          onToggleScroll={setScrollEnabled}
          hint="再生回数が少ない、まだ誰にも見つけられていない動画を発掘する確率を上げます。"
          activeColor="#58a6ff"
        />

        <CustomSlider 
          label="パーソナライズ度"
          value={settings.personalizedLevel}
          onValueChange={(val) => updateSetting('personalizedLevel', val)}
          onToggleScroll={setScrollEnabled}
          hint="あなたの過去の視聴履歴（タグや傾向）に基づいたおすすめを表示する強さを調整します。"
          activeColor="#238636"
        />

        <CustomSlider 
          label="接続先地域"
          value={settings.regionIndex / (REGIONS.length - 1)}
          onValueChange={(val) => {
            const index = Math.round(val * (REGIONS.length - 1));
            updateSetting('regionIndex', index);
          }}
          onToggleScroll={setScrollEnabled}
          hint="特定の地域の情報を優先的に取得するように切り替えます。0%なら日本固定です。"
          activeColor="#c084fc"
          type="region"
        />

        <TouchableOpacity style={styles.dangerButton}>
          <Text style={styles.dangerButtonText}>すべての断罪記録を抹消</Text>
        </TouchableOpacity>
        
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1614',
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    color: '#cbd5e1',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 4,
  },
  description: {
    color: '#8b5e3c',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  statusBox: {
    marginTop: 30,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#2d2421',
  },
  statusText: {
    color: '#3d322d',
    fontSize: 10,
    fontFamily: 'monospace',
  },
  settingsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  settingItem: {
    backgroundColor: '#0a0a0c',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2d2421',
  },
  settingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  settingLabel: {
    color: '#e6d5c3',
    fontSize: 14,
    fontWeight: '600',
  },
  settingValue: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  settingHint: {
    color: '#555',
    fontSize: 10,
    marginBottom: 20,
    lineHeight: 16,
  },
  sliderTrackContainer: {
    height: 40,
    justifyContent: 'center',
    position: 'relative',
  },
  sliderTrack: {
    height: 4,
    backgroundColor: '#1a1614',
    borderRadius: 2,
    width: '100%',
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
  },
  sliderThumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    backgroundColor: '#000',
    borderWidth: 2,
    borderRadius: 10,
    marginLeft: -10,
  },
  dangerButton: {
    marginTop: 20,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#442222',
  },
  dangerButtonText: {
    color: '#ff4444',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
  }
});
