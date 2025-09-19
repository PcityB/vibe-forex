// API endpoint for forex historical data

import { NextRequest, NextResponse } from 'next/server';
import { ForexDataManager } from '@/lib/forex-data';
import { ApiResponse, ForexDataPoint, CurrencyPair, TimeFrame } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse currency pair
    const symbol = searchParams.get('symbol') || 'EURUSD';
    const [base, quote] = symbol.split('/') || symbol.match(/.{3}/g) || ['EUR', 'USD'];
    const currencyPair: CurrencyPair = { base, quote, symbol };
    
    // Parse timeframe
    const timeFrameValue = searchParams.get('timeframe') || '1h';
    const timeFrame: TimeFrame = {
      value: timeFrameValue,
      label: getTimeFrameLabel(timeFrameValue),
      minutes: getTimeFrameMinutes(timeFrameValue)
    };
    
    // Parse other parameters
    const dataPoints = parseInt(searchParams.get('dataPoints') || '1000');
    const apiKey = searchParams.get('apiKey') || process.env.FOREX_API_KEY || '';
    const provider = (searchParams.get('provider') as 'alphavantage' | 'fxapi') || 'alphavantage';

    // Validate parameters
    if (dataPoints < 1 || dataPoints > 50000) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'dataPoints must be between 1 and 50000',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // Create forex data manager
    const dataManager = new ForexDataManager(apiKey, provider);
    
    // Fetch historical data
    const data = await dataManager.getHistoricalData(currencyPair, timeFrame, dataPoints);
    
    // Validate data quality
    const validation = dataManager.validateData(data);
    
    return NextResponse.json<ApiResponse<{
      data: ForexDataPoint[];
      metadata: {
        symbol: string;
        timeframe: string;
        dataPoints: number;
        provider: string;
        validation: typeof validation;
        cacheStats: ReturnType<typeof dataManager.getCacheStats>;
      };
    }>>({
      success: true,
      data: {
        data: data,
        metadata: {
          symbol: currencyPair.symbol,
          timeframe: timeFrame.value,
          dataPoints: data.length,
          provider: apiKey ? provider : 'synthetic',
          validation: validation,
          cacheStats: dataManager.getCacheStats()
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching forex data:', error);
    
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch forex data',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'clearCache') {
      // Clear forex data cache
      const dataManager = new ForexDataManager();
      dataManager.clearCache();
      
      return NextResponse.json<ApiResponse<{ message: string }>>({
        success: true,
        data: { message: 'Cache cleared successfully' },
        timestamp: new Date().toISOString()
      });
    }

    if (action === 'validateData') {
      const { data } = body;
      if (!data || !Array.isArray(data)) {
        return NextResponse.json<ApiResponse<null>>({
          success: false,
          error: 'Invalid data provided for validation',
          timestamp: new Date().toISOString()
        }, { status: 400 });
      }

      const dataManager = new ForexDataManager();
      const validation = dataManager.validateData(data);
      
      return NextResponse.json<ApiResponse<typeof validation>>({
        success: true,
        data: validation,
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Unsupported action. Available actions: clearCache, validateData',
      timestamp: new Date().toISOString()
    }, { status: 400 });

  } catch (error) {
    console.error('Error processing forex data request:', error);
    
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process request',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Utility functions
function getTimeFrameLabel(value: string): string {
  const labels: { [key: string]: string } = {
    '1m': '1 Minute',
    '5m': '5 Minutes', 
    '15m': '15 Minutes',
    '30m': '30 Minutes',
    '1h': '1 Hour',
    '4h': '4 Hours',
    '1d': '1 Day'
  };
  return labels[value] || value;
}

function getTimeFrameMinutes(value: string): number {
  const minutes: { [key: string]: number } = {
    '1m': 1,
    '5m': 5,
    '15m': 15,
    '30m': 30,
    '1h': 60,
    '4h': 240,
    '1d': 1440
  };
  return minutes[value] || 60;
}