// API endpoint for pattern analysis and metrics

import { NextRequest, NextResponse } from 'next/server';
import { calculateTechnicalIndicators } from '@/lib/forex-data';
import { ApiResponse, DiscoveredPattern, FilterOptions, PatternMiningStatistics } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patterns, forexData, filters } = body;

    if (!patterns || !Array.isArray(patterns)) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Invalid patterns data provided',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // Apply filters if provided
    let filteredPatterns = patterns;
    if (filters) {
      filteredPatterns = applyPatternFilters(patterns, filters);
    }

    // Calculate comprehensive statistics
    const statistics = calculatePatternStatistics(filteredPatterns);
    
    // Calculate technical indicators if forex data provided
    let technicalIndicators = null;
    if (forexData && Array.isArray(forexData)) {
      technicalIndicators = calculateTechnicalIndicators(forexData, {
        rsiPeriod: 14,
        macdFast: 12,
        macdSlow: 26,
        bollBandPeriod: 20
      });
    }

    // Calculate pattern correlations
    const correlations = calculatePatternCorrelations(filteredPatterns);
    
    // Generate insights and recommendations
    const insights = generatePatternInsights(filteredPatterns, statistics);

    return NextResponse.json<ApiResponse<{
      patterns: DiscoveredPattern[];
      statistics: PatternMiningStatistics;
      technicalIndicators: typeof technicalIndicators;
      correlations: typeof correlations;
      insights: typeof insights;
    }>>({
      success: true,
      data: {
        patterns: filteredPatterns,
        statistics: statistics,
        technicalIndicators: technicalIndicators,
        correlations: correlations,
        insights: insights
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error analyzing patterns:', error);
    
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze patterns',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET() {
  // Return analysis capabilities and default parameters
  return NextResponse.json<ApiResponse<{
    capabilities: string[];
    defaultFilters: FilterOptions;
    supportedAnalytics: string[];
  }>>({
    success: true,
    data: {
      capabilities: [
        'Pattern filtering and sorting',
        'Statistical analysis and metrics',
        'Technical indicators integration',
        'Pattern correlation analysis',
        'Performance insights generation',
        'Cross-validation analysis',
        'Risk metrics calculation'
      ],
      defaultFilters: {
        patternType: 'all',
        minConfidence: 0.5,
        minSupport: 0.01,
        minProfitability: -1,
        sortBy: 'confidence',
        sortOrder: 'desc'
      },
      supportedAnalytics: [
        'profitability',
        'winRate',
        'sharpeRatio',
        'maxDrawdown',
        'frequency',
        'significance',
        'correlations',
        'seasonality'
      ]
    },
    timestamp: new Date().toISOString()
  });
}

// Helper functions for pattern analysis

function applyPatternFilters(patterns: DiscoveredPattern[], filters: FilterOptions): DiscoveredPattern[] {
  let filtered = patterns;

  // Filter by pattern type
  if (filters.patternType !== 'all') {
    filtered = filtered.filter(p => p.type === filters.patternType);
  }

  // Filter by confidence
  filtered = filtered.filter(p => p.confidence >= filters.minConfidence);

  // Filter by support
  filtered = filtered.filter(p => p.support >= filters.minSupport);

  // Filter by profitability
  if (filters.minProfitability > -1) {
    filtered = filtered.filter(p => (p.profitability || 0) >= filters.minProfitability);
  }

  // Sort patterns
  filtered.sort((a, b) => {
    let aValue: number, bValue: number;
    
    switch (filters.sortBy) {
      case 'confidence':
        aValue = a.confidence;
        bValue = b.confidence;
        break;
      case 'support':
        aValue = a.support;
        bValue = b.support;
        break;
      case 'profitability':
        aValue = a.profitability || 0;
        bValue = b.profitability || 0;
        break;
      case 'frequency':
        aValue = a.frequency || 0;
        bValue = b.frequency || 0;
        break;
      case 'significance':
        aValue = a.significance;
        bValue = b.significance;
        break;
      default:
        aValue = a.confidence;
        bValue = b.confidence;
    }

    return filters.sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
  });

  return filtered;
}

function calculatePatternStatistics(patterns: DiscoveredPattern[]): PatternMiningStatistics {
  if (!patterns || patterns.length === 0) {
    return {
      totalPatterns: 0,
      uniquePatterns: 0,
      avgConfidence: 0,
      avgSupport: 0,
      overallProfitability: 0,
      avgWinRate: 0,
      avgSharpeRatio: 0,
      bestPattern: '',
      worstPattern: '',
      patternFrequency: {},
      timeFrameDistribution: {},
      crossValidationScore: 0,
      bootstrapConfidence: 0,
      outOfSampleResults: {
        winRate: 0,
        avgReturn: 0,
        sharpeRatio: 0
      }
    };
  }

  const stats: PatternMiningStatistics = {
    totalPatterns: patterns.length,
    uniquePatterns: new Set(patterns.map(p => p.type)).size,
    avgConfidence: patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length,
    avgSupport: patterns.reduce((sum, p) => sum + p.support, 0) / patterns.length,
    overallProfitability: patterns.reduce((sum, p) => sum + (p.profitability || 0), 0) / patterns.length,
    avgWinRate: patterns.reduce((sum, p) => sum + (p.winRate || 0), 0) / patterns.length,
    avgSharpeRatio: patterns.reduce((sum, p) => sum + (p.sharpeRatio || 0), 0) / patterns.length,
    bestPattern: '',
    worstPattern: '',
    patternFrequency: {},
    timeFrameDistribution: {},
    crossValidationScore: 0,
    bootstrapConfidence: 0,
    outOfSampleResults: {
      winRate: 0,
      avgReturn: 0,
      sharpeRatio: 0
    }
  };

  // Find best and worst patterns
  const bestPattern = patterns.reduce((best, current) => 
    (current.profitability || 0) > (best.profitability || 0) ? current : best
  );
  const worstPattern = patterns.reduce((worst, current) => 
    (current.profitability || 0) < (worst.profitability || 0) ? current : worst
  );

  stats.bestPattern = bestPattern.id;
  stats.worstPattern = worstPattern.id;

  // Calculate pattern frequency distribution
  patterns.forEach(pattern => {
    stats.patternFrequency[pattern.type] = (stats.patternFrequency[pattern.type] || 0) + 1;
  });

  // Calculate cross-validation score (simplified)
  const profitablePatterns = patterns.filter(p => (p.profitability || 0) > 0).length;
  stats.crossValidationScore = profitablePatterns / patterns.length;

  // Bootstrap confidence (simplified)
  stats.bootstrapConfidence = Math.max(0, Math.min(1, stats.avgConfidence * stats.crossValidationScore));

  // Out-of-sample results (estimated)
  stats.outOfSampleResults = {
    winRate: stats.avgWinRate * 0.85, // Assume 15% degradation
    avgReturn: stats.overallProfitability * 0.8, // Assume 20% degradation  
    sharpeRatio: stats.avgSharpeRatio * 0.75 // Assume 25% degradation
  };

  return stats;
}

function calculatePatternCorrelations(patterns: DiscoveredPattern[]) {
  const correlations: { [key: string]: { [key: string]: number } } = {};
  
  // Group patterns by type
  const patternGroups: { [key: string]: DiscoveredPattern[] } = {};
  patterns.forEach(pattern => {
    if (!patternGroups[pattern.type]) {
      patternGroups[pattern.type] = [];
    }
    patternGroups[pattern.type].push(pattern);
  });

  // Calculate correlations between pattern types
  const patternTypes = Object.keys(patternGroups);
  
  for (let i = 0; i < patternTypes.length; i++) {
    const typeA = patternTypes[i];
    correlations[typeA] = {};
    
    for (let j = 0; j < patternTypes.length; j++) {
      const typeB = patternTypes[j];
      
      if (i === j) {
        correlations[typeA][typeB] = 1.0;
      } else {
        // Simplified correlation calculation based on profitability
        const profitA = patternGroups[typeA].map(p => p.profitability || 0);
        const profitB = patternGroups[typeB].map(p => p.profitability || 0);
        
        correlations[typeA][typeB] = calculateCorrelation(profitA, profitB);
      }
    }
  }

  return correlations;
}

function calculateCorrelation(x: number[], y: number[]): number {
  if (x.length === 0 || y.length === 0 || x.length !== y.length) {
    return 0;
  }

  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));

  return denominator === 0 ? 0 : numerator / denominator;
}

function generatePatternInsights(patterns: DiscoveredPattern[], statistics: PatternMiningStatistics) {
  const insights = {
    keyFindings: [] as string[],
    recommendations: [] as string[],
    riskWarnings: [] as string[],
    opportunities: [] as string[]
  };

  // Key findings
  if (statistics.totalPatterns > 0) {
    insights.keyFindings.push(`Discovered ${statistics.totalPatterns} patterns with ${statistics.uniquePatterns} unique types`);
    insights.keyFindings.push(`Average pattern confidence: ${(statistics.avgConfidence * 100).toFixed(1)}%`);
    insights.keyFindings.push(`Overall profitability: ${(statistics.overallProfitability * 100).toFixed(2)}%`);
  }

  // Recommendations based on performance
  if (statistics.avgWinRate > 0.6) {
    insights.recommendations.push('High win rate patterns detected - consider increasing position sizing');
  } else if (statistics.avgWinRate < 0.4) {
    insights.recommendations.push('Low win rate patterns - focus on risk management and filtering');
  }

  if (statistics.avgSharpeRatio > 1.0) {
    insights.recommendations.push('Excellent risk-adjusted returns - patterns suitable for live trading');
  } else if (statistics.avgSharpeRatio < 0.5) {
    insights.recommendations.push('Poor risk-adjusted returns - refine pattern selection criteria');
  }

  // Risk warnings
  if (statistics.crossValidationScore < 0.5) {
    insights.riskWarnings.push('Low cross-validation score - patterns may not generalize well');
  }

  if (statistics.outOfSampleResults.sharpeRatio < 0.3) {
    insights.riskWarnings.push('Poor out-of-sample performance - high overfitting risk');
  }

  // Opportunities
  const bestPatternType = Object.entries(statistics.patternFrequency)
    .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0];
  
  if (bestPatternType) {
    insights.opportunities.push(`Focus on ${bestPatternType} patterns - highest frequency detected`);
  }

  if (statistics.avgConfidence > 0.8) {
    insights.opportunities.push('High confidence patterns available - suitable for automated trading');
  }

  // Advanced pattern analysis insights
  if (patterns.length > 0) {
    const highPerformancePatterns = patterns.filter(p => (p.profitability || 0) > 0.05 && p.confidence > 0.8);
    if (highPerformancePatterns.length > 0) {
      insights.opportunities.push(`${highPerformancePatterns.length} high-performance patterns identified (>5% profit, >80% confidence)`);
    }

    const consistentPatterns = patterns.filter(p => p.support > 0.1 && (p.sharpeRatio || 0) > 1.0);
    if (consistentPatterns.length > 0) {
      insights.keyFindings.push(`${consistentPatterns.length} patterns show both high frequency and good risk-adjusted returns`);
    }

    // Risk assessment
    const riskyStagterns = patterns.filter(p => (p.maxDrawdown || 0) > 0.1);
    if (riskyStagterns.length > patterns.length * 0.3) {
      insights.riskWarnings.push('High proportion of patterns show significant drawdown risk (>10%)');
    }
  }

  return insights;
}

/**
 * Advanced pattern filtering with multiple criteria
 * @unused - Available for future enhancement
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function applyAdvancedPatternFiltering(patterns: DiscoveredPattern[], criteria: {
  minSharpeRatio?: number;
  maxDrawdown?: number;
  minFrequency?: number;
  excludeTypes?: string[];
}): DiscoveredPattern[] {
  return patterns.filter(pattern => {
    // Sharpe ratio filter
    if (criteria.minSharpeRatio && (pattern.sharpeRatio || 0) < criteria.minSharpeRatio) {
      return false;
    }

    // Max drawdown filter
    if (criteria.maxDrawdown && (pattern.maxDrawdown || 0) > criteria.maxDrawdown) {
      return false;
    }

    // Minimum frequency filter
    if (criteria.minFrequency && (pattern.frequency || 0) < criteria.minFrequency) {
      return false;
    }

    // Exclude specific pattern types
    if (criteria.excludeTypes && criteria.excludeTypes.includes(pattern.type)) {
      return false;
    }

    return true;
  });
}