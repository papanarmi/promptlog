"use client";
/*
 * Documentation:
 * Custom component — https://app.subframe.com/ace97b1b228a/library?component=Custom+component_bc7535e5-026e-4071-ba12-310616a1c226
 * Dropdown Menu — https://app.subframe.com/ace97b1b228a/library?component=Dropdown+Menu_99951515-459b-4286-919e-a89e7549b43b
 * Icon Button — https://app.subframe.com/ace97b1b228a/library?component=Icon+Button_af9405b1-8c54-4e01-9786-5aad308224f6
 */

import React from "react";
import * as SubframeUtils from "../utils";
import * as SubframeCore from "@subframe/core";
import { FeatherFolder } from "@subframe/core";
import { FeatherTag } from "@subframe/core";
import { FeatherCpu } from "@subframe/core";
import { DropdownMenu } from "./DropdownMenu";
import { FeatherCopy } from "@subframe/core";
import { FeatherHeart } from "@subframe/core";
import { FeatherTrash } from "@subframe/core";
import { IconButton } from "./IconButton";
import { FeatherMoreVertical } from "@subframe/core";

interface CustomComponentRootProps
  extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  text?: React.ReactNode;
  text2?: React.ReactNode;
  text3?: React.ReactNode;
  text4?: React.ReactNode;
  text5?: React.ReactNode;
  text6?: React.ReactNode;
  text7?: React.ReactNode;
  text8?: React.ReactNode;
  text9?: React.ReactNode;
  text10?: React.ReactNode;
  text11?: React.ReactNode;
  icon2?: React.ReactNode;
  text12?: React.ReactNode;
  text13?: React.ReactNode;
  text14?: React.ReactNode;
  text15?: React.ReactNode;
  text16?: React.ReactNode;
  text17?: React.ReactNode;
  text18?: React.ReactNode;
  text19?: React.ReactNode;
  text20?: React.ReactNode;
  icon3?: React.ReactNode;
  text21?: React.ReactNode;
  text22?: React.ReactNode;
  text23?: React.ReactNode;
  text24?: React.ReactNode;
  text25?: React.ReactNode;
  className?: string;
}

const CustomComponentRoot = React.forwardRef<
  HTMLDivElement,
  CustomComponentRootProps
>(function CustomComponentRoot(
  {
    icon = <FeatherFolder />,
    text,
    text2,
    text3,
    text4,
    text5,
    text6,
    text7,
    text8,
    text9,
    text10,
    text11,
    icon2 = <FeatherTag />,
    text12,
    text13,
    text14,
    text15,
    text16,
    text17,
    text18,
    text19,
    text20,
    icon3 = <FeatherCpu />,
    text21,
    text22,
    text23,
    text24,
    text25,
    className,
    ...otherProps
  }: CustomComponentRootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "flex flex-col items-start gap-6",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <div className="flex w-80 flex-col items-start rounded-lg border border-solid border-neutral-border bg-default-background">
        <div className="flex w-full flex-col items-start gap-6 rounded-t-lg border-b border-solid border-neutral-border bg-neutral-50 px-4 py-4">
          <div className="flex w-full items-center gap-2">
            {icon ? (
              <SubframeCore.IconWrapper className="text-heading-3 font-heading-3 text-default-font">
                {icon}
              </SubframeCore.IconWrapper>
            ) : null}
            {text ? (
              <span className="grow shrink-0 basis-0 text-heading-3 font-heading-3 text-default-font">
                {text}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex w-full flex-col items-start gap-4 pl-4 pr-1 py-4">
          <div className="flex w-full items-center gap-4">
            {text2 ? (
              <span className="line-clamp-1 grow shrink-0 basis-0 text-body-bold font-body-bold text-default-font">
                {text2}
              </span>
            ) : null}
            <div className="flex items-center gap-2">
              {text3 ? (
                <span className="line-clamp-1 text-body font-body text-subtext-color">
                  {text3}
                </span>
              ) : null}
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
          <div className="flex w-full items-center gap-4">
            {text4 ? (
              <span className="line-clamp-1 grow shrink-0 basis-0 text-body-bold font-body-bold text-default-font">
                {text4}
              </span>
            ) : null}
            <div className="flex items-center gap-2">
              {text5 ? (
                <span className="line-clamp-1 text-body font-body text-subtext-color">
                  {text5}
                </span>
              ) : null}
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
          <div className="flex w-full items-center gap-4">
            {text6 ? (
              <span className="line-clamp-1 grow shrink-0 basis-0 text-body-bold font-body-bold text-default-font">
                {text6}
              </span>
            ) : null}
            <div className="flex items-center gap-2">
              {text7 ? (
                <span className="line-clamp-1 text-body font-body text-subtext-color">
                  {text7}
                </span>
              ) : null}
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
          <div className="flex w-full items-center gap-4">
            {text8 ? (
              <span className="line-clamp-1 grow shrink-0 basis-0 text-body-bold font-body-bold text-default-font">
                {text8}
              </span>
            ) : null}
            <div className="flex items-center gap-2">
              {text9 ? (
                <span className="line-clamp-1 text-body font-body text-subtext-color">
                  {text9}
                </span>
              ) : null}
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
          <div className="flex w-full items-center gap-4">
            {text10 ? (
              <span className="line-clamp-1 grow shrink-0 basis-0 text-body-bold font-body-bold text-default-font">
                {text10}
              </span>
            ) : null}
            <div className="flex items-center gap-2">
              {text11 ? (
                <span className="line-clamp-1 text-body font-body text-subtext-color">
                  {text11}
                </span>
              ) : null}
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
          <div className="flex w-full items-center gap-4">
            {text10 ? (
              <span className="line-clamp-1 grow shrink-0 basis-0 text-body-bold font-body-bold text-default-font">
                {text10}
              </span>
            ) : null}
            <div className="flex items-center gap-2">
              {text11 ? (
                <span className="line-clamp-1 text-body font-body text-subtext-color">
                  {text11}
                </span>
              ) : null}
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
        </div>
      </div>
      <div className="flex w-80 flex-col items-start rounded-lg border border-solid border-neutral-border bg-default-background">
        <div className="flex w-full flex-col items-start gap-6 rounded-t-lg border-b border-solid border-neutral-border bg-neutral-50 px-4 py-4">
          <div className="flex w-full items-center gap-2">
            {icon3 ? (
              <SubframeCore.IconWrapper className="text-heading-3 font-heading-3 text-default-font">
                {icon3}
              </SubframeCore.IconWrapper>
            ) : null}
            {text21 ? (
              <span className="grow shrink-0 basis-0 text-heading-3 font-heading-3 text-default-font">
                {text21}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex w-full flex-col items-start gap-4 pl-4 pr-1 py-4">
          <div className="flex w-full items-center gap-4">
            {text22 ? (
              <span className="line-clamp-1 grow shrink-0 basis-0 text-body-bold font-body-bold text-default-font">
                {text22}
              </span>
            ) : null}
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
          <div className="flex w-full items-center gap-4">
            {text24 ? (
              <span className="line-clamp-1 grow shrink-0 basis-0 text-body-bold font-body-bold text-default-font">
                {text24}
              </span>
            ) : null}
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
      </div>
    </div>
  );
});

export const CustomComponent = CustomComponentRoot;
