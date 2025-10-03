import express from 'express';
import dotenv from 'dotenv';
dotenv.config(); // 環境変数を読み込む
import { fetchWeatherData } from './weather.js';
import rateLimit from 'express-rate-limit';



const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// レートリミットの設定 (15分間に100リクエストまで)
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/weather', apiLimiter);


// 天気情報エンドポイント
app.get('/api/weather/:city', async (req, res) => {
    const city = req.params.city;
    
    if (!city) {
        return res.status(400).json({ error: 'City parameter is required.' });
    }

    try {
        const weather = await fetchWeatherData(city); 
        res.json(weather);
        
    } catch (error) {
        // 外部APIのエラーをクライアントに返す
        console.error('API Error:', error);
        res.status(503).json({ 
            error: 'Failed to retrieve weather data.'
        });
    }
});

// サーバー起動
app.listen(PORT, () => {
    console.log(`⚡️ [server]: Server is running at http://localhost:${PORT}`);
});