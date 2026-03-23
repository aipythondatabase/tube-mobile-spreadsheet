const YOUTUBE_API_KEY = 'AIzaSyATiULH7dW5PLdRBdj_4Hd2WNg4OoJyzsI';

export const youtubeApi = {
  // 多カテゴリの急上昇動画をミックスして取得 (多様性確保)
  getPopularVideos: async (maxResults = 60, regionCode = 'JP') => {
    try {
      console.log(`Initiating diverse abyss scan (targeting ${maxResults} nodes)...`);
      
      // 取得するカテゴリID（1:アニメ, 10:音楽, 17:スポーツ, 20:ゲーム, 24:エンタメ, 28:科学技術）
      const categories = [1, 10, 17, 20, 24, 28];
      
      // 各カテゴリから少なめに取得して混ぜる
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

      // IDベースで重複排除
      const uniqueItems = Array.from(new Map(allItems.map(item => [item.id, item])).values());

      // 毎回異なる顔ぶれにするためにシャッフル
      const shuffled = uniqueItems.sort(() => Math.random() - 0.5);
      
      console.log(`Scan complete: ${shuffled.length} diverse units detected.`);
      return shuffled.slice(0, maxResults);
    } catch (error) {
      console.error('Observation failed:', error);
      return [];
    }
  },

  // 検索
  searchVideos: async (query, maxResults = 20) => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`
      );
      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Error searching videos:', error);
      return [];
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
