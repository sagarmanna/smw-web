"use client";

import React from "react";
import { GenericCrudModal, type CrudModalConfig } from "@/components/GenericCrudModal";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { stripHtmlTags } from "@/utils/sanitizeHtml";
import {
  type BlogRow,
  type CreateBlogRequest,
  createBlog,
  type UpdateBlogRequest,
  updateBlog,
  deleteBlog,
} from "../../blogs.api";

type BlogRowWithId = BlogRow & { id: number };

type BlogFormData = {
  title: string;
  content: string; // html
};

type BlogUpdatePayload = UpdateBlogRequest & { id: number };

interface BlogCrudModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  location: string;
  mode: "add" | "edit";
  initialData?: BlogRowWithId | null;
}

const buildBlogCrudConfig = (): CrudModalConfig<
  BlogRowWithId,
  BlogFormData,
  CreateBlogRequest,
  BlogUpdatePayload
> => {
  return {
    entityName: "Blogs",
    onCreate: async (location, payload) => {
      try {
        const res = await createBlog(location, payload);
        return { success: res.success, message: res.message };
      } catch (e: unknown) {
        const msg = (e as { message?: string })?.message || "Failed to create blog";
        return { success: false, message: msg };
      }
    },
    onUpdate: async (location, payload) => {
      try {
        const { id, ...body } = payload;
        const res = await updateBlog(location, id, body);
        return { success: res.success, message: res.message };
      } catch (e: unknown) {
        const msg = (e as { message?: string })?.message || "Failed to update blog";
        return { success: false, message: msg };
      }
    },
    onDelete: async (location, id) => {
      try {
        const res = await deleteBlog(location, id);
        return { success: res.success, message: res.message };
      } catch (e: unknown) {
        const msg = (e as { message?: string })?.message || "Failed to delete blog";
        return { success: false, message: msg };
      }
    },
    buildCreateRequest: (formData) => ({
      title: formData.title,
      content: formData.content,
    }),
    buildUpdateRequest: (formData, id) => ({
      id,
      title: formData.title,
      content: formData.content,
    }),
    initializeFormData: (row) => ({
      title: row.title ?? "",
      content: row.content ?? "",
    }),
    getDefaultFormData: () => ({
      title: "",
      content: "",
    }),
    validateForm: (formData) => {
      const errors: Record<string, string> = {};

      const title = formData.title.trim();
      if (!title) {
        errors.title = "Title cannot be blank.";
      } else if (title.length < 3) {
        errors.title = "Title must be at least 3 characters";
      } else if (title.length > 255) {
        errors.title = "Title must not exceed 255 characters";
      }

      const textContent = stripHtmlTags(formData.content ?? "").trim();
      if (!textContent) {
        errors.content = "Content cannot be blank.";
      }

      return errors;
    },
  };
};

export function BlogCrudModal({ isOpen, onClose, onSuccess, location, mode, initialData }: BlogCrudModalProps) {
  const config = React.useMemo(() => buildBlogCrudConfig(), []);

  return (
    <GenericCrudModal<BlogRowWithId, BlogFormData, CreateBlogRequest, BlogUpdatePayload>
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
      location={location}
      initialData={initialData ?? null}
      mode={mode}
      config={config}
      title={mode === "add" ? "Add New Blog" : "Blogs"}
      dialogClassName="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto"
      deleteTitle="Delete Blog"
      deleteDescription={<span>Are you sure you want to delete this?.</span>}
    >
      {({ formData, errors, isBusy, handleInputChange }) => (
        <>
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Enter blog title"
              required
              disabled={isBusy}
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <RichTextEditor
              value={formData.content}
              onChange={(html) => handleInputChange("content", html)}
              mode="full"
              label={
                <span>
                  Content <span className="text-red-500">*</span>
                </span>
              }
              error={Boolean(errors.content)}
              errorMessage={errors.content}
              disabled={isBusy}
              minHeight="300px"
              placeholder="Write your blog content..."
            />
          </div>
        </>
      )}
    </GenericCrudModal>
  );
}


