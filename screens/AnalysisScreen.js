import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, LayoutAnimation } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const BLOCKED_KEYWORDS_KEY = 'blocked_keywords';

export default function AnalysisScreen() {
  const [history, setHistory] = useState([]);
  const [components, setComponents] = useState([]);
  const [blockedKeywords, setBlockedKeywords] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // 履歴の読み込みと解析
  const loadAndAnalyze = useCallback(async () => {
    try {
      setLoading(true);
      const historyData = await AsyncStorage.getItem('watch_history');
      const blockedData = await AsyncStorage.getItem(BLOCKED_KEYWORDS_KEY);
      
      if (blockedData) {
        setBlockedKeywords(new Set(JSON.parse(blockedData)));
      }

      if (historyData) {
        const parsedHistory = JSON.parse(historyData);
        setHistory(parsedHistory);

        // タイトルから単語を抽出して集計（簡易的な成分解析）
        const wordCount = {};
        parsedHistory.forEach(video => {
          const words = video.title
            ?.replace(/[【】「」]/g, ' ')
            .split(/[\s　]+/)
            .filter(w => w.length > 1); // 1文字は除外
          
          words?.forEach(word => {
            wordCount[word] = (wordCount[word] || 0) + 1;
          });
        });

        // ランキング化
        const sortedComponents = Object.entries(wordCount)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 20); // 上位20件

        setComponents(sortedComponents);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAndAnalyze();
  }, [loadAndAnalyze]);

  // キーワードの切除（ブロック）
  const toggleBlockKeyword = async (word) => {
    const newBlocked = new Set(blockedKeywords);
    if (newBlocked.has(word)) {
      newBlocked.delete(word);
    } else {
      newBlocked.add(word);
    }
    
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setBlockedKeywords(newBlocked);
    await AsyncStorage.setItem(BLOCKED_KEYWORDS_KEY, JSON.stringify([...newBlocked]));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>成分分析</Text>
        <Text style={styles.subtitle}>視聴履歴から抽出された情報の断片</Text>
      </View>

      {loading ? (
        <View style={styles.center}><Text style={styles.loadingText}>解析中...</Text></View>
      ) : (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>検出された主要成分</Text>
            <Text style={styles.hint}>タップして成分を『切除（ブロック）』します</Text>
            
            <View style={styles.grid}>
              {components.map((item, index) => {
                const isBlocked = blockedKeywords.has(item.name);
                return (
                  <TouchableOpacity 
                    key={index} 
                    style={[styles.chip, isBlocked && styles.chipBlocked]}
                    onPress={() => toggleBlockKeyword(item.name)}
                  >
                    <Text style={[styles.chipText, isBlocked && styles.chipTextBlocked]}>
                      {item.name}
                    </Text>
                    <Text style={[styles.chipCount, isBlocked && styles.chipCountBlocked]}>
                      {item.count}
                    </Text>
                    {isBlocked && <Ionicons name="cut" size={10} color="#ff4444" style={styles.cutIcon} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {blockedKeywords.size > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>切除済みの成分</Text>
              <View style={styles.blockedList}>
                {[...blockedKeywords].map((word, index) => (
                  <View key={index} style={styles.blockedItem}>
                    <Text style={styles.blockedText}>{word}</Text>
                    <TouchableOpacity onPress={() => toggleBlockKeyword(word)}>
                      <Ionicons name="refresh-outline" size={16} color="#8b5e3c" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}
          
          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1614', paddingTop: 50 },
  header: { paddingHorizontal: 20, marginBottom: 30, alignItems: 'center' },
  title: { color: '#cbd5e1', fontSize: 20, fontWeight: 'bold', letterSpacing: 4 },
  subtitle: { color: '#8b5e3c', fontSize: 10, marginTop: 5, letterSpacing: 1 },
  scroll: { flex: 1, paddingHorizontal: 20 },
  section: { marginBottom: 30 },
  sectionTitle: { color: '#e6d5c3', fontSize: 14, fontWeight: 'bold', marginBottom: 5 },
  hint: { color: '#555', fontSize: 10, marginBottom: 15 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#0a0a0c', 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#2d2421'
  },
  chipBlocked: { borderColor: '#442222', backgroundColor: '#1a0d0d' },
  chipText: { color: '#e6d5c3', fontSize: 12, fontWeight: '600' },
  chipTextBlocked: { color: '#666', textDecorationLine: 'line-through' },
  chipCount: { color: '#8b5e3c', fontSize: 10, marginLeft: 6, fontFamily: 'monospace' },
  chipCountBlocked: { color: '#442222' },
  cutIcon: { marginLeft: 6 },
  blockedList: { gap: 8 },
  blockedItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#0a0a0c', 
    padding: 12, 
    borderLeftWidth: 2, 
    borderLeftColor: '#ff4444' 
  },
  blockedText: { color: '#ff4444', fontSize: 12, fontFamily: 'monospace' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#8b5e3c', fontSize: 12, fontFamily: 'monospace' }
});
