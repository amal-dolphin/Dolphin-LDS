import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import classNames from 'classnames';
import CountUp from 'react-countup';
import useDynamicSizing from '../hooks/useDynamicSizing';

const GameSlide = ({ game, layout }) => {
  const [jackpotKey, setJackpotKey] = useState(0);
  const [showJackpot, setShowJackpot] = useState(true);
  const sizes = useDynamicSizing(layout);

  const validLayouts = ['ticker', 'landscape', 'portrait'];
  const isValidLayout = layout && validLayouts.includes(layout);

  useEffect(() => {
    if (!game.nextDrawJackpot) return;

    const loopInterval = setInterval(() => {
      setShowJackpot(false);
      setTimeout(() => {
        setJackpotKey(prev => prev + 1);
        setShowJackpot(true);
      }, 100);
    }, 6000);

    return () => clearInterval(loopInterval);
  }, [game.nextDrawJackpot]);

  // Early return AFTER all hooks
  if (!isValidLayout) {
    console.error('Invalid layout prop:', layout);
    return null;
  }

  const getBallColor = (ballName) => {
    if (!ballName) return 'bg-white text-black';
    const name = ballName.toLowerCase();
    if (name.includes('powerball')) return 'bg-red-600 text-white';
    if (name.includes('mega')) return 'bg-yellow-400 text-black';
    if (name.includes('cash')) return 'bg-green-600 text-white';
    return 'bg-white text-black';
  };

  const getGlowColor = (ballName) => {
    if (!ballName) return 'rgba(255, 255, 255, 0.6)';
    const name = ballName.toLowerCase();
    if (name.includes('powerball')) return 'rgba(220, 38, 38, 0.8)';
    if (name.includes('mega')) return 'rgba(250, 204, 21, 0.8)';
    if (name.includes('cash')) return 'rgba(22, 163, 74, 0.8)';
    return 'rgba(255, 255, 255, 0.6)';
  };

  const regularNumbers = game.numbers.filter(n => !n.special || !n.special.name);
  const specialNumber = game.numbers.find(n => n.special && n.special.name);

  const getGameLogo = (gameName) => {
    const name = gameName.toLowerCase();
    if (name.includes('double') && name.includes('play')) {
      return '/powerdoubleplay-logo.webp';
    }
    if (name.includes('powerball')) {
      return '/powerball-logo.png';
    }
    if (name.includes('mega million')) {
      return '/megamillions-logo.png';
    }
    return null;
  };

  const gameLogo = getGameLogo(game.game);

  // Ticker layout - Horizontal single-line layout
  if (layout === 'ticker') {
    return (
      <div
        className="flex flex-row items-center justify-center h-screen w-screen relative overflow-hidden box-border ticker-layout"
        style={{ 
          padding: `0 ${sizes.padding}px`,
          transform: 'translateZ(0)',
          WebkitTransform: 'translateZ(0)',
        }}
      >
        {/* Logo */}
        {gameLogo ? (
          <div className="flex-shrink-0" style={{ height: sizes.logoHeight, maxWidth: sizes.logoMaxWidth }}>
            <img
              src={gameLogo}
              alt={game.game}
              className="h-full w-auto object-contain"
              style={{ maxWidth: '100%', transform: 'translateZ(0)', WebkitTransform: 'translateZ(0)' }}
            />
          </div>
        ) : (
          <h1 className="font-bold text-white flex-shrink-0" style={{ fontSize: sizes.logoHeight * 0.3 }}>
            {game.game}
          </h1>
        )}

        {/* Divider */}
        <div 
          className="flex-shrink-0 bg-white/30"
          style={{ width: 2, height: sizes.dividerHeight, marginLeft: sizes.dividerMargin || sizes.gap * 2, marginRight: sizes.dividerMargin || sizes.gap * 2 }}
        />


        <div className="flex flex-row items-center flex-shrink-0">
          {regularNumbers.map((num, idx) => (
            <div key={idx} className={`relative flex-shrink-0 ball-bounce ball-bounce-${idx + 1}`} style={{ marginLeft: idx === 0 ? 0 : sizes.gap / 2, marginRight: sizes.gap / 2 }}>
              <div
                className="rounded-full flex items-center justify-center font-bold bg-white text-black"
                style={{
                  width: sizes.ballSize,
                  height: sizes.ballSize,
                  fontSize: sizes.ballFontSize,
                  boxShadow: '0 0 15px rgba(255, 255, 255, 0.4)',
                }}
              >
                {num.value}
              </div>
            </div>
          ))}
          
          {specialNumber && (
            <>
              <span
                className="text-white font-bold flex-shrink-0"
                style={{ fontSize: sizes.plusSize, marginLeft: sizes.gap * 0.5, marginRight: sizes.gap * 0.5 }}
              >
                +
              </span>
              
              <div className="relative flex-shrink-0 ball-bounce ball-bounce-special">
                <div
                  className="absolute rounded-full"
                  style={{
                    width: sizes.specialBallSize + 6,
                    height: sizes.specialBallSize + 6,
                    left: -3,
                    top: -3,
                    background: `radial-gradient(circle, ${getGlowColor(specialNumber.special.name)} 0%, transparent 70%)`,
                    filter: 'blur(12px)',
                    WebkitFilter: 'blur(12px)',
                    opacity: 0.8,
                  }}
                />
                <div
                  className={classNames(
                    'rounded-full flex items-center justify-center font-bold relative z-10',
                    getBallColor(specialNumber.special.name)
                  )}
                  style={{
                    width: sizes.specialBallSize,
                    height: sizes.specialBallSize,
                    fontSize: sizes.specialFontSize,
                    boxShadow: `0 0 20px ${getGlowColor(specialNumber.special.name)}`,
                  }}
                >
                  {specialNumber.value}
                </div>
              </div>
            </>
          )}
        </div>


        <div 
          className="flex-shrink-0 bg-white/30"
          style={{ width: 2, height: sizes.dividerHeight, marginLeft: sizes.dividerMargin || sizes.gap * 2, marginRight: sizes.dividerMargin || sizes.gap * 2 }}
        />

        {/* Info section */}
        <div className="flex flex-col justify-center flex-shrink-0" style={{ maxWidth: sizes.infoMaxWidth }}>
          <p className="text-white/90 whitespace-nowrap overflow-hidden text-ellipsis" style={{ fontSize: sizes.dateSize, fontWeight: 600 }}>
            Draw: {dayjs(game.date).format('MMM DD, YYYY')}
          </p>
          
          {game.nextDrawJackpot && parseFloat(game.nextDrawJackpot) > 0 && showJackpot && (
            <div>
              <p className="text-white/90 whitespace-nowrap overflow-hidden text-ellipsis" style={{ fontSize: sizes.dateSize, fontWeight: 600 }}>
                Next: {dayjs(game.nextDrawDate).format('MMM DD, YYYY')}
              </p>
              <div 
                className="font-bold text-yellow-400 whitespace-nowrap"
                style={{ fontSize: sizes.jackpotSize, lineHeight: 1.1, textShadow: '0 0 20px rgba(250, 204, 21, 0.6)' }}
              >
                $<CountUp start={0} end={parseFloat(game.nextDrawJackpot)} duration={1.5} separator="," decimals={0} />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Portrait and Landscape layouts
  return (
    <div
      className={`flex flex-col justify-center items-center h-screen w-screen relative overflow-hidden box-border ${layout}-layout`}
      style={{
        padding: sizes.padding,
        transform: 'translateZ(0)',
        WebkitTransform: 'translateZ(0)',
      }}
    >

      {gameLogo ? (
        <div className="flex-shrink-0" style={{ height: sizes.logoHeight, marginBottom: sizes.padding }}>
          <img
            src={gameLogo}
            alt={game.game}
            className="object-contain mx-auto h-full w-auto"
            style={{ maxWidth: '90vw', transform: 'translateZ(0)', WebkitTransform: 'translateZ(0)' }}
          />
        </div>
      ) : (
        <h1
          className="font-bold text-white flex-shrink-0"
          style={{ fontSize: sizes.logoHeight * 0.4, marginBottom: sizes.padding }}
        >
          {game.game}
        </h1>
      )}

      <p
        className="text-white/80 flex-shrink-0"
        style={{ fontSize: sizes.dateSize, marginBottom: sizes.padding }}
      >
        Draw: {dayjs(game.date).format('MMM DD, YYYY')}
      </p>

      <div 
        className="flex items-center justify-center flex-shrink-0"
        style={{ marginBottom: sizes.padding * 1.5 }}
      >
        {regularNumbers.map((num, idx) => (
          <div key={idx} className={`relative flex-shrink-0 ball-bounce ball-bounce-${idx + 1}`} style={{ marginLeft: idx === 0 ? 0 : sizes.gap / 2, marginRight: sizes.gap / 2 }}>
            <div
              className="rounded-full flex items-center justify-center font-bold bg-white text-black"
              style={{
                width: sizes.ballSize,
                height: sizes.ballSize,
                fontSize: sizes.ballFontSize,
                boxShadow: '0 0 10px rgba(255, 255, 255, 0.3), 0 0 20px rgba(255, 255, 255, 0.2)',
              }}
            >
              {num.value}
            </div>
          </div>
        ))}
        
        {specialNumber && (
          <>
            <span
              className="text-white font-bold flex-shrink-0"
              style={{ fontSize: sizes.plusSize, marginLeft: sizes.gap * 0.5, marginRight: sizes.gap * 0.5 }}
            >
              +
            </span>
            
            <div className="relative flex-shrink-0 ball-bounce ball-bounce-special">
              <div
                className="absolute rounded-full"
                style={{
                  width: sizes.specialBallSize + 8,
                  height: sizes.specialBallSize + 8,
                  left: -4,
                  top: -4,
                  background: `radial-gradient(circle, ${getGlowColor(specialNumber.special.name)} 0%, transparent 70%)`,
                  filter: 'blur(15px)',
                  WebkitFilter: 'blur(15px)',
                  opacity: 0.7,
                }}
              />
              <div
                className={classNames(
                  'rounded-full flex items-center justify-center font-bold relative z-10',
                  getBallColor(specialNumber.special.name)
                )}
                style={{
                  width: sizes.specialBallSize,
                  height: sizes.specialBallSize,
                  fontSize: sizes.specialFontSize,
                  boxShadow: `0 0 15px ${getGlowColor(specialNumber.special.name)}, 0 0 30px ${getGlowColor(specialNumber.special.name)}`,
                }}
              >
                {specialNumber.value}
              </div>
            </div>
          </>
        )}
      </div>

      {game.nextDrawJackpot && game.nextDrawJackpot > 0 && (
        <div className="text-center flex-shrink-0" style={{ maxWidth: '95vw' }}>
          <p className="text-white/80" style={{ fontSize: sizes.dateSize, marginBottom: sizes.padding * 0.3 }}>
            Next Draw: {dayjs(game.nextDrawDate).format('MMM DD, YYYY')}
          </p>
          
          {showJackpot && (
            <div 
              className="text-yellow-300 font-bold"
              style={{
                fontSize: sizes.jackpotSize,
                lineHeight: 1.1,
                textShadow: '0 0 20px rgba(250, 204, 21, 0.5)'
              }}
            >
              $<CountUp
                key={jackpotKey}
                start={0}
                end={game.nextDrawJackpot}
                duration={2.5}
                separator=","
                decimals={0}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GameSlide;
