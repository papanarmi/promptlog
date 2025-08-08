"use client";
/*
 * Documentation:
 * Feed — https://app.subframe.com/ace97b1b228a/library?component=Feed_1d0bc549-4078-44f8-a312-988c8e47bdd9
 * Prompt card — https://app.subframe.com/ace97b1b228a/library?component=Prompt+card_8f873461-8555-4a52-8062-9b27510c91d6
 */

import React from "react";
import * as SubframeUtils from "../utils";
import { PromptCard } from "./PromptCard";

interface FeedRootProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: React.ReactNode;
  text2?: React.ReactNode;
  overview?: boolean;
  className?: string;
}

const FeedRoot = React.forwardRef<HTMLDivElement, FeedRootProps>(
  function FeedRoot(
    { text, text2, overview = false, className, ...otherProps }: FeedRootProps,
    ref
  ) {
    return (
      <div
        className={SubframeUtils.twClassNames(
          "group/1d0bc549 flex h-full w-full flex-col items-center gap-6",
          className
        )}
        ref={ref}
        {...otherProps}
      >
        <div className="flex w-full flex-col items-start gap-4">
          {text ? (
            <span className="text-heading-3 font-heading-3 text-subtext-color">
              {text}
            </span>
          ) : null}
          <PromptCard
            text="2 hours ago"
            text2="Explain quantum computing in simple terms"
            boolean={overview ? true : undefined}
            body="Copy template"
          />
          <PromptCard
            text="2 hours ago"
            text2="Explain quantum computing in simple terms"
            boolean={overview ? true : undefined}
            body="Copy template"
          />
        </div>
        <div className="flex w-full flex-col items-start gap-4">
          {text2 ? (
            <span className="text-heading-3 font-heading-3 text-subtext-color">
              {text2}
            </span>
          ) : null}
          <PromptCard
            text="2 hours ago"
            text2="Explain quantum computing in simple terms"
            boolean={overview ? true : undefined}
            body="Copy template"
          />
          <PromptCard
            text="2 hours ago"
            text2="Explain quantum computing in simple terms"
            boolean={overview ? true : undefined}
            body="Copy template"
          />
        </div>
      </div>
    );
  }
);

export const Feed = FeedRoot;
