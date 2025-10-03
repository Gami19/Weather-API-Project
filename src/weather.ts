// サードパーティAPIへのアクセスと、キャッシュの「取得 → 保存」 のロジックを実装

interface VisualCrossingResponse{
    // interfece は Object なので ; 
    resolvedAddress: string;
    description: string;
    currentConditions: {
        temp: number
    };
}

import axios from 'axios';
// ⚠️ ローカルのモジュールインポートには必ず .js 拡張子を付けます
import { getCache, setCache } from './cache.js';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.WEATHER_API_KEY;
const BASE_URL = process.env.WEATHER_API_BASE_URL;
const CACHE_EXPIRATION_SECONDS = 60 * 60 * 12; // 12時間の有効期限

// any ?、...
export const fetchWeatherData = async (city: string): Promise<any> => {
    // city: string を小文字に変換
    const cacheKey = `weather: ${city.toLowerCase()}`;

    //  1.キャッシュの確認
    const cacheData = await getCache( cacheKey );

    if ( cacheData ) {
        console.log(`✅ Cache hit for ${ city }!`);
        return{
            ...JSON.parse(cacheData),
            source: `Redis Cache`
        }
    }

    // 2. キャッシュミス
    console.log(`❌ Cache miss for ${city}. Fetching from 3rd party API ...`);

    // 3. API通信
    try {
        const url = `${BASE_URL}${city}?unitGroup=metric&key=${API_KEY}`;
        const response = await axios.get <VisualCrossingResponse> (url, {timeout: 5000});

        // 4. データの抽出・整形
        const weatherData = {

            // axios などの非同期通信ライブラリを使う際、try...catch ブロック内で受け取るレスポンスオブジェクト
            // （ここでは response）の data プロパティは、デフォルトで unknown 型として扱われる　
            // → 操作したりすることが許可されない。これは、アクセスする前に開発者が型を検証することを強制するため
            // 解決策: interface宣言（型アサーションによる）明示
            
            city: response.data.resolvedAddress || city,
            temparture: `${response.data.currentConditions.temp}°C`,
            description: response.data.description,
            source: '3rd Party APi'
        };

        // 5. キャッシュに保存
        await setCache(cacheKey, JSON.stringify(weatherData), CACHE_EXPIRATION_SECONDS);
        console.log(`💾 Data saved to cache for ${city}`);

        return weatherData;
    } catch( error ){
        // 3rd Party APIのエラーをキャッチしてスロー
        console.error('External API fetch error:');
        throw new Error(`Failed to fetch weather data for ${city}`);
    }
};