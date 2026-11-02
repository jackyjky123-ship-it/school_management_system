import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Database, Server, Cpu } from "lucide-react";

interface HealthResponse {
  status: string;
  laravel_version: string;
  message: string;
  database: string;
  timestamp: string;
}

export default function App() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery<HealthResponse>({
    queryKey: ["system-health"],
    queryFn: async () => {
      const response = await apiClient.get<HealthResponse>("/health");
      return response.data;
    },
  });

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-xl font-bold">School Management System</CardTitle>
            <CardDescription>Phase 1: Laravel 13 + Neon + shadcn/ui</CardDescription>
          </div>
          <Badge variant={isError ? "destructive" : data?.status === "ok" ? "default" : "secondary"}>
            {isLoading ? "Checking..." : isError ? "Offline" : "Connected"}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
            </div>
          ) : isError ? (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
              Cannot reach Laravel 13 API at <code>/api/v1/health</code>. Check <code>php artisan serve</code> and your Neon <code>.env</code> credentials.
            </div>
          ) : (
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-slate-700">
                <Server className="h-4 w-4 text-emerald-600" />
                <span>{data?.message}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Cpu className="h-4 w-4 text-purple-600" />
                <span>
                  Laravel Version: <strong className="font-mono">{data?.laravel_version}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Database className="h-4 w-4 text-blue-600" />
                <span>
                  Neon Database: <strong className="font-mono">{data?.database}</strong>
                </span>
              </div>
            </div>
          )}

          <Button
            onClick={() => refetch()}
            disabled={isFetching}
            variant="outline"
            className="w-full"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            Re-test Connection
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}