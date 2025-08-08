import React, { useEffect, useState } from "react";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import { FeatherInfo, FeatherLightbulb } from "@subframe/core";
import { Button } from "@/ui/components/Button";
import { supabase } from "@/lib/supabaseClient";
import { useParams, useNavigate } from "react-router-dom";

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

export default function TemplateDetails() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    prompt: "",
    collection: "",
    type: "",
    tags: [],
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data, error } = await supabase
        .from("prompt_logs")
        .select("id, title, description, content, collection, tags")
        .eq("id", id)
        .eq("kind", "template")
        .maybeSingle();
      if (!error && data) {
        setFormData({
          title: data.title || "",
          description: (data as any).description || "",
          prompt: (data.content as string) || "",
          collection: (data as any).collection || "",
          type: "",
          tags: (data.tags as string[]) || [],
        });
      }
      setLoading(false);
    })();
  }, [id]);

  const handleInputChange = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    else if (formData.title.trim().length < 3) newErrors.title = "Title must be at least 3 characters";
    if (!formData.prompt.trim()) newErrors.prompt = "Prompt is required";
    else if (formData.prompt.trim().length < 10) newErrors.prompt = "Prompt must be at least 10 characters";
    if (!formData.collection.trim()) newErrors.collection = "Collection is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!id) return;
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("prompt_logs")
        .update({
          title: formData.title,
          description: formData.description,
          content: formData.prompt,
          collection: formData.collection,
          tags: formData.tags,
        })
        .eq("id", id)
        .eq("kind", "template");
      if (error) throw error;
      alert("Template updated successfully!");
    } catch (e) {
      console.error(e);
      alert("Error updating template.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      handleInputChange("tags", [...formData.tags, tag.trim()]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleInputChange("tags", formData.tags.filter(tag => tag !== tagToRemove));
  };

  if (loading) return null;

  return (
    <DefaultPageLayout>
      <div className="container max-w-none flex h-full w-full flex-col items-start">
        <div className="flex w-full grow shrink-0 basis-0 flex-col items-center gap-4 bg-default-background px-12 py-16 overflow-auto">
          <div className="flex w-full max-w-[1280px] grow shrink-0 basis-0 flex-col items-start gap-8">
            <div className="flex w-full items-center justify-between">
              <span className="text-heading-1 font-heading-1 text-default-font">Edit Template</span>
              <div className="flex items-center gap-2">
                <Button variant="neutral-tertiary" onClick={() => navigate(-1)} disabled={isSubmitting}>Back</Button>
                <Button onClick={handleSave} loading={isSubmitting} disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </div>

            {/* Basic information */}
            <div className="flex w-full flex-col items-start rounded-lg border border-solid border-neutral-border bg-default-background shadow-sm">
              <div className="flex w-full items-center gap-2 rounded-t-[8px] border-b border-solid border-neutral-border bg-neutral-50 px-6 py-4">
                <span className="text-heading-3 font-heading-3 text-default-font">Basic information</span>
              </div>
              <div className="flex w-full flex-col items-start gap-6 px-6 py-6">
                {/* Title */}
                <div className="flex w-full flex-col items-start gap-2">
                  <div className="flex w-full items-center gap-2">
                    <span className="text-body-bold font-body-bold text-default-font">Title</span>
                    <div className="text-body font-body text-neutral-400"><FeatherInfo /></div>
                  </div>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Enter a title..."
                    className="w-full rounded-md border px-3 py-2 text-body font-body border-neutral-border focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                  {errors.title && <span className="text-caption font-caption text-error-600">{errors.title}</span>}
                </div>

                {/* Description */}
                <div className="flex w-full flex-col items-start gap-2">
                  <div className="flex w-full items-center gap-2">
                    <span className="text-body-bold font-body-bold text-default-font">Description</span>
                    <span className="text-caption font-caption text-subtext-color">(optional)</span>
                  </div>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Add context about this prompt..."
                    className="w-full rounded-md border border-neutral-border px-3 py-2 text-body font-body focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    rows={3}
                  />
                </div>

                {/* Prompt */}
                <div className="flex w-full flex-col items-start gap-2">
                  <div className="flex w-full items-center gap-2">
                    <span className="text-body-bold font-body-bold text-default-font">Prompt</span>
                    <div className="text-body font-body text-neutral-400"><FeatherInfo /></div>
                  </div>
                  <textarea
                    value={formData.prompt}
                    onChange={(e) => handleInputChange("prompt", e.target.value)}
                    placeholder="Write your prompt..."
                    className="w-full rounded-md border px-3 py-2 text-body font-body border-neutral-border focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    rows={8}
                  />
                  <div className="flex w-full flex-col items-start gap-4 rounded-md border border-solid border-neutral-border bg-neutral-50 px-4 py-3">
                    <div className="flex items-center gap-1">
                      <div className="text-heading-3 font-heading-3 text-brand-700"><FeatherLightbulb /></div>
                      <span className="text-body-bold font-body-bold text-brand-700">Using placeholders</span>
                    </div>
                    <div className="flex flex-col items-start gap-2">
                      <span className="text-body font-body text-default-font">Add dynamic content to your prompt using [[placeholder]] syntax. For example:</span>
                      <span className="text-body-bold font-body-bold text-subtext-color">"Analyze this [[transcript]] and list the key insights."</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional details */}
            <div className="flex w-full flex-col items-start rounded-lg border border-solid border-neutral-border bg-default-background shadow-sm">
              <div className="flex w-full items-center gap-2 rounded-t-lg border-b border-solid border-neutral-border bg-neutral-50 px-6 py-4">
                <span className="text-heading-3 font-heading-3 text-default-font">Additional details</span>
              </div>
              <div className="flex w-full flex-col items-start gap-6 px-6 py-6">
                {/* Collection */}
                <div className="flex w-full flex-col items-start gap-2">
                  <div className="flex w-full items-center gap-2">
                    <span className="text-body-bold font-body-bold text-default-font">Collection</span>
                    <div className="text-body font-body text-subtext-color"><FeatherInfo /></div>
                  </div>
                  <input
                    value={formData.collection}
                    onChange={(e) => handleInputChange("collection", e.target.value)}
                    placeholder="Select or create collection..."
                    className="w-full rounded-md border px-3 py-2 text-body font-body border-neutral-border focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                {/* Type */}
                <div className="flex w-full flex-col items-start gap-2">
                  <div className="flex w-full items-center gap-2">
                    <span className="text-body-bold font-body-bold text-default-font">Type</span>
                    <span className="text-caption font-caption text-subtext-color">(optional)</span>
                  </div>
                  <input
                    value={formData.type}
                    onChange={(e) => handleInputChange("type", e.target.value)}
                    placeholder="Select type..."
                    className="w-full rounded-md border px-3 py-2 text-body font-body border-neutral-border focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                {/* Tags */}
                <div className="flex w-full flex-col items-start gap-2">
                  <div className="flex w-full items-center gap-2">
                    <span className="text-body-bold font-body-bold text-default-font">Tags</span>
                    <div className="text-body font-body text-subtext-color"><FeatherInfo /></div>
                  </div>
                  <div className="w-full rounded-md border border-neutral-border px-3 py-2 min-h-[64px]">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.tags.map((tag, index) => (
                        <span key={index} className="inline-flex items-center gap-1 rounded-md border border-solid border-neutral-border bg-neutral-100 px-2 py-1 text-caption font-caption">
                          {tag}
                          <button type="button" onClick={() => removeTag(tag)} className="text-neutral-500 hover:text-neutral-700">×</button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Add a tag and press Enter..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const input = e.currentTarget as HTMLInputElement;
                          addTag(input.value);
                          input.value = '';
                        }
                      }}
                      className="w-full border-none outline-none text-body font-body bg-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </DefaultPageLayout>
  );
}

