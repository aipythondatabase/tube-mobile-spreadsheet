import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ActivityIndicator, Alert, LayoutAnimation } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { youtubeApi } from '../services/youtubeApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PostScreen() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoData, setVideoData] = useState(null);
  const [influence, setInfluence] = useState(0.5); // 影響力スライダー用

  // URLからIDを抽出
  const extractId = (text) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = text.match(regExp);
    return (match && match[7].length === 11) ? match[7] : text;
  };

  const handleScan = async () => {
    const videoId = extractId(input);
    if (videoId.length !== 11) {
      Alert.alert('エラー', '有効なYouTube URLまたはIDを入力してください');
      return;
    }

    setLoading(true);
    try {
      const data = await youtubeApi.getVideoDetails(videoId);
      if (data) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setVideoData(data);
      } else {
        Alert.alert('エラー', '動画が見つかりませんでした');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!videoData) return;
    
    try {
      // 本来はここでGASに送るが、一旦ローカルの履歴に「強力な成分」として追加
      const historyData = await AsyncStorage.getItem('watch_history');
      const history = historyData ? JSON.parse(historyData) : [];
      
      // 影響力の分だけ、履歴に同じ単語をダブらせて登録することで「重み」をつける
      const weight = Math.ceil(influence * 10);
      const newEntry = {
        id: videoData.id,
        title: videoData.snippet.title,
        syncedAt: new Date().toISOString(),
        isPremiumSync: true,
        weight: weight
      };

      // 履歴の先頭に追加
      const newHistory = [newEntry, ...history];
      await AsyncStorage.setItem('watch_history', JSON.stringify(newHistory));

      Alert.alert('同期完了', `影響力 ${Math.round(influence * 100)}% でシステムに同期しました。`);
      setVideoData(null);
      setInput('');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>情報同期</Text>
        <Text style={styles.subtitle}>外部データをこのシステムへ注入します</Text>
      </View>

      <View style={styles.inputSection}>
        <TextInput
          style={styles.input}
          placeholder="YouTube URL or ID..."
          placeholderTextColor="#3d322d"
          value={input}
          onChangeText={setInput}
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.scanButton} onPress={handleScan} disabled={loading}>
          {loading ? <ActivityIndicator color="#e6d5c3" size="small" /> : <Ionicons name="search" size={20} color="#e6d5c3" />}
        </TouchableOpacity>
      </View>

      {videoData && (
        <View style={styles.previewCard}>
          <Image source={{ uri: videoData.snippet.thumbnails.high.url }} style={styles.thumbnail} />
          <View style={styles.info}>
            <Text style={styles.videoTitle} numberOfLines={2}>{videoData.snippet.title}</Text>
            <Text style={styles.channelTitle}>{videoData.snippet.channelTitle}</Text>
          </View>

          <View style={styles.influenceSection}>
            <View style={styles.influenceHeader}>
              <Text style={styles.influenceLabel}>影響力（アルゴリズムへの重み）</Text>
              <Text style={styles.influenceValue}>{Math.round(influence * 100)}%</Text>
            </View>
            
            {/* 簡易スライダー */}
            <View 
              style={styles.sliderTrack} 
              onStartShouldSetResponder={() => true}
              onResponderMove={(e) => {
                const x = e.nativeEvent.locationX;
                setInfluence(Math.max(0, Math.min(1, x / 280)));
              }}
            >
              <View style={[styles.sliderFill, { width: `${influence * 100}%` }]} />
              <View style={[styles.sliderThumb, { left: `${influence * 100}%` }]} />
            </View>
          </View>

          <TouchableOpacity style={styles.syncButton} onPress={handleSync}>
            <Ionicons name="sync" size={18} color="#000" style={{ marginRight: 8 }} />
            <Text style={styles.syncButtonText}>システムと同期する</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1614', paddingTop: 50, paddingHorizontal: 20 },
  header: { marginBottom: 30, alignItems: 'center' },
  title: { color: '#cbd5e1', fontSize: 20, fontWeight: 'bold', letterSpacing: 4 },
  subtitle: { color: '#8b5e3c', fontSize: 10, marginTop: 5 },
  inputSection: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  input: { flex: 1, backgroundColor: '#0a0a0c', color: '#e6d5c3', padding: 15, borderRadius: 4, borderWidth: 1, borderColor: '#2d2421', fontFamily: 'monospace' },
  scanButton: { backgroundColor: '#3d322d', width: 55, justifyContent: 'center', alignItems: 'center', borderRadius: 4 },
  previewCard: { backgroundColor: '#0a0a0c', borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#2d2421' },
  thumbnail: { width: '100%', height: 180 },
  info: { padding: 15 },
  videoTitle: { color: '#e6d5c3', fontSize: 14, fontWeight: 'bold', marginBottom: 5 },
  channelTitle: { color: '#8b5e3c', fontSize: 12 },
  influenceSection: { padding: 20, borderTopWidth: 1, borderTopColor: '#2d2421' },
  influenceHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  influenceLabel: { color: '#888', fontSize: 11 },
  influenceValue: { color: '#8b5e3c', fontWeight: 'bold', fontFamily: 'monospace' },
  sliderTrack: { height: 4, backgroundColor: '#1a1614', borderRadius: 2, position: 'relative', width: 280, alignSelf: 'center' },
  sliderFill: { height: '100%', backgroundColor: '#8b5e3c', borderRadius: 2 },
  sliderThumb: { position: 'absolute', width: 16, height: 16, borderRadius: 8, backgroundColor: '#8b5e3c', top: -6, marginLeft: -8 },
  syncButton: { backgroundColor: '#8b5e3c', flexDirection: 'row', padding: 15, justifyContent: 'center', alignItems: 'center' },
  syncButtonText: { color: '#000', fontWeight: 'bold', fontSize: 14 }
});
