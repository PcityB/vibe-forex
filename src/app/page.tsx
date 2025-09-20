"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ParameterPanel } from "@/components/dashboard/ParameterPanel";
import { PatternVisualizer } from "@/components/dashboard/PatternVisualizer";
import { JobMonitor } from "@/components/dashboard/JobMonitor";
import { ResultsAnalyzer } from "@/components/dashboard/ResultsAnalyzer";
import { DashboardState, KaggleJobStatus, PatternMiningParams, DEFAULT_MINING_PARAMS } from "@/lib/types";

export default function ForexPatternMiningDashboard() {
  const [dashboardState, setDashboardState] = useState<DashboardState>({
    currentParams: DEFAULT_MINING_PARAMS,
    activeJob: null,
    jobHistory: [],
    results: null,
    selectedPatterns: [],
    viewMode: 'overview',
    isLoading: false,
    error: null,
    lastUpdate: new Date().toISOString()
  });

  const [kaggleCredentials, setKaggleCredentials] = useState<{
    username: string;
    apiKey: string;
  }>({ username: '', apiKey: '' });

  const [activeTab, setActiveTab] = useState('configure');

  const updateDashboardState = (updates: Partial<DashboardState>) => {
    setDashboardState(prev => ({
      ...prev,
      ...updates,
      lastUpdate: new Date().toISOString()
    }));
  };

  const handleParameterChange = (params: PatternMiningParams) => {
    updateDashboardState({ currentParams: params });
  };

  const handleSubmitJob = async () => {
    updateDashboardState({ isLoading: true, error: null });

    try {
      // Submit job (will use simulation mode automatically)
      const response = await fetch('/api/kaggle/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dashboardState.currentParams)
      });

      const result = await response.json();
      
      if (result.success) {
        const newJob: KaggleJobStatus = {
          id: result.data.jobId,
          status: 'submitted',
          progress: 0,
          message: result.data.simulationMode 
            ? 'Job submitted to simulation engine' 
            : 'Job submitted successfully',
          startTime: new Date().toISOString(),
          executionTime: result.data.estimatedTime
        };

        updateDashboardState({
          activeJob: newJob,
          jobHistory: [newJob, ...dashboardState.jobHistory],
          isLoading: false
        });

        setActiveTab('monitor');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      updateDashboardState({
        error: error instanceof Error ? error.message : 'Failed to submit job',
        isLoading: false
      });
    }
  };

  const refreshJobStatus = useCallback(async (jobId: string) => {
    try {
      const response = await fetch(`/api/kaggle/status?jobId=${jobId}`);

      const result = await response.json();
      
      if (result.success) {
        const updatedJob = result.data;
        
        updateDashboardState({
          activeJob: updatedJob,
          jobHistory: dashboardState.jobHistory.map(job => 
            job.id === jobId ? updatedJob : job
          )
        });

        // If job completed, try to fetch results
        if (updatedJob.status === 'completed') {
          fetchJobResults(jobId);
        }
      }
    } catch (error) {
      console.error('Error refreshing job status:', error);
    }
  }, [dashboardState.jobHistory]);

  const fetchJobResults = useCallback(async (jobId: string) => {
    try {
      const response = await fetch(`/api/kaggle/results?jobId=${jobId}`);

      const result = await response.json();
      
      if (result.success) {
        updateDashboardState({
          results: result.data
        });
        setActiveTab('results');
      }
    } catch (error) {
      console.error('Error fetching job results:', error);
    }
  }, []);

  // Auto-refresh job status if there's an active job
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    const currentJob = dashboardState.activeJob;
    
    if (currentJob && currentJob.status === 'running') {
      interval = setInterval(async () => {
        await refreshJobStatus(currentJob.id);
      }, 10000); // Check every 10 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [dashboardState.activeJob, refreshJobStatus]);

  const handleCancelJob = async (jobId: string) => {
    try {
      const response = await fetch('/api/kaggle/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'cancel', jobId })
      });

      const result = await response.json();
      
      if (result.success && result.data.cancelled) {
        await refreshJobStatus(jobId);
      }
    } catch (error) {
      console.error('Error cancelling job:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-black/20 border-purple-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-white">Active Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">
              {dashboardState.activeJob?.status === 'running' ? '1' : '0'}
            </div>
            <p className="text-xs text-purple-300 mt-1">Currently running</p>
          </CardContent>
        </Card>

        <Card className="bg-black/20 border-purple-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-white">Total Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">
              {dashboardState.jobHistory.length}
            </div>
            <p className="text-xs text-blue-300 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card className="bg-black/20 border-purple-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-white">Patterns Found</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {dashboardState.results?.patterns.length || 0}
            </div>
            <p className="text-xs text-green-300 mt-1">Last analysis</p>
          </CardContent>
        </Card>

        <Card className="bg-black/20 border-purple-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-white">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">
              {dashboardState.results?.statistics.crossValidationScore 
                ? `${(dashboardState.results.statistics.crossValidationScore * 100).toFixed(1)}%`
                : '—'
              }
            </div>
            <p className="text-xs text-yellow-300 mt-1">Pattern accuracy</p>
          </CardContent>
        </Card>
      </div>

      {/* Simulation Mode Notice */}
      <Alert className="bg-blue-500/10 border-blue-500/20">
        <AlertDescription className="text-blue-200">
          <strong>🚀 Demo Mode Active:</strong> This application runs in simulation mode, providing realistic pattern mining results without requiring live Kaggle API integration. All functionality is fully operational - submit jobs to see the complete workflow in action!
        </AlertDescription>
      </Alert>

      {/* Kaggle Credentials (Optional for Demo) */}
      {(!kaggleCredentials.username || !kaggleCredentials.apiKey) && (
        <Alert className="bg-gray-500/10 border-gray-500/20">
          <AlertDescription className="text-gray-300">
            <strong>Optional:</strong> You can provide Kaggle credentials if you have them, but the demo works perfectly without them using our simulation engine.
            <div className="mt-2 space-y-2">
              <input
                type="text"
                placeholder="Kaggle Username (Optional for Demo)"
                className="w-full px-3 py-2 bg-black/20 border border-gray-600 rounded text-white placeholder-gray-400"
                value={kaggleCredentials.username}
                onChange={(e) => setKaggleCredentials(prev => ({ ...prev, username: e.target.value }))}
              />
              <input
                type="password"
                placeholder="Kaggle API Key (Optional for Demo)"
                className="w-full px-3 py-2 bg-black/20 border border-gray-600 rounded text-white placeholder-gray-400"
                value={kaggleCredentials.apiKey}
                onChange={(e) => setKaggleCredentials(prev => ({ ...prev, apiKey: e.target.value }))}
              />
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Error Display */}
      {dashboardState.error && (
        <Alert className="bg-red-500/10 border-red-500/20">
          <AlertDescription className="text-red-200">
            <strong>Error:</strong> {dashboardState.error}
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2" 
              onClick={() => updateDashboardState({ error: null })}
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-black/20">
          <TabsTrigger value="configure" className="text-white">Configure</TabsTrigger>
          <TabsTrigger value="monitor" className="text-white">Monitor</TabsTrigger>
          <TabsTrigger value="visualize" className="text-white">Visualize</TabsTrigger>
          <TabsTrigger value="results" className="text-white">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="configure" className="space-y-4">
          <Card className="bg-black/20 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white">Pattern Mining Configuration</CardTitle>
              <CardDescription className="text-purple-300">
                Configure parameters for the algorithmic pattern recognition framework
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ParameterPanel 
                params={dashboardState.currentParams}
                onChange={handleParameterChange}
                onSubmit={handleSubmitJob}
                isLoading={dashboardState.isLoading}
                disabled={false}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitor" className="space-y-4">
          <JobMonitor 
            activeJob={dashboardState.activeJob}
            jobHistory={dashboardState.jobHistory}
            onRefresh={refreshJobStatus}
            onCancel={handleCancelJob}
          />
        </TabsContent>

        <TabsContent value="visualize" className="space-y-4">
          <PatternVisualizer 
            patterns={dashboardState.results?.patterns || []}
            selectedPatterns={dashboardState.selectedPatterns}
            onPatternSelect={(patternIds) => updateDashboardState({ selectedPatterns: patternIds })}
            currencyPair={dashboardState.currentParams.currencyPair}
            timeFrame={dashboardState.currentParams.timeFrame}
          />
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <ResultsAnalyzer 
            results={dashboardState.results}
            onViewModeChange={(mode) => updateDashboardState({ viewMode: mode })}
            viewMode={dashboardState.viewMode}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}