import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import classNames from 'classnames';
import CountUp from 'react-countup';

const GameSlide = ({ game, layout }) => {
  const [jackpotKey, setJackpotKey] = useState(0);
  const [showJackpot, setShowJackpot] = useState(true);

  const validLayouts = ['ticker', 'landscape', 'portrait'];
  const isValidLayout = layout && validLayouts.includes(layout);

  useEffect(() => {
    if (!game.nextDrawJackpot) return;

    const loopInterval = setInterval(() => {
      setShowJackpot(false);
      setTimeout(() => {
        setJackpotKey((prev) => prev + 1);
        setShowJackpot(true);
      }, 100);
    }, 6000);

    return () => clearInterval(loopInterval);
  }, [game.nextDrawJackpot]);

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

  const regularNumbers = game.numbers.filter((n) => !n.special || !n.special.name);
  const specialNumber = game.numbers.find((n) => n.special && n.special.name);

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

  if (layout === 'ticker') {
    return (
      <div
        className="flex flex-row items-center justify-center h-screen w-screen relative overflow-hidden box-border ticker-layout"
        style={{
          maxWidth: '100vw',
          maxHeight: '100vh',
          transform: 'translateZ(0)',
          WebkitTransform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
      >
        {gameLogo ? (
          <div
            className="ticker-logo"
            style={{
              width: 'auto',
            }}
          >
            <img
              src={gameLogo}
              alt={game.game}
              className="h-full w-auto object-contain"
              style={{
                transform: 'translateZ(0)',
                WebkitTransform: 'translateZ(0)',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
              }}
            />
          </div>
        ) : (
          <h1 className="font-bold text-white ticker-title">{game.game}</h1>
        )}

        <div className="bg-white/30 ticker-divider"></div>

        <div className="flex flex-row items-center  flex-nowrap ticker-numbers">
          {regularNumbers.map((num, idx) => (
            <div key={idx} className={`relative flex-shrink-0 ball-bounce ball-bounce-${idx + 1}`}>
              <div className="rounded-full flex items-center justify-center font-bold bg-white text-black relative z-10 ticker-ball">
                {num.value}
              </div>
            </div>
          ))}

          {specialNumber && (
            
            <>
              <span className="text-white font-bold flex-shrink-0 ticker-plus">+</span>

              <div className="relative flex-shrink-0 ball-bounce ball-bounce-special">
                <div
                  className="absolute rounded-full ticker-special-halo"
                  style={{
                    left: '-0.25rem',
                    top: '-0.25rem',
                    background: `radial-gradient(circle, ${getGlowColor(
                      specialNumber.special.name
                    )} 0%, transparent 70%)`,
                    filter: 'blur(25px)',
                    WebkitFilter: 'blur(25px)',
                    opacity: 0.8,
                  }}
                />

                <div
                  className={classNames(
                    'rounded-full flex items-center justify-center font-bold relative z-10 ticker-special-ball',
                    getBallColor(specialNumber.special.name)
                  )}
                  style={{
                    boxShadow: `0 0 25px ${getGlowColor(
                      specialNumber.special.name
                    )}, 0 0 50px ${getGlowColor(specialNumber.special.name)}`,
                  }}
                >
                  {specialNumber.value}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="bg-white/30 ticker-divider"></div>

        <div className="flex flex-col justify-center ticker-info">
          <p
            className="text-white/90 whitespace-nowrap overflow-hidden text-ellipsis ticker-date"
            style={{ fontWeight: '600' }}
          >
            Draw: {dayjs(game.date).format('MMM DD, YYYY')}
          </p>

          {game.nextDrawJackpot && parseFloat(game.nextDrawJackpot) > 0 && showJackpot && (
            <div className="relative">
              <p
                className="text-white/90 whitespace-nowrap overflow-hidden text-ellipsis ticker-next-draw"
                style={{ fontWeight: '600' }}
              >
                Next Draw: {dayjs(game.nextDrawDate).format('MMM DD, YYYY')}
              </p>
              <div
                className="font-bold text-yellow-400 relative overflow-hidden whitespace-nowrap text-ellipsis ticker-jackpot"
                style={{
                  lineHeight: '1.1',
                  textShadow: '0 0 25px rgba(250, 204, 21, 0.6)',
                  marginTop: '0.25rem',
                }}
              >
                $
                <CountUp
                  start={0}
                  end={parseFloat(game.nextDrawJackpot)}
                  duration={1.5}
                  separator=","
                  decimals={0}
                  useEasing={true}
                  easingFn={(t, b, c, d) => c * ((t = t / d - 1) * t * t + 1) + b}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col justify-center items-center h-screen w-screen relative overflow-hidden box-border ${layout}-layout`}
      style={{
        maxWidth: '100vw',
        maxHeight: '100vh',
        transform: 'translateZ(0)',
        WebkitTransform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
      }}
    >
      {gameLogo ? (
        <div
          className={`flex-shrink-0 ${layout}-logo`}
          style={{
            maxWidth: '90vw',
          }}
        >
          <img
            src={gameLogo}
            alt={game.game}
            className="object-contain mx-auto h-full w-auto max-w-full"
            style={{
              transform: 'translateZ(0)',
              WebkitTransform: 'translateZ(0)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          />
        </div>
      ) : (
        <h1 className={`font-bold text-white flex-shrink-0 ${layout}-title`}>{game.game}</h1>
      )}

      <p className={`text-white/80 flex-shrink-0 ${layout}-draw-date`}>
        Draw: {dayjs(game.date).format('MMM DD, YYYY')}
      </p>

      <div
        className={`flex items-center justify-center flex-shrink-0 ${layout}-balls-container`}
        style={{
          maxWidth: '95vw',
          width: '100%',
          flexWrap: 'nowrap',
        }}
      >
        {regularNumbers.map((num, idx) => (
          <div key={idx} className={`relative flex-shrink-0 ball-bounce ball-bounce-${idx + 1}`}>
            <div
              className={`rounded-full flex items-center justify-center font-bold bg-white text-black relative z-10 ${layout}-ball`}
              style={{
                boxShadow: '0 0 10px rgba(255, 255, 255, 0.3), 0 0 20px rgba(255, 255, 255, 0.2)',
              }}
            >
              {num.value}
            </div>
          </div>
        ))}

        {specialNumber && (
          <>
            <span className={`text-white font-bold flex-shrink-0 ${layout}-plus`}>+</span>

            <div className="relative flex-shrink-0 ball-bounce ball-bounce-special">
              <div
                className={`absolute rounded-full ${layout}-special-halo`}
                style={{
                  left: '-0.25rem',
                  top: '-0.25rem',
                  background: `radial-gradient(circle, ${getGlowColor(
                    specialNumber.special.name
                  )} 0%, transparent 70%)`,
                  filter: 'blur(20px)',
                  WebkitFilter: 'blur(20px)',
                  opacity: 0.7,
                }}
              />

              <div
                className={classNames(
                  `rounded-full flex items-center justify-center font-bold relative z-10 ${layout}-special-ball`,
                  getBallColor(specialNumber.special.name)
                )}
                style={{
                  boxShadow: `0 0 15px ${getGlowColor(
                    specialNumber.special.name
                  )}, 0 0 30px ${getGlowColor(specialNumber.special.name)}`,
                }}
              >
                {specialNumber.value}
              </div>
            </div>
          </>
        )}
      </div>

      {game.nextDrawJackpot && game.nextDrawJackpot > 0 && (
        <div
          className={`text-center relative flex-shrink-0 ${layout}-jackpot-container`}
          style={{ maxWidth: '95vw' }}
        >
          <p className={`text-white/80 ${layout}-next-draw`}>
            Next Draw: {dayjs(game.nextDrawDate).format('MMM DD, YYYY')}
          </p>

          <div className="relative inline-block overflow-hidden max-w-full">
            {showJackpot && (
              <div
                className={`text-yellow-300 font-bold relative z-10 overflow-hidden text-ellipsis ${layout}-jackpot`}
                style={{
                  maxWidth: '90vw',
                  lineHeight: '1.1',
                  textShadow: '0 0 20px rgba(250, 204, 21, 0.5)',
                }}
              >
                $<CountUp
                  key={jackpotKey}
                  start={0}
                  end={game.nextDrawJackpot}
                  duration={2.5}
                  separator=","
                  decimals={0}
                  useEasing={true}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameSlide;
