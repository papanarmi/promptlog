"use client";
/*
 * Documentation:
 * Template additional details — https://app.subframe.com/ace97b1b228a/library?component=Template+additional+details_4cff3e0e-1611-41d8-b40b-0d8e39c19e7b
 * Text Field — https://app.subframe.com/ace97b1b228a/library?component=Text+Field_be48ca43-f8e7-4c0e-8870-d219ea11abfe
 * Badge — https://app.subframe.com/ace97b1b228a/library?component=Badge_97bdb082-1124-4dd7-a335-b14b822d0157
 * Button — https://app.subframe.com/ace97b1b228a/library?component=Button_3b777358-b86b-40af-9327-891efc6826fe
 * Text Area — https://app.subframe.com/ace97b1b228a/library?component=Text+Area_4ec05ee8-8f1c-46b2-b863-5419aa7f5cce
 */

import React from "react";
import * as SubframeUtils from "../utils";
import { FeatherInfo } from "@subframe/core";
import { TextField } from "./TextField";
import { FeatherFolder } from "@subframe/core";
import { FeatherChevronDown } from "@subframe/core";
import { Badge } from "./Badge";
import { FeatherTag } from "@subframe/core";
import { Button } from "./Button";
import { FeatherPlus } from "@subframe/core";
import { TextArea } from "./TextArea";

interface TemplateAdditionalDetailsRootProps
  extends React.HTMLAttributes<HTMLDivElement> {
  text?: React.ReactNode;
  text2?: React.ReactNode;
  text3?: React.ReactNode;
  text4?: React.ReactNode;
  text5?: React.ReactNode;
  className?: string;
  collectionValue?: string;
  tagsValue?: string[];
  readOnly?: boolean;
  onChangeCollection?: (value: string) => void;
  onChangeTags?: (tags: string[]) => void;
}

const TemplateAdditionalDetailsRoot = React.forwardRef<
  HTMLDivElement,
  TemplateAdditionalDetailsRootProps
>(function TemplateAdditionalDetailsRoot(
  {
    text,
    text2,
    text3,
    text4,
    text5,
    className,
    collectionValue,
    tagsValue,
    readOnly = false,
    onChangeCollection,
    onChangeTags,
    ...otherProps
  }: TemplateAdditionalDetailsRootProps,
  ref
) {
  const [tagDraft, setTagDraft] = React.useState("");

  const handleAddTag = () => {
    const t = tagDraft.trim();
    if (!t) return;
    const next = Array.from(new Set([...(tagsValue || []), t]));
    onChangeTags?.(next);
    setTagDraft("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const next = (tagsValue || []).filter((t) => t !== tagToRemove);
    onChangeTags?.(next);
  };

  return (
    <div
      className={SubframeUtils.twClassNames(
        "flex w-full flex-col items-start rounded-lg border border-solid border-neutral-border bg-default-background shadow-sm",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <div className="flex w-full items-center gap-2 rounded-t-lg border-b border-solid border-neutral-border bg-neutral-50 px-6 py-4">
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
            <FeatherInfo className="text-body font-body text-subtext-color" />
          </div>
          {readOnly ? (
            <TextField
              className={SubframeUtils.twClassNames("h-auto w-full flex-none", "pointer-events-none select-none")}
              label=""
              helpText=""
              icon={<FeatherFolder />}
              iconRight={<FeatherChevronDown />}
              variant="filled"
            >
              <TextField.Input
                placeholder="Select or create collection..."
                value={collectionValue}
                onChange={(e) => onChangeCollection?.(e.target.value)}
                readOnly={true}
                className="opacity-70 pointer-events-none select-none"
                tabIndex={-1}
              />
            </TextField>
          ) : (
            <div className="relative w-full">
              <select
                value={collectionValue || ""}
                onChange={(e) => onChangeCollection?.(e.target.value)}
                className="w-full appearance-none rounded-md border border-neutral-border bg-default-background px-3 pr-10 py-2 text-body font-body focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="">Select or create collection...</option>
                <option value="Outreach Templates Library">Outreach Templates Library</option>
                <option value="Design Feedback Scripts">Design Feedback Scripts</option>
                <option value="Idea Generation">Idea Generation</option>
                <option value="Launch-Ready Prompts">Launch-Ready Prompts</option>
                <option value="Core Prompts">Core Prompts</option>
              </select>
              <FeatherChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-subtext-color" />
            </div>
          )}
        </div>
        <div className="flex w-full flex-col items-start gap-2">
          <div className="flex w-full items-center gap-2">
            {text5 ? (
              <span className="text-body-bold font-body-bold text-default-font">
                {text5}
              </span>
            ) : null}
            <FeatherInfo className="text-body font-body text-subtext-color" />
          </div>
          {readOnly ? (
            <TextArea className={SubframeUtils.twClassNames("h-auto w-full flex-none", "pointer-events-none select-none")} label="" helpText="" variant="filled">
              <div className="flex min-h-[64px] w-full flex-wrap items-start gap-2 px-2 py-1.5 opacity-70">
                {(tagsValue || []).map((tag) => (
                  <Badge key={tag} variant="neutral" icon={<FeatherTag />}> 
                    {tag}
                  </Badge>
                ))}
              </div>
            </TextArea>
          ) : (
            <div className="w-full rounded-md border border-neutral-border px-3 py-2 min-h-[64px]">
              <div className="flex flex-wrap gap-2 mb-2">
                {(tagsValue || []).map((tag, index) => (
                  <span
                    key={`${tag}-${index}`}
                    className="inline-flex items-center gap-1 rounded-md border border-solid border-neutral-border bg-neutral-100 px-2 py-1 text-caption font-caption"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-neutral-500 hover:text-neutral-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Add a tag and press Enter..."
                  value={tagDraft}
                  onChange={(e) => setTagDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="w-full border-none outline-none text-body font-body bg-transparent"
                />
                <Button
                  variant="neutral-tertiary"
                  size="small"
                  icon={<FeatherPlus />}
                  onClick={handleAddTag}
                >
                  Add tag
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export const TemplateAdditionalDetails = TemplateAdditionalDetailsRoot;
