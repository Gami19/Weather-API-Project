// Redis's logic

// class
import Redis from 'ioredis';
// module
import dotenv from 'dotenv';

// 環境変数を読み取る
dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redis = new Redis(redisUrl);

try{
    // on は Node.jsのデフォルトモジュール（ EventEmitter ）
    // イベント駆動プログラミングという
    redis.on('connect', () => {
        console.log('📦 Redis client connected');
    });
    

} catch (error){
    console.log('❌ Redis client disconnected');
};

// キャッシュからデータを取得
// export、アロー関数:async(エイシンク)、Promise、<>
export const getCache = async (key: string): Promise< string | null > => {
    return redis.get(key);
};

// キャッシュにデータを設定
export const setCache = async (key: string, value: string, expirationSeconds: number): Promise< string | null> => {
    // 'EX' (Expire) フラグを使って有効期限を設定
    // Redisの SET コマンドは通常、成功すれば必ず 'OK' を返す
    // ioredis パッケージ自体が持つ型定義を信頼し、string | null の可能性があると判断
    return redis.set(key, value, 'EX', expirationSeconds);
};

export default redis;