"use client";

import React, { useEffect, useState } from "react";
import { DrawerLayout } from "@/ui/layouts/DrawerLayout";
import { TemplateBasicInfo } from "@/ui/components/TemplateBasicInfo";
import { FeatherInfo } from "@subframe/core";
import { FeatherLightbulb } from "@subframe/core";
import { TemplateAdditionalDetails } from "@/ui/components/TemplateAdditionalDetails";
import { Button } from "@/ui/components/Button";
import { supabase } from "@/lib/supabaseClient";
import { useSearchParams } from "react-router-dom";

interface CreateATemplate_New_Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormData {
  title: string;
  description: string;
  prompt: string;
  collection: string;
  type: string;
  tags: string[];
}

interface FormErrors {
  title?: string;
  prompt?: string;
  collection?: string;
}

function CreateATemplate_New_({ open, onOpenChange }: CreateATemplate_New_Props) {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    prompt: "",
    collection: "",
    type: "",
    tags: []
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const fromId = searchParams.get('from');
    const editId = searchParams.get('edit');
    const id = editId || fromId;
    if (!id || !open) return;
    (async () => {
      const { data, error } = await supabase
        .from('prompt_logs')
        .select('id, title, description, content, collection, tags')
        .eq('id', id)
        .maybeSingle();
      if (!error && data) {
        setFormData(prev => ({
          ...prev,
          title: data.title || prev.title,
          description: (data as any).description || prev.description,
          prompt: (data.content as string) || prev.prompt,
          collection: (data as any).collection || prev.collection,
          tags: (data.tags as string[]) || prev.tags,
        }));
      }
    })();
  }, [open, searchParams]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    }

    // Prompt validation
    if (!formData.prompt.trim()) {
      newErrors.prompt = "Prompt is required";
    } else if (formData.prompt.trim().length < 10) {
      newErrors.prompt = "Prompt must be at least 10 characters";
    }

    // Collection validation
    if (!formData.collection.trim()) {
      newErrors.collection = "Collection is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Please sign in to save templates.");
        return;
      }

      const fromId = searchParams.get('from');
      const editId = searchParams.get('edit');
      if (editId) {
        const { error } = await supabase
          .from('prompt_logs')
          .update({
            title: formData.title,
            description: formData.description,
            content: formData.prompt,
            collection: formData.collection,
            tags: formData.tags,
          })
          .eq('id', editId)
          .eq('kind','template');
        if (error) throw error;
      } else {
        const { data: created, error } = await supabase
          .from("prompt_logs")
          .insert({
            user_id: user.id,
            title: formData.title,
            description: formData.description,
            content: formData.prompt,
            collection: formData.collection,
            tags: formData.tags,
            kind: 'template',
            source: 'web',
            from_log_id: fromId
          })
          .select('id, created_at, title, content, collection, tags')
          .single();
        if (error) throw error;
        try {
          if (created) {
            window.dispatchEvent(new CustomEvent('template-created', { detail: created }));
            // Notify extension (if present) to broadcast a refresh
            try { chrome?.runtime?.sendMessage?.({ type: 'templatesChanged' }) } catch {}
          }
        } catch {}
      }

      // Reset form and close drawer
      setFormData({
        title: "",
        description: "",
        prompt: "",
        collection: "",
        type: "",
        tags: []
      });
      setErrors({});
      onOpenChange(false);
      try { chrome?.runtime?.sendMessage?.({ type: 'templatesChanged' }) } catch {}
      alert(editId ? "Template updated successfully!" : "Template saved successfully!");
    } catch (error) {
      console.error("Error saving template:", error);
      alert("Error saving template. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Reset form data when canceling
    setFormData({
      title: "",
      description: "",
      prompt: "",
      collection: "",
      type: "",
      tags: []
    });
    setErrors({});
    onOpenChange(false);
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      handleInputChange("tags", [...formData.tags, tag.trim()]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleInputChange("tags", formData.tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <DrawerLayout open={open} onOpenChange={onOpenChange}>
      <div className="flex h-full w-full flex-col items-end gap-6 bg-default-background px-6 py-6 mobile:h-full mobile:w-full">
        <div className="flex w-full items-center gap-2">
          <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1">
            <span className="text-heading-2 font-heading-2 text-default-font">
              New Prompt Template
            </span>
            <span className="text-body font-body text-subtext-color">
              Create a reusable prompt template
            </span>
          </div>
        </div>
        
        <div className="flex w-full grow shrink-0 basis-0 flex-col items-center gap-6 overflow-y-auto">
          {/* Basic Information Section */}
          <div className="flex w-full flex-col items-start rounded-lg border border-solid border-neutral-border bg-default-background shadow-sm">
            <div className="flex w-full items-center gap-2 rounded-t-[8px] border-b border-solid border-neutral-border bg-neutral-50 px-6 py-4">
              <span className="text-heading-3 font-heading-3 text-default-font">
                Basic information
              </span>
            </div>
            <div className="flex w-full flex-col items-start gap-6 px-6 py-6">
              {/* Title Field */}
              <div className="flex w-full flex-col items-start gap-2">
                <div className="flex w-full items-center gap-2">
                  <span className="text-body-bold font-body-bold text-default-font">
                    Title
                  </span>
                  <div className="text-body font-body text-neutral-400">
                    <FeatherInfo />
                  </div>
                </div>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Enter a title..."
                  className={`w-full rounded-md border px-3 py-2 text-body font-body ${
                    errors.title 
                      ? "border-error-500 focus:border-error-500" 
                      : "border-neutral-border focus:border-brand-500"
                  } focus:outline-none focus:ring-1 focus:ring-brand-500`}
                />
                {errors.title && (
                  <span className="text-caption font-caption text-error-600">
                    {errors.title}
                  </span>
                )}
              </div>

              {/* Description Field */}
              <div className="flex w-full flex-col items-start gap-2">
                <div className="flex w-full items-center gap-2">
                  <span className="text-body-bold font-body-bold text-default-font">
                    Description
                  </span>
                  <span className="text-caption font-caption text-subtext-color">
                    (optional)
                  </span>
                </div>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Add context about this prompt..."
                  className="w-full rounded-md border border-neutral-border px-3 py-2 text-body font-body focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  rows={3}
                />
              </div>

              {/* Prompt Field */}
              <div className="flex w-full flex-col items-start gap-2">
                <div className="flex w-full items-center gap-2">
                  <span className="text-body-bold font-body-bold text-default-font">
                    Prompt
                  </span>
                  <div className="text-body font-body text-neutral-400">
                    <FeatherInfo />
                  </div>
                </div>
                <textarea
                  value={formData.prompt}
                  onChange={(e) => handleInputChange("prompt", e.target.value)}
                  placeholder="Write your prompt..."
                  className={`w-full rounded-md border px-3 py-2 text-body font-body ${
                    errors.prompt 
                      ? "border-error-500 focus:border-error-500" 
                      : "border-neutral-border focus:border-brand-500"
                  } focus:outline-none focus:ring-1 focus:ring-brand-500`}
                  rows={8}
                />
                {errors.prompt && (
                  <span className="text-caption font-caption text-error-600">
                    {errors.prompt}
                  </span>
                )}
                
                {/* Placeholder Help */}
                <div className="flex w-full flex-col items-start gap-4 rounded-md border border-solid border-neutral-border bg-neutral-50 px-4 py-3">
                  <div className="flex items-center gap-1">
                    <div className="text-heading-3 font-heading-3 text-brand-700">
                      <FeatherLightbulb />
                    </div>
                    <span className="text-body-bold font-body-bold text-brand-700">
                      Using placeholders
                    </span>
                  </div>
                  <div className="flex flex-col items-start gap-2">
                    <span className="text-body font-body text-default-font">
                      Add dynamic content to your prompt using [[placeholder]] syntax. For example:
                    </span>
                    <span className="text-body-bold font-body-bold text-subtext-color">
                      "Analyze this [[transcript]] and list the key insights."
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Details Section */}
          <div className="flex w-full flex-col items-start rounded-lg border border-solid border-neutral-border bg-default-background shadow-sm">
            <div className="flex w-full items-center gap-2 rounded-t-lg border-b border-solid border-neutral-border bg-neutral-50 px-6 py-4">
              <span className="text-heading-3 font-heading-3 text-default-font">
                Additional details
              </span>
            </div>
            <div className="flex w-full flex-col items-start gap-6 px-6 py-6">
              {/* Collection Field */}
              <div className="flex w-full flex-col items-start gap-2">
                <div className="flex w-full items-center gap-2">
                  <span className="text-body-bold font-body-bold text-default-font">
                    Collection
                  </span>
                  <div className="text-body font-body text-subtext-color">
                    <FeatherInfo />
                  </div>
                </div>
                <select
                  value={formData.collection}
                  onChange={(e) => handleInputChange("collection", e.target.value)}
                  className={`w-full rounded-md border px-3 py-2 text-body font-body ${
                    errors.collection 
                      ? "border-error-500 focus:border-error-500" 
                      : "border-neutral-border focus:border-brand-500"
                  } focus:outline-none focus:ring-1 focus:ring-brand-500`}
                >
                  <option value="">Select or create collection...</option>
                  <option value="Outreach Templates Library">Outreach Templates Library</option>
                  <option value="Design Feedback Scripts">Design Feedback Scripts</option>
                  <option value="Idea Generation">Idea Generation</option>
                  <option value="Launch-Ready Prompts">Launch-Ready Prompts</option>
                  <option value="Core Prompts">Core Prompts</option>
                </select>
                {errors.collection && (
                  <span className="text-caption font-caption text-error-600">
                    {errors.collection}
                  </span>
                )}
              </div>

              {/* Type Field */}
              <div className="flex w-full flex-col items-start gap-2">
                <div className="flex w-full items-center gap-2">
                  <span className="text-body-bold font-body-bold text-default-font">
                    Type
                  </span>
                  <span className="text-caption font-caption text-subtext-color">
                    (optional)
                  </span>
                </div>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange("type", e.target.value)}
                  className="w-full rounded-md border border-neutral-border px-3 py-2 text-body font-body focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="">Select type...</option>
                  <option value="Instruction">Instruction</option>
                  <option value="Generation">Generation</option>
                  <option value="Summarization">Summarization</option>
                  <option value="Analysis">Analysis</option>
                  <option value="Translation">Translation</option>
                </select>
              </div>

              {/* Tags Field */}
              <div className="flex w-full flex-col items-start gap-2">
                <div className="flex w-full items-center gap-2">
                  <span className="text-body-bold font-body-bold text-default-font">
                    Tags
                  </span>
                  <div className="text-body font-body text-subtext-color">
                    <FeatherInfo />
                  </div>
                </div>
                <div className="w-full rounded-md border border-neutral-border px-3 py-2 min-h-[64px]">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 rounded-md border border-solid border-neutral-border bg-neutral-100 px-2 py-1 text-caption font-caption"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-neutral-500 hover:text-neutral-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Add a tag and press Enter..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                    className="w-full border-none outline-none text-body font-body bg-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="neutral-tertiary"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save template"}
          </Button>
        </div>
      </div>
    </DrawerLayout>
  );
}

export default CreateATemplate_New_;
