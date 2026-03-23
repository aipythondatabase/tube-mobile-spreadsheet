import AsyncStorage from '@react-native-async-storage/async-storage';

const YOUTUBE_API_KEY = 'AIzaSyATiULH7dW5PLdRBdj_4Hd2WNg4OoJyzsI';

export const youtubeApi = {
  // 多カテゴリの急上昇動画をミックスして取得 (多様性確保)
  getPopularVideos: async (maxResults = 60, regionCode = 'JP') => {
    try {
      console.log(`Initiating diverse abyss scan (targeting ${maxResults} nodes)...`);
      const categories = [1, 10, 17, 20, 24, 28];
      const results = await Promise.all(
        categories.map(catId => 
          fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&chart=mostPopular&regionCode=${regionCode}&videoCategoryId=${catId}&maxResults=10&key=${YOUTUBE_API_KEY}`
          ).then(res => res.json())
        )
      );

      let allItems = [];
      results.forEach(data => {
        if (data.items) allItems = [...allItems, ...data.items];
      });

      const uniqueItems = Array.from(new Map(allItems.map(item => [item.id, item])).values());
      const shuffled = uniqueItems.sort(() => Math.random() - 0.5);
      return shuffled.slice(0, maxResults);
    } catch (error) {
      console.error('Observation failed:', error);
      return [];
    }
  },

  // 検索
  searchVideos: async (query, maxResults = 20, regionCode = 'JP', language = 'ja') => {
    try {
      let url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`;
      if (regionCode) url += `&regionCode=${regionCode}`;
      if (language) url += `&relevanceLanguage=${language}`;

      const response = await fetch(url);
      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Error searching videos:', error);
      return [];
    }
  },

  // 高度な動画取得（設定値に基づくミックス）
  getAdvancedVideos: async (count = 40, settings = {}, historyKeywords = []) => {
    try {
      const { 
        chaosLevel = 0.2, 
        minorLevel = 0.1, 
        personalizedLevel = 0.7, 
        regionIndex = 0 
      } = settings;

      // フィルタリングで減る分を考慮して1.5倍取得する
      const fetchCount = Math.ceil(count * 1.5);

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

      const selectedRegion = REGIONS[regionIndex] || REGIONS[0];
      const region = selectedRegion.code;
      const lang = selectedRegion.lang;

      // ブロック済みデータの読み込み
      const [blockedData, blockedIdsData] = await Promise.all([
        AsyncStorage.getItem('blocked_keywords'),
        AsyncStorage.getItem('blocked_videos_abyss')
      ]);
      const blockedKeywords = blockedData ? JSON.parse(blockedData) : [];
      const blockedIds = new Set(blockedIdsData ? JSON.parse(blockedIdsData) : []);

      const total = chaosLevel + minorLevel + personalizedLevel;
      const counts = {
        chaos: Math.round((chaosLevel / total) * fetchCount),
        minor: Math.round((minorLevel / total) * fetchCount),
        personalized: Math.round((personalizedLevel / total) * fetchCount)
      };

      const promises = [];

      // 1. パーソナライズ
      if (counts.personalized > 0 && historyKeywords.length > 0) {
        const query = historyKeywords[Math.floor(Math.random() * historyKeywords.length)];
        promises.push(youtubeApi.searchVideos(query, counts.personalized, region, lang));
      } else {
        promises.push(youtubeApi.getPopularVideos(counts.personalized || 10, region));
      }

      // 2. カオス
      if (counts.chaos > 0) {
        const randomCat = [2, 15, 19, 22][Math.floor(Math.random() * 4)];
        promises.push(
          fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=${region}&videoCategoryId=${randomCat}&maxResults=${counts.chaos}&key=${YOUTUBE_API_KEY}`)
          .then(res => res.json())
          .then(data => data.items || [])
        );
      }

      // 3. マイナー
      if (counts.minor > 0) {
        const randomWords = region === 'JP' ? ['料理', 'ゲーム'] : ['vlog', 'tech', 'music'];
        const word = randomWords[Math.floor(Math.random() * randomWords.length)];
        promises.push(
          fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${word}&order=date&regionCode=${region}&relevanceLanguage=${lang}&maxResults=${counts.minor}&key=${YOUTUBE_API_KEY}`)
          .then(res => res.json())
          .then(data => data.items || [])
        );
      }

      const results = await Promise.all(promises);
      let allVideos = results.flat();
      
      // フィルタリング
      allVideos = allVideos.filter(video => {
        const vId = video.id?.videoId || video.id;
        if (blockedIds.has(vId)) return false;
        const title = video.snippet?.title || video.title || '';
        const titleStr = typeof title === 'string' ? title : '';
        return !blockedKeywords.some(word => titleStr.includes(word));
      });

      // 重複排除
      const uniqueMap = new Map();
      allVideos.forEach(v => {
        const id = v.id?.videoId || v.id;
        if (!uniqueMap.has(id)) uniqueMap.set(id, v);
      });
      
      const uniqueVideos = Array.from(uniqueMap.values());
      const shuffled = uniqueVideos.sort(() => Math.random() - 0.5);
      
      console.log(`Fetched ${shuffled.length} videos (requested ${count})`);
      return shuffled.slice(0, count);
    } catch (error) {
      console.error('Advanced fetch failed:', error);
      return youtubeApi.getPopularVideos(count);
    }
  },

  // 動画詳細を取得
  getVideoDetails: async (videoId) => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${YOUTUBE_API_KEY}`
      );
      const data = await response.json();
      return data.items?.[0] || null;
    } catch (error) {
      console.error('Error fetching video details:', error);
      return null;
    }
  },
};
