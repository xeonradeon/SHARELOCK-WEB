"use client";

import { useState } from "react";
import { Search, Globe, CheckCircle2, XCircle, HelpCircle, ExternalLink, FileJson, FileSpreadsheet, Copy, Loader2, Github, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type Status = "found" | "not_found" | "unknown";

interface SearchResult {
  site: string;
  url: string;
  status: Status;
}

interface SearchResponse {
  username: string;
  total: number;
  found: number;
  not_found: number;
  unknown: number;
  time: string;
  results: SearchResult[];
}

export default function Home() {
  const [username, setUsername] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [data, setData] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [view, setView] = useState<"grid" | "list">("grid");

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!username.trim()) return;

    setIsSearching(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch(`/api/search?username=${encodeURIComponent(username)}`);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.detail || "Terjadi kesalahan saat mencari username");
      }

      const resultData: SearchResponse = await res.json();
      setData(resultData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const filteredResults = data?.results.filter((res) => {
    if (filter === "all") return true;
    return res.status === filter;
  }) || [];

  const handleExportJSON = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sherlock_${data.username}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    if (!data) return;
    const headers = ["Site", "URL", "Status"];
    const rows = data.results.map((r) => `"${r.site}","${r.url}","${r.status}"`);
    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sherlock_${data.username}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    if (!data) return;
    const text = data.results
      .filter((r) => r.status === "found")
      .map((r) => `${r.site}: ${r.url}`)
      .join("\n");
    navigator.clipboard.writeText(`Found ${data.username} on:\n\n${text}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      
      {/* GitHub-style Header */}
      <header className="flex items-center gap-4 px-4 sm:px-6 py-4 border-b border-border bg-[#010409]">
        <Github className="w-8 h-8 text-foreground" />
        <span className="font-semibold text-sm sm:text-base tracking-tight text-foreground">Sherlock Web</span>
        <div className="hidden sm:flex items-center ml-4 gap-4 text-sm font-medium text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors">Search</a>
          <a href="#" className="hover:text-foreground transition-colors">About</a>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center p-4 sm:p-8">
        {/* Header / Hero */}
        <div className="w-full max-w-4xl space-y-6 text-center mt-8 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-foreground">
              Find usernames across the web
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
              Open-source intelligence gathering across hundreds of social media platforms.
            </p>
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto flex items-center shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <Input 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Search or jump to username..."
              className="pl-10 pr-24 h-12 text-base bg-card border-border rounded-md focus-visible:ring-1 focus-visible:ring-primary shadow-sm w-full"
              disabled={isSearching}
            />
            <Button 
              type="submit" 
              variant="default"
              className="absolute right-1.5 h-9 rounded-sm px-4 font-medium"
              disabled={isSearching || !username.trim()}
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
            </Button>
          </form>
          <div className="text-sm text-muted-foreground">
            Example: <button type="button" onClick={() => { setUsername("torvalds"); }} className="text-primary hover:underline font-medium">torvalds</button>
          </div>
        </div>

        {/* Loading State */}
        {isSearching && (
          <div className="flex flex-col items-center justify-center space-y-4 mt-12 animate-in fade-in duration-500">
            <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
            <p className="text-sm font-medium text-muted-foreground">Scanning social networks...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isSearching && (
          <div className="w-full max-w-4xl mt-8">
            <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-md flex items-center gap-3">
              <XCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Results State */}
        {data && !isSearching && (
          <div className="w-full max-w-5xl space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
            
            {/* Stats Bar (GitHub Style Boxes) */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3 bg-card border border-border rounded-md flex flex-col justify-center items-center">
                <span className="text-xs text-muted-foreground font-medium mb-1">Total Checked</span>
                <span className="text-xl font-semibold">{data.total}</span>
              </div>
              <div className="p-3 bg-card border border-border rounded-md flex flex-col justify-center items-center">
                <span className="text-xs text-muted-foreground font-medium mb-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-[#3fb950]" /> Found</span>
                <span className="text-xl font-semibold text-[#3fb950]">{data.found}</span>
              </div>
              <div className="p-3 bg-card border border-border rounded-md flex flex-col justify-center items-center">
                <span className="text-xs text-muted-foreground font-medium mb-1 flex items-center gap-1"><XCircle className="w-3 h-3 text-[#f85149]" /> Not Found</span>
                <span className="text-xl font-semibold text-[#f85149]">{data.not_found}</span>
              </div>
              <div className="p-3 bg-card border border-border rounded-md flex flex-col justify-center items-center">
                <span className="text-xs text-muted-foreground font-medium mb-1 flex items-center gap-1"><HelpCircle className="w-3 h-3 text-[#d29922]" /> Unknown</span>
                <span className="text-xl font-semibold text-[#d29922]">{data.unknown}</span>
              </div>
              <div className="p-3 bg-card border border-border rounded-md flex flex-col justify-center items-center col-span-2 sm:col-span-1">
                <span className="text-xs text-muted-foreground font-medium mb-1">Time Elapsed</span>
                <span className="text-xl font-semibold">{data.time}</span>
              </div>
            </div>

            {/* Actions & Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 border-b border-border">
              <div className="flex space-x-1 border border-border rounded-md bg-card p-1">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-3 py-1 text-sm font-medium rounded-sm transition-colors ${filter === "all" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50"}`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter("found")}
                  className={`px-3 py-1 text-sm font-medium rounded-sm transition-colors flex items-center gap-1 ${filter === "found" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50"}`}
                >
                  <span className="w-2 h-2 rounded-full bg-[#3fb950]"></span> Found
                </button>
                <button
                  onClick={() => setFilter("not_found")}
                  className={`px-3 py-1 text-sm font-medium rounded-sm transition-colors flex items-center gap-1 ${filter === "not_found" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50"}`}
                >
                  <span className="w-2 h-2 rounded-full bg-[#f85149]"></span> Not Found
                </button>
                <button
                  onClick={() => setFilter("unknown")}
                  className={`px-3 py-1 text-sm font-medium rounded-sm transition-colors flex items-center gap-1 ${filter === "unknown" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50"}`}
                >
                  <span className="w-2 h-2 rounded-full bg-[#d29922]"></span> Unknown
                </button>
              </div>
              
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="flex items-center mr-2 border border-border rounded-md bg-card p-0.5">
                   <button onClick={() => setView("grid")} className={`p-1.5 rounded-sm ${view === "grid" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50"}`}>
                      <LayoutGrid className="w-4 h-4" />
                   </button>
                   <button onClick={() => setView("list")} className={`p-1.5 rounded-sm ${view === "list" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50"}`}>
                      <List className="w-4 h-4" />
                   </button>
                </div>
                <Tooltip>
                  <TooltipTrigger
                    onClick={handleExportJSON} 
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium border border-border bg-card h-8 w-8 hover:bg-muted transition-colors"
                  >
                    <FileJson className="w-4 h-4" />
                  </TooltipTrigger>
                  <TooltipContent>Export JSON</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger
                    onClick={handleExportCSV} 
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium border border-border bg-card h-8 w-8 hover:bg-muted transition-colors"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                  </TooltipTrigger>
                  <TooltipContent>Export CSV</TooltipContent>
                </Tooltip>
                <Button variant="outline" onClick={handleCopy} className="border-border bg-card h-8 text-xs font-medium hover:bg-muted transition-colors">
                  <Copy className="w-3.5 h-3.5 mr-2" />
                  Copy Results
                </Button>
              </div>
            </div>

            {/* Results */}
            {filteredResults.length > 0 ? (
              <div className={view === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
                {filteredResults.map((result, idx) => (
                  <div key={idx} className={`bg-card border border-border rounded-md p-4 flex ${view === "grid" ? "flex-col" : "flex-row items-center justify-between"} gap-4 hover:border-muted-foreground/30 transition-colors`}>
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="mt-1">
                        {result.status === "found" ? (
                          <Globe className="w-5 h-5 text-muted-foreground" />
                        ) : result.status === "not_found" ? (
                          <Globe className="w-5 h-5 text-muted-foreground/50" />
                        ) : (
                          <Globe className="w-5 h-5 text-muted-foreground/50" />
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-foreground truncate">{result.site}</span>
                          <span className={`px-2 py-0.5 text-[11px] font-medium rounded-full border ${
                            result.status === "found" ? "border-[#3fb950]/30 text-[#3fb950] bg-[#3fb950]/10" :
                            result.status === "not_found" ? "border-muted text-muted-foreground" :
                            "border-[#d29922]/30 text-[#d29922] bg-[#d29922]/10"
                          }`}>
                            {result.status === "found" ? "Found" : result.status === "not_found" ? "Not Found" : "Unknown"}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground mt-1 truncate">@{data.username}</span>
                      </div>
                    </div>
                    
                    <div className={view === "grid" ? "mt-auto pt-4 border-t border-border" : "ml-4 shrink-0"}>
                       {result.status === "found" ? (
                        <a 
                          href={result.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={`inline-flex items-center justify-center rounded-md text-xs font-medium border border-border bg-card hover:bg-muted transition-colors ${view === "grid" ? "w-full h-8" : "px-3 h-8"}`}
                        >
                          Visit Profile <ExternalLink className="w-3 h-3 ml-1.5" />
                        </a>
                      ) : (
                        <button 
                          className={`inline-flex items-center justify-center rounded-md text-xs font-medium border border-border bg-card opacity-50 cursor-not-allowed ${view === "grid" ? "w-full h-8" : "px-3 h-8"}`}
                          disabled
                        >
                          Not Available
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
               <div className="py-12 border border-border border-dashed rounded-md text-center space-y-3">
                 <Search className="w-8 h-8 text-muted-foreground mx-auto" />
                 <h3 className="text-base font-semibold">No results match your filter</h3>
                 <p className="text-sm text-muted-foreground">Try selecting a different filter or search again.</p>
               </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
