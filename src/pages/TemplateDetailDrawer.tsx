"use client";

import React, { useEffect, useState } from "react";
import { DrawerLayout } from "@/ui/layouts/DrawerLayout";
import { Button } from "@/ui/components/Button";
import { TemplateBasicInfo } from "@/ui/components/TemplateBasicInfo";
import { TemplateAdditionalDetails } from "@/ui/components/TemplateAdditionalDetails";
// inputs are rendered within the UI components
import { supabase } from "@/lib/supabaseClient";
// view-only drawer; routing handled by parent

interface TemplateDetailDrawerProps {
  open: boolean;
  templateId: string;
  onOpenChange: (open: boolean) => void;
}

interface TemplateRow {
  id: string;
  title: string;
  content: string;
  description: string | null;
  collection: string | null;
  tags: string[] | null;
  created_at: string;
}

export default function TemplateDetailDrawer({ open, templateId, onOpenChange }: TemplateDetailDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [row, setRow] = useState<TemplateRow | null>(null);
  const [form, setForm] = useState({ title: "", description: "", content: "", collection: "", tags: [] as string[] });

  useEffect(() => {
    if (!open || !templateId) return;
    setLoading(true);
    (async () => {
      const { data, error } = await supabase
        .from("prompt_logs")
        .select("id, title, description, content, collection, tags, created_at")
        .eq("id", templateId)
        .eq("kind", "template")
        .maybeSingle();
      if (!error) {
        const r = data as any as TemplateRow;
        setRow(r);
        setForm({
          title: r.title || "",
          description: r.description || "",
          content: r.content || "",
          collection: r.collection || "",
          tags: Array.isArray(r.tags) ? (r.tags as string[]) : [],
        });
      }
      setLoading(false);
    })();
  }, [open, templateId]);

  const formatRelative = (iso: string) => {
    const now = Date.now();
    const then = new Date(iso).getTime();
    const s = Math.max(1, Math.floor((now - then) / 1000));
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}hr ago`;
    const d = Math.floor(h / 24);
    if (d < 7) return `${d}d ago`;
    const w = Math.floor(d / 7);
    if (w < 4) return `${w}w ago`;
    const mo = Math.floor(d / 30);
    if (mo < 12) return `${mo}mo ago`;
    const y = Math.floor(d / 365);
    return `${y}yr ago`;
  };

  const [isEditing, setIsEditing] = useState(false);

  const handleCancel = () => {
    if (!row) return onOpenChange(false);
    setForm({
      title: row.title || "",
      description: row.description || "",
      content: row.content || "",
      collection: row.collection || "",
      tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    });
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!row) return;
    setLoading(true);
    const { error } = await supabase
      .from('prompt_logs')
      .update({
        title: form.title,
        description: form.description,
        content: form.content,
        collection: form.collection,
        tags: form.tags,
      })
      .eq('id', row.id)
      .eq('kind','template');
    setLoading(false);
    if (!error) {
      setRow({ ...row, ...form });
      setIsEditing(false);
      try {
        window.dispatchEvent(
          new CustomEvent('template-updated', {
            detail: {
              id: row.id,
              title: form.title,
              content: form.content,
              collection: form.collection,
              tags: form.tags,
            },
          })
        );
      } catch {}
    }
  };

  return (
    <DrawerLayout open={open} onOpenChange={onOpenChange}>
      <div className="flex h-full w-full flex-col items-end gap-6 bg-default-background px-6 py-6">
        <div className="flex w-full grow shrink-0 basis-0 flex-col items-center gap-6 overflow-y-auto">
          <TemplateBasicInfo
            text="Basic information"
            text2="Title"
            text3="Description"
            text4="(optional)"
            text5="Prompt"
            text6="Using placeholders"
            text7="Add dynamic content to your prompt using [[placeholder]] syntax. For example:"
            text8="Analyze this [[transcript]] and list the key insights."
            titleValue={form.title}
            descriptionValue={form.description}
            promptValue={form.content}
            readOnly={!isEditing}
            onChangeTitle={(v) => setForm((f) => ({ ...f, title: v }))}
            onChangeDescription={(v) => setForm((f) => ({ ...f, description: v }))}
            onChangePrompt={(v) => setForm((f) => ({ ...f, content: v }))}
          />

          {/* read-only view; extra summary block removed */}

          <TemplateAdditionalDetails
            text="Additional details"
            text2="Collection"
            text5="Tags"
            collectionValue={form.collection}
            tagsValue={form.tags}
            readOnly={!isEditing}
            onChangeCollection={(v) => setForm((f) => ({ ...f, collection: v }))}
            onChangeTags={(tags) => setForm((f) => ({ ...f, tags }))}
          />

          <div className="w-full -mt-6 px-6">
            <div className="mt-4 flex w-full flex-col items-start gap-2">
              <span className="text-caption font-caption text-subtext-color">Created {row?.created_at ? formatRelative(row.created_at) : "—"}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="neutral-tertiary" onClick={handleCancel} disabled={loading}>Cancel</Button>
              <Button onClick={handleSave} loading={loading} disabled={loading}>Save template</Button>
            </>
          ) : (
            <>
              <Button variant="neutral-tertiary" onClick={() => onOpenChange(false)}>Close</Button>
              <Button onClick={() => setIsEditing(true)} disabled={loading}>Edit template</Button>
            </>
          )}
        </div>
      </div>
    </DrawerLayout>
  );
}


