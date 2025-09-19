"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { KaggleJobStatus } from "@/lib/types";

interface JobMonitorProps {
  activeJob: KaggleJobStatus | null;
  jobHistory: KaggleJobStatus[];
  onRefresh: (jobId: string) => void;
  onCancel: (jobId: string) => void;
}

export function JobMonitor({ activeJob, jobHistory, onRefresh, onCancel }: JobMonitorProps) {
  const getStatusBadge = (status: KaggleJobStatus['status']) => {
    const variants: Record<KaggleJobStatus['status'], { variant: 'default' | 'secondary' | 'destructive' | 'outline'; color: string }> = {
      'submitted': { variant: 'outline', color: 'text-blue-400 border-blue-400' },
      'running': { variant: 'default', color: 'text-green-400 bg-green-500/20' },
      'completed': { variant: 'secondary', color: 'text-emerald-400 bg-emerald-500/20' },
      'failed': { variant: 'destructive', color: 'text-red-400 bg-red-500/20' },
      'cancelled': { variant: 'outline', color: 'text-gray-400 border-gray-400' }
    };

    const config = variants[status];
    return (
      <Badge variant={config.variant} className={config.color}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getProgressPercentage = (job: KaggleJobStatus): number => {
    if (job.status === 'completed') return 100;
    if (job.status === 'failed' || job.status === 'cancelled') return 0;
    if (job.status === 'running') {
      // Estimate progress based on execution time
      const elapsed = job.executionTime ? 
        (Date.now() - new Date(job.startTime).getTime()) / 1000 : 0;
      const estimated = job.executionTime || 300; // Default 5 minutes
      return Math.min(90, (elapsed / estimated) * 100); // Max 90% until completion
    }
    return 10; // Submitted jobs
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds.toFixed(0)}s`;
    if (seconds < 3600) return `${(seconds / 60).toFixed(1)}m`;
    return `${(seconds / 3600).toFixed(1)}h`;
  };

  const getElapsedTime = (startTime: string): string => {
    const elapsed = (Date.now() - new Date(startTime).getTime()) / 1000;
    return formatDuration(elapsed);
  };

  return (
    <div className="space-y-6">
      {/* Active Job Monitor */}
      {activeJob ? (
        <Card className="bg-black/20 border-purple-500/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white text-xl">Active Job Monitor</CardTitle>
                <CardDescription className="text-purple-300">
                  Job ID: {activeJob.id}
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusBadge(activeJob.status)}
                {activeJob.status === 'running' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onRefresh(activeJob.id)}
                    className="border-purple-500 text-purple-300 hover:bg-purple-500/10"
                  >
                    Refresh
                  </Button>
                )}
                {(activeJob.status === 'running' || activeJob.status === 'submitted') && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onCancel(activeJob.id)}
                    className="border-red-500 text-red-400 hover:bg-red-500/10"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Progress</span>
                <span className="text-purple-400">
                  {getProgressPercentage(activeJob).toFixed(0)}%
                </span>
              </div>
              <Progress 
                value={getProgressPercentage(activeJob)} 
                className="w-full bg-gray-700"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-gray-400">Started</div>
                <div className="text-white font-mono text-sm">
                  {new Date(activeJob.startTime).toLocaleString()}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-gray-400">Elapsed Time</div>
                <div className="text-purple-400 font-mono text-sm">
                  {getElapsedTime(activeJob.startTime)}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-gray-400">Estimated Total</div>
                <div className="text-blue-400 font-mono text-sm">
                  {activeJob.executionTime ? formatDuration(activeJob.executionTime) : 'Unknown'}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-gray-400">Status Message</div>
              <div className="p-3 bg-black/30 rounded border border-gray-700">
                <div className="text-white text-sm font-mono">
                  {activeJob.message}
                </div>
              </div>
            </div>

            {activeJob.status === 'running' && (
              <Alert className="bg-blue-500/10 border-blue-500/20">
                <AlertDescription className="text-blue-200">
                  <strong>Job Running:</strong> Your pattern mining analysis is in progress. 
                  The algorithm is analyzing historical forex data to discover frequent patterns.
                  This may take several minutes depending on the data size and parameters.
                </AlertDescription>
              </Alert>
            )}

            {activeJob.status === 'completed' && (
              <Alert className="bg-green-500/10 border-green-500/20">
                <AlertDescription className="text-green-200">
                  <strong>Job Completed:</strong> Pattern mining analysis finished successfully! 
                  Check the Results tab to explore discovered patterns and statistics.
                </AlertDescription>
              </Alert>
            )}

            {activeJob.status === 'failed' && (
              <Alert className="bg-red-500/10 border-red-500/20">
                <AlertDescription className="text-red-200">
                  <strong>Job Failed:</strong> The pattern mining analysis encountered an error. 
                  Please check your parameters and Kaggle credentials, then try submitting a new job.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-black/20 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">No Active Jobs</CardTitle>
            <CardDescription className="text-gray-400">
              Submit a new pattern mining job from the Configure tab
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gray-500 rounded-full border-dashed"></div>
              </div>
              <p className="text-gray-400">No pattern mining jobs currently running</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Job History */}
      {jobHistory.length > 0 && (
        <Card className="bg-black/20 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Job History</CardTitle>
            <CardDescription className="text-gray-400">
              Recent pattern mining jobs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {jobHistory.slice(0, 10).map((job, index) => (
                <div key={job.id}>
                  <div className="flex items-center justify-between p-3 rounded border border-gray-700 hover:border-gray-600 transition-colors">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center space-x-3">
                        <span className="text-white font-mono text-sm">{job.id}</span>
                        {getStatusBadge(job.status)}
                      </div>
                      <div className="text-xs text-gray-400">
                        Started: {new Date(job.startTime).toLocaleString()}
                        {job.endTime && (
                          <span className="ml-4">
                            Ended: {new Date(job.endTime).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {job.executionTime && (
                        <span className="text-xs text-purple-400">
                          {formatDuration(job.executionTime)}
                        </span>
                      )}
                      {job.status === 'completed' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.location.hash = 'results'}
                          className="text-xs border-green-500 text-green-400 hover:bg-green-500/10"
                        >
                          View Results
                        </Button>
                      )}
                    </div>
                  </div>
                  {index < jobHistory.length - 1 && <Separator className="bg-gray-800" />}
                </div>
              ))}
            </div>
            
            {jobHistory.length > 10 && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-400">
                  Showing 10 most recent jobs. Total: {jobHistory.length}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}