import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { youtubeApi } from '../services/youtubeApi';

export default function RealtimeScreen({ navigation }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef();

  // 1件取得してログに追加
  const fetchAndAddLog = async () => {
    try {
      // 5分ごとの更新なので、その都度人気の動画からランダムに1件ピックアップ
      const videos = await youtubeApi.getPopularVideos(10);
      if (videos.length > 0) {
        const randomVideo = videos[Math.floor(Math.random() * videos.length)];
        addLog(randomVideo);
      }
    } catch (e) {
      console.error('Realtime fetch failed:', e);
    }
  };

  // 初回読み込み
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchAndAddLog();
      setLoading(false);
    };
    init();
  }, []);

  // 5分（300,000ms）ごとに動画を1つずつ取得して放流
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAndAddLog();
    }, 300000); 

    return () => clearInterval(interval);
  }, []);

  const addLog = (video) => {
    const newLog = {
      id: Date.now(),
      videoId: video.id?.videoId || video.id,
      title: video.snippet?.title || 'Unknown Title',
      user: `Watcher_${Math.floor(Math.random() * 999)}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      opacity: new Animated.Value(0)
    };

    setLogs(prev => [...prev.slice(-19), newLog]);

    Animated.timing(newLog.opacity, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  const handleVideoPress = (log) => {
    navigation.navigate('VideoPlayer', { 
      videoId: log.videoId, 
      title: log.title 
    });
  };

  if (loading && logs.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="small" color="#8b5e3c" />
        <Text style={styles.loadingText}>シグナルを受信中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.pulseContainer}>
          <Ionicons name="radio-outline" size={20} color="#ff4444" />
          <Text style={styles.pulseText}>REALTIME SYNC [LIVE_FETCH]</Text>
        </View>
        <Text style={styles.subtitle}>世界中の観測ログを5分ごとに直接同期しています</Text>
      </View>

      <ScrollView 
        style={styles.logContainer} 
        ref={scrollRef}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
      >
        {logs.map((log) => (
          <Animated.View key={log.id} style={{ opacity: log.opacity }}>
            <TouchableOpacity 
              style={styles.logItem} 
              onPress={() => handleVideoPress(log)}
              activeOpacity={0.7}
            >
              <View style={styles.logLeft}>
                <Text style={styles.logTime}>{log.time}</Text>
                <Text style={styles.logUser}>{log.user}</Text>
              </View>
              <View style={styles.logDivider} />
              <View style={styles.logRight}>
                <Text style={styles.logAction}>SYNCED_CONTENT</Text>
                <Text style={styles.logTitle} numberOfLines={1}>{log.title}</Text>
              </View>
              <Ionicons name="play-circle-outline" size={20} color="#3d322d" />
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>接続ステータス：正常 | 5分ごとに新着ログをスキャン中</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0c', paddingTop: 50 },
  header: { paddingHorizontal: 20, marginBottom: 20 },
  pulseContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pulseText: { color: '#ff4444', fontSize: 12, fontWeight: 'bold', fontFamily: 'monospace', letterSpacing: 1 },
  subtitle: { color: '#555', fontSize: 10, marginTop: 5 },
  logContainer: { flex: 1, paddingHorizontal: 15 },
  logItem: { 
    flexDirection: 'row', 
    marginBottom: 8, 
    backgroundColor: '#161b22', 
    padding: 12, 
    borderWidth: 0.5, 
    borderColor: '#30363d',
    alignItems: 'center',
    borderRadius: 2,
  },
  logLeft: { width: 70 },
  logTime: { color: '#30363d', fontSize: 8, fontFamily: 'monospace' },
  logUser: { color: '#58a6ff', fontSize: 9, fontWeight: 'bold' },
  logDivider: { width: 1, height: 20, backgroundColor: '#30363d', marginHorizontal: 10 },
  logRight: { flex: 1 },
  logAction: { color: '#8b5e3c', fontSize: 7, fontWeight: 'bold', letterSpacing: 1 },
  logTitle: { color: '#e6d5c3', fontSize: 11, marginTop: 2 },
  footer: { padding: 15, borderTopWidth: 1, borderTopColor: '#161b22', alignItems: 'center' },
  footerText: { color: '#1a1614', fontSize: 8, fontFamily: 'monospace' },
  center: { flex: 1, backgroundColor: '#0a0a0c', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#8b5e3c', fontSize: 10, marginTop: 10, fontFamily: 'monospace' }
});
