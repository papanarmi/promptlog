"use client";
/*
 * Documentation:
 * Prompt card — https://app.subframe.com/ace97b1b228a/library?component=Prompt+card_8f873461-8555-4a52-8062-9b27510c91d6
 * Badge — https://app.subframe.com/ace97b1b228a/library?component=Badge_97bdb082-1124-4dd7-a335-b14b822d0157
 * Button — https://app.subframe.com/ace97b1b228a/library?component=Button_3b777358-b86b-40af-9327-891efc6826fe
 * Dropdown Menu — https://app.subframe.com/ace97b1b228a/library?component=Dropdown+Menu_99951515-459b-4286-919e-a89e7549b43b
 * Icon Button — https://app.subframe.com/ace97b1b228a/library?component=Icon+Button_af9405b1-8c54-4e01-9786-5aad308224f6
 */

import React from "react";
import * as SubframeUtils from "../utils";
import * as SubframeCore from "@subframe/core";
import { FeatherCopy } from "@subframe/core";
import { FeatherSparkle } from "@subframe/core";
import { Badge } from "./Badge";
import { FeatherTag } from "@subframe/core";
import { FeatherClock } from "@subframe/core";
import { Button } from "./Button";
import { DropdownMenu } from "./DropdownMenu";
import { FeatherHeart } from "@subframe/core";
import { FeatherTrash } from "@subframe/core";
import { IconButton } from "./IconButton";
import { FeatherMoreVertical } from "@subframe/core";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

interface PromptCardRootProps extends React.HTMLAttributes<HTMLDivElement> {
  // Small meta text on the right of badges (used for time string)
  text?: React.ReactNode;
  // Title and content
  titleText?: React.ReactNode;
  contentText?: React.ReactNode;
  // If true, show "Create template" styling; else "Copy template"
  boolean?: boolean;
  // Optional data-driven decorations
  tags?: string[];
  category?: string | null;
  // When true, right-side actions appear on hover
  hoverActions?: boolean;
  className?: string;
  onCreateTemplate?: () => void;
  onCopyTemplate?: () => void;
  // Data id and kind for actions
  id?: string;
  kind?: 'log' | 'template';
}

const PromptCardRoot = React.forwardRef<HTMLDivElement, PromptCardRootProps>(
  function PromptCardRoot(
    {
      text,
      titleText,
      contentText,
      boolean = false,
      // Icons are internal, not part of props
      tags = [],
      category = null,
      hoverActions = false,
      className,
      onCreateTemplate,
      onCopyTemplate,
      ...otherProps
    }: PromptCardRootProps,
    ref
  ) {
    const isClickable = typeof (otherProps as { onClick?: unknown }).onClick === 'function';
    const navigate = useNavigate();
    const [isFavorite, setIsFavorite] = React.useState<boolean>(Array.isArray(tags) && tags.includes('favorite'));
    React.useEffect(() => {
      setIsFavorite(Array.isArray(tags) && tags.includes('favorite'));
    }, [tags]);

    // Hide 'favorite' tag from the visible list; heart icon represents favorite state
    const visibleTags: string[] = Array.isArray(tags)
      ? (tags as string[]).filter((t) => t !== 'favorite')
      : [];

    const handleEdit = (e: React.MouseEvent) => {
      e.stopPropagation();
      const id = (otherProps as any).id as string | undefined;
      if (!id) return;
      navigate(`/templates/${id}`, { state: { edit: true } });
    };

    const handleAddFavorite = async (e: React.MouseEvent) => {
      e.stopPropagation();
      const id = (otherProps as any).id as string | undefined;
      if (!id) return;
      const currentTags = Array.isArray(tags) ? tags : [];
      const nextTags = Array.from(new Set([...(currentTags || []), 'favorite']));
      const { error } = await supabase
        .from('prompt_logs')
        .update({ tags: nextTags })
        .eq('id', id);
      if (!error) {
        // inform feed to update this item
        const detail = { id, title: String(titleText || ''), content: String(contentText || ''), collection: category ?? null, tags: nextTags } as any;
        window.dispatchEvent(new CustomEvent('template-updated', { detail }));
        // trigger a soft refresh for stats
        window.dispatchEvent(new CustomEvent('template-soft-refresh'));
      }
    };

    const handleRemoveFavorite = async (e: React.MouseEvent) => {
      e.stopPropagation();
      const id = (otherProps as any).id as string | undefined;
      if (!id) return;
      const currentTags = Array.isArray(tags) ? tags : [];
      const nextTags = (currentTags || []).filter((t) => t !== 'favorite');
      const { error } = await supabase
        .from('prompt_logs')
        .update({ tags: nextTags })
        .eq('id', id);
      if (!error) {
        const detail = { id, title: String(titleText || ''), content: String(contentText || ''), collection: category ?? null, tags: nextTags } as any;
        window.dispatchEvent(new CustomEvent('template-updated', { detail }));
        window.dispatchEvent(new CustomEvent('template-soft-refresh'));
      }
    };

    const handleRemove = async (e: React.MouseEvent) => {
      e.stopPropagation();
      const id = (otherProps as any).id as string | undefined;
      if (!id) return;
      // optional confirm
      // if (!window.confirm('Remove this item?')) return;
      const { error } = await supabase
        .from('prompt_logs')
        .delete()
        .eq('id', id);
      if (!error) {
        window.dispatchEvent(new CustomEvent('template-removed', { detail: { id } }));
        window.dispatchEvent(new CustomEvent('template-soft-refresh'));
      }
    };

    const toggleFavorite = async (e: React.MouseEvent) => {
      if (isFavorite) {
        await handleRemoveFavorite(e);
        setIsFavorite(false);
      } else {
        await handleAddFavorite(e);
        setIsFavorite(true);
      }
    };
    return (
      <div
        className={SubframeUtils.twClassNames(
          "group/8f873461 flex w-full items-center justify-center gap-2 rounded-lg border border-solid border-neutral-border bg-default-background pl-6 pr-3 py-4 shadow-sm",
          { "items-center justify-center": boolean },
          className,
          isClickable ? "cursor-pointer hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-500/40" : undefined
        )}
        ref={ref}
        role={isClickable ? "button" : undefined}
        tabIndex={isClickable ? 0 : undefined}
        onKeyDown={(e) => {
          if (!isClickable) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const handler = (otherProps as unknown as { onClick?: (evt: any) => void }).onClick;
            handler?.((e as unknown) as any);
          }
        }}
        {...otherProps}
      >
        <div className="flex grow shrink-0 basis-0 flex-col items-start justify-center gap-4">
          <div className="flex items-center gap-2">
            {category && String(category).trim().toLowerCase() !== 'none' ? (
              <Badge
                className={SubframeUtils.twClassNames({ hidden: false })}
                variant="variation"
              >
                {category}
              </Badge>
            ) : null}
            {visibleTags && visibleTags.length > 0 ? (
              <>
                <div className="flex h-6 w-px flex-none flex-col items-center gap-2 rounded-full bg-neutral-border" />
                <div className="flex items-center gap-1">
                  {visibleTags.map((tag) => (
                    <Badge key={tag} variant="neutral" icon={<FeatherTag />}>
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex h-6 w-px flex-none flex-col items-center gap-2 rounded-full bg-neutral-border" />
              </>
            ) : null}
            <div className="flex items-center gap-1">
              <FeatherClock className="text-body font-body text-subtext-color" />
              {text ? (
                <span className="whitespace-nowrap text-caption font-caption text-subtext-color">
                  {text}
                </span>
              ) : null}
            </div>
          </div>
          <div
            className={SubframeUtils.twClassNames(
              "flex w-full flex-col items-start gap-2",
              { "flex-col flex-nowrap gap-2": boolean }
            )}
          >
            {titleText ? (
              <span className="line-clamp-1 w-full text-body-bold font-body-bold text-default-font">
                {titleText}
              </span>
            ) : null}
            {contentText ? (
              <span className="line-clamp-2 w-full text-body font-body text-subtext-color">
                {contentText}
              </span>
            ) : null}
          </div>
        </div>
        <div
          className={SubframeUtils.twClassNames(
            "flex items-center gap-1 transition-opacity",
            {
              "opacity-0 pointer-events-none group-hover/8f873461:opacity-100 group-hover/8f873461:pointer-events-auto":
                hoverActions,
            }
          )}
        >
          <Button
            className={SubframeUtils.twClassNames({ flex: boolean })}
            variant="brand-tertiary"
            icon={boolean ? <FeatherSparkle /> : <FeatherCopy />}
            onClick={(e) => {
              e.stopPropagation();
              if (boolean) onCreateTemplate?.();
              else onCopyTemplate?.();
            }}
          >
            {boolean ? "Create template" : "Copy prompt"}
          </Button>
          <IconButton
            icon={
              isFavorite ? (
                <span className="text-red-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1em"
                    height="1em"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                  </svg>
                </span>
              ) : (
                <FeatherHeart className="text-subtext-color" />
              )
            }
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(e);
            }}
          />
          <SubframeCore.DropdownMenu.Root>
            <SubframeCore.DropdownMenu.Trigger asChild={true}>
              <div onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
                <IconButton icon={<FeatherMoreVertical />} />
              </div>
            </SubframeCore.DropdownMenu.Trigger>
            <SubframeCore.DropdownMenu.Portal>
              <SubframeCore.DropdownMenu.Content
                side="bottom"
                align="end"
                sideOffset={4}
                asChild={true}
              >
                <DropdownMenu>
                  <DropdownMenu.DropdownItem icon={<FeatherSparkle />} onClick={handleEdit}>
                    Edit
                  </DropdownMenu.DropdownItem>
                  <DropdownMenu.DropdownItem icon={<FeatherTrash />} onClick={handleRemove}>
                    Remove
                  </DropdownMenu.DropdownItem>
                </DropdownMenu>
              </SubframeCore.DropdownMenu.Content>
            </SubframeCore.DropdownMenu.Portal>
          </SubframeCore.DropdownMenu.Root>
        </div>
      </div>
    );
  }
);

export const PromptCard = PromptCardRoot;
