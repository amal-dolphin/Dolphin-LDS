import React, { useState, useEffect } from 'react';
import GameSlide from './GameSlide';
import axios from 'axios';

const transformDolphinAPIData = (apiData) => {
  const games = [];

  if (!apiData || !Array.isArray(apiData)) {
    console.warn('Invalid API data structure');
    return games;
  }

  apiData.forEach((game) => {
    if (!game.plays || !Array.isArray(game.plays)) return;

    game.plays.forEach((play) => {
      if (!play.draws || !Array.isArray(play.draws)) return;

      play.draws.forEach((draw) => {
        const numbers = (draw.numbers || [])
          .filter((n) => !n.specialBall || n.specialBall.ballType !== 'multi')
          .sort((a, b) => a.order - b.order)
          .map((n) => ({
            value: n.value,
            special: n.specialBall ? { name: n.specialBall.name } : null,
          }));

        games.push({
          game: play.name || game.name,
          date: draw.date,
          numbers,
          nextDrawJackpot: draw.nextDrawJackpot || 0,
          nextDrawDate: draw.nextDrawDate || null,
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
  const [nextIndex, setNextIndex] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

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
          'Content-Type': 'application/json',
        },
      });

      if (!response.data || !response.data.data || !response.data.dataTs) {
        throw new Error('Invalid API response structure');
      }

      const { data: apiData, dataTs } = response.data;

      const ageInMinutes = (Date.now() - dataTs) / (1000 * 60);
      if (ageInMinutes > 10) {
        console.warn(
          `⚠️ API data is ${Math.round(ageInMinutes)} minutes old (older than 10 minutes)`
        );
      } else {
        console.log(`✅ API data is fresh (${Math.round(ageInMinutes)} minutes old)`);
      }

      let transformedGames = transformDolphinAPIData(apiData);

      if (lotteryList && lotteryList.length > 0) {
        transformedGames = transformedGames.filter((game) => {
          return lotteryList.some((requested) => {
            const normalizedGame = game.game.toLowerCase().replace(/\s+/g, '');
            const normalizedRequest = requested.toLowerCase().replace(/\s+/g, '');
            return (
              normalizedGame.includes(normalizedRequest) || normalizedRequest.includes(normalizedGame)
            );
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
    fetchLotteryData();
    const interval = setInterval(fetchLotteryData, 60000);
    return () => clearInterval(interval);
  }, [lotteryList]);

  useEffect(() => {
    if (games.length <= 1) return;

    const interval = setInterval(() => {
      setNextIndex((prev) => {
        const current = prev === null ? currentIndex : prev;
        return (current + 1) % games.length;
      });
      setIsTransitioning(true);

      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % games.length);
        setNextIndex(null);
        setIsTransitioning(false);
      }, 500);
    }, carouselGap * 1000);

    return () => clearInterval(interval);
  }, [games.length, carouselGap, currentIndex]);

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

  const currentGame = games[currentIndex];
  const nextGame = nextIndex !== null ? games[nextIndex] : null;

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      <div
        key={`current-${currentGame.game}-${currentIndex}`}
        className="absolute inset-0"
        style={{
          opacity: isTransitioning ? 0 : 1,
          transition: 'opacity 0.5s ease-in-out',
          WebkitTransition: 'opacity 0.5s ease-in-out',
          transform: 'translateZ(0)',
          WebkitTransform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          display: isTransitioning ? 'none' : 'block',
          visibility: isTransitioning ? 'hidden' : 'visible',
          zIndex: 1,
          willChange: 'opacity',
        }}
      >
        <GameSlide game={currentGame} layout={layout} />
      </div>

      {nextGame && isTransitioning && (
        <div
          key={`next-${nextGame.game}-${nextIndex}`}
          className="absolute inset-0"
          style={{
            opacity: 1,
            transition: 'opacity 0.5s ease-in-out',
            WebkitTransition: 'opacity 0.5s ease-in-out',
            transform: 'translateZ(0)',
            WebkitTransform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            display: 'block',
            visibility: 'visible',
            zIndex: 2,
            willChange: 'opacity',
          }}
        >
          <GameSlide game={nextGame} layout={layout} />
        </div>
      )}
    </div>
  );
};

export default LotteryCarousel;
