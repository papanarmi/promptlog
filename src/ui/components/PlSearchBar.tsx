"use client";
/*
 * Documentation:
 * PL search bar — https://app.subframe.com/ace97b1b228a/library?component=PL+search+bar_b72b414d-7419-492a-8695-23e7fae25189
 * Text Field — https://app.subframe.com/ace97b1b228a/library?component=Text+Field_be48ca43-f8e7-4c0e-8870-d219ea11abfe
 * Button — https://app.subframe.com/ace97b1b228a/library?component=Button_3b777358-b86b-40af-9327-891efc6826fe
 */

import React from "react";
import * as SubframeUtils from "../utils";
import { TextField } from "./TextField";
import { FeatherSearch } from "@subframe/core";
import { Button } from "./Button";
import { FeatherSortDesc } from "@subframe/core";
import { FeatherListFilter } from "@subframe/core";

interface PlSearchBarRootProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const PlSearchBarRoot = React.forwardRef<HTMLDivElement, PlSearchBarRootProps>(
  function PlSearchBarRoot(
    { className, ...otherProps }: PlSearchBarRootProps,
    ref
  ) {
    return (
      <div
        className={SubframeUtils.twClassNames(
          "flex w-full items-center gap-2",
          className
        )}
        ref={ref}
        {...otherProps}
      >
        <TextField
          className="h-auto grow shrink-0 basis-0"
          variant="filled"
          label=""
          helpText=""
          icon={<FeatherSearch />}
        >
          <TextField.Input placeholder="Search prompts..." />
        </TextField>
        <div className="flex items-center gap-1">
          <Button variant="neutral-tertiary" icon={<FeatherSortDesc />}>
            Sort
          </Button>
          <Button variant="brand-tertiary" icon={<FeatherListFilter />}>
            Filter
          </Button>
        </div>
      </div>
    );
  }
);

export const PlSearchBar = PlSearchBarRoot;
