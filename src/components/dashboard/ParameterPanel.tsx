"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PatternMiningParams, DEFAULT_CURRENCY_PAIRS, DEFAULT_TIMEFRAMES } from "@/lib/types";

interface ParameterPanelProps {
  params: PatternMiningParams;
  onChange: (params: PatternMiningParams) => void;
  onSubmit: () => void;
  isLoading: boolean;
  disabled: boolean;
}

export function ParameterPanel({ params, onChange, onSubmit, isLoading, disabled }: ParameterPanelProps) {
  const updateParam = <K extends keyof PatternMiningParams>(key: K, value: PatternMiningParams[K]) => {
    onChange({ ...params, [key]: value });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Market Parameters */}
      <Card className="bg-black/10 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white text-lg">Market Parameters</CardTitle>
          <CardDescription className="text-gray-400">Configure market and data settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-white">Currency Pair</Label>
            <Select 
              value={params.currencyPair.symbol} 
              onValueChange={(value) => {
                const pair = DEFAULT_CURRENCY_PAIRS.find(p => p.symbol === value);
                if (pair) updateParam('currencyPair', pair);
              }}
            >
              <SelectTrigger className="bg-black/20 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black border-gray-600">
                {DEFAULT_CURRENCY_PAIRS.map(pair => (
                  <SelectItem key={pair.symbol} value={pair.symbol} className="text-white hover:bg-gray-700">
                    {pair.symbol} - {pair.base}/{pair.quote}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Time Frame</Label>
            <Select 
              value={params.timeFrame.value} 
              onValueChange={(value) => {
                const timeFrame = DEFAULT_TIMEFRAMES.find(tf => tf.value === value);
                if (timeFrame) updateParam('timeFrame', timeFrame);
              }}
            >
              <SelectTrigger className="bg-black/20 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black border-gray-600">
                {DEFAULT_TIMEFRAMES.map(tf => (
                  <SelectItem key={tf.value} value={tf.value} className="text-white hover:bg-gray-700">
                    {tf.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Data Points</Label>
            <Input
              type="number"
              value={params.dataPoints}
              onChange={(e) => updateParam('dataPoints', parseInt(e.target.value))}
              className="bg-black/20 border-gray-600 text-white"
              min={1000}
              max={50000}
              step={1000}
            />
            <p className="text-xs text-gray-400">Historical data points to analyze (1K - 50K)</p>
          </div>
        </CardContent>
      </Card>

      {/* Algorithm Parameters */}
      <Card className="bg-black/10 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white text-lg">Algorithm Parameters</CardTitle>
          <CardDescription className="text-gray-400">Core pattern mining settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-white">Pattern Window Size</Label>
            <div className="px-2">
              <Slider
                value={[params.windowSize]}
                onValueChange={([value]) => updateParam('windowSize', value)}
                max={100}
                min={5}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>5</span>
                <span className="text-purple-400">{params.windowSize}</span>
                <span>100</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Minimum Support</Label>
            <div className="px-2">
              <Slider
                value={[params.minSupport * 100]}
                onValueChange={([value]) => updateParam('minSupport', value / 100)}
                max={20}
                min={1}
                step={0.5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1%</span>
                <span className="text-purple-400">{(params.minSupport * 100).toFixed(1)}%</span>
                <span>20%</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Minimum Confidence</Label>
            <div className="px-2">
              <Slider
                value={[params.minConfidence * 100]}
                onValueChange={([value]) => updateParam('minConfidence', value / 100)}
                max={95}
                min={50}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>50%</span>
                <span className="text-purple-400">{(params.minConfidence * 100).toFixed(0)}%</span>
                <span>95%</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Noise Filter Level</Label>
            <div className="px-2">
              <Slider
                value={[params.noiseFilter * 100]}
                onValueChange={([value]) => updateParam('noiseFilter', value / 100)}
                max={50}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1%</span>
                <span className="text-purple-400">{(params.noiseFilter * 100).toFixed(0)}%</span>
                <span>50%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Parameters */}
      <Card className="bg-black/10 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white text-lg">Advanced Settings</CardTitle>
          <CardDescription className="text-gray-400">Statistical and validation parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-white">Include Technical Indicators</Label>
            <Switch
              checked={params.includeTechnicalIndicators}
              onCheckedChange={(checked) => updateParam('includeTechnicalIndicators', checked)}
            />
          </div>

          <Separator className="bg-gray-700" />

          <div className="space-y-2">
            <Label className="text-white">Statistical Significance Level</Label>
            <Select 
              value={params.significanceLevel.toString()} 
              onValueChange={(value) => updateParam('significanceLevel', parseFloat(value))}
            >
              <SelectTrigger className="bg-black/20 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black border-gray-600">
                <SelectItem value="0.01" className="text-white hover:bg-gray-700">0.01 (99% confidence)</SelectItem>
                <SelectItem value="0.05" className="text-white hover:bg-gray-700">0.05 (95% confidence)</SelectItem>
                <SelectItem value="0.10" className="text-white hover:bg-gray-700">0.10 (90% confidence)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Bootstrap Samples</Label>
            <Input
              type="number"
              value={params.bootstrapSamples}
              onChange={(e) => updateParam('bootstrapSamples', parseInt(e.target.value))}
              className="bg-black/20 border-gray-600 text-white"
              min={100}
              max={5000}
              step={100}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Cross-Validation Folds</Label>
            <Input
              type="number"
              value={params.crossValidationFolds}
              onChange={(e) => updateParam('crossValidationFolds', parseInt(e.target.value))}
              className="bg-black/20 border-gray-600 text-white"
              min={3}
              max={10}
            />
          </div>

          {params.includeTechnicalIndicators && (
            <>
              <Separator className="bg-gray-700" />
              <div className="text-sm text-gray-400">Technical Indicator Periods</div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-white text-xs">RSI Period</Label>
                  <Input
                    type="number"
                    value={params.rsiPeriod}
                    onChange={(e) => updateParam('rsiPeriod', parseInt(e.target.value))}
                    className="bg-black/20 border-gray-600 text-white text-xs"
                    min={5}
                    max={50}
                  />
                </div>
                
                <div className="space-y-1">
                  <Label className="text-white text-xs">Bollinger Bands</Label>
                  <Input
                    type="number"
                    value={params.bollBandPeriod}
                    onChange={(e) => updateParam('bollBandPeriod', parseInt(e.target.value))}
                    className="bg-black/20 border-gray-600 text-white text-xs"
                    min={10}
                    max={50}
                  />
                </div>
              </div>
            </>
          )}

          <div className="pt-4">
            <Button 
              onClick={onSubmit}
              disabled={disabled || isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold"
              size="lg"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting Job...</span>
                </div>
              ) : (
                'Start Pattern Mining Analysis'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}