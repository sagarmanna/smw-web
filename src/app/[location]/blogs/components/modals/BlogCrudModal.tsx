"use client";

import React from "react";
import { GenericCrudModal, type CrudModalConfig } from "@/components/GenericCrudModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { stripHtmlTags } from "@/utils/sanitizeHtml";
import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Link } from "@tiptap/extension-link";
import { Image } from "@tiptap/extension-image";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Undo2,
  Redo2,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Link2 as LinkIcon,
  Link2Off as UnlinkIcon,
  Image as ImageIcon,
} from "lucide-react";
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

function BlogTipTapEditor({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (html: string) => void;
  disabled: boolean;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Subscript,
      Superscript,
      TextStyle,
      Color,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-blue-600 underline" },
      }),
      Image.configure({
        HTMLAttributes: { class: "max-w-full h-auto" },
      }),
    ],
    content: value ?? "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editable: !disabled,
  });

  React.useEffect(() => {
    if (!editor) return;
    const html = value ?? "";
    if (html !== editor.getHTML()) {
      editor.commands.setContent(html, { emitUpdate: false });
    }
  }, [value, editor]);

  const setLink = () => {
    const previousUrl = editor?.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) return;
    if (url === "") {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt("Image URL");
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run();
    }
  };

  if (!editor) return null;

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="border border-gray-300 rounded-t-md p-2 bg-gray-50 flex flex-wrap gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "bg-gray-200" : ""}
          disabled={disabled}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "bg-gray-200" : ""}
          disabled={disabled}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive("underline") ? "bg-gray-200" : ""}
          disabled={disabled}
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive("strike") ? "bg-gray-200" : ""}
          disabled={disabled}
        >
          <Strikethrough className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          className={editor.isActive("subscript") ? "bg-gray-200" : ""}
          disabled={disabled}
        >
          <SubscriptIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          className={editor.isActive("superscript") ? "bg-gray-200" : ""}
          disabled={disabled}
        >
          <SuperscriptIcon className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={setLink}
          className={editor.isActive("link") ? "bg-gray-200" : ""}
          disabled={disabled}
        >
          {editor.isActive("link") ? (
            <UnlinkIcon className="h-4 w-4" />
          ) : (
            <LinkIcon className="h-4 w-4" />
          )}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={addImage} disabled={disabled}>
          <ImageIcon className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={disabled || !editor.can().undo()}
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={disabled || !editor.can().redo()}
        >
          <Redo2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor Content */}
      <div className="border border-gray-300 border-t-0 rounded-b-md min-h-[300px] p-4 prose prose-sm max-w-none">
        <EditorContent
          editor={editor}
          className="[&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[250px] [&_.ProseMirror]:prose [&_.ProseMirror]:prose-sm [&_.ProseMirror]:max-w-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-gray-400 [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0"
        />
      </div>
    </div>
  );
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
            <Label>
              Content <span className="text-red-500">*</span>
            </Label>
            <BlogTipTapEditor
              value={formData.content}
              onChange={(html) => handleInputChange("content", html)}
              disabled={isBusy}
            />
            {errors.content && <p className="text-sm text-red-500">{errors.content}</p>}
          </div>
        </>
      )}
    </GenericCrudModal>
  );
}


