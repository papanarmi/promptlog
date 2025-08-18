"use client";

import React, { useEffect, useState } from "react";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import { IconButton } from "@/ui/components/IconButton";
import { useLocation, useNavigate } from "react-router-dom";
import { FeatherDownload } from "@subframe/core";
import { Button } from "@/ui/components/Button";
import { FeatherSparkle } from "@subframe/core";
import { Stats } from "@/ui/components/Stats";
import { CustomComponent } from "@/ui/components/CustomComponent";
import { FeatherFolder } from "@subframe/core";
import { FeatherTag } from "@subframe/core";
import { Feed } from "@/ui/components/Feed";
import { FeatherChevronLeft } from "@subframe/core";
import { FeatherChevronRight } from "@subframe/core";
import { supabase } from "@/lib/supabaseClient";
import { useCollections } from "@/lib/collectionsContext";
import { useSearch, Template } from "@/lib/searchContext";
import { DropdownMenu } from "@/ui/components/DropdownMenu";
import * as SubframeCore from "@subframe/core";

function PromptLogOverview() {
  const [promptCount, setPromptCount] = useState<number | null>(null);
  const [favoriteCount, setFavoriteCount] = useState<number | null>(null);
  const [templateCount, setTemplateCount] = useState<number | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [total, setTotal] = useState(0);
  const endIndex = Math.min(page * pageSize, Math.max(total, 0));
  const { collections, collectionsWithCounts, addCollection, renameCollection, removeCollection } = useCollections();
  const { searchQuery, performFuzzySearch, applySorting, getSortDirection } = useSearch();

  useEffect(() => {
    const refreshCounts = async () => {
      const [allRes, favRes] = await Promise.all([
        supabase.from('prompt_logs').select('*', { count: 'exact', head: true }),
        supabase.from('prompt_logs').select('*', { count: 'exact', head: true }).contains('tags', ['favorite']),
      ]);
      if (!('error' in allRes) || !allRes.error) setPromptCount(allRes.count ?? 0);
      if (!('error' in favRes) || !favRes.error) setFavoriteCount(favRes.count ?? 0);
      setTemplateCount(allRes.count ?? 0);
    };
    refreshCounts();
    const onAnyChange = () => { refreshCounts(); };
    window.addEventListener('template-created', onAnyChange);
    window.addEventListener('template-updated', onAnyChange);
    window.addEventListener('template-removed', onAnyChange);
    window.addEventListener('template-soft-refresh', onAnyChange as EventListener);
    return () => {
      window.removeEventListener('template-created', onAnyChange);
      window.removeEventListener('template-updated', onAnyChange);
      window.removeEventListener('template-removed', onAnyChange);
      window.removeEventListener('template-soft-refresh', onAnyChange as EventListener);
    };
  }, []);

  // Reset to first page on path change
  useEffect(() => { setPage(1) }, [location.pathname]);

  const handleAddCollection = (name: string) => {
    addCollection(name);
  };

  // Download functionality
  const downloadAsJSON = (data: Template[]) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `promptlog-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadAsCSV = (data: Template[]) => {
    const headers = ['ID', 'Created At', 'Title', 'Content', 'Collection', 'Tags'];
    const csvContent = [
      headers.join(','),
      ...data.map(item => [
        `"${item.id}"`,
        `"${item.created_at}"`,
        `"${(item.title || '').replace(/"/g, '""')}"`,
        `"${(item.content || '').replace(/"/g, '""')}"`,
        `"${(item.collection || '').replace(/"/g, '""')}"`,
        `"${Array.isArray(item.tags) ? item.tags.join('; ') : ''}"`
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `promptlog-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadAsTXT = (data: Template[]) => {
    const textContent = data.map(item => {
      const tags = Array.isArray(item.tags) ? item.tags.join(', ') : '';
      return [
        `Title: ${item.title || 'Untitled'}`,
        `Created: ${new Date(item.created_at).toLocaleString()}`,
        `Collection: ${item.collection || 'None'}`,
        `Tags: ${tags}`,
        `Content:`,
        item.content || '',
        '---'
      ].join('\n');
    }).join('\n\n');
    
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `promptlog-export-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownload = async (format: 'json' | 'csv' | 'txt') => {
    try {
      // Fetch the current data using the same logic as the Feed component
      const ascendingCreated = getSortDirection('created_at') === 'asc';
      let dataToDownload: Template[] = [];

      if (searchQuery.trim()) {
        // When searching, fetch all data and apply filters
        const { data, error } = await supabase
          .from('prompt_logs')
          .select('id, created_at, title, content, collection, tags')
          .order('created_at', { ascending: ascendingCreated })
          .limit(1000); // Same limit as Feed component
        
        if (!error && data) {
          // Apply fuzzy search and sorting like Feed component does
          let result = performFuzzySearch(searchQuery, data);
          result = applySorting(result);
          dataToDownload = result;
        }
      } else {
        // When not searching, fetch all data (not just current page)
        const { data, error } = await supabase
          .from('prompt_logs')
          .select('id, created_at, title, content, collection, tags')
          .order('created_at', { ascending: ascendingCreated });
        
        if (!error && data) {
          dataToDownload = applySorting(data);
        }
      }
      
      if (dataToDownload.length === 0) {
        alert('No data to download. Please ensure there are prompts in the database.');
        return;
      }

      switch (format) {
        case 'json':
          downloadAsJSON(dataToDownload);
          break;
        case 'csv':
          downloadAsCSV(dataToDownload);
          break;
        case 'txt':
          downloadAsTXT(dataToDownload);
          break;
      }
    } catch (error) {
      console.error('Error downloading data:', error);
      alert('Failed to download data. Please try again.');
    }
  };

  return (
    <DefaultPageLayout>
      <div className="container max-w-none flex h-full w-full flex-col items-start">
        <div className="flex w-full grow shrink-0 basis-0 flex-col items-center gap-4 bg-default-background px-12 py-16 overflow-auto">
          <div className="flex w-full max-w-[1280px] grow shrink-0 basis-0 flex-col items-start gap-8">
            <div className="flex w-full items-center justify-between">
              <span className="text-heading-1 font-heading-1 text-default-font">
                Dashboard
              </span>
              <div className="flex items-center gap-2">
                <SubframeCore.DropdownMenu.Root>
                  <SubframeCore.DropdownMenu.Trigger asChild={true}>
                    <IconButton
                      icon={<FeatherDownload />}
                    />
                  </SubframeCore.DropdownMenu.Trigger>
                  <SubframeCore.DropdownMenu.Portal>
                    <SubframeCore.DropdownMenu.Content
                      side="bottom"
                      align="end"
                      sideOffset={4}
                      asChild={true}
                    >
                      <DropdownMenu>
                        <DropdownMenu.DropdownItem onClick={() => handleDownload('json')}>
                          Download as JSON
                        </DropdownMenu.DropdownItem>
                        <DropdownMenu.DropdownItem onClick={() => handleDownload('csv')}>
                          Download as CSV
                        </DropdownMenu.DropdownItem>
                        <DropdownMenu.DropdownItem onClick={() => handleDownload('txt')}>
                          Download as TXT
                        </DropdownMenu.DropdownItem>
                      </DropdownMenu>
                    </SubframeCore.DropdownMenu.Content>
                  </SubframeCore.DropdownMenu.Portal>
                </SubframeCore.DropdownMenu.Root>

                <Button icon={<FeatherSparkle />} onClick={() => navigate('/templates/new')}>
                  Create a blank template
                </Button>
              </div>
            </div>
            <Stats
              text="Total prompts"
              text2={promptCount === null ? "…" : String(promptCount)}
              text3="Favorite prompts"
              text4={favoriteCount === null ? "…" : String(favoriteCount)}
              text5="Templates"
              text6={templateCount === null ? "…" : String(templateCount)}
            />
            <div className="flex w-full grow shrink-0 basis-0 items-start gap-8">
              <CustomComponent
                icon={<FeatherFolder />}
                text="Collections"
                collections={collections}
                collectionsWithCounts={collectionsWithCounts}
                onCollectionAdd={handleAddCollection}
                onCollectionRename={renameCollection}
                onCollectionRemove={removeCollection}
                icon2={<FeatherTag />}
                text12="Tags"
                text13="Brainstorming"
                text14="15"
                text15="Copywriting"
                text16="15"
                text17="Email"
                text18="15"
                text19="Research"
                text20="15"

              />
              <div className="flex grow shrink-0 basis-0 flex-col items-start gap-6 self-stretch">
                <Feed 
                  text="Today" 
                  text2="Yesterday" 
                  kind="template" 
                  overview={true} 
                  page={page} 
                  pageSize={pageSize} 
                  onCount={setTotal}
                />
                <div className="flex w-full items-center justify-center gap-4">
                  <span className="grow shrink-0 basis-0 text-body font-body text-subtext-color">
                    {total > 0
                      ? `Showing ${(page - 1) * pageSize + 1} – ${endIndex} of ${total}`
                      : `Showing 0 – 0 of 0`}
                  </span>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="brand-tertiary"
                      icon={<FeatherChevronLeft />}
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Prev
                    </Button>
                    <Button
                      variant="brand-tertiary"
                      iconRight={<FeatherChevronRight />}
                      disabled={endIndex >= total}
                      onClick={() => setPage((p) => (endIndex >= total ? p : p + 1))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultPageLayout>
  );
}

export default PromptLogOverview;
