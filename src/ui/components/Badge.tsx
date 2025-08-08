"use client";
/*
 * Documentation:
 * Badge — https://app.subframe.com/ace97b1b228a/library?component=Badge_97bdb082-1124-4dd7-a335-b14b822d0157
 */

import React from "react";
import * as SubframeUtils from "../utils";
import * as SubframeCore from "@subframe/core";
import { FeatherPlus } from "@subframe/core";
import { FeatherFolder } from "@subframe/core";

interface BadgeRootProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "brand"
    | "neutral"
    | "error"
    | "warning"
    | "success"
    | "variation"
    | "variation-2";
  icon?: React.ReactNode;
  children?: React.ReactNode;
  iconRight?: React.ReactNode;
  className?: string;
}

const BadgeRoot = React.forwardRef<HTMLDivElement, BadgeRootProps>(
  function BadgeRoot(
    {
      variant = "brand",
      icon = null,
      children,
      iconRight = null,
      className,
      ...otherProps
    }: BadgeRootProps,
    ref
  ) {
    return (
      <div
        className={SubframeUtils.twClassNames(
          "group/97bdb082 flex h-6 items-center gap-1 rounded-md border border-solid border-brand-100 bg-brand-100 px-2",
          {
            "h-auto w-auto rounded-full border border-dashed border-subtext-color bg-transparent px-2 py-1":
              variant === "variation-2",
            "h-auto w-auto rounded-full border border-dashed border-[#d7a604ff] bg-transparent px-2 py-1":
              variant === "variation",
            "rounded-md border border-solid border-success-100 bg-success-100":
              variant === "success",
            "border border-solid border-warning-100 bg-warning-100":
              variant === "warning",
            "border border-solid border-error-100 bg-error-100":
              variant === "error",
            "border border-solid border-neutral-100 bg-neutral-100":
              variant === "neutral",
          },
          className
        )}
        ref={ref}
        {...otherProps}
      >
        {variant === "variation" && (
          <FeatherFolder
            className={SubframeUtils.twClassNames(
              "hidden text-body font-body text-[#d7a604ff]",
              { "inline-flex": true }
            )}
          />
        )}
        {variant === "variation" && (
          <FeatherPlus
            className={SubframeUtils.twClassNames(
              "hidden text-body font-body text-[#d7a604ff]",
              { "inline-flex": true }
            )}
          />
        )}
        <FeatherPlus className="hidden text-body font-body text-[#8c271eff]" />
        {variant === "variation-2" && (
          <FeatherFolder
            className={SubframeUtils.twClassNames(
              "hidden text-body font-body text-subtext-color",
              { "inline-flex": true }
            )}
          />
        )}
        {variant === "variation-2" && (
          <FeatherPlus
            className={SubframeUtils.twClassNames(
              "hidden text-body font-body text-subtext-color",
              { "inline-flex": true }
            )}
          />
        )}
        {icon ? (
          <SubframeCore.IconWrapper
            className={SubframeUtils.twClassNames(
              "text-caption font-caption text-brand-700",
              {
                "text-success-800": variant === "success",
                "text-warning-800": variant === "warning",
                "text-error-700": variant === "error",
                "text-neutral-700": variant === "neutral",
              }
            )}
          >
            {icon}
          </SubframeCore.IconWrapper>
        ) : null}
        <span
          className={SubframeUtils.twClassNames(
            "whitespace-nowrap text-caption font-caption text-brand-800",
            {
              "text-caption-bold font-caption-bold text-subtext-color":
                variant === "variation-2",
              "text-caption-bold font-caption-bold text-[#d7a604ff]":
                variant === "variation",
              "text-success-800": variant === "success",
              "text-warning-800": variant === "warning",
              "text-error-800": variant === "error",
              "text-neutral-700": variant === "neutral",
            }
          )}
        >
          {variant === "variation-2" ? "None" : "Collection"}
        </span>
        {iconRight ? (
          <SubframeCore.IconWrapper
            className={SubframeUtils.twClassNames(
              "text-caption font-caption text-brand-700",
              {
                "text-success-800": variant === "success",
                "text-warning-800": variant === "warning",
                "text-error-700": variant === "error",
                "text-neutral-700": variant === "neutral",
              }
            )}
          >
            {iconRight}
          </SubframeCore.IconWrapper>
        ) : null}
      </div>
    );
  }
);

export const Badge = BadgeRoot;
