import React, { useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import LotteryCarousel from './components/LotteryCarousel';
import './android9-fallbacks.css';
import './App.css';

function App() {
  const [searchParams] = useSearchParams();

  const layout = searchParams.get('layout') || 'portrait';
  const lotteryParam = searchParams.get('lottery') || 'powerball|mega millions';
  const carouselGap = Math.max(2, parseInt(searchParams.get('carousalgap')) || 10);

  const lotteryList = useMemo(() => {
    return lotteryParam.split(/[|,]/).map(s => s.trim()).filter(Boolean);
  }, [lotteryParam]);


  useEffect(() => {
    document.body.setAttribute('data-layout', layout);
    return () => {
      document.body.removeAttribute('data-layout');
    };
  }, [layout]);

  return (
    <div className="App min-h-screen relative overflow-hidden lottery-gradient-bg">
      <div className="absolute inset-0 z-0 lottery-overlay" />

      <div className="relative z-10">
        <LotteryCarousel
          key={`carousel-${layout}`}
          layout={layout}
          lotteryList={lotteryList}
          carouselGap={carouselGap}
        />
      </div>
    </div>
  );
}

export default App;