"use client";
/*
 * Documentation:
 * Stats — https://app.subframe.com/ace97b1b228a/library?component=Stats_8b180621-4edd-45bb-9c1e-b6f6c6e9b12d
 */

import React from "react";
import * as SubframeUtils from "../utils";

interface StatsRootProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: React.ReactNode;
  text2?: React.ReactNode;
  text3?: React.ReactNode;
  text4?: React.ReactNode;
  text5?: React.ReactNode;
  text6?: React.ReactNode;
  className?: string;
}

const StatsRoot = React.forwardRef<HTMLDivElement, StatsRootProps>(
  function StatsRoot(
    {
      text,
      text2,
      text3,
      text4,
      text5,
      text6,
      className,
      ...otherProps
    }: StatsRootProps,
    ref
  ) {
    return (
      <div
        className={SubframeUtils.twClassNames(
          "flex w-full flex-wrap items-start gap-4",
          className
        )}
        ref={ref}
        {...otherProps}
      >
        <div className="flex grow shrink-0 basis-0 flex-col items-start gap-2 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6 shadow-sm">
          {text ? (
            <span className="line-clamp-1 w-full text-body-bold font-body-bold text-subtext-color">
              {text}
            </span>
          ) : null}
          {text2 ? (
            <span className="w-full text-heading-1 font-heading-1 text-default-font">
              {text2}
            </span>
          ) : null}
        </div>
        <div className="flex grow shrink-0 basis-0 flex-col items-start gap-2 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6 shadow-sm">
          {text3 ? (
            <span className="line-clamp-1 w-full text-body-bold font-body-bold text-subtext-color">
              {text3}
            </span>
          ) : null}
          {text4 ? (
            <span className="w-full text-heading-1 font-heading-1 text-default-font">
              {text4}
            </span>
          ) : null}
        </div>
        <div className="flex grow shrink-0 basis-0 flex-col items-start gap-2 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6 shadow-sm">
          {text5 ? (
            <span className="line-clamp-1 w-full text-body-bold font-body-bold text-subtext-color">
              {text5}
            </span>
          ) : null}
          {text6 ? (
            <span className="w-full text-heading-1 font-heading-1 text-default-font">
              {text6}
            </span>
          ) : null}
        </div>
      </div>
    );
  }
);

export const Stats = StatsRoot;
