import React, { useEffect, useState, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  StatusBar, 
  SafeAreaView, 
  Platform,
  LayoutAnimation,
  UIManager,
  TouchableOpacity,
  Dimensions,
  Image,
  Alert,
  BackHandler,
  TextInput
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { youtubeApi } from '../services/youtubeApi';
import VideoCard from '../components/VideoCard';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const BLOCKED_VIDEOS_KEY = 'blocked_videos_abyss';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// 履歴レイヤー・コンポーネント
const MemoryLayer = ({ history, onClose, onVideoPlay }) => {
  if (!history || history.length === 0) return null;
  return (
    <View style={styles.overlayContainer}>
      <View style={styles.overlayHeader}>
        <Text style={styles.overlayTitle}>表示履歴</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close-outline" size={24} color="#ff4444" />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.overlayScroll}>
        {history.map((set, setIndex) => (
          <View key={`set-${setIndex}`} style={styles.memorySet}>
            <Text style={styles.setTime}>セット {String(history.length - setIndex).padStart(2, '0')}</Text>
            <View style={styles.memoryGrid}>
              {set.map((video, vIndex) => (
                <TouchableOpacity 
                  key={`mem-${setIndex}-${vIndex}`} 
                  style={styles.memoryThumbnailWrapper}
                  onPress={() => onVideoPlay(video)}
                >
                  <Image source={{ uri: video.snippet?.thumbnails?.default?.url }} style={styles.memoryThumbnail} />
                  <View style={styles.memoryTitleOverlay}>
                    <Text style={styles.memoryTitleText} numberOfLines={1}>{video.snippet?.title}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )).reverse()}
      </ScrollView>
    </View>
  );
};

export default function HomeScreen({ navigation }) {
  const [rows, setRows] = useState([]); 
  const [stock, setStock] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [isRefreshingStock, setIsRefreshingStock] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastSearchQuery, setLastSearchQuery] = useState(''); // 直前の検索ワードを保持
  const [isSearching, setIsSearching] = useState(false);
  const [abyssRows, setAbyssRows] = useState([]); // メインフィードを退避
  const [searchRows, setSearchRows] = useState([]); // 検索結果を保持
  
  const [activeHistory, setActiveHistory] = useState(null);
  const [isBlockMode, setIsBlockMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [blockedIds, setBlockedIds] = useState(new Set());

  const isFetchingRef = useRef(false);

  // 戻るボタンの制御
  useEffect(() => {
    const backAction = () => {
      if (activeHistory) { setActiveHistory(null); return true; }
      if (isBlockMode) { setIsBlockMode(false); setSelectedIds(new Set()); return true; }
      if (isSearching) { backToAbyss(); return true; }
      return false;
    };
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, [activeHistory, isBlockMode, isSearching, abyssRows]);

  useEffect(() => {
    loadBlockedData().then(() => initialLoad());
  }, []);

  const loadBlockedData = async () => {
    try {
      const data = await AsyncStorage.getItem(BLOCKED_VIDEOS_KEY);
      if (data) setBlockedIds(new Set(JSON.parse(data)));
    } catch (e) { console.error(e); }
  };

  const initialLoad = async () => {
    try {
      setLoading(true);
      const fetchedVideos = await youtubeApi.getPopularVideos(100);
      const filtered = fetchedVideos.filter(v => !blockedIds.has(v.id?.videoId || v.id));
      
      const initialRows = [];
      for (let i = 0; i < Math.min(filtered.length, 40); i += 4) {
        initialRows.push({ id: `row-${i}`, current: filtered.slice(i, i + 4), history: [] });
      }
      setRows(initialRows);
      setAbyssRows(initialRows); // アビスの初期状態を保存
      setStock(filtered.slice(40));
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const replenishStock = async () => {
    if (isFetchingRef.current || isSearching) return; // 検索中は補充しない
    isFetchingRef.current = true;
    setIsRefreshingStock(true);
    try {
      const newVideos = await youtubeApi.getPopularVideos(50);
      const filtered = newVideos.filter(v => !blockedIds.has(v.id?.videoId || v.id));
      setStock(prev => [...prev, ...filtered]);
    } catch (e) { console.error(e); } finally {
      isFetchingRef.current = false;
      setIsRefreshingStock(false);
    }
  };

  const handleRefreshRow = useCallback((rowIndex) => {
    if (isSearching) return; // 検索中はリフレッシュ無効（または検索結果のシャッフルなど別の挙動にすべきか）
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setRows(prevRows => {
      const newRows = [...prevRows];
      const targetRow = { ...newRows[rowIndex] };
      targetRow.history = [...targetRow.history, targetRow.current];
      if (stock.length >= 4) {
        targetRow.current = stock.slice(0, 4);
        setStock(prev => prev.slice(4));
      }
      newRows[rowIndex] = targetRow;
      setAbyssRows(newRows); // アビスの状態を更新
      return newRows;
    });
    if (stock.length <= 12) replenishStock();
  }, [stock, blockedIds, isSearching]);

  const handleRefreshAll = useCallback(() => {
    if (isSearching) return;
    if (stock.length < rows.length * 4) {
      replenishStock();
      Alert.alert('読み込み中', '動画リストを更新しています。少々お待ちください。');
      return;
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setRows(prevRows => {
      let currentStock = [...stock];
      const newRows = prevRows.map(row => {
        const updatedRow = { ...row };
        updatedRow.history = [...updatedRow.history, updatedRow.current];
        updatedRow.current = currentStock.slice(0, 4);
        currentStock = currentStock.slice(4);
        return updatedRow;
      });
      setStock(currentStock);
      setAbyssRows(newRows); // アビスの状態を更新
      return newRows;
    });
    if (stock.length <= 20) replenishStock();
  }, [rows, stock, isSearching]);

  const toggleSelect = (videoId) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(videoId)) newSelected.delete(videoId);
    else newSelected.add(videoId);
    setSelectedIds(newSelected);
  };

  const handlePurge = async () => {
    if (selectedIds.size === 0) { setIsBlockMode(false); return; }
    
    Alert.alert('ブロック確認', `${selectedIds.size}個の動画をブロックリストに追加しますか？`, [
      { text: 'キャンセル', style: 'cancel' },
      { text: 'ブロックする', onPress: async () => {
        const newBlocked = new Set([...blockedIds, ...selectedIds]);
        await AsyncStorage.setItem(BLOCKED_VIDEOS_KEY, JSON.stringify([...newBlocked]));
        setBlockedIds(newBlocked);
        
        // stockを直接変更（shift）せず、コピーを作成して処理する
        let currentStock = [...stock];
        
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setRows(prev => {
          const updated = prev.map(row => ({
            ...row,
            current: row.current.map(v => {
              const vId = v.id?.videoId || v.id;
              if (selectedIds.has(vId)) {
                return currentStock.length > 0 ? currentStock.shift() : v;
              }
              return v;
            })
          }));
          if (!isSearching) setAbyssRows(updated);
          return updated;
        });
        
        setStock(currentStock);
        setSelectedIds(new Set());
        setIsBlockMode(false);
      }}
    ]);
  };

  const handleVideoPlay = (video) => {
    if (isBlockMode) return;
    const videoId = video.id?.videoId || video.id;
    navigation.navigate('VideoPlayer', { videoId, title: video.snippet?.title || '' });
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    // 現在のアビスの状態を保存（検索モードに入っていない場合のみ）
    if (!isSearching) {
      setAbyssRows(rows);
    }
    
    setIsSearching(true);
    setLastSearchQuery(searchQuery);
    try {
      const results = await youtubeApi.searchVideos(searchQuery, 40);
      const searchResultRows = [];
      for (let i = 0; i < results.length; i += 4) {
        searchResultRows.push({ id: `search-row-${i}`, current: results.slice(i, i + 4), history: [] });
      }
      setRows(searchResultRows);
      setSearchRows(searchResultRows);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const backToAbyss = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsSearching(false);
    setRows(abyssRows);
  };

  const resumeSearch = () => {
    if (searchRows.length > 0) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setIsSearching(true);
      setRows(searchRows);
      setSearchQuery(lastSearchQuery);
    }
  };

  return (
    <SafeAreaView style={[styles.container, isSearching && styles.searchPageContainer]}>
      <StatusBar barStyle="light-content" />
      
      <View style={[styles.megaHeader, isSearching && styles.searchHeader]}>
        <View style={styles.headerStatusRow}>
          <Text style={[styles.systemStatus, isSearching && styles.searchStatusText]}>{isBlockMode ? 'ブロックモード実行中' : isSearching ? `検索：${lastSearchQuery} [SCANNING...]` : 'システム：正常'}</Text>
          <Text style={styles.bufferText}>ストック: {stock.length}</Text>
        </View>

        <View style={styles.headerMainRow}>
          <View style={styles.sideColumn}>
            {isSearching && (
              <TouchableOpacity onPress={backToAbyss} style={styles.headerIconButton}>
                <Ionicons name="arrow-back-outline" size={22} color="#8b5e3c" />
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity 
            onPress={isSearching ? null : handleRefreshAll} 
            activeOpacity={isSearching ? 1 : 0.6}
            style={styles.titleButton}
          >
            <Text style={[styles.mainTitle, isSearching && styles.searchTitle]}>
              {isSearching ? lastSearchQuery : '蒼銀の断罪'}
            </Text>
          </TouchableOpacity>

          <View style={styles.sideColumn}>
            <TouchableOpacity 
              onPress={isBlockMode ? handlePurge : () => setIsBlockMode(true)} 
              style={styles.headerIconButton}
              hitSlop={{ top: 25, bottom: 25, left: 25, right: 25 }}
            >
              <Ionicons 
                name={isBlockMode ? "checkmark-circle" : "shield-half-outline"} 
                size={22} 
                color={isBlockMode ? "#c084fc" : "#8b5e3c"} 
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.headerBottom}>
          <View style={[styles.glowBar, (isRefreshingStock || isBlockMode || isSearching) && styles.syncGlow, isBlockMode && {backgroundColor: '#c084fc'}]} />
        </View>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="small" color="#8b5e3c" /><Text style={styles.loadingText}>動画を読み込み中...</Text></View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {rows.map((row, rowIndex) => (
            <View key={row.id} style={[styles.rowContainer, isSearching && styles.searchRowContainer]}>
              {row.current.map((video, vIndex) => {
                const vId = video.id?.videoId || video.id;
                return (
                  <VideoCard 
                    key={`${row.id}-${vId}-${vIndex}`}
                    video={video}
                    role={vIndex === 0 ? 'left' : vIndex === 3 ? 'right' : 'center'}
                    isSelectable={isBlockMode}
                    isSelected={selectedIds.has(vId)}
                    onSelect={() => toggleSelect(vId)}
                    onPlay={() => handleVideoPlay(video)}
                    onRefresh={() => handleRefreshRow(rowIndex)}
                    onHistory={() => setActiveHistory(row.history)}
                  />
                );
              })}
            </View>
          ))}

          {/* 検索フィールド */}
          <View style={styles.searchSection}>
            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={16} color="#8b5e3c" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="深淵を検索..."
                placeholderTextColor="#3d322d"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
            </View>
            
            {!isSearching && lastSearchQuery !== '' && (
              <TouchableOpacity style={styles.resumeSearchButton} onPress={resumeSearch}>
                <Ionicons name="refresh-outline" size={14} color="#8b5e3c" style={{marginRight: 6}} />
                <Text style={styles.resumeSearchText}>「{lastSearchQuery}」の検索結果に戻る</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerTitle}>— 断罪の儀式 —</Text>
            <View style={styles.manualGrid}>
              <View style={styles.manualItem}>
                <Text style={styles.manualKey}>左端タップ</Text>
                <Text style={styles.manualValue}>その行をリフレッシュ</Text>
              </View>
              <View style={styles.manualItem}>
                <Text style={styles.manualKey}>右端タップ</Text>
                <Text style={styles.manualValue}>その行の表示履歴を閲覧</Text>
              </View>
              <View style={styles.manualItem}>
                <Text style={styles.manualKey}>タイトル名</Text>
                <Text style={styles.manualValue}>全行をストックから一斉更新</Text>
              </View>
              <View style={styles.manualItem}>
                <Text style={styles.manualKey}>盾マーク</Text>
                <Text style={styles.manualValue}>ブロックモード（不要な動画を排除）</Text>
              </View>
            </View>
            <Text style={styles.footerText}>システム：Version 1.0.4 - Azure Silver Conviction</Text>
          </View>
        </ScrollView>
      )}
      {activeHistory && <MemoryLayer history={activeHistory} onClose={() => setActiveHistory(null)} onVideoPlay={handleVideoPlay} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1614' },
  searchPageContainer: { backgroundColor: '#0d1117' },
  megaHeader: { 
    backgroundColor: '#1a1614', 
    paddingHorizontal: 20, 
    paddingTop: 10, 
    paddingBottom: 8, 
    borderBottomWidth: 1, 
    borderBottomColor: '#2d2421' 
  },
  searchHeader: {
    backgroundColor: '#161b22',
    borderBottomColor: '#30363d',
  },
  headerStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  headerMainRow: { 
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sideColumn: {
    flex: 1,
    alignItems: 'center',
  },
  titleButton: {
    paddingVertical: 2,
    flex: 3,
  },
  headerIconButton: {
    padding: 5,
  },
  systemStatus: { color: '#238636', fontSize: 7, fontWeight: 'bold', fontFamily: 'monospace' },
  searchStatusText: { color: '#58a6ff' },
  bufferText: { color: '#8b5e3c', fontSize: 7, fontFamily: 'monospace' },
  mainTitle: { color: '#cbd5e1', fontSize: 24, fontWeight: '900', letterSpacing: 6, textAlign: 'center', textShadowColor: 'rgba(148, 163, 184, 0.5)', textShadowOffset: {width: 0, height: 0}, textShadowRadius: 10 },
  searchTitle: { fontSize: 16, letterSpacing: 2, color: '#8b5e3c' },
  headerBottom: { marginTop: 10, height: 2, backgroundColor: '#2d2421', width: '100%', overflow: 'hidden' },
  glowBar: { height: '100%', width: '30%', backgroundColor: '#8b5e3c', alignSelf: 'center' },
  syncGlow: { backgroundColor: '#58a6ff', width: '100%' },
  scrollView: { flex: 1 },
  searchSection: {
    marginTop: 1,
    backgroundColor: '#000',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 50,
    borderBottomWidth: 0.5,
    borderBottomColor: '#2d2421',
  },
  resumeSearchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#1a1614',
    backgroundColor: '#0a0a0c',
  },
  resumeSearchText: {
    color: '#8b5e3c',
    fontSize: 10,
    fontFamily: 'monospace',
    textDecorationLine: 'underline',
  },
  searchIcon: { marginRight: 10, opacity: 0.5 },
  searchInput: {
    flex: 1,
    color: '#e6d5c3',
    fontSize: 12,
    fontFamily: 'monospace',
    height: '100%',
  },
  rowContainer: { flexDirection: 'row', backgroundColor: '#000', marginBottom: 1 },
  searchRowContainer: { backgroundColor: '#0d1117', borderBottomWidth: 0.5, borderBottomColor: '#30363d', marginBottom: 0 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  loadingText: { color: '#8b5e3c', marginTop: 10, fontSize: 9 },
  overlayContainer: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10, 10, 12, 0.98)', zIndex: 100, paddingTop: 50 },
  overlayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
  overlayTitle: { color: '#e6d5c3', fontSize: 14, fontWeight: 'bold', letterSpacing: 2 },
  closeButton: { padding: 5 },
  overlayScroll: { paddingHorizontal: 15, paddingBottom: 50 },
  memorySet: { marginBottom: 25, borderBottomWidth: 1, borderBottomColor: '#2d2421', paddingBottom: 10 },
  setTime: { color: '#444', fontSize: 8, marginBottom: 8, fontFamily: 'monospace' },
  memoryGrid: { flexDirection: 'row' },
  memoryThumbnailWrapper: { width: (width - 60) / 4, aspectRatio: 1, marginRight: 5, backgroundColor: '#000', position: 'relative', overflow: 'hidden' },
  memoryThumbnail: { width: '100%', height: '100%', opacity: 0.6 },
  memoryTitleOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.7)', padding: 1 },
  memoryTitleText: { color: '#e6d5c3', fontSize: 5, fontWeight: 'bold' },
  footer: { padding: 40, alignItems: 'center', backgroundColor: '#0a0a0c' },
  footerTitle: { color: '#8b5e3c', fontSize: 10, fontWeight: 'bold', marginBottom: 20, letterSpacing: 4 },
  manualGrid: { width: '100%', marginBottom: 30 },
  manualItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: '#1a1614' },
  manualKey: { color: '#e6d5c3', fontSize: 8, fontFamily: 'monospace' },
  manualValue: { color: '#555', fontSize: 8 },
  footerText: { color: '#1a1614', fontSize: 6, letterSpacing: 1, fontFamily: 'monospace' },
});
