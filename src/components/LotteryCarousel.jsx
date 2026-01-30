import React, { useState, useEffect } from 'react';
import GameSlide from './GameSlide';
import axios from 'axios';

const LOTTERY_LOGOS = [
  '/powerball-logo.png',
  '/megamillions-logo.png',
  '/powerdoubleplay-logo.webp'
];

const preloadImages = () => {
  LOTTERY_LOGOS.forEach(src => {
    const img = new Image();
    img.src = src;
  });
};

const transformDolphinAPIData = (apiData) => {
  const games = [];
  
  if (!apiData || !Array.isArray(apiData)) {
    console.warn('Invalid API data structure');
    return games;
  }
  
  apiData.forEach(game => {
    if (!game.plays || !Array.isArray(game.plays)) return;
    
    game.plays.forEach(play => {
      if (!play.draws || !Array.isArray(play.draws)) return;
      
      play.draws.forEach(draw => {
        const numbers = (draw.numbers || [])
          .filter(n => {
            return !n.specialBall || n.specialBall.ballType !== 'multi';
          })
          .sort((a, b) => a.order - b.order)
          .map(n => ({
            value: n.value,
            special: n.specialBall ? { name: n.specialBall.name } : null
          }));
        
        games.push({
          game: play.name || game.name,
          date: draw.date,
          numbers: numbers,
          nextDrawJackpot: draw.nextDrawJackpot || 0,
          nextDrawDate: draw.nextDrawDate || null
        });
      });
    });
  });
  
  return games;
};

const sortGames = (games) => {
  return games.sort((a, b) => {
    const getOrder = (gameName) => {
      const name = gameName.toLowerCase();
      if (name.includes('powerball') && !name.includes('double')) return 1;
      if (name.includes('double') && name.includes('play')) return 2;
      if (name.includes('mega million')) return 3;
      return 4;
    };
    return getOrder(a.game) - getOrder(b.game);
  });
};

const LotteryCarousel = ({ layout, lotteryList, carouselGap }) => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchLotteryData = async () => {
    try {
      const apiUrl = process.env.REACT_APP_LOTTERY_API_URL;
      const apiKey = process.env.REACT_APP_LOTTERY_API_KEY;
      
      if (!apiUrl || !apiKey) {
        throw new Error('API configuration missing');
      }

      console.log('Fetching from Dolphin Digital API...');
      const response = await axios.get(apiUrl, {
        timeout: 10000,
        headers: {
          'X-Api-Key': apiKey,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.data || !response.data.data || !response.data.dataTs) {
        throw new Error('Invalid API response structure');
      }

      const { data: apiData, dataTs } = response.data;
      
      // Check data freshness (warn if older than 10 minutes)
      const ageInMinutes = (Date.now() - dataTs) / (1000 * 60);
      if (ageInMinutes > 10) {
        console.warn(`API data is ${Math.round(ageInMinutes)} minutes old (older than 10 minutes)`);
      } else {
        console.log(`API data is fresh (${Math.round(ageInMinutes)} minutes old)`);
      }
      
      // Transform and sort games
      let transformedGames = transformDolphinAPIData(apiData);
      
      // Filter by lottery list if provided
      if (lotteryList && lotteryList.length > 0) {
        transformedGames = transformedGames.filter(game => {
          return lotteryList.some(requested => {
            const normalizedGame = game.game.toLowerCase().replace(/\s+/g, '');
            const normalizedRequest = requested.toLowerCase().replace(/\s+/g, '');
            return normalizedGame.includes(normalizedRequest) || normalizedRequest.includes(normalizedGame);
          });
        });
      }
      
      setGames(sortGames(transformedGames));
      setLoading(false);
      setError(null);
      
    } catch (err) {
      console.error('Error fetching lottery data:', err.message);
      setError('Failed to load lottery data');
      setLoading(false);
    }
  };

  useEffect(() => {
    preloadImages();
  }, []);

  useEffect(() => {
    fetchLotteryData();
    const interval = setInterval(fetchLotteryData, 60000);
    return () => clearInterval(interval);
  }, [lotteryList]);

  // Carousel rotation - simplified to prevent flickering
  useEffect(() => {
    if (games.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % games.length);
    }, carouselGap * 1000);

    return () => clearInterval(interval);
  }, [games.length, carouselGap]);

  if (loading && games.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900">
        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-yellow-400 mb-8"></div>
        <p className="text-white text-4xl font-bold animate-pulse">Loading Lottery Data...</p>
      </div>
    );
  }

  if (error && games.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900">
        <p className="text-white text-3xl font-bold mb-4">⚠️ Error Loading Data</p>
        <p className="text-white text-xl">{error}</p>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <p className="text-white text-3xl font-bold">No Lottery Data Available</p>
        <p className="text-white text-xl mt-4">Please check your configuration</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      {/* Render all slides, only show current one with CSS */}
      {games.map((game, index) => (
        <div
          key={`slide-${game.game}-${index}`}
          className="absolute inset-0"
          style={{
            opacity: index === currentIndex ? 1 : 0,
            transition: 'opacity 0.8s ease-in-out',
            WebkitTransition: 'opacity 0.8s ease-in-out',
            transform: 'translateZ(0)',
            WebkitTransform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            zIndex: index === currentIndex ? 2 : 1,
            pointerEvents: index === currentIndex ? 'auto' : 'none',
          }}
        >
          <GameSlide game={game} layout={layout} />
        </div>
      ))}
    </div>
  );
};

export default LotteryCarousel;
