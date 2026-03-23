import React from 'react';
import { TouchableOpacity, Image, Text, StyleSheet, Dimensions, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const cardWidth = (width - 10) / 4; 

const VideoCard = ({ video, role, onPlay, onRefresh, onHistory, isSelectable, isSelected, onSelect }) => {
  const thumbnailUrl = video.snippet?.thumbnails?.medium?.url || video.snippet?.thumbnails?.default?.url;
  const title = video.snippet?.title || '';

  // 選択モード中の処理
  const handlePress = () => {
    if (isSelectable) {
      onSelect();
    } else {
      onPlay();
    }
  };

  return (
    <View style={[styles.cardContainer, isSelected && styles.selectedCard]}>
      <View style={styles.mediaContainer}>
        <Image 
          source={{ uri: thumbnailUrl }} 
          style={[styles.thumbnail, isSelected && styles.selectedThumbnail]} 
          resizeMode="cover"
        />
        <View style={styles.titleOverlay}>
          <Text style={styles.titleText} numberOfLines={1}>{title}</Text>
        </View>

        {/* インタラクション・レイヤー */}
        <View style={styles.interactionLayer}>
          {role === 'left' ? (
            <>
              <TouchableOpacity style={styles.thirdTouch} onPress={onRefresh} disabled={isSelectable}>
                <View style={[styles.indicator, styles.refreshIndicator]}>
                  <Ionicons name="refresh-outline" size={10} color="#e6d5c3" />
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.twoThirdsTouch} onPress={handlePress} disabled={isSelectable} />
            </>
          ) : role === 'right' ? (
            <>
              <TouchableOpacity style={styles.twoThirdsTouch} onPress={handlePress} disabled={isSelectable} />
              <TouchableOpacity style={styles.thirdTouch} onPress={onHistory} disabled={isSelectable}>
                <View style={[styles.indicator, styles.historyIndicator]}>
                  <Ionicons name="time-outline" size={10} color="#e6d5c3" />
                </View>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.fullTouch} onPress={handlePress} disabled={isSelectable} />
          )}

          {/* 選択モード時のオーバーレイ（絶対配置で被せるためアニメーション崩れが起きない） */}
          {isSelectable && (
            <TouchableOpacity 
              style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center' }]} 
              onPress={handlePress}
              activeOpacity={0.7}
            >
              {isSelected && (
                <View style={styles.checkOverlay}>
                  <Ionicons name="shield-half-outline" size={24} color="#c084fc" />
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View style={styles.borderEffect} />
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: cardWidth,
    aspectRatio: 1.3, // 16:9に近い比率にして縦長感を解消
    backgroundColor: '#000',
    margin: 0.5,
    position: 'relative',
    overflow: 'hidden',
  },
  selectedCard: {
    borderColor: '#c084fc',
    borderWidth: 1,
  },
  mediaContainer: {
    flex: 1,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  selectedThumbnail: {
    opacity: 0.3,
  },
  titleOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 1,
  },
  titleText: {
    color: '#e6d5c3',
    fontSize: 6,
    fontWeight: 'bold',
  },
  interactionLayer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
  },
  thirdTouch: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  twoThirdsTouch: {
    flex: 2,
    height: '100%',
  },
  fullTouch: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkOverlay: {
    backgroundColor: 'rgba(255, 68, 68, 0.2)',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshIndicator: {
    backgroundColor: 'rgba(139, 94, 60, 0.1)',
  },
  historyIndicator: {
    backgroundColor: 'rgba(0, 112, 255, 0.1)',
  },
  borderEffect: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 0.5,
    borderColor: '#2d2421',
    pointerEvents: 'none',
  },
});

export default VideoCard;
