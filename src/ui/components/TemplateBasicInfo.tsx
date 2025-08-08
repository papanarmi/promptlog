"use client";
/*
 * Documentation:
 * Template Basic Info — https://app.subframe.com/ace97b1b228a/library?component=Template+Basic+Info_9018eb1e-9349-4521-91a3-c476b2a7064f
 * Tooltip — https://app.subframe.com/ace97b1b228a/library?component=Tooltip_ccebd1e9-f6ac-4737-8376-0dfacd90c9f3
 * Text Field — https://app.subframe.com/ace97b1b228a/library?component=Text+Field_be48ca43-f8e7-4c0e-8870-d219ea11abfe
 * Text Area — https://app.subframe.com/ace97b1b228a/library?component=Text+Area_4ec05ee8-8f1c-46b2-b863-5419aa7f5cce
 */

import React from "react";
import * as SubframeUtils from "../utils";
import * as SubframeCore from "@subframe/core";
import { FeatherInfo } from "@subframe/core";
import { FeatherLightbulb } from "@subframe/core";
import { Tooltip } from "./Tooltip";
import { TextField } from "./TextField";
import { TextArea } from "./TextArea";

interface TemplateBasicInfoRootProps
  extends React.HTMLAttributes<HTMLDivElement> {
  text?: React.ReactNode;
  text2?: React.ReactNode;
  icon?: React.ReactNode;
  text3?: React.ReactNode;
  text4?: React.ReactNode;
  text5?: React.ReactNode;
  icon2?: React.ReactNode;
  icon3?: React.ReactNode;
  text6?: React.ReactNode;
  text7?: React.ReactNode;
  text8?: React.ReactNode;
  className?: string;
  // Controlled values and handlers (optional)
  titleValue?: string;
  descriptionValue?: string;
  promptValue?: string;
  readOnly?: boolean;
  onChangeTitle?: (value: string) => void;
  onChangeDescription?: (value: string) => void;
  onChangePrompt?: (value: string) => void;
}

const TemplateBasicInfoRoot = React.forwardRef<
  HTMLDivElement,
  TemplateBasicInfoRootProps
>(function TemplateBasicInfoRoot(
  {
    text,
    text2,
    icon = <FeatherInfo />,
    text3,
    text4,
    text5,
    icon2 = <FeatherInfo />,
    icon3 = <FeatherLightbulb />,
    text6,
    text7,
    text8,
    className,
    titleValue,
    descriptionValue,
    promptValue,
    readOnly = false,
    onChangeTitle,
    onChangeDescription,
    onChangePrompt,
    ...otherProps
  }: TemplateBasicInfoRootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "flex w-full flex-col items-start rounded-lg border border-solid border-neutral-border bg-default-background shadow-sm",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <div className="flex w-full items-center gap-2 rounded-t-[8px] border-b border-solid border-neutral-border bg-neutral-50 px-6 py-4">
        {text ? (
          <span className="text-heading-3 font-heading-3 text-default-font">
            {text}
          </span>
        ) : null}
      </div>
      <div className="flex w-full flex-col items-start gap-6 px-6 py-6">
        <div className="flex w-full flex-col items-start gap-2">
          <div className="flex w-full items-center gap-2">
            {text2 ? (
              <span className="text-body-bold font-body-bold text-default-font">
                {text2}
              </span>
            ) : null}
            {icon ? (
              <SubframeCore.Tooltip.Provider>
                <SubframeCore.Tooltip.Root>
                  <SubframeCore.Tooltip.Trigger asChild={true}>
                    <SubframeCore.IconWrapper className="text-body font-body text-neutral-400">
                      {icon}
                    </SubframeCore.IconWrapper>
                  </SubframeCore.Tooltip.Trigger>
                  <SubframeCore.Tooltip.Portal>
                    <SubframeCore.Tooltip.Content
                      side="top"
                      align="center"
                      sideOffset={4}
                      asChild={true}
                    >
                      <Tooltip>Clear, short label for your prompt</Tooltip>
                    </SubframeCore.Tooltip.Content>
                  </SubframeCore.Tooltip.Portal>
                </SubframeCore.Tooltip.Root>
              </SubframeCore.Tooltip.Provider>
            ) : null}
          </div>
          <TextField className={SubframeUtils.twClassNames("h-auto w-full flex-none", readOnly ? "pointer-events-none select-none" : undefined)} label="" helpText="" variant={readOnly ? "filled" : "outline"}>
            <TextField.Input
              placeholder="Enter a title..."
              value={titleValue}
              onChange={(e) => onChangeTitle?.(e.target.value)}
              readOnly={readOnly}
              className={readOnly ? "opacity-70 pointer-events-none select-none" : undefined}
              tabIndex={readOnly ? -1 : 0}
            />
          </TextField>
        </div>
        <div className="flex w-full flex-col items-start gap-2">
          <div className="flex w-full items-center gap-2">
            {text3 ? (
              <span className="text-body-bold font-body-bold text-default-font">
                {text3}
              </span>
            ) : null}
            {text4 ? (
              <span className="text-caption font-caption text-subtext-color">
                {text4}
              </span>
            ) : null}
          </div>
          <TextArea className={SubframeUtils.twClassNames("h-auto w-full flex-none", readOnly ? "pointer-events-none select-none" : undefined)} label="" helpText="" variant={readOnly ? "filled" : "outline"}>
            <TextArea.Input
              className="h-auto min-h-[64px] w-full flex-none opacity-70 pointer-events-none select-none"
              placeholder="Add context about this prompt..."
              value={descriptionValue}
              onChange={(e) => onChangeDescription?.(e.target.value)}
              readOnly={readOnly}
              tabIndex={readOnly ? -1 : 0}
            />
          </TextArea>
        </div>
        <div className="flex w-full flex-col items-start gap-2">
          <div className="flex w-full items-center gap-2">
            {text5 ? (
              <span className="text-body-bold font-body-bold text-default-font">
                {text5}
              </span>
            ) : null}
            {icon2 ? (
              <SubframeCore.Tooltip.Provider>
                <SubframeCore.Tooltip.Root>
                  <SubframeCore.Tooltip.Trigger asChild={true}>
                    <SubframeCore.IconWrapper className="text-body font-body text-neutral-400">
                      {icon2}
                    </SubframeCore.IconWrapper>
                  </SubframeCore.Tooltip.Trigger>
                  <SubframeCore.Tooltip.Portal>
                    <SubframeCore.Tooltip.Content
                      side="top"
                      align="center"
                      sideOffset={4}
                      asChild={true}
                    >
                      <Tooltip>
                        Use [[variable]] for dynamic content, e.g.
                        [[transcript]]
                      </Tooltip>
                    </SubframeCore.Tooltip.Content>
                  </SubframeCore.Tooltip.Portal>
                </SubframeCore.Tooltip.Root>
              </SubframeCore.Tooltip.Provider>
            ) : null}
          </div>
          <TextArea className={SubframeUtils.twClassNames("h-auto w-full flex-none", readOnly ? "pointer-events-none select-none" : undefined)} label="" helpText="" variant={readOnly ? "filled" : "outline"}>
            <TextArea.Input
              className="h-auto min-h-[256px] w-full flex-none opacity-70 pointer-events-none select-none"
              placeholder="Write your prompt..."
              value={promptValue}
              onChange={(e) => onChangePrompt?.(e.target.value)}
              readOnly={readOnly}
              tabIndex={readOnly ? -1 : 0}
            />
          </TextArea>
          {/* Optional helper card; hide in view-only drawer */}
          <div className="hidden">
            <div className="flex items-center gap-1">
              {icon3 ? (
                <SubframeCore.IconWrapper className="text-heading-3 font-heading-3 text-brand-700">
                  {icon3}
                </SubframeCore.IconWrapper>
              ) : null}
              {text6 ? (
                <span className="text-body-bold font-body-bold text-brand-700">
                  {text6}
                </span>
              ) : null}
            </div>
            <div className="flex flex-col items-start gap-2">
              {text7 ? (
                <span className="text-body font-body text-default-font">
                  {text7}
                </span>
              ) : null}
              {text8 ? (
                <span className="text-body-bold font-body-bold text-subtext-color">
                  {text8}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export const TemplateBasicInfo = TemplateBasicInfoRoot;
