import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import YouTubeIframe from 'react-native-youtube-iframe';

export default function VideoPlayerScreen({ route, navigation }) {
  const { videoId, title } = route.params;
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);

  return (
    <View style={styles.container}>
      <View style={styles.playerContainer}>
        <YouTubeIframe
          videoId={videoId}
          height={220}
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
            <ActivityIndicator size="large" color="#FF0000" />
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setPlaying(!playing)}
          >
            <Text style={styles.controlButtonText}>
              {playing ? '一時停止' : '再生'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  playerContainer: {
    backgroundColor: '#000',
    position: 'relative',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    padding: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  controlButton: {
    backgroundColor: '#FF0000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  controlButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
