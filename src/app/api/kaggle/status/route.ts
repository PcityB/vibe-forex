// API endpoint for monitoring Kaggle job status

import { NextRequest, NextResponse } from 'next/server';
import { createKaggleClient } from '@/lib/kaggle-api';
import { ApiResponse, KaggleJobStatus } from '@/lib/types';

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

    // Get Kaggle credentials - use your credentials as default
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

    console.log(`Checking status for job ${jobId} with user ${kaggleUsername}`);

    // Get job status from Kaggle
    const client = createKaggleClient(kaggleUsername, kaggleApiKey);
    const status = await client.getJobStatus(jobId);

    return NextResponse.json<ApiResponse<KaggleJobStatus>>({
      success: true,
      data: status,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting job status:', error);
    
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get job status',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, jobId } = await request.json();

    if (!jobId || !action) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Missing required parameters: jobId and action',
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

    const client = createKaggleClient(kaggleUsername, kaggleApiKey);

    if (action === 'cancel') {
      const success = await client.cancelJob(jobId);
      
      return NextResponse.json<ApiResponse<{ cancelled: boolean }>>({
        success: success,
        data: { cancelled: success },
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Unsupported action. Available actions: cancel',
      timestamp: new Date().toISOString()
    }, { status: 400 });

  } catch (error) {
    console.error('Error performing job action:', error);
    
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to perform job action',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}