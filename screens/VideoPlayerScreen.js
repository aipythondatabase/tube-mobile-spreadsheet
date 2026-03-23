import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions, ScrollView, TextInput, Keyboard, LayoutAnimation } from 'react-native';
import YouTubeIframe from 'react-native-youtube-iframe';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const playerHeight = (width * 9) / 16; 

export default function VideoPlayerScreen({ route, navigation }) {
  const { videoId, title } = route.params;
  const [playing, setPlaying] = useState(true); 
  const [loading, setLoading] = useState(true);
  
  // コメント関連の状態
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  // 視聴履歴の保存とコメントの読み込み
  useEffect(() => {
    saveHistory();
    loadComments();
  }, [videoId]);

  const saveHistory = async () => {
    try {
      const historyData = await AsyncStorage.getItem('watch_history');
      let history = historyData ? JSON.parse(historyData) : [];
      history = history.filter(v => (v.id?.videoId || v.id) !== videoId);
      const newEntry = { id: videoId, title: title, watchedAt: new Date().toISOString() };
      await AsyncStorage.setItem('watch_history', JSON.stringify([newEntry, ...history].slice(0, 50)));
    } catch (e) { console.error(e); }
  };

  const loadComments = async () => {
    try {
      const savedComments = await AsyncStorage.getItem(`comments_${videoId}`);
      if (savedComments) {
        setComments(JSON.parse(savedComments));
      }
    } catch (e) { console.error(e); }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const commentEntry = {
      id: Date.now().toString(),
      text: newComment,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedComments = [commentEntry, ...comments];
    
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setComments(updatedComments);
    setNewComment('');
    Keyboard.dismiss();

    try {
      await AsyncStorage.setItem(`comments_${videoId}`, JSON.stringify(updatedComments));
    } catch (e) { console.error(e); }
  };

  return (
    <View style={styles.container}>
      <View style={styles.playerContainer}>
        <YouTubeIframe
          videoId={videoId}
          height={playerHeight}
          play={playing}
          onChangeState={(event) => {
            if (event === 'ended') setPlaying(false);
          }}
          onReady={() => setLoading(false)}
        />
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8b5e3c" />
          </View>
        )}
      </View>

      <ScrollView style={styles.infoContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.videoTitle} numberOfLines={2}>{title}</Text>
        
        <View style={styles.divider} />

        {/* コメントセクション */}
        <View style={styles.commentSection}>
          <Text style={styles.sectionTitle}>コメント</Text>
          
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="コメントを入力..."
              placeholderTextColor="#3d322d"
              value={newComment}
              onChangeText={setNewComment}
              multiline
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleAddComment}>
              <Ionicons name="send" size={18} color="#8b5e3c" />
            </TouchableOpacity>
          </View>

          <View style={styles.commentList}>
            {comments.map((item) => (
              <View key={item.id} style={styles.commentItem}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentUser}>User_Anonymous</Text>
                  <Text style={styles.commentTime}>{item.createdAt}</Text>
                </View>
                <Text style={styles.commentText}>{item.text}</Text>
              </View>
            ))}
            {comments.length === 0 && (
              <Text style={styles.emptyText}>コメントはまだありません。</Text>
            )}
          </View>
        </View>
        
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0c' },
  playerContainer: { backgroundColor: '#000', position: 'relative', borderBottomWidth: 1, borderBottomColor: '#2d2421' },
  loadingContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  infoContainer: { padding: 20 },
  videoTitle: { color: '#e6d5c3', fontSize: 15, fontWeight: 'bold', marginBottom: 15, letterSpacing: 0.5, lineHeight: 20 },
  buttonRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  controlButton: { backgroundColor: '#1a1614', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 2, borderWidth: 1, borderColor: '#3d322d' },
  controlButtonText: { color: '#8b5e3c', fontWeight: 'bold', fontSize: 11, letterSpacing: 2 },
  divider: { hieght: 1, backgroundColor: '#1a1614', marginVertical: 10 },
  commentSection: { marginTop: 10 },
  sectionTitle: { color: '#8b5e3c', fontSize: 10, fontWeight: 'bold', letterSpacing: 2, marginBottom: 15 },
  inputRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-end', marginBottom: 25 },
  input: { flex: 1, backgroundColor: '#000', color: '#e6d5c3', padding: 12, borderRadius: 4, borderWidth: 1, borderColor: '#2d2421', fontSize: 13, minHeight: 45 },
  sendButton: { padding: 12, backgroundColor: '#1a1614', borderRadius: 4, borderWidth: 1, borderColor: '#2d2421' },
  commentList: { gap: 15 },
  commentItem: { paddingLeft: 10, borderLeftWidth: 1, borderLeftColor: '#3d322d' },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  commentUser: { color: '#58a6ff', fontSize: 9, fontWeight: 'bold' },
  commentTime: { color: '#30363d', fontSize: 8, fontFamily: 'monospace' },
  commentText: { color: '#cbd5e1', fontSize: 13, lineHeight: 18 },
  emptyText: { color: '#1a1614', fontSize: 10, textAlign: 'center', marginTop: 20, fontFamily: 'monospace' }
});
