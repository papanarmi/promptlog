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

interface PromptCardRootProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: React.ReactNode;
  text2?: React.ReactNode;
  boolean?: boolean;
  body?: React.ReactNode;
  nonTemplate?: React.ReactNode;
  template?: React.ReactNode;
  className?: string;
}

const PromptCardRoot = React.forwardRef<HTMLDivElement, PromptCardRootProps>(
  function PromptCardRoot(
    {
      text,
      text2,
      boolean = false,
      body,
      nonTemplate = <FeatherCopy />,
      template = <FeatherSparkle />,
      className,
      ...otherProps
    }: PromptCardRootProps,
    ref
  ) {
    return (
      <div
        className={SubframeUtils.twClassNames(
          "group/8f873461 flex w-full items-center justify-center gap-2 rounded-lg border border-solid border-neutral-border bg-default-background pl-6 pr-3 py-4 shadow-sm",
          { "items-center justify-center": boolean },
          className
        )}
        ref={ref}
        {...otherProps}
      >
        <div className="flex grow shrink-0 basis-0 flex-col items-start justify-center gap-4">
          <div className="flex items-center gap-2">
            <Badge
              className={SubframeUtils.twClassNames({ hidden: boolean })}
              variant="variation"
            >
              NationGraph
            </Badge>
            <Badge
              className={SubframeUtils.twClassNames("hidden", {
                flex: boolean,
              })}
              variant={boolean ? "variation-2" : "variation"}
            >
              NationGraph
            </Badge>
            <div className="hidden h-1 w-1 flex-none flex-col items-center gap-2 rounded-full bg-subtext-color" />
            <div className="flex h-6 w-px flex-none flex-col items-center gap-2 rounded-full bg-neutral-border" />
            <div className="flex items-center gap-1">
              <Badge variant="neutral" icon={<FeatherTag />}>
                Work
              </Badge>
              <Badge variant="neutral" icon={<FeatherTag />}>
                Marketing
              </Badge>
              <Badge variant="neutral" icon={<FeatherTag />}>
                Quantum Computing
              </Badge>
            </div>
            <div className="flex h-6 w-px flex-none flex-col items-center gap-2 rounded-full bg-neutral-border" />
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
            {text2 ? (
              <span className="line-clamp-1 w-full text-body-bold font-body-bold text-default-font">
                {text2}
              </span>
            ) : null}
            {text2 ? (
              <span className="line-clamp-1 w-full text-body font-body text-subtext-color">
                {text2}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            className={SubframeUtils.twClassNames({ flex: boolean })}
            variant="brand-tertiary"
            icon={boolean ? <FeatherSparkle /> : <FeatherCopy />}
          >
            {boolean ? "Create template" : "Copy template"}
          </Button>
          <SubframeCore.DropdownMenu.Root>
            <SubframeCore.DropdownMenu.Trigger asChild={true}>
              <IconButton icon={<FeatherMoreVertical />} />
            </SubframeCore.DropdownMenu.Trigger>
            <SubframeCore.DropdownMenu.Portal>
              <SubframeCore.DropdownMenu.Content
                side="bottom"
                align="end"
                sideOffset={4}
                asChild={true}
              >
                <DropdownMenu>
                  <DropdownMenu.DropdownItem icon={<FeatherCopy />}>
                    Copy prompt
                  </DropdownMenu.DropdownItem>
                  <DropdownMenu.DropdownItem icon={<FeatherHeart />}>
                    Add to Favorites
                  </DropdownMenu.DropdownItem>
                  <DropdownMenu.DropdownItem icon={<FeatherTrash />}>
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
