import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from './supabaseClient';

interface CollectionWithCount {
  name: string;
  count: number;
}

interface CollectionsContextType {
  collections: string[];
  collectionsWithCounts: CollectionWithCount[];
  addCollection: (name: string) => void;
  renameCollection: (oldName: string, newName: string) => void;
  removeCollection: (name: string) => void;
  loading: boolean;
}

const CollectionsContext = createContext<CollectionsContextType | undefined>(undefined);

export const useCollections = () => {
  const context = useContext(CollectionsContext);
  if (context === undefined) {
    throw new Error('useCollections must be used within a CollectionsProvider');
  }
  return context;
};

interface CollectionsProviderProps {
  children: ReactNode;
}

export const CollectionsProvider: React.FC<CollectionsProviderProps> = ({ children }) => {
  const [collections, setCollections] = useState<string[]>([]);
  const [collectionsWithCounts, setCollectionsWithCounts] = useState<CollectionWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  // Load collections from database on mount
  useEffect(() => {
    loadCollections();
    
    // Listen for template changes to refresh counts
    const handleTemplateChange = () => {
      if (collections.length > 0) {
        loadCollectionCounts(collections);
      }
    };

    window.addEventListener('template-created', handleTemplateChange);
    window.addEventListener('template-updated', handleTemplateChange);
    window.addEventListener('template-removed', handleTemplateChange);

    return () => {
      window.removeEventListener('template-created', handleTemplateChange);
      window.removeEventListener('template-updated', handleTemplateChange);
      window.removeEventListener('template-removed', handleTemplateChange);
    };
  }, [collections]);

  const loadCollections = async () => {
    try {
      setLoading(true);
      let allCollections: string[] = [];
      
      // Try to load from dedicated collections table first
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: collectionsData, error: collectionsError } = await supabase
            .from('collections')
            .select('name')
            .eq('user_id', user.id)
            .order('name');

          if (!collectionsError && collectionsData) {
            allCollections = collectionsData.map(c => c.name);
          }
        }
      } catch (error) {
        console.warn('Collections table not available:', error);
      }

      // Also get unique collections from existing templates (prompt_logs table)
      try {
        const { data: templates, error: templatesError } = await supabase
          .from('prompt_logs')
          .select('collection')
          .not('collection', 'is', null)
          .not('collection', 'eq', '');

        if (!templatesError && templates) {
          const templateCollections = templates
            .map(t => t.collection)
            .filter(Boolean)
            .map(c => c.trim())
            .filter(c => c.length > 0);
          
          allCollections = [...allCollections, ...templateCollections];
        }
      } catch (error) {
        console.warn('Error loading collections from templates:', error);
      }

      // Get collections from localStorage as fallback
      try {
        const storedCollections = JSON.parse(localStorage.getItem('promptlog_collections') || '[]');
        if (Array.isArray(storedCollections)) {
          allCollections = [...allCollections, ...storedCollections];
        }
      } catch (error) {
        console.warn('Error loading collections from localStorage:', error);
      }

      // Remove duplicates and sort
      const uniqueCollections = [...new Set(allCollections)].sort();

      // If no collections found, use defaults
      if (uniqueCollections.length === 0) {
        const defaultCollections = [
          "Outreach Templates Library",
          "Design Feedback Scripts", 
          "Idea Generation",
          "Launch-Ready Prompts",
          "Core Prompts"
        ];
        setCollections(defaultCollections);
        
        // Store defaults in localStorage for persistence
        localStorage.setItem('promptlog_collections', JSON.stringify(defaultCollections));
        
        // Set default counts to 0 since no templates exist yet
        setCollectionsWithCounts(defaultCollections.map(name => ({ name, count: 0 })));
      } else {
        setCollections(uniqueCollections);
        
        // Get counts for each collection
        await loadCollectionCounts(uniqueCollections);
      }

    } catch (error) {
      console.error('Error loading collections:', error);
      // Fallback to default collections
      const defaultCollections = [
        "Outreach Templates Library",
        "Design Feedback Scripts", 
        "Idea Generation",
        "Launch-Ready Prompts",
        "Core Prompts"
      ];
      setCollections(defaultCollections);
      localStorage.setItem('promptlog_collections', JSON.stringify(defaultCollections));
    } finally {
      setLoading(false);
    }
  };

  const loadCollectionCounts = async (collectionNames: string[]) => {
    try {
      // Get counts for each collection from prompt_logs table
      const { data: counts, error } = await supabase
        .from('prompt_logs')
        .select('collection')
        .in('collection', collectionNames)
        .not('collection', 'is', null);

      if (error) {
        console.error('Error loading collection counts:', error);
        // Set all counts to 0 as fallback
        setCollectionsWithCounts(collectionNames.map(name => ({ name, count: 0 })));
        return;
      }

      // Count occurrences of each collection
      const countMap = new Map<string, number>();
      collectionNames.forEach(name => countMap.set(name, 0));
      
      counts?.forEach(item => {
        if (item.collection && countMap.has(item.collection)) {
          countMap.set(item.collection, (countMap.get(item.collection) || 0) + 1);
        }
      });

      // Convert to array with counts
      const collectionsWithCountsArray = collectionNames.map(name => ({
        name,
        count: countMap.get(name) || 0
      }));

      setCollectionsWithCounts(collectionsWithCountsArray);
    } catch (error) {
      console.error('Error loading collection counts:', error);
      // Fallback to 0 counts
      setCollectionsWithCounts(collectionNames.map(name => ({ name, count: 0 })));
    }
  };

  const addCollection = async (name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName || collections.includes(trimmedName)) {
      return;
    }

    try {
      // Add to local state immediately for UI responsiveness
      setCollections(prev => [...prev, trimmedName].sort());
      
      // Add to collections with counts (new collections start with 0 count)
      setCollectionsWithCounts(prev => [...prev, { name: trimmedName, count: 0 }].sort((a, b) => a.name.localeCompare(b.name)));

      // Try to insert into collections table
      // If that fails, fall back to localStorage for persistence
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { error: insertError } = await supabase
            .from('collections')
            .insert({
              user_id: user.id,
              name: trimmedName
            });

          if (!insertError) {
            // Successfully saved to database, also save to localStorage as backup
            const storedCollections = JSON.parse(localStorage.getItem('promptlog_collections') || '[]');
            const updatedCollections = [...new Set([...storedCollections, trimmedName])].sort();
            localStorage.setItem('promptlog_collections', JSON.stringify(updatedCollections));
            return; // Success, exit early
          }
        }

        // If we get here, database insert failed or user not authenticated
        console.warn('Database insert failed, using localStorage');
        const storedCollections = JSON.parse(localStorage.getItem('promptlog_collections') || '[]');
        const updatedCollections = [...new Set([...storedCollections, trimmedName])].sort();
        localStorage.setItem('promptlog_collections', JSON.stringify(updatedCollections));
        
      } catch (tableError) {
        // Table doesn't exist or other error, use localStorage
        console.warn('Collections table not available, using localStorage:', tableError);
        const storedCollections = JSON.parse(localStorage.getItem('promptlog_collections') || '[]');
        const updatedCollections = [...new Set([...storedCollections, trimmedName])].sort();
        localStorage.setItem('promptlog_collections', JSON.stringify(updatedCollections));
      }

    } catch (error) {
      console.error('Error adding collection:', error);
      // Revert the local state change if there was an error
      setCollections(prev => prev.filter(c => c !== trimmedName));
    }
  };

  const renameCollection = async (oldName: string, newName: string) => {
    const trimmedNewName = newName.trim();
    if (!trimmedNewName || trimmedNewName === oldName || collections.includes(trimmedNewName)) {
      return;
    }

    try {
      // Update local state immediately for UI responsiveness
      setCollections(prev => prev.map(name => name === oldName ? trimmedNewName : name).sort());
      setCollectionsWithCounts(prev => 
        prev.map(item => item.name === oldName ? { ...item, name: trimmedNewName } : item)
          .sort((a, b) => a.name.localeCompare(b.name))
      );

      // Update in database - rename collection in collections table and prompt_logs
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Update collections table
        const { error: collectionsError } = await supabase
          .from('collections')
          .update({ name: trimmedNewName })
          .eq('user_id', user.id)
          .eq('name', oldName);

        // Update prompt_logs table
        const { error: promptsError } = await supabase
          .from('prompt_logs')
          .update({ collection: trimmedNewName })
          .eq('user_id', user.id)
          .eq('collection', oldName);

        if (collectionsError || promptsError) {
          console.error('Error renaming collection:', collectionsError || promptsError);
          // Revert local state if database update failed
          setCollections(prev => prev.map(name => name === trimmedNewName ? oldName : name).sort());
          setCollectionsWithCounts(prev => 
            prev.map(item => item.name === trimmedNewName ? { ...item, name: oldName } : item)
              .sort((a, b) => a.name.localeCompare(b.name))
          );
        } else {
          // Update localStorage backup
          const storedCollections = JSON.parse(localStorage.getItem('promptlog_collections') || '[]');
          const updatedCollections = storedCollections.map((name: string) => name === oldName ? trimmedNewName : name);
          localStorage.setItem('promptlog_collections', JSON.stringify(updatedCollections));
        }
      }
    } catch (error) {
      console.error('Error renaming collection:', error);
      // Revert local state changes
      setCollections(prev => prev.map(name => name === trimmedNewName ? oldName : name).sort());
      setCollectionsWithCounts(prev => 
        prev.map(item => item.name === trimmedNewName ? { ...item, name: oldName } : item)
          .sort((a, b) => a.name.localeCompare(b.name))
      );
    }
  };

  const removeCollection = async (name: string) => {
    try {
      // Update local state immediately for UI responsiveness
      setCollections(prev => prev.filter(collectionName => collectionName !== name));
      setCollectionsWithCounts(prev => prev.filter(item => item.name !== name));

      // Update in database
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Remove from collections table
        const { error: collectionsError } = await supabase
          .from('collections')
          .delete()
          .eq('user_id', user.id)
          .eq('name', name);

        // Update prompt_logs table - set collection to null instead of deleting prompts
        const { error: promptsError } = await supabase
          .from('prompt_logs')
          .update({ collection: null })
          .eq('user_id', user.id)
          .eq('collection', name);

        if (collectionsError || promptsError) {
          console.error('Error removing collection:', collectionsError || promptsError);
          // Revert local state if database update failed
          setCollections(prev => [...prev, name].sort());
          // Note: We'd need to re-fetch the count for proper reversion, but this is a fallback
          setCollectionsWithCounts(prev => [...prev, { name, count: 0 }].sort((a, b) => a.name.localeCompare(b.name)));
        } else {
          // Update localStorage backup
          const storedCollections = JSON.parse(localStorage.getItem('promptlog_collections') || '[]');
          const updatedCollections = storedCollections.filter((collectionName: string) => collectionName !== name);
          localStorage.setItem('promptlog_collections', JSON.stringify(updatedCollections));
        }
      }
    } catch (error) {
      console.error('Error removing collection:', error);
      // Revert local state changes
      setCollections(prev => [...prev, name].sort());
      setCollectionsWithCounts(prev => [...prev, { name, count: 0 }].sort((a, b) => a.name.localeCompare(b.name)));
    }
  };

  return (
    <CollectionsContext.Provider value={{ collections, collectionsWithCounts, addCollection, renameCollection, removeCollection, loading }}>
      {children}
    </CollectionsContext.Provider>
  );
};
