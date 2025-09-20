"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, Cell } from 'recharts';
import { DiscoveredPattern, CurrencyPair, TimeFrame } from "@/lib/types";

interface PatternVisualizerProps {
  patterns: DiscoveredPattern[];
  selectedPatterns: string[];
  onPatternSelect: (patternIds: string[]) => void;
  currencyPair: CurrencyPair;
  timeFrame: TimeFrame;
}

export function PatternVisualizer({ patterns, selectedPatterns, onPatternSelect, currencyPair, timeFrame }: PatternVisualizerProps) {
  const [viewMode, setViewMode] = useState<'patterns' | 'frequency' | 'performance'>('patterns');
  const [filterType, setFilterType] = useState<'all' | 'bullish' | 'bearish' | 'neutral'>('all');
  const [sortBy, setSortBy] = useState<'confidence' | 'support' | 'profitability'>('confidence');

  const filteredPatterns = useMemo(() => {
    let filtered = patterns;
    
    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(p => p.type === filterType);
    }

    // Sort patterns
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'confidence':
          return b.confidence - a.confidence;
        case 'support':
          return b.support - a.support;
        case 'profitability':
          return (b.profitability || 0) - (a.profitability || 0);
        default:
          return b.confidence - a.confidence;
      }
    });

    return filtered;
  }, [patterns, filterType, sortBy]);

  const handlePatternToggle = (patternId: string, checked: boolean) => {
    if (checked) {
      onPatternSelect([...selectedPatterns, patternId]);
    } else {
      onPatternSelect(selectedPatterns.filter(id => id !== patternId));
    }
  };

  const getPatternColor = (pattern: DiscoveredPattern): string => {
    switch (pattern.type) {
      case 'bullish': return '#10b981'; // green
      case 'bearish': return '#ef4444'; // red  
      case 'neutral': return '#8b5cf6'; // purple
      default: return '#6b7280'; // gray
    }
  };

  const formatPatternData = (pattern: DiscoveredPattern) => {
    return pattern.pricePoints?.map((price, index) => ({
      x: index,
      y: price,
      confidence: pattern.confidence
    })) || [];
  };

  const getFrequencyData = () => {
    const typeCount: Record<string, number> = {};
    patterns.forEach(pattern => {
      typeCount[pattern.type] = (typeCount[pattern.type] || 0) + 1;
    });

    return Object.entries(typeCount).map(([type, count]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      count,
      percentage: (count / patterns.length * 100).toFixed(1)
    }));
  };

  const getPerformanceData = () => {
    return patterns.map(pattern => ({
      id: pattern.id,
      confidence: pattern.confidence * 100,
      profitability: (pattern.profitability || 0) * 100,
      winRate: (pattern.winRate || 0) * 100,
      type: pattern.type
    }));
  };

  if (patterns.length === 0) {
    return (
      <Card className="bg-black/20 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Pattern Visualization</CardTitle>
          <CardDescription className="text-gray-400">
            No patterns available for visualization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-700 flex items-center justify-center">
              <div className="text-gray-500 text-2xl">📈</div>
            </div>
            <p className="text-gray-400 mb-4">No pattern data to display</p>
            <p className="text-sm text-gray-500">
              Complete a pattern mining job to see visualizations here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="bg-black/20 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Pattern Visualization - {currencyPair.symbol}</CardTitle>
          <CardDescription className="text-gray-400">
            {patterns.length} patterns found • {timeFrame.label} timeframe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <label className="text-white text-sm">View:</label>
              <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                <SelectTrigger className="w-32 bg-black/20 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-gray-600">
                  <SelectItem value="patterns" className="text-white hover:bg-gray-700">Patterns</SelectItem>
                  <SelectItem value="frequency" className="text-white hover:bg-gray-700">Frequency</SelectItem>
                  <SelectItem value="performance" className="text-white hover:bg-gray-700">Performance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-white text-sm">Filter:</label>
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger className="w-24 bg-black/20 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-gray-600">
                  <SelectItem value="all" className="text-white hover:bg-gray-700">All</SelectItem>
                  <SelectItem value="bullish" className="text-white hover:bg-gray-700">Bullish</SelectItem>
                  <SelectItem value="bearish" className="text-white hover:bg-gray-700">Bearish</SelectItem>
                  <SelectItem value="neutral" className="text-white hover:bg-gray-700">Neutral</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-white text-sm">Sort by:</label>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-32 bg-black/20 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-gray-600">
                  <SelectItem value="confidence" className="text-white hover:bg-gray-700">Confidence</SelectItem>
                  <SelectItem value="support" className="text-white hover:bg-gray-700">Support</SelectItem>
                  <SelectItem value="profitability" className="text-white hover:bg-gray-700">Profitability</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visualization Content */}
      {viewMode === 'patterns' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pattern List */}
          <Card className="bg-black/20 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">Pattern List</CardTitle>
              <CardDescription className="text-gray-400">
                {filteredPatterns.length} patterns • Select to visualize
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {filteredPatterns.slice(0, 20).map(pattern => (
                <div key={pattern.id} className="flex items-center space-x-3 p-2 rounded hover:bg-black/30 transition-colors">
                  <Checkbox
                    checked={selectedPatterns.includes(pattern.id)}
                    onCheckedChange={(checked) => handlePatternToggle(pattern.id, checked as boolean)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <Badge 
                        className="text-xs"
                        style={{ 
                          backgroundColor: `${getPatternColor(pattern)}20`,
                          color: getPatternColor(pattern),
                          border: `1px solid ${getPatternColor(pattern)}40`
                        }}
                      >
                        {pattern.type}
                      </Badge>
                      <span className="text-white text-sm font-mono truncate">
                        {pattern.id}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Confidence: {(pattern.confidence * 100).toFixed(1)}% • 
                      Support: {(pattern.support * 100).toFixed(1)}%
                      {pattern.profitability && (
                        <> • Profit: {(pattern.profitability * 100).toFixed(1)}%</>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredPatterns.length > 20 && (
                <div className="text-center py-2 text-sm text-gray-400">
                  Showing first 20 patterns
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pattern Chart */}
          <Card className="lg:col-span-2 bg-black/20 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">Pattern Shapes</CardTitle>
              <CardDescription className="text-gray-400">
                Normalized price movements for selected patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={selectedPatterns.length > 0 ? formatPatternData(patterns.find(p => p.id === selectedPatterns[0]) || patterns[0]) : []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="x"
                      stroke="#9ca3af" 
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                      label={{ value: 'Time Steps', position: 'insideBottom', offset: -10, style: { textAnchor: 'middle', fill: '#9ca3af' } }}
                    />
                    <YAxis 
                      stroke="#9ca3af" 
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                      label={{ value: 'Normalized Price', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#9ca3af' } }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151', 
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Legend />
                    {selectedPatterns.slice(0, 5).map(patternId => {
                      const pattern = patterns.find(p => p.id === patternId);
                      if (!pattern || !pattern.pricePoints) return null;
                      
                      return (
                        <Line
                          key={pattern.id}
                          type="monotone"
                          dataKey="y"
                          stroke={getPatternColor(pattern)}
                          strokeWidth={2}
                          dot={false}
                          name={`${pattern.type} (${(pattern.confidence * 100).toFixed(0)}%)`}
                        />
                      );
                    })}
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              {selectedPatterns.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  Select patterns from the list to visualize their shapes
                </div>
              )}
              
              {selectedPatterns.length > 5 && (
                <div className="mt-2 text-sm text-yellow-400">
                  Showing first 5 selected patterns for clarity
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {viewMode === 'frequency' && (
        <Card className="bg-black/20 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-lg">Pattern Frequency Distribution</CardTitle>
            <CardDescription className="text-gray-400">
              Distribution of pattern types found in the analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getFrequencyData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="type"
                    stroke="#9ca3af" 
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="#9ca3af" 
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    label={{ value: 'Count', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#9ca3af' } }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151', 
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {viewMode === 'performance' && (
        <Card className="bg-black/20 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-lg">Pattern Performance Analysis</CardTitle>
            <CardDescription className="text-gray-400">
              Confidence vs Profitability scatter plot
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart data={getPerformanceData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    type="number"
                    dataKey="confidence"
                    stroke="#9ca3af" 
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    label={{ value: 'Confidence (%)', position: 'insideBottom', offset: -10, style: { textAnchor: 'middle', fill: '#9ca3af' } }}
                  />
                  <YAxis 
                    type="number"
                    dataKey="profitability"
                    stroke="#9ca3af" 
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    label={{ value: 'Profitability (%)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#9ca3af' } }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151', 
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value: any, name: string) => [
                      `${Number(value).toFixed(1)}%`,
                      name.charAt(0).toUpperCase() + name.slice(1)
                    ]}
                  />
                  <Scatter dataKey="profitability">
                    {getPerformanceData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getPatternColor({ type: entry.type } as DiscoveredPattern)} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}