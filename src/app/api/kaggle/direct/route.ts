// Direct Kaggle API test endpoint

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username') || 'netszy';
  const apiKey = searchParams.get('apiKey') || '60a515ec7742c89c180861c1ec823493';

  try {
    console.log(`Testing Kaggle API with username: ${username}`);
    
    // Test 1: List kernels to verify authentication
    const listResponse = await fetch('https://www.kaggle.com/api/v1/kernels/list', {
      headers: {
        'Authorization': `Basic ${btoa(`${username}:${apiKey}`)}`
      }
    });

    console.log(`List kernels response: ${listResponse.status}`);
    
    if (!listResponse.ok) {
      const errorText = await listResponse.text();
      return NextResponse.json({
        success: false,
        error: `Authentication failed: ${listResponse.status} - ${errorText}`,
        timestamp: new Date().toISOString()
      });
    }

    const kernels = await listResponse.json();
    console.log(`Found ${kernels.length || 0} kernels`);

    // Test 2: Try to create a simple kernel
    const timestamp = Date.now();
    const testKernelData = {
      id: `${username}/test-kernel-${timestamp}`,
      title: `Test Kernel ${timestamp}`,
      code_file: "notebook.ipynb",
      language: "python",
      kernel_type: "notebook",
      is_private: true,
      enable_gpu: false,
      enable_internet: true
    };

    console.log('Testing kernel creation...');
    const createResponse = await fetch('https://www.kaggle.com/api/v1/kernels/push', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${username}:${apiKey}`)}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testKernelData)
    });

    console.log(`Create kernel response: ${createResponse.status}`);
    const createResult = createResponse.ok ? await createResponse.json() : await createResponse.text();

    return NextResponse.json({
      success: true,
      data: {
        authTest: {
          status: listResponse.status,
          kernelCount: kernels.length || 0
        },
        createTest: {
          status: createResponse.status,
          result: createResult
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Direct Kaggle test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}