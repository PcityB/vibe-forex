"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { KaggleJobResults } from "@/lib/types";

interface ResultsAnalyzerProps {
  results: KaggleJobResults | null;
  onViewModeChange: (mode: 'overview' | 'detailed' | 'comparison') => void;
  viewMode: 'overview' | 'detailed' | 'comparison';
}

export function ResultsAnalyzer({ results, onViewModeChange, viewMode }: ResultsAnalyzerProps) {
  if (!results) {
    return (
      <Card className="bg-black/20 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Results Analysis</CardTitle>
          <CardDescription className="text-gray-400">
            No analysis results available
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-700 flex items-center justify-center">
              <div className="text-gray-500 text-2xl">📊</div>
            </div>
            <p className="text-gray-400 mb-4">No results to analyze</p>
            <p className="text-sm text-gray-500">
              Complete a pattern mining job to see analysis results here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { patterns, statistics, metadata } = results;

  const getPatternTypeColor = (type: string) => {
    switch (type) {
      case 'bullish': return 'bg-green-500/20 text-green-400 border-green-500/20';
      case 'bearish': return 'bg-red-500/20 text-red-400 border-red-500/20';
      case 'neutral': return 'bg-purple-500/20 text-purple-400 border-purple-500/20';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/20';
    }
  };

  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;
  const formatNumber = (value: number) => value.toFixed(3);

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <Card className="bg-black/20 border-purple-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-2xl">Pattern Mining Results</CardTitle>
              <CardDescription className="text-purple-300">
                Job ID: {results.jobId} • {patterns.length} patterns discovered
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              {['overview', 'detailed', 'comparison'].map((mode) => (
                <Button
                  key={mode}
                  variant={viewMode === mode ? "default" : "outline"}
                  size="sm"
                  onClick={() => onViewModeChange(mode as 'overview' | 'detailed' | 'comparison')}
                  className={viewMode === mode 
                    ? "bg-purple-600 hover:bg-purple-700" 
                    : "border-purple-500 text-purple-300 hover:bg-purple-500/10"
                  }
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{patterns.length}</div>
              <div className="text-sm text-gray-400">Total Patterns</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {formatPercentage(statistics.avgConfidence)}
              </div>
              <div className="text-sm text-gray-400">Avg Confidence</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {formatPercentage(statistics.avgSupport)}
              </div>
              <div className="text-sm text-gray-400">Avg Support</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {formatPercentage(statistics.overallProfitability || 0)}
              </div>
              <div className="text-sm text-gray-400">Profitability</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Content */}
      <Tabs value={viewMode} onValueChange={(value: string) => onViewModeChange(value as 'overview' | 'detailed' | 'comparison')} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-black/20">
          <TabsTrigger value="overview" className="text-white">Overview</TabsTrigger>
          <TabsTrigger value="detailed" className="text-white">Detailed Analysis</TabsTrigger>
          <TabsTrigger value="comparison" className="text-white">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Statistical Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-black/20 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Statistical Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Patterns Found</span>
                    <span className="text-white font-semibold">{statistics.totalPatterns}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Unique Pattern Types</span>
                    <span className="text-white font-semibold">{statistics.uniquePatterns}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Cross-Validation Score</span>
                    <span className="text-purple-400 font-semibold">
                      {formatPercentage(statistics.crossValidationScore)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Bootstrap Confidence</span>
                    <span className="text-blue-400 font-semibold">
                      {formatPercentage(statistics.bootstrapConfidence)}
                    </span>
                  </div>
                </div>
                
                <Separator className="bg-gray-700" />
                
                <div>
                  <div className="text-sm text-gray-400 mb-2">Analysis Metadata</div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Data Points Analyzed</span>
                      <span className="text-gray-300">{metadata.dataPointsAnalyzed.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Execution Time</span>
                      <span className="text-gray-300">{metadata.executionTime}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Algorithm Version</span>
                      <span className="text-gray-300">{metadata.algorithmVersion}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/20 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Pattern Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(statistics.patternFrequency || {}).map(([type, count]) => {
                    const percentage = (Number(count) / statistics.totalPatterns) * 100;
                    return (
                      <div key={type} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Badge className={getPatternTypeColor(type)}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </Badge>
                          <span className="text-white text-sm">
                            {count} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2 bg-gray-700" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Best Patterns Preview */}
          <Card className="bg-black/20 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">Top Performing Patterns</CardTitle>
              <CardDescription className="text-gray-400">
                Highest confidence patterns from the analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {patterns
                  .sort((a, b) => b.confidence - a.confidence)
                  .slice(0, 5)
                  .map((pattern) => (
                    <div key={pattern.id} className="flex items-center justify-between p-3 rounded border border-gray-700 hover:border-gray-600 transition-colors">
                      <div className="flex items-center space-x-3">
                        <Badge className={getPatternTypeColor(pattern.type)}>
                          {pattern.type}
                        </Badge>
                        <div>
                          <div className="text-white font-mono text-sm">{pattern.id}</div>
                          <div className="text-xs text-gray-400">
                            Support: {formatPercentage(pattern.support)} • 
                            Significance: {formatNumber(pattern.significance)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-purple-400 font-semibold">
                          {formatPercentage(pattern.confidence)}
                        </div>
                        <div className="text-xs text-gray-400">confidence</div>
                      </div>
                    </div>
                  ))
                }
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-6">
          {/* All Patterns Table */}
          <Card className="bg-black/20 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">Detailed Pattern Analysis</CardTitle>
              <CardDescription className="text-gray-400">
                Complete list of discovered patterns with metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {patterns.map((pattern) => (
                    <div key={pattern.id} className="grid grid-cols-6 gap-4 p-3 rounded border border-gray-700 hover:border-gray-600 transition-colors text-sm">
                      <div className="space-y-1">
                        <Badge className={`${getPatternTypeColor(pattern.type)} text-xs`}>
                          {pattern.type}
                        </Badge>
                        <div className="text-white font-mono text-xs">{pattern.id}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-purple-400 font-semibold">{formatPercentage(pattern.confidence)}</div>
                        <div className="text-xs text-gray-400">Confidence</div>
                      </div>
                      <div className="text-center">
                        <div className="text-blue-400 font-semibold">{formatPercentage(pattern.support)}</div>
                        <div className="text-xs text-gray-400">Support</div>
                      </div>
                      <div className="text-center">
                        <div className="text-yellow-400 font-semibold">{formatNumber(pattern.significance)}</div>
                        <div className="text-xs text-gray-400">Significance</div>
                      </div>
                      <div className="text-center">
                        <div className="text-green-400 font-semibold">
                          {pattern.profitability ? formatPercentage(pattern.profitability) : '—'}
                        </div>
                        <div className="text-xs text-gray-400">Profitability</div>
                      </div>
                      <div className="text-center">
                        <div className="text-pink-400 font-semibold">
                          {pattern.occurrences?.length || 0}
                        </div>
                        <div className="text-xs text-gray-400">Occurrences</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-black/20 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">In-Sample Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Overall Profitability</span>
                    <span className="text-green-400 font-semibold">
                      {formatPercentage(statistics.overallProfitability || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Average Win Rate</span>
                    <span className="text-blue-400 font-semibold">
                      {formatPercentage(statistics.avgWinRate || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Average Sharpe Ratio</span>
                    <span className="text-purple-400 font-semibold">
                      {formatNumber(statistics.avgSharpeRatio || 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/20 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Out-of-Sample Estimates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="bg-yellow-500/10 border-yellow-500/20">
                  <AlertDescription className="text-yellow-200 text-xs">
                    Estimated performance based on statistical models
                  </AlertDescription>
                </Alert>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Est. Win Rate</span>
                    <span className="text-blue-400 font-semibold">
                      {formatPercentage(statistics.outOfSampleResults?.winRate || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Est. Avg Return</span>
                    <span className="text-green-400 font-semibold">
                      {formatPercentage(statistics.outOfSampleResults?.avgReturn || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Est. Sharpe Ratio</span>
                    <span className="text-purple-400 font-semibold">
                      {formatNumber(statistics.outOfSampleResults?.sharpeRatio || 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Best and Worst Patterns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-black/20 border-green-500/20">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center">
                  <span className="text-green-400 mr-2">🏆</span>
                  Best Performing Pattern
                </CardTitle>
              </CardHeader>
              <CardContent>
                {statistics.bestPattern && patterns.find(p => p.id === statistics.bestPattern) && (
                  <div className="space-y-3">
                    {(() => {
                      const bestPattern = patterns.find(p => p.id === statistics.bestPattern);
                      return bestPattern ? (
                        <>
                          <div className="flex items-center space-x-2">
                            <Badge className={getPatternTypeColor(bestPattern.type)}>
                              {bestPattern.type}
                            </Badge>
                            <span className="text-white font-mono text-sm">{bestPattern.id}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-400">Confidence:</span>
                              <span className="text-purple-400 ml-2">{formatPercentage(bestPattern.confidence)}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Support:</span>
                              <span className="text-blue-400 ml-2">{formatPercentage(bestPattern.support)}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Profitability:</span>
                              <span className="text-green-400 ml-2">{formatPercentage(bestPattern.profitability || 0)}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Significance:</span>
                              <span className="text-yellow-400 ml-2">{formatNumber(bestPattern.significance)}</span>
                            </div>
                          </div>
                        </>
                      ) : null;
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-black/20 border-red-500/20">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center">
                  <span className="text-red-400 mr-2">⚠️</span>
                  Lowest Performing Pattern
                </CardTitle>
              </CardHeader>
              <CardContent>
                {statistics.worstPattern && patterns.find(p => p.id === statistics.worstPattern) && (
                  <div className="space-y-3">
                    {(() => {
                      const worstPattern = patterns.find(p => p.id === statistics.worstPattern);
                      return worstPattern ? (
                        <>
                          <div className="flex items-center space-x-2">
                            <Badge className={getPatternTypeColor(worstPattern.type)}>
                              {worstPattern.type}
                            </Badge>
                            <span className="text-white font-mono text-sm">{worstPattern.id}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-400">Confidence:</span>
                              <span className="text-purple-400 ml-2">{formatPercentage(worstPattern.confidence)}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Support:</span>
                              <span className="text-blue-400 ml-2">{formatPercentage(worstPattern.support)}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Profitability:</span>
                              <span className="text-red-400 ml-2">{formatPercentage(worstPattern.profitability || 0)}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Significance:</span>
                              <span className="text-yellow-400 ml-2">{formatNumber(worstPattern.significance)}</span>
                            </div>
                          </div>
                        </>
                      ) : null;
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}