"use client";
/*
 * Documentation:
 * Custom component — https://app.subframe.com/ace97b1b228a/library?component=Custom+component_bc7535e5-026e-4071-ba12-310616a1c226
 * Dropdown Menu — https://app.subframe.com/ace97b1b228a/library?component=Dropdown+Menu_99951515-459b-4286-919e-a89e7549b43b
 * Icon Button — https://app.subframe.com/ace97b1b228a/library?component=Icon+Button_af9405b1-8c54-4e01-9786-5aad308224f6
 */

import React, { useState } from "react";
import * as SubframeUtils from "../utils";
import * as SubframeCore from "@subframe/core";
import { FeatherFolder } from "@subframe/core";
import { FeatherTag } from "@subframe/core";

import { DropdownMenu } from "./DropdownMenu";
import { FeatherCopy } from "@subframe/core";
import { FeatherHeart } from "@subframe/core";
import { FeatherTrash } from "@subframe/core";
import { IconButton } from "./IconButton";
import { FeatherMoreVertical } from "@subframe/core";
import { FeatherPlus } from "@subframe/core";
import { FeatherCheck } from "@subframe/core";
import { FeatherX } from "@subframe/core";
import { FeatherEdit } from "@subframe/core";
import { Dialog } from "./Dialog";
import { Button } from "./Button";

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

  className?: string;
  onAddClick?: () => void;
  collections?: string[];
  collectionsWithCounts?: Array<{ name: string; count: number }>;
  onCollectionAdd?: (name: string) => void;
  onCollectionRename?: (oldName: string, newName: string) => void;
  onCollectionRemove?: (name: string) => void;
  onCollectionClick?: (name: string) => void;
  selectedCollections?: string[];
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

    className,
    onAddClick,
    collections = [],
    collectionsWithCounts = [],
    onCollectionAdd,
    onCollectionRename,
    onCollectionRemove,
    onCollectionClick,
    selectedCollections = [],
    ...otherProps
  }: CustomComponentRootProps,
  ref
) {
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [renamingCollection, setRenamingCollection] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [collectionToRemove, setCollectionToRemove] = useState<string | null>(null);

  const handleAddClick = () => {
    if (onCollectionAdd) {
      setIsCreatingCollection(true);
      setNewCollectionName("");
    } else if (onAddClick) {
      onAddClick();
    }
  };

  const handleSaveCollection = () => {
    if (newCollectionName.trim() && onCollectionAdd) {
      onCollectionAdd(newCollectionName.trim());
      setIsCreatingCollection(false);
      setNewCollectionName("");
    }
  };

  const handleCancelCollection = () => {
    setIsCreatingCollection(false);
    setNewCollectionName("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (renamingCollection) {
        handleSaveRename();
      } else {
        handleSaveCollection();
      }
    } else if (e.key === 'Escape') {
      if (renamingCollection) {
        handleCancelRename();
      } else {
        handleCancelCollection();
      }
    }
  };

  const handleRename = (collectionName: string) => {
    setRenamingCollection(collectionName);
    setRenameValue(collectionName);
  };

  const handleSaveRename = () => {
    if (renamingCollection && renameValue.trim() && onCollectionRename) {
      onCollectionRename(renamingCollection, renameValue.trim());
      setRenamingCollection(null);
      setRenameValue("");
    }
  };

  const handleCancelRename = () => {
    setRenamingCollection(null);
    setRenameValue("");
  };

  const handleRemoveClick = (collectionName: string) => {
    setCollectionToRemove(collectionName);
    setShowRemoveDialog(true);
  };

  const handleRemove = () => {
    if (collectionToRemove && onCollectionRemove) {
      onCollectionRemove(collectionToRemove);
      setShowRemoveDialog(false);
      setCollectionToRemove(null);
    }
  };

  const handleCancelRemove = () => {
    setShowRemoveDialog(false);
    setCollectionToRemove(null);
  };

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
        <div className="flex w-full flex-col items-start gap-6 rounded-t-lg border-b border-solid border-neutral-border bg-neutral-50 pl-4 pr-1 py-4">
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
            {(onAddClick || onCollectionAdd) ? (
              <IconButton
                icon={<FeatherPlus />}
                onClick={handleAddClick}
              />
            ) : null}
          </div>
        </div>
        <div className="flex w-full flex-col items-start gap-4 pl-4 pr-1 py-4">
          {/* Render existing collections */}
          {collectionsWithCounts.length > 0 ? (
            collectionsWithCounts.map((collection, index) => (
              <div key={index} className="flex w-full items-center gap-4">
                {renamingCollection === collection.name ? (
                  <input
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="grow shrink-0 basis-0 rounded-md border border-neutral-border px-3 py-2 text-body-bold font-body-bold text-default-font focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    autoFocus
                  />
                ) : (
                  <button 
                    onClick={() => onCollectionClick?.(collection.name)}
                    className={`line-clamp-1 grow shrink-0 basis-0 text-body-bold font-body-bold text-left p-2 rounded-md transition-colors ${
                      selectedCollections.includes(collection.name) 
                        ? 'bg-brand-50 text-brand-700 border border-brand-200' 
                        : 'text-default-font hover:bg-neutral-50 hover:text-brand-600'
                    }`}
                  >
                    {collection.name}
                  </button>
                )}
                <div className="flex items-center gap-2">
                  {renamingCollection === collection.name ? (
                    <>
                      <IconButton
                        icon={<FeatherCheck />}
                        onClick={handleSaveRename}
                        size="small"
                      />
                      <IconButton
                        icon={<FeatherX />}
                        onClick={handleCancelRename}
                        size="small"
                      />
                    </>
                  ) : (
                    <>
                      <span className="line-clamp-1 text-body font-body text-subtext-color">
                        {collection.count}
                      </span>
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
                        <DropdownMenu.DropdownItem 
                          icon={<FeatherEdit />}
                          onClick={() => handleRename(collection.name)}
                        >
                          Rename
                        </DropdownMenu.DropdownItem>
                        <DropdownMenu.DropdownItem 
                          icon={<FeatherTrash />}
                          onClick={() => handleRemoveClick(collection.name)}
                        >
                          Remove
                        </DropdownMenu.DropdownItem>
                      </DropdownMenu>
                    </SubframeCore.DropdownMenu.Content>
                  </SubframeCore.DropdownMenu.Portal>
                </SubframeCore.DropdownMenu.Root>
                    </>
                  )}
                </div>
              </div>
          ))
          ) : collections.length > 0 ? (
            // Fallback to old collections array without counts
            collections.map((collection, index) => (
              <div key={index} className="flex w-full items-center gap-4">
                <span className="line-clamp-1 grow shrink-0 basis-0 text-body-bold font-body-bold text-default-font">
                  {collection}
                </span>
                <div className="flex items-center gap-2">
                  <span className="line-clamp-1 text-body font-body text-subtext-color">
                    0
                  </span>
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
            ))
          ) : (
            // Fallback to hardcoded collections if no collections prop provided
            <>
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
            </>
          )}

          {/* Inline collection creation input */}
          {isCreatingCollection && (
            <div className="flex w-full items-center gap-2">
              <input
                type="text"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Enter collection name..."
                className="grow shrink-0 basis-0 rounded-md border border-neutral-border px-3 py-2 text-body-bold font-body-bold text-default-font focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                autoFocus
              />
              <div className="flex items-center gap-1">
                <IconButton
                  icon={<FeatherCheck />}
                  onClick={handleSaveCollection}
                  size="small"
                />
                <IconButton
                  icon={<FeatherX />}
                  onClick={handleCancelCollection}
                  size="small"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Remove Collection Confirmation Dialog */}
      {showRemoveDialog && (
        <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
          <Dialog.Content className="p-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <h2 className="text-heading-3 font-heading-3 text-default-font">Remove Collection</h2>
                <p className="text-body font-body text-subtext-color">
                  Are you sure you want to remove the collection "{collectionToRemove}"? 
                  Templates in this collection will not be deleted, but they will no longer be grouped under this collection.
                </p>
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="neutral-secondary" onClick={handleCancelRemove}>
                  Cancel
                </Button>
                <Button variant="destructive-primary" onClick={handleRemove}>
                  Remove Collection
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog>
      )}
    </div>
  );
});

export const CustomComponent = CustomComponentRoot;
