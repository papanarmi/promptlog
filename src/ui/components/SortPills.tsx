"use client";

import React from "react";
import * as SubframeUtils from "../utils";
import { FeatherChevronUp, FeatherChevronDown, FeatherFolder, FeatherCalendar } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import { useSearch, SortField, SortDirection } from "@/lib/searchContext";

interface SortPillProps extends React.HTMLAttributes<HTMLDivElement> {
  field: SortField;
  label: string;
  isActive: boolean;
  direction?: SortDirection;
  onToggle: () => void;
}

const SortPill: React.FC<SortPillProps> = ({
  field,
  label,
  isActive,
  direction,
  onToggle,
  className,
  ...otherProps
}) => {
  const getSortIcon = () => {
    if (!isActive) return null;
    return direction === 'asc' ? <FeatherChevronUp /> : <FeatherChevronDown />;
  };

  const getFieldIcon = () => {
    switch (field) {
      case 'collection':
        return <FeatherFolder />;
      case 'created_at':
        return <FeatherCalendar />;
      default:
        return null;
    }
  };

  return (
    <div
      className={SubframeUtils.twClassNames(
        "flex items-center gap-1 rounded-full border px-3 py-1 text-sm cursor-pointer",
        {
          // keep light gray background even when active
          "border-brand-primary bg-[#FAFAFA] text-brand-700": isActive,
          "border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100": !isActive,
        },
        className
      )}
      onClick={onToggle}
      {...otherProps}
    >
      {getFieldIcon() ? (
        <SubframeCore.IconWrapper className="text-body font-body text-subtext-color">
          {getFieldIcon()}
        </SubframeCore.IconWrapper>
      ) : null}
      <span>{label}</span>
      {getSortIcon()}
    </div>
  );
};

export const SortPills: React.FC = () => {
  const { sortStateMap, toggleSort, getSortDirection, clearAllSorts } = useSearch();

  const sortOptions: Array<{ field: SortField; label: string }> = [
    { field: 'collection', label: 'Collection' },
    { field: 'created_at', label: 'Date' },
  ];

  const hasActive = Object.keys(sortStateMap || {}).length > 0;

  return (
    <div className="flex w-full flex-wrap items-center gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {sortOptions.map(({ field, label }) => (
          <SortPill
            key={field}
            field={field}
            label={label}
            isActive={Boolean(getSortDirection(field))}
            direction={getSortDirection(field) || undefined}
            onToggle={() => toggleSort(field)}
          />
        ))}
      </div>
      {hasActive && (
        <button
          type="button"
          className="text-brand-primary hover:underline text-sm"
          onClick={() => clearAllSorts()}
        >
          Clear
        </button>
      )}
    </div>
  );
};
