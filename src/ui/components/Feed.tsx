"use client";
/*
 * Documentation:
 * Feed — https://app.subframe.com/ace97b1b228a/library?component=Feed_1d0bc549-4078-44f8-a312-988c8e47bdd9
 * Prompt card — https://app.subframe.com/ace97b1b228a/library?component=Prompt+card_8f873461-8555-4a52-8062-9b27510c91d6
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import * as SubframeUtils from "../utils";
import { PromptCard } from "./PromptCard";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useSearch, Template } from "@/lib/searchContext";

interface FeedRootProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: React.ReactNode;
  text2?: React.ReactNode;
  overview?: boolean;
  kind?: 'template';
  className?: string;
  page?: number;
  pageSize?: number;
  onCount?: (n: number) => void;
  favoritesOnly?: boolean;
  selectedCollections?: string[];
}

const FeedRoot = React.forwardRef<HTMLDivElement, FeedRootProps>(
  function FeedRoot(
    { text, text2, overview = false, kind = 'template', className, page = 1, pageSize = 10, onCount, favoritesOnly = false, selectedCollections = [], ...otherProps }: FeedRootProps,
    ref
  ) {
  const navigate = useNavigate();
  const { searchQuery, performFuzzySearch, applySorting, sortStateMap, getSortDirection } = useSearch();
  const [allItems, setAllItems] = useState<Template[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Fetch all data for search functionality
  const refreshData = useCallback(async () => {
    const ascendingCreated = getSortDirection('created_at') === 'asc';
    let query = supabase
      .from('prompt_logs')
      .select('id, created_at, title, content, collection, tags', { count: 'exact' })
      .order('created_at', { ascending: ascendingCreated });

    // Add favorites filter if needed
    if (favoritesOnly) {
      query = query.contains('tags', ['favorite']);
    }

    // Add collection filter if needed
    if (selectedCollections.length > 0) {
      query = query.in('collection', selectedCollections);
    }

    if (searchQuery.trim()) {
      // When searching, fetch all data (up to a reasonable limit)
      const { data, count, error } = await query.limit(1000); // Reasonable limit for client-side search
      if (!error) {
        setAllItems(data || []);
        if (typeof count === 'number') {
          setTotalCount(count);
        }
      }
    } else {
      // When not searching, use pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, count, error } = await query.range(from, to);
      if (!error) {
        setAllItems(data || []);
        if (typeof count === 'number') {
          setTotalCount(count);
          onCount?.(count);
        }
      }
    }
  }, [page, pageSize, searchQuery, getSortDirection, favoritesOnly, selectedCollections, onCount]);

  useEffect(() => {
    refreshData();
    const onUpdated = (e: Event) => {
      const detail = (e as CustomEvent).detail as { id: string; title: string; content: string; collection: string | null; tags: string[] };
      if (!detail) return;
      
      setAllItems((prev) => {
        // If we're viewing favorites only and the updated item no longer has 'favorite' tag, remove it instantly
        if (favoritesOnly && !detail.tags.includes('favorite')) {
          const itemExists = prev.find((it) => it.id === detail.id);
          if (itemExists) {
            const newItems = prev.filter((it) => it.id !== detail.id);
            // Update total count to reflect the removal
            setTotalCount((t) => {
              const v = Math.max(0, t - 1);
              onCount?.(v);
              return v;
            });
            return newItems;
          }
        }
        
        // Normal update case - update the item properties if it exists in the current view
        return prev.map((it) => (it.id === detail.id ? { ...it, title: detail.title, content: detail.content, collection: detail.collection, tags: detail.tags } : it));
      });
    };
    const onTemplateUpdated = (ev: Event) => { onUpdated(ev) };
    window.addEventListener('template-updated', onTemplateUpdated as EventListener);
    const onRemoved = (e: Event) => {
      const detail = (e as CustomEvent).detail as { id: string };
      if (!detail) return;
      setAllItems((prev) => prev.filter((it) => it.id !== detail.id));
      setTotalCount((t) => {
        const v = Math.max(0, t - 1);
        onCount?.(v);
        return v;
      });
    };
    const onTemplateRemoved = (ev: Event) => { onRemoved(ev) };
    window.addEventListener('template-removed', onTemplateRemoved as EventListener);
    const onCreated = (e: Event) => {
      const detail = (e as CustomEvent).detail as { id: string; created_at: string; title: string; content: string; collection: string | null; tags: string[] };
      if (!detail) return;
      setAllItems((prev) => {
        // avoid duplicates
        if (prev.find((p) => p.id === detail.id)) return prev;
        return [detail, ...prev];
      });
      setTotalCount((t) => {
        const v = t + 1;
        onCount?.(v);
        return v;
      });
    };
    const onTemplateCreated = (ev: Event) => { onCreated(ev) };
    window.addEventListener('template-created', onTemplateCreated as EventListener);
    const onSoftRefresh = () => {
      // For favorites-only view, do a full refresh to catch any newly favorited items
      if (favoritesOnly) {
        refreshData();
      }
    };
    window.addEventListener('template-soft-refresh', onSoftRefresh as EventListener);
    
    return () => {
      window.removeEventListener('template-updated', onTemplateUpdated as EventListener);
      window.removeEventListener('template-created', onTemplateCreated as EventListener);
      window.removeEventListener('template-removed', onTemplateRemoved as EventListener);
      window.removeEventListener('template-soft-refresh', onSoftRefresh as EventListener);
    };
  }, [refreshData, favoritesOnly, onCount]);

  // Apply fuzzy search and pagination
  const items = useMemo(() => {
    let result = allItems;
    if (searchQuery.trim()) {
      // Apply fuzzy search
      result = performFuzzySearch(searchQuery, result);
      const filteredCount = result.length;
      onCount?.(filteredCount);
    }
    // Apply sorting
    result = applySorting(result);
    // Apply pagination when searching
    if (searchQuery.trim()) {
      const from = (page - 1) * pageSize;
      const to = from + pageSize;
      return result.slice(from, to);
    }
    return result;
  }, [searchQuery, allItems, page, pageSize, performFuzzySearch, onCount, applySorting]);

  const grouped = useMemo(() => {
    const startOfDayKey = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    const toDate = (key: string) => {
      const [y, m, d] = key.split('-').map((s) => parseInt(s, 10));
      return new Date(y, m - 1, d);
    };
    const today = new Date();
    const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    const map = new Map<string, typeof items>();
    for (const it of items) {
      const d = new Date(it.created_at);
      const key = startOfDayKey(d);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(it);
    }
    const suffix = (n: number) => {
      if (n % 100 >= 11 && n % 100 <= 13) return 'th';
      switch (n % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    };
    const monthShort = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const labelFor = (date: Date) => {
      const tKey = startOfDayKey(today);
      const yKey = startOfDayKey(yesterday);
      const k = startOfDayKey(date);
      if (k === tKey) return 'Today';
      if (k === yKey) return 'Yesterday';
      const day = date.getDate();
      return `${day}${suffix(day)} ${monthShort[date.getMonth()]}`;
    };
    const dateAsc = getSortDirection('created_at') === 'asc';
    const keys = Array.from(map.keys()).sort((a, b) =>
      dateAsc ? toDate(a).getTime() - toDate(b).getTime() : toDate(b).getTime() - toDate(a).getTime()
    );
    return keys.map((key) => {
      const groupItems = [...(map.get(key) || [])].sort((a, b) => {
        const tA = new Date(a.created_at).getTime();
        const tB = new Date(b.created_at).getTime();
        return dateAsc ? tA - tB : tB - tA;
      });
      return { label: labelFor(toDate(key)), items: groupItems };
    });
  }, [items, getSortDirection]);

  const formatRelative = (iso: string) => {
    const now = Date.now();
    const then = new Date(iso).getTime();
    const s = Math.max(1, Math.floor((now - then) / 1000));
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}hr ago`;
    const d = Math.floor(h / 24);
    if (d < 7) return `${d}d ago`;
    const w = Math.floor(d / 7);
    if (w < 4) return `${w}w ago`;
    const mo = Math.floor(d / 30);
    if (mo < 12) return `${mo}mo ago`;
    const y = Math.floor(d / 365);
    return `${y}yr ago`;
  };

  const normalizeTags = (raw: unknown): string[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.filter((t) => typeof t === 'string') as string[];
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.filter((t) => typeof t === 'string');
      } catch {}
      // fallback comma/semicolon separated
      return raw
        .split(/[;,]/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  };

  const cleanCollection = (cat: string | null): string | null => {
    if (!cat) return null;
    const c = String(cat).trim();
    if (!c || c.toLowerCase() === 'none' || c.toLowerCase() === 'null') return null;
    return c;
  };

  return (
      <div
        className={SubframeUtils.twClassNames(
          "group/1d0bc549 flex h-full w-full flex-col items-center gap-6",
          className
        )}
        ref={ref}
        {...otherProps}
      >
        {grouped.map((group) => (
          <div key={group.label} className="flex w-full flex-col items-start gap-4">
            {group.items.length ? (
              <span className="text-heading-3 font-heading-3 text-subtext-color">{group.label}</span>
            ) : null}
                {group.items.map((it) => (
              <PromptCard
                key={it.id}
                text={formatRelative(it.created_at)}
                titleText={it.title}
                contentText={it.content}
                boolean={false}
                category={cleanCollection(it.collection)}
                tags={normalizeTags(it.tags)}
                hoverActions={true}
                id={it.id}
                 kind={'template'}
                onClick={() => navigate(`/templates/${it.id}`)}
                onCreateTemplate={() => overview && navigate(`/templates/new?from=${it.id}`)}
                onCopyTemplate={() => {
                  try {
                    navigator.clipboard.writeText(it.content || "");
                  } catch {}
                }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }
);

export const Feed = FeedRoot;