import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import Fuse from 'fuse.js';

export interface Template {
  id: string;
  created_at: string;
  title: string;
  content: string;
  collection: string | null;
  tags: string[];
}

export type SortField = 'created_at' | 'collection';
export type SortDirection = 'asc' | 'desc';
export type MultiSortState = Partial<Record<SortField, SortDirection>>;

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: Template[];
  setSearchResults: (results: Template[]) => void;
  performFuzzySearch: (query: string, templates: Template[]) => Template[];
  isSearching: boolean;
  setIsSearching: (searching: boolean) => void;
  // Stacked sorting support
  sortStateMap: MultiSortState;
  setSortStateMap: (s: MultiSortState) => void;
  getSortDirection: (field: SortField) => SortDirection | null;
  toggleSort: (field: SortField) => void;
  clearAllSorts: () => void;
  applySorting: (templates: Template[]) => Template[];
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

const fuseOptions = {
  keys: [
    { name: 'title', weight: 0.4 },
    { name: 'content', weight: 0.3 },
    { name: 'tags', weight: 0.2 },
    { name: 'collection', weight: 0.1 }
  ],
  includeScore: true,
  threshold: 0.4,
  location: 0,
  distance: 1000,
  minMatchCharLength: 1,
  ignoreLocation: true,
  ignoreFieldNorm: false,
  useExtendedSearch: false
};

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Template[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  // Default: date descending
  const [sortStateMap, setSortStateMap] = useState<MultiSortState>({ created_at: 'desc' });

  const performFuzzySearch = useCallback((query: string, templates: Template[]): Template[] => {
    if (!query.trim()) {
      return templates;
    }
    const fuse = new Fuse(templates, fuseOptions);
    const results = fuse.search(query);
    return results.map(result => result.item);
  }, []);

  const getSortDirection = useCallback((field: SortField): SortDirection | null => {
    return sortStateMap[field] ?? null;
  }, [sortStateMap]);

  const toggleSort = useCallback((field: SortField) => {
    setSortStateMap((prev) => {
      const current = prev[field];
      if (!current) return { ...prev, [field]: 'asc' };
      if (current === 'asc') return { ...prev, [field]: 'desc' };
      const { [field]: _removed, ...rest } = prev;
      return rest;
    });
  }, []);

  const clearAllSorts = useCallback(() => {
    setSortStateMap({});
  }, []);

  const applySorting = useCallback((templates: Template[]): Template[] => {
    const createdAtDir = sortStateMap.created_at ?? null;
    const collectionDir = sortStateMap.collection ?? null;
    if (!createdAtDir && !collectionDir) return templates;
    const dirMul = (d: SortDirection | null) => (d === 'asc' ? 1 : -1);
    return [...templates].sort((a, b) => {
      if (createdAtDir) {
        const cmp = (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * dirMul(createdAtDir);
        if (cmp !== 0) return cmp;
      }
      if (collectionDir) {
        const cmp = String(a.collection || '').localeCompare(String(b.collection || '')) * dirMul(collectionDir);
        if (cmp !== 0) return cmp;
      }
      return 0;
    });
  }, [sortStateMap]);

  return (
    <SearchContext.Provider value={{
      searchQuery,
      setSearchQuery,
      searchResults,
      setSearchResults,
      performFuzzySearch,
      isSearching,
      setIsSearching,
      sortStateMap,
      setSortStateMap,
      getSortDirection,
      toggleSort,
      clearAllSorts,
      applySorting
    }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}
