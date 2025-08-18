"use client";
/*
 * Documentation:
 * PL search bar — https://app.subframe.com/ace97b1b228a/library?component=PL+search+bar_b72b414d-7419-492a-8695-23e7fae25189
 * Text Field — https://app.subframe.com/ace97b1b228a/library?component=Text+Field_be48ca43-f8e7-4c0e-8870-d219ea11abfe
 * Button — https://app.subframe.com/ace97b1b228a/library?component=Button_3b777358-b86b-40af-9327-891efc6826fe
 */

import React, { useEffect, useState } from "react";
import * as SubframeUtils from "../utils";
import * as SubframeCore from "@subframe/core";
import { TextField } from "./TextField";
import { FeatherSearch } from "@subframe/core";
import { FeatherX } from "@subframe/core";
import { useSearch } from "@/lib/searchContext";
import { IconButton } from "./IconButton";

interface PlSearchBarRootProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  compact?: boolean;
}

const PlSearchBarRoot = React.forwardRef<HTMLDivElement, PlSearchBarRootProps>(
  function PlSearchBarRoot(
    { className, compact = false, ...otherProps }: PlSearchBarRootProps,
    ref
  ) {
    const { searchQuery, setSearchQuery } = useSearch();
    const [localSearchValue, setLocalSearchValue] = useState(searchQuery);

    // Debounce search input
    useEffect(() => {
      const timer = setTimeout(() => {
        setSearchQuery(localSearchValue);
      }, 300); // 300ms debounce

      return () => clearTimeout(timer);
    }, [localSearchValue, setSearchQuery]);

    // Sync with external search query changes
    useEffect(() => {
      setLocalSearchValue(searchQuery);
    }, [searchQuery]);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setLocalSearchValue(event.target.value);
    };

    const handleSearchClear = () => {
      setLocalSearchValue('');
      setSearchQuery('');
    };

    if (compact) {
      return (
        <div
          className={SubframeUtils.twClassNames(
            "flex w-full items-center",
            className
          )}
          ref={ref}
          {...otherProps}
        >
          <div className="flex h-8 w-full flex-none items-center gap-1 rounded-md border border-solid px-2 bg-transparent text-white placeholder:text-neutral-400 focus-within:border-brand-primary"
               style={{ borderColor: '#3D3D3D' }}>
            <SubframeCore.IconWrapper className="text-body font-body text-neutral-400">
              <FeatherSearch />
            </SubframeCore.IconWrapper>
            <input
              className="h-full w-full border-none bg-transparent text-body font-body text-white outline-none placeholder:text-neutral-400"
              placeholder="Search prompts, tags, collections..."
              value={localSearchValue}
              onChange={handleSearchChange}
            />
            {localSearchValue ? (
              <IconButton
                size="small"
                variant="neutral-tertiary"
                icon={<FeatherX />}
                onClick={handleSearchClear}
              />
            ) : null}
          </div>
        </div>
      );
    }

    return (
      <div
        className={SubframeUtils.twClassNames(
          "flex w-full flex-col gap-4",
          className
        )}
        ref={ref}
        {...otherProps}
      >
        <div className="flex w-full items-center">
          <TextField
            className="h-auto w-full"
            variant="filled"
            label=""
            helpText=""
            icon={<FeatherSearch />}
            iconRight={
              localSearchValue ? (
                <IconButton
                  size="small"
                  variant="neutral-tertiary"
                  icon={<FeatherX />}
                  onClick={handleSearchClear}
                />
              ) : null
            }
          >
            <TextField.Input 
              placeholder="Search prompts, tags, collections..." 
              value={localSearchValue}
              onChange={handleSearchChange}
            />
          </TextField>

        </div>

      </div>
    );
  }
);

export const PlSearchBar = PlSearchBarRoot;
