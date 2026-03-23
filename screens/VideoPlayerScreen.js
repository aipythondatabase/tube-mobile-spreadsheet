import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions, ScrollView } from 'react-native';
import YouTubeIframe from 'react-native-youtube-iframe';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const playerHeight = (width * 9) / 16; // 16:9の計算

export default function VideoPlayerScreen({ route, navigation }) {
  const { videoId, title } = route.params;
  const [playing, setPlaying] = useState(true); // 初期状態で再生
  const [loading, setLoading] = useState(true);

  // 視聴履歴の保存
  useEffect(() => {
    const saveHistory = async () => {
      try {
        const historyData = await AsyncStorage.getItem('watch_history');
        let history = historyData ? JSON.parse(historyData) : [];
        
        // 重複排除（同じ動画は最新を上に）
        history = history.filter(v => (v.id?.videoId || v.id) !== videoId);
        
        const newEntry = {
          id: videoId,
          title: title,
          watchedAt: new Date().toISOString(),
        };

        const newHistory = [newEntry, ...history].slice(0, 50); // 最大50件
        await AsyncStorage.setItem('watch_history', JSON.stringify(newHistory));
        console.log('History saved:', title);
      } catch (e) {
        console.error('Failed to save history:', e);
      }
    };
    saveHistory();
  }, [videoId, title]);

  return (
    <View style={styles.container}>
      <View style={styles.playerContainer}>
        <YouTubeIframe
          videoId={videoId}
          height={playerHeight}
          play={playing}
          onChangeState={(event) => {
            if (event === 'ended') {
              setPlaying(false);
            }
          }}
          onReady={() => setLoading(false)}
        />
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8b5e3c" />
          </View>
        )}
      </View>

      <ScrollView style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setPlaying(!playing)}
          >
            <Text style={styles.controlButtonText}>
              {playing ? 'PAUSE' : 'RESUME'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0c',
  },
  playerContainer: {
    backgroundColor: '#000',
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#2d2421',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  infoContainer: {
    padding: 20,
  },
  title: {
    color: '#e6d5c3',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
    letterSpacing: 1,
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  controlButton: {
    backgroundColor: '#3d322d',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#8b5e3c',
  },
  controlButtonText: {
    color: '#e6d5c3',
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 2,
  },
});
