import { useState, useEffect, useCallback } from 'react';


const useDynamicSizing = (layout) => {
  const [sizes, setSizes] = useState(() => calculateSizesForLayout(layout));

  const calculateSizes = useCallback(() => {
    setSizes(calculateSizesForLayout(layout));
  }, [layout]);

  useEffect(() => {
    calculateSizes();
    
    window.addEventListener('resize', calculateSizes);
    window.addEventListener('orientationchange', calculateSizes);
    
    return () => {
      window.removeEventListener('resize', calculateSizes);
      window.removeEventListener('orientationchange', calculateSizes);
    };
  }, [calculateSizes]);

  return sizes;
};

function calculateSizesForLayout(layout) {
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1080;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 1920;
  
  // Number of ball elements (5 regular + plus + 1 special = 7)
  const totalBallElements = 7;
  const gapCount = 6;

  if (layout === 'portrait') {
    // Portrait: Stack content vertically, maximize sizes
    
    // Ball sizing - fit within 92% of width
    const availableWidthForBalls = vw * 0.92;
    const totalGapWidth = gapCount * (vw * 0.015);
    const plusWidth = vw * 0.04;
    const ballByWidth = (availableWidthForBalls - totalGapWidth - plusWidth) / totalBallElements;
    
    // Height constraint - balls shouldn't exceed 15% of height
    const ballByHeight = vh * 0.15;
    const ballSize = Math.min(ballByWidth, ballByHeight);
    
    // Logo - make it prominent
    const logoHeight = Math.min(vh * 0.2, vw * 0.8);
    
    // Jackpot - large but must fit width (approx 12 chars for $XXX,XXX,XXX)
    const jackpotByHeight = vh * 0.12;
    const jackpotByWidth = vw / 8; // ~12.5% per character space
    const jackpotSize = Math.min(jackpotByHeight, jackpotByWidth);
    
    return {
      ballSize: ballSize,
      specialBallSize: ballSize * 1.1,
      ballFontSize: ballSize * 0.48,
      specialFontSize: ballSize * 0.48,
      plusSize: ballSize * 0.5,
      gap: vw * 0.015,
      logoHeight: logoHeight,
      dateSize: Math.min(vh * 0.04, vw * 0.06),
      jackpotSize: jackpotSize,
      padding: vh * 0.02,
    };
    
  } else if (layout === 'landscape') {
    // Landscape: Content stacked vertically, maximize to fill height
    
    // Available height after padding
    const availableHeight = vh * 0.95;
    
    // Distribute height: logo 25%, date 8%, balls 35%, jackpot info 25%, padding 7%
    const logoHeight = availableHeight * 0.25;
    const ballRowHeight = availableHeight * 0.35;
    const jackpotHeight = availableHeight * 0.22;
    
    // Ball sizing - maximize within row height
    const ballByHeight = ballRowHeight * 0.9;
    
    // Also check width constraint
    const availableWidthForBalls = vw * 0.9;
    const totalGapWidth = gapCount * (vw * 0.015);
    const plusWidth = vw * 0.05;
    const ballByWidth = (availableWidthForBalls - totalGapWidth - plusWidth) / totalBallElements;
    
    const ballSize = Math.min(ballByHeight, ballByWidth);
    
    // Jackpot - maximize but fit width
    const jackpotByHeight = jackpotHeight * 0.7;
    const jackpotByWidth = vw / 9;
    const jackpotSize = Math.min(jackpotByHeight, jackpotByWidth);
    
    return {
      ballSize: ballSize,
      specialBallSize: ballSize * 1.1,
      ballFontSize: ballSize * 0.45,
      specialFontSize: ballSize * 0.45,
      plusSize: ballSize * 0.55,
      gap: Math.min(vw * 0.015, ballSize * 0.15),
      logoHeight: Math.min(logoHeight, vw * 0.35),
      dateSize: Math.min(vh * 0.05, vw * 0.035),
      jackpotSize: jackpotSize,
      padding: vh * 0.015,
    };
    
  } else if (layout === 'ticker') {
    // Ticker: Horizontal layout, height is the constraint
    
    const availableHeight = vh * 0.85;
    
    // Ball sizing - maximize based on height
    const ballByHeight = availableHeight * 0.6;
    
    // Width check - balls section gets ~40% of width
    const ballsSectionWidth = vw * 0.42;
    const totalGapWidth = gapCount * (vh * 0.05);
    const ballByWidth = (ballsSectionWidth - totalGapWidth) / totalBallElements;
    
    const ballSize = Math.min(ballByHeight, ballByWidth);
    
    // Gaps scale with height
    const baseGap = vh * 0.06;
    
    return {
      ballSize: ballSize,
      specialBallSize: ballSize * 1.08,
      ballFontSize: ballSize * 0.45,
      specialFontSize: ballSize * 0.45,
      plusSize: ballSize * 0.4,
      gap: baseGap,
      logoHeight: availableHeight * 0.85,
      logoMaxWidth: vw * 0.18,
      dateSize: Math.min(vh * 0.14, vw * 0.016),
      jackpotSize: Math.min(vh * 0.22, vw * 0.038),
      dividerHeight: availableHeight * 0.85,
      dividerMargin: baseGap,
      padding: vh * 0.08,
      infoMaxWidth: vw * 0.26,
    };
  }
  
  // Default fallback
  const minDim = Math.min(vw, vh);
  return {
    ballSize: minDim * 0.1,
    specialBallSize: minDim * 0.11,
    ballFontSize: minDim * 0.045,
    specialFontSize: minDim * 0.05,
    plusSize: minDim * 0.05,
    gap: minDim * 0.02,
    logoHeight: minDim * 0.2,
    dateSize: minDim * 0.035,
    jackpotSize: minDim * 0.08,
    padding: minDim * 0.02,
  };
}

export default useDynamicSizing;
