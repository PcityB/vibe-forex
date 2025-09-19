// Core ML and Forex Trading Types for Pattern Mining Dashboard

export interface ForexDataPoint {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface CurrencyPair {
  base: string;
  quote: string;
  symbol: string; // e.g., "EURUSD"
}

export interface TimeFrame {
  value: string; // "1m", "5m", "15m", "1h", "4h", "1d"
  label: string;
  minutes: number;
}

// Pattern Mining Algorithm Parameters (Based on Research Paper)
export interface PatternMiningParams {
  // Core Parameters
  currencyPair: CurrencyPair;
  timeFrame: TimeFrame;
  windowSize: number; // Pattern window size in bars
  minSupport: number; // Minimum support threshold (0-1)
  minConfidence: number; // Minimum confidence threshold (0-1)
  
  // Advanced Parameters
  dataPoints: number; // Number of historical data points
  overlapThreshold: number; // Pattern overlap threshold
  noiseFilter: number; // Noise filtering level
  
  // Statistical Parameters
  significanceLevel: number; // Statistical significance (0.05, 0.01, etc.)
  bootstrapSamples: number; // Bootstrap validation samples
  crossValidationFolds: number; // K-fold cross validation
  
  // Technical Indicators
  includeTechnicalIndicators: boolean;
  rsiPeriod: number;
  macdFast: number;
  macdSlow: number;
  bollBandPeriod: number;
}

// Discovered Pattern Structure
export interface DiscoveredPattern {
  id: string;
  type: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  support: number; // Frequency of occurrence
  significance: number; // Statistical significance
  
  // Pattern Shape Data
  pricePoints: number[]; // Normalized price points
  volume?: number[]; // Volume data if available
  duration: number; // Pattern duration in bars
  
  // Pattern Metrics
  profitability: number; // Historical profitability
  winRate: number; // Win rate percentage
  avgReturn: number; // Average return
  maxDrawdown: number;
  sharpeRatio: number;
  
  // Occurrence Data
  occurrences: PatternOccurrence[];
  firstSeen: string;
  lastSeen: string;
  frequency: number; // Occurrences per time period
}

export interface PatternOccurrence {
  timestamp: string;
  startIndex: number;
  endIndex: number;
  priceData: ForexDataPoint[];
  outcome: 'profit' | 'loss' | 'breakeven';
  returnPercentage: number;
  confidence: number;
}

// Kaggle Job Management
export interface KaggleJobConfig {
  notebookPath: string;
  parameters: PatternMiningParams;
  dataset?: string;
  kernel?: string;
  environment?: 'python' | 'r';
}

export interface KaggleJobStatus {
  id: string;
  status: 'submitted' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number; // 0-100
  message: string;
  startTime: string;
  endTime?: string;
  executionTime?: number; // seconds
  logUrl?: string;
  outputUrl?: string;
}

export interface KaggleJobResults {
  jobId: string;
  patterns: DiscoveredPattern[];
  statistics: PatternMiningStatistics;
  metadata: {
    dataPointsAnalyzed: number;
    patternsFound: number;
    executionTime: number;
    algorithmVersion: string;
  };
}

// Statistical Analysis Results
export interface PatternMiningStatistics {
  totalPatterns: number;
  uniquePatterns: number;
  avgConfidence: number;
  avgSupport: number;
  
  // Performance Metrics
  overallProfitability: number;
  avgWinRate: number;
  avgSharpeRatio: number;
  bestPattern: string;
  worstPattern: string;
  
  // Frequency Distribution
  patternFrequency: { [key: string]: number };
  timeFrameDistribution: { [key: string]: number };
  
  // Validation Results
  crossValidationScore: number;
  bootstrapConfidence: number;
  outOfSampleResults: {
    winRate: number;
    avgReturn: number;
    sharpeRatio: number;
  };
}

// Dashboard State Management
export interface DashboardState {
  currentParams: PatternMiningParams;
  activeJob: KaggleJobStatus | null;
  jobHistory: KaggleJobStatus[];
  results: KaggleJobResults | null;
  selectedPatterns: string[];
  viewMode: 'overview' | 'detailed' | 'comparison';
  
  // UI State
  isLoading: boolean;
  error: string | null;
  lastUpdate: string;
}

// Chart and Visualization Types
export interface ChartData {
  priceData: ForexDataPoint[];
  patterns: DiscoveredPattern[];
  timeRange: {
    start: string;
    end: string;
  };
}

export interface PatternVisualization {
  patternId: string;
  coordinates: {
    x: number[];
    y: number[];
  };
  color: string;
  opacity: number;
  highlighted: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

// Forex Data Provider Types
export interface ForexDataProvider {
  name: string;
  apiKey?: string;
  rateLimit: number;
  supportedPairs: CurrencyPair[];
  supportedTimeframes: TimeFrame[];
}

// Configuration Types
export interface AppConfig {
  kaggleApi: {
    username: string;
    key: string;
  };
  forexProviders: ForexDataProvider[];
  defaultParams: PatternMiningParams;
  chartSettings: {
    theme: 'light' | 'dark';
    colors: string[];
    animations: boolean;
  };
}

// Utility Types
export type PatternType = 'all' | 'bullish' | 'bearish' | 'neutral';
export type SortOrder = 'asc' | 'desc';
export type SortField = 'confidence' | 'support' | 'profitability' | 'frequency' | 'significance';

export interface FilterOptions {
  patternType: PatternType;
  minConfidence: number;
  minSupport: number;
  minProfitability: number;
  sortBy: SortField;
  sortOrder: SortOrder;
}

// Default Values and Constants
export const DEFAULT_CURRENCY_PAIRS: CurrencyPair[] = [
  { base: 'EUR', quote: 'USD', symbol: 'EURUSD' },
  { base: 'GBP', quote: 'USD', symbol: 'GBPUSD' },
  { base: 'USD', quote: 'JPY', symbol: 'USDJPY' },
  { base: 'USD', quote: 'CHF', symbol: 'USDCHF' },
  { base: 'AUD', quote: 'USD', symbol: 'AUDUSD' },
  { base: 'USD', quote: 'CAD', symbol: 'USDCAD' },
];

export const DEFAULT_TIMEFRAMES: TimeFrame[] = [
  { value: '1m', label: '1 Minute', minutes: 1 },
  { value: '5m', label: '5 Minutes', minutes: 5 },
  { value: '15m', label: '15 Minutes', minutes: 15 },
  { value: '30m', label: '30 Minutes', minutes: 30 },
  { value: '1h', label: '1 Hour', minutes: 60 },
  { value: '4h', label: '4 Hours', minutes: 240 },
  { value: '1d', label: '1 Day', minutes: 1440 },
];

export const DEFAULT_MINING_PARAMS: PatternMiningParams = {
  currencyPair: DEFAULT_CURRENCY_PAIRS[0],
  timeFrame: DEFAULT_TIMEFRAMES[4], // 1 hour
  windowSize: 20,
  minSupport: 0.05,
  minConfidence: 0.7,
  dataPoints: 10000,
  overlapThreshold: 0.3,
  noiseFilter: 0.1,
  significanceLevel: 0.05,
  bootstrapSamples: 1000,
  crossValidationFolds: 5,
  includeTechnicalIndicators: true,
  rsiPeriod: 14,
  macdFast: 12,
  macdSlow: 26,
  bollBandPeriod: 20,
};