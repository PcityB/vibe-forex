// API endpoint for retrieving Kaggle job results

import { NextRequest, NextResponse } from 'next/server';
import { createKaggleClient } from '@/lib/kaggle-api';
import { ApiResponse, KaggleJobResults } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Missing required parameter: jobId',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // Get Kaggle credentials
    const authHeader = request.headers.get('authorization');
    let kaggleUsername = 'netszy';
    let kaggleApiKey = '60a515ec7742c89c180861c1ec823493';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const credentials = JSON.parse(atob(authHeader.split(' ')[1]));
        kaggleUsername = credentials.username || kaggleUsername;
        kaggleApiKey = credentials.apiKey || kaggleApiKey;
      } catch (error) {
        console.error('Error parsing credentials:', error);
      }
    }

    console.log(`Getting results for job ${jobId} with user ${kaggleUsername}`);

    // Get job results from Kaggle
    const client = createKaggleClient(kaggleUsername, kaggleApiKey);
    const results = await client.getJobResults(jobId);

    if (!results) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Job not completed or results not available yet',
        timestamp: new Date().toISOString()
      }, { status: 202 }); // Accepted but not ready
    }

    return NextResponse.json<ApiResponse<KaggleJobResults>>({
      success: true,
      data: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error retrieving job results:', error);
    
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve job results',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}