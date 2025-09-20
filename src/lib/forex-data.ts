// Forex Data Management and Historical Data Integration

import { ForexDataPoint, CurrencyPair, TimeFrame } from './types';

export class ForexDataManager {
  private apiKey: string;
  private baseUrl: string;
  private cache: Map<string, { data: ForexDataPoint[]; timestamp: number }> = new Map();
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes cache

  constructor(apiKey: string = '', provider: 'alphavantage' | 'fxapi' = 'alphavantage') {
    this.apiKey = apiKey;
    this.baseUrl = provider === 'alphavantage' 
      ? 'https://www.alphavantage.co/query'
      : 'https://api.fxapi.com/v1';
  }

  /**
   * Fetch historical forex data for pattern mining
   */
  async getHistoricalData(
    currencyPair: CurrencyPair,
    timeFrame: TimeFrame,
    dataPoints: number = 10000
  ): Promise<ForexDataPoint[]> {
    const cacheKey = `${currencyPair.symbol}_${timeFrame.value}_${dataPoints}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data.slice(0, dataPoints);
    }

    try {
      let data: ForexDataPoint[];
      
      if (this.apiKey && this.apiKey !== '') {
        // Use real API if key provided
        data = await this.fetchFromAPI(currencyPair, timeFrame, dataPoints);
      } else {
        // Generate realistic test data for development/demo
        data = this.generateRealisticTestData(currencyPair, timeFrame, dataPoints);
      }

      // Cache the results
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      
      return data;
    } catch (error) {
      console.error('Error fetching forex data:', error);
      // Fallback to test data on error
      return this.generateRealisticTestData(currencyPair, timeFrame, dataPoints);
    }
  }

  /**
   * Fetch data from external forex API
   */
  private async fetchFromAPI(
    currencyPair: CurrencyPair,
    timeFrame: TimeFrame,
    dataPoints: number
  ): Promise<ForexDataPoint[]> {
    const url = new URL(this.baseUrl);
    url.searchParams.append('function', 'FX_INTRADAY');
    url.searchParams.append('from_symbol', currencyPair.base);
    url.searchParams.append('to_symbol', currencyPair.quote);
    url.searchParams.append('interval', this.mapTimeFrameToAPI(timeFrame.value));
    url.searchParams.append('apikey', this.apiKey);
    url.searchParams.append('outputsize', 'full');

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data['Error Message']) {
      throw new Error(data['Error Message']);
    }

    if (data['Note']) {
      throw new Error('API rate limit exceeded');
    }

    const timeSeries = data[`Time Series FX (${this.mapTimeFrameToAPI(timeFrame.value)})`];
    
    if (!timeSeries) {
      throw new Error('Invalid API response format');
    }

    const forexData: ForexDataPoint[] = [];
    const timestamps = Object.keys(timeSeries).sort().reverse();

    for (let i = 0; i < Math.min(timestamps.length, dataPoints); i++) {
      const timestamp = timestamps[i];
      const point = timeSeries[timestamp];
      
      forexData.push({
        timestamp: timestamp,
        open: parseFloat(point['1. open']),
        high: parseFloat(point['2. high']),
        low: parseFloat(point['3. low']),
        close: parseFloat(point['4. close'])
      });
    }

    return forexData;
  }

  /**
   * Generate realistic test data for development and demo purposes
   */
  private generateRealisticTestData(
    currencyPair: CurrencyPair,
    timeFrame: TimeFrame,
    dataPoints: number
  ): ForexDataPoint[] {
    const data: ForexDataPoint[] = [];
    const startDate = new Date();
    startDate.setTime(startDate.getTime() - (dataPoints * timeFrame.minutes * 60 * 1000));

    // Base price for different currency pairs
    const basePrices: { [key: string]: number } = {
      'EURUSD': 1.2000,
      'GBPUSD': 1.3500,
      'USDJPY': 110.00,
      'USDCHF': 0.9200,
      'AUDUSD': 0.7500,
      'USDCAD': 1.2500,
      'NZDUSD': 0.7000,
      'EURGBP': 0.8900
    };

    let currentPrice = basePrices[currencyPair.symbol] || 1.0000;
    const volatility = this.getVolatilityForPair(currencyPair.symbol);

    for (let i = 0; i < dataPoints; i++) {
      const timestamp = new Date(startDate.getTime() + (i * timeFrame.minutes * 60 * 1000));
      
      // Generate realistic price movements
      const randomFactor = (Math.random() - 0.5) * 2;
      const trend = Math.sin(i / 100) * 0.0001; // Long-term trend
      const noise = randomFactor * volatility;
      
      // Simulate market hours effect (higher volatility during overlap)
      const hour = timestamp.getUTCHours();
      let sessionMultiplier = 1;
      if ((hour >= 8 && hour <= 16) || (hour >= 13 && hour <= 21)) {
        sessionMultiplier = 1.5; // London/NY overlap
      }

      const priceChange = (trend + noise) * sessionMultiplier;
      currentPrice *= (1 + priceChange);

      // Generate OHLC from current price
      const spread = currentPrice * (0.00001 + Math.random() * 0.00005);
      const high = currentPrice + (Math.random() * spread * 2);
      const low = currentPrice - (Math.random() * spread * 2);
      const open = i === 0 ? currentPrice : data[i - 1].close;

      // Add realistic intraday patterns occasionally
      if (i > 20 && Math.random() > 0.995) {
        // Add a small pattern (bullish or bearish)
        const patternDirection = Math.random() > 0.5 ? 1 : -1;
        const patternStrength = 0.0005 * patternDirection;
        currentPrice *= (1 + patternStrength);
      }

      data.push({
        timestamp: timestamp.toISOString(),
        open: Math.max(low, Math.min(high, open)),
        high: high,
        low: low,
        close: currentPrice,
        volume: Math.floor(1000 + Math.random() * 5000)
      });
    }

    return data;
  }

  /**
   * Get appropriate volatility for currency pair
   */
  private getVolatilityForPair(symbol: string): number {
    const volatilities: { [key: string]: number } = {
      'EURUSD': 0.0008,
      'GBPUSD': 0.0012,
      'USDJPY': 0.0010,
      'USDCHF': 0.0009,
      'AUDUSD': 0.0015,
      'USDCAD': 0.0011,
      'NZDUSD': 0.0016,
      'EURGBP': 0.0007
    };
    
    return volatilities[symbol] || 0.0010;
  }

  /**
   * Map our timeframe values to API timeframe values
   */
  private mapTimeFrameToAPI(timeFrame: string): string {
    const mapping: { [key: string]: string } = {
      '1m': '1min',
      '5m': '5min',
      '15m': '15min',
      '30m': '30min',
      '1h': '60min',
      '4h': '240min', // Not all APIs support this
      '1d': 'daily'
    };
    
    return mapping[timeFrame] || '60min';
  }

  /**
   * Validate forex data quality
   */
  validateData(data: ForexDataPoint[]): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    if (!data || data.length === 0) {
      return { isValid: false, issues: ['No data provided'] };
    }

    // Check for missing OHLC values
    for (let i = 0; i < data.length; i++) {
      const point = data[i];
      
      if (!point.open || !point.high || !point.low || !point.close) {
        issues.push(`Missing OHLC values at index ${i}`);
      }
      
      if (point.high < point.low) {
        issues.push(`Invalid OHLC: High < Low at index ${i}`);
      }
      
      if (point.open > point.high || point.open < point.low) {
        issues.push(`Invalid OHLC: Open outside High-Low range at index ${i}`);
      }
      
      if (point.close > point.high || point.close < point.low) {
        issues.push(`Invalid OHLC: Close outside High-Low range at index ${i}`);
      }
    }

    // Check for chronological order
    for (let i = 1; i < data.length; i++) {
      if (new Date(data[i].timestamp) <= new Date(data[i - 1].timestamp)) {
        issues.push(`Data not in chronological order at index ${i}`);
      }
    }

    // Check for extreme price movements (potential data errors)
    for (let i = 1; i < data.length; i++) {
      const prevClose = data[i - 1].close;
      const currentOpen = data[i].open;
      const priceChange = Math.abs((currentOpen - prevClose) / prevClose);
      
      if (priceChange > 0.05) { // 5% price gap
        issues.push(`Extreme price gap (${(priceChange * 100).toFixed(2)}%) at index ${i}`);
      }
    }

    return {
      isValid: issues.length === 0,
      issues: issues
    };
  }

  /**
   * Clear data cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Utility functions for forex data management

/**
 * Calculate technical indicators for forex data
 */
export function calculateTechnicalIndicators(data: ForexDataPoint[], params: {
  rsiPeriod?: number;
  macdFast?: number;
  macdSlow?: number;
  bollBandPeriod?: number;
}) {
  const closePrices = data.map(d => d.close);
  
  return {
    rsi: calculateRSI(closePrices, params.rsiPeriod || 14),
    macd: calculateMACD(closePrices, params.macdFast || 12, params.macdSlow || 26),
    bollBands: calculateBollingerBands(closePrices, params.bollBandPeriod || 20),
    sma20: calculateSMA(closePrices, 20),
    ema20: calculateEMA(closePrices, 20)
  };
}

/**
 * Calculate Relative Strength Index (RSI)
 */
function calculateRSI(prices: number[], period: number): number[] {
  const rsi: number[] = [];
  
  if (prices.length < period + 1) {
    return rsi;
  }

  let gains = 0;
  let losses = 0;

  // Calculate initial average gain and loss
  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) {
      gains += change;
    } else {
      losses -= change;
    }
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? -change : 0;

    avgGain = ((avgGain * (period - 1)) + gain) / period;
    avgLoss = ((avgLoss * (period - 1)) + loss) / period;

    const rs = avgGain / (avgLoss || 1);
    const rsiValue = 100 - (100 / (1 + rs));
    
    rsi.push(rsiValue);
  }

  return rsi;
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 */
function calculateMACD(prices: number[], fastPeriod: number, slowPeriod: number) {
  const emaFast = calculateEMA(prices, fastPeriod);
  const emaSlow = calculateEMA(prices, slowPeriod);
  
  const macdLine: number[] = [];
  const startIndex = Math.max(emaFast.length, emaSlow.length) - Math.min(emaFast.length, emaSlow.length);
  
  for (let i = startIndex; i < Math.min(emaFast.length, emaSlow.length); i++) {
    macdLine.push(emaFast[i] - emaSlow[i]);
  }

  const signalLine = calculateEMA(macdLine, 9);
  const histogram: number[] = [];
  
  for (let i = 0; i < Math.min(macdLine.length, signalLine.length); i++) {
    histogram.push(macdLine[i] - signalLine[i]);
  }

  return {
    macd: macdLine,
    signal: signalLine,
    histogram: histogram
  };
}

/**
 * Calculate Bollinger Bands
 */
function calculateBollingerBands(prices: number[], period: number, stdDev: number = 2) {
  const sma = calculateSMA(prices, period);
  const upperBand: number[] = [];
  const lowerBand: number[] = [];

  for (let i = period - 1; i < prices.length; i++) {
    const slice = prices.slice(i - period + 1, i + 1);
    const mean = slice.reduce((a, b) => a + b) / slice.length;
    const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / slice.length;
    const standardDeviation = Math.sqrt(variance);

    upperBand.push(sma[i - period + 1] + (stdDev * standardDeviation));
    lowerBand.push(sma[i - period + 1] - (stdDev * standardDeviation));
  }

  return {
    upper: upperBand,
    middle: sma,
    lower: lowerBand
  };
}

/**
 * Calculate Simple Moving Average (SMA)
 */
function calculateSMA(prices: number[], period: number): number[] {
  const sma: number[] = [];
  
  for (let i = period - 1; i < prices.length; i++) {
    const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b);
    sma.push(sum / period);
  }
  
  return sma;
}

/**
 * Calculate Exponential Moving Average (EMA)
 */
function calculateEMA(prices: number[], period: number): number[] {
  const ema: number[] = [];
  const multiplier = 2 / (period + 1);
  
  if (prices.length === 0) return ema;
  
  ema[0] = prices[0];
  
  for (let i = 1; i < prices.length; i++) {
    ema[i] = (prices[i] * multiplier) + (ema[i - 1] * (1 - multiplier));
  }
  
  return ema;
}

/**
 * Detect and remove outliers from forex data using IQR method
 */
export function detectAndCleanOutliers(data: ForexDataPoint[]): {
  cleaned: ForexDataPoint[];
  outliers: ForexDataPoint[];
  stats: { removed: number; total: number; percentage: number };
} {
  if (data.length < 4) {
    return {
      cleaned: data,
      outliers: [],
      stats: { removed: 0, total: data.length, percentage: 0 }
    };
  }

  const prices = data.map(d => d.close);
  
  // Calculate quartiles
  const sorted = [...prices].sort((a, b) => a - b);
  const q1Index = Math.floor(sorted.length * 0.25);
  const q3Index = Math.floor(sorted.length * 0.75);
  const q1 = sorted[q1Index];
  const q3 = sorted[q3Index];
  const iqr = q3 - q1;
  
  // Define outlier boundaries
  const lowerBound = q1 - (1.5 * iqr);
  const upperBound = q3 + (1.5 * iqr);
  
  // Separate outliers from clean data
  const cleaned: ForexDataPoint[] = [];
  const outliers: ForexDataPoint[] = [];
  
  data.forEach(point => {
    if (point.close >= lowerBound && point.close <= upperBound &&
        point.high >= lowerBound && point.high <= upperBound &&
        point.low >= lowerBound && point.low <= upperBound &&
        point.open >= lowerBound && point.open <= upperBound) {
      cleaned.push(point);
    } else {
      outliers.push(point);
    }
  });
  
  return {
    cleaned,
    outliers,
    stats: {
      removed: outliers.length,
      total: data.length,
      percentage: (outliers.length / data.length) * 100
    }
  };
}

/**
 * Calculate volatility metrics for forex data
 */
export function calculateVolatilityMetrics(data: ForexDataPoint[]): {
  dailyVolatility: number;
  realizedVolatility: number;
  garchVolatility: number;
  averageTrueRange: number;
} {
  if (data.length < 2) {
    return { dailyVolatility: 0, realizedVolatility: 0, garchVolatility: 0, averageTrueRange: 0 };
  }

  // Calculate returns
  const returns = [];
  for (let i = 1; i < data.length; i++) {
    returns.push(Math.log(data[i].close / data[i - 1].close));
  }

  // Daily volatility (standard deviation of returns)
  const meanReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
  const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - meanReturn, 2), 0) / returns.length;
  const dailyVolatility = Math.sqrt(variance);

  // Realized volatility (sum of squared returns)
  const realizedVolatility = Math.sqrt(returns.reduce((sum, ret) => sum + ret * ret, 0));

  // Simplified GARCH(1,1) volatility estimate
  let garchVol = dailyVolatility;
  const alpha = 0.1, beta = 0.85, omega = 0.00001;
  for (let i = 1; i < returns.length; i++) {
    garchVol = Math.sqrt(omega + alpha * returns[i - 1] * returns[i - 1] + beta * garchVol * garchVol);
  }

  // Average True Range (ATR)
  let atrSum = 0;
  for (let i = 1; i < data.length; i++) {
    const highLow = data[i].high - data[i].low;
    const highClosePrev = Math.abs(data[i].high - data[i - 1].close);
    const lowClosePrev = Math.abs(data[i].low - data[i - 1].close);
    const trueRange = Math.max(highLow, highClosePrev, lowClosePrev);
    atrSum += trueRange;
  }
  const averageTrueRange = atrSum / (data.length - 1);

  return {
    dailyVolatility,
    realizedVolatility,
    garchVolatility: garchVol,
    averageTrueRange
  };
}