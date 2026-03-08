"use client";

import { useState, useEffect } from "react";
import {
  Newspaper, ExternalLink, RefreshCw, Wrench,
  BookOpen, Radio, GraduationCap, Calendar, Clock,
  Loader2, AlertCircle, Rss,
} from "lucide-react";
import { getDomainFeed } from "@/actions/blogs";
import { formatDistanceToNow } from "date-fns";

// ── Client-only timestamp — avoids SSR/client hydration mismatch ─
function TimeAgo({ date }) {
  const [label, setLabel] = useState(null);
  useEffect(() => {
    setLabel(formatDistanceToNow(new Date(date), { addSuffix: true }));
  }, [date]);
  if (!label) return null;
  return <span>{label}</span>;
}

// ── Type config ───────────────────────────────────────────────
const TYPE_CONFIG = {
  article:  { label: "Article",  Icon: BookOpen,      color: "text-blue-500",   bg: "bg-blue-500/10",   border: "border-blue-500/20"   },
  tool:     { label: "Tool",     Icon: Wrench,        color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  news:     { label: "News",     Icon: Radio,         color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  tutorial: { label: "Tutorial", Icon: GraduationCap, color: "text-emerald-500",bg: "bg-emerald-500/10",border: "border-emerald-500/20"},
};

const getTypeConfig = (type) =>
  TYPE_CONFIG[type?.toLowerCase()] || TYPE_CONFIG.article;

// ── Single Article Card ───────────────────────────────────────
function ArticleCard({ article }) {
  const { label, Icon, color, bg, border } = getTypeConfig(article.type);

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col gap-3 p-4 rounded-xl border bg-card transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
    >
      {/* Top row — type badge + source */}
      <div className="flex items-center justify-between gap-2">
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${color} ${bg} ${border}`}>
          <Icon className="w-3 h-3" />
          {label}
        </span>
        <span className="text-xs text-muted-foreground truncate max-w-[120px]">
          {article.source}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
        {article.title}
      </h3>

      {/* Summary */}
      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
        {article.summary}
      </p>

      {/* Footer — date + read time + link icon */}
      <div className="flex items-center justify-between mt-auto pt-1">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {article.publishedDate}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {article.readTime}
          </span>
        </div>
        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
      </div>
    </a>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function DomainFeed({ initialData }) {
  const [data,       setData]       = useState(initialData);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const fresh = await getDomainFeed(true); // forceRefresh = true
      setData(fresh);
    } catch {
      // keep existing data
    } finally {
      setRefreshing(false);
    }
  };

  const { articles = [], domain, lastFetched, cached, error } = data || {};

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Rss className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-bold leading-tight">
              Latest in {domain || "Your Domain"}
            </h2>
            {lastFetched && (
              <p className="text-xs text-muted-foreground">
                {cached ? "Cached · " : ""}
                Updated <TimeAgo date={lastFetched} />
              </p>
            )}
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border bg-background hover:bg-muted transition-colors disabled:opacity-50"
        >
          {refreshing
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <RefreshCw className="w-3.5 h-3.5" />}
          {refreshing ? "Searching web..." : "Refresh"}
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Could not load feed. {error}</span>
        </div>
      )}

      {/* Loading state */}
      {refreshing && (
        <div className="flex items-center justify-center gap-3 py-12 text-muted-foreground text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span>Searching the web for latest {domain} content...</span>
        </div>
      )}

      {/* Empty state */}
      {!refreshing && articles.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
          <Newspaper className="w-8 h-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No articles loaded yet. Click Refresh to fetch the latest content.
          </p>
        </div>
      )}

      {/* Articles grid */}
      {!refreshing && articles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((article, i) => (
            <ArticleCard key={i} article={article} />
          ))}
        </div>
      )}

      {/* Footer note */}
      {articles.length > 0 && !refreshing && (
        <p className="text-xs text-muted-foreground text-center">
          Results sourced from the web via AI search · Refreshes every 24 hours
        </p>
      )}
    </div>
  );
}