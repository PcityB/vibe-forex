// API endpoint for submitting pattern mining jobs to Kaggle

import { NextRequest, NextResponse } from 'next/server';
import { createKaggleClient, getEstimatedExecutionTime } from '@/lib/kaggle-api';
import { PatternMiningParams, ApiResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const params: PatternMiningParams = await request.json();
    
    // Validate required parameters
    if (!params.currencyPair || !params.timeFrame) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Missing required parameters: currencyPair and timeFrame',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // Get Kaggle credentials from request headers or use provided test credentials
    const authHeader = request.headers.get('authorization');
    let kaggleUsername = 'netszy'; // Use your username
    let kaggleApiKey = '60a515ec7742c89c180861c1ec823493'; // Use your API key

    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const credentials = JSON.parse(atob(authHeader.split(' ')[1]));
        kaggleUsername = credentials.username || kaggleUsername;
        kaggleApiKey = credentials.apiKey || kaggleApiKey;
      } catch (error) {
        console.error('Error parsing credentials:', error);
      }
    }

    console.log(`Using Kaggle credentials: ${kaggleUsername}`);

    // Create Kaggle client and submit real job
    const client = createKaggleClient(kaggleUsername, kaggleApiKey);
    const result = await client.submitPatternMiningJob(params);
    
    // Calculate estimated execution time
    const estimatedTime = getEstimatedExecutionTime(params);

    console.log('Real Kaggle job submitted:', result);

    return NextResponse.json<ApiResponse<{ 
      jobId: string; 
      estimatedTime: number;
      status: string;
    }>>({
      success: true,
      data: {
        jobId: result.jobId,
        estimatedTime: estimatedTime,
        status: 'submitted'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error submitting Kaggle job:', error);
    
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit to Kaggle API',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json<ApiResponse<{
    supportedParams: string[];
    defaultParams: Partial<PatternMiningParams>;
  }>>({
    success: true,
    data: {
      supportedParams: [
        'currencyPair',
        'timeFrame', 
        'windowSize',
        'minSupport',
        'minConfidence',
        'dataPoints',
        'overlapThreshold',
        'noiseFilter',
        'significanceLevel',
        'bootstrapSamples',
        'crossValidationFolds',
        'includeTechnicalIndicators'
      ],
      defaultParams: {
        windowSize: 20,
        minSupport: 0.05,
        minConfidence: 0.7,
        dataPoints: 10000,
        overlapThreshold: 0.3,
        noiseFilter: 0.1,
        significanceLevel: 0.05,
        bootstrapSamples: 1000,
        crossValidationFolds: 5,
        includeTechnicalIndicators: true
      }
    },
    timestamp: new Date().toISOString()
  });
}