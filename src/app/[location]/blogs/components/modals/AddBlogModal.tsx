"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
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
  Type as TypeIcon,
} from "lucide-react";
import { createBlog, CreateBlogRequest } from "../../blogs.api";

interface AddBlogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  location: string;
}

export function AddBlogModal({ isOpen, onClose, onSuccess, location }: AddBlogModalProps) {
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Subscript,
      Superscript,
      TextStyle,
      Color,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto",
        },
      }),
    ],
    content: "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      // Content is automatically handled by editor
    },
  });

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTitle("");
      setErrors({});
      editor?.commands.clearContent();
    }
  }, [isOpen, editor]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "Title cannot be blank.";
    } else if (title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    } else if (title.trim().length > 255) {
      newErrors.title = "Title must not exceed 255 characters";
    }

    const content = editor?.getHTML() || "";
    const textContent = editor?.getText() || "";
    
    if (!textContent.trim()) {
      newErrors.content = "Content cannot be blank.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const content = editor?.getHTML() || "";
      
      const payload: CreateBlogRequest = {
        title: title.trim(),
        content: content,
      };

      const response = await createBlog(location, payload);

      toast.success(response.message || "Blog created successfully!");
      onSuccess?.();
      onClose();

      // Reset form
      setTitle("");
      editor?.commands.clearContent();
    } catch (error: unknown) {
      const apiError = error as { message?: string; errorCode?: string };
      const errorMessage = apiError.message || "Failed to create blog";

      toast.error(errorMessage);

      if (apiError.errorCode === "BAD_REQUEST") {
        console.error("Validation error:", errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (value: string) => {
    setTitle(value);
    // Clear error when user starts typing
    if (errors.title) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.title;
        return newErrors;
      });
    }
  };

  const setLink = () => {
    const previousUrl = editor?.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) {
      return;
    }

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

  if (!editor) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Blog</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Enter blog title"
              required
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">
              Content <span className="text-red-500">*</span>
            </Label>
            
            {/* Toolbar */}
            <div className="border border-gray-300 rounded-t-md p-2 bg-gray-50 flex flex-wrap gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={editor.isActive("bold") ? "bg-gray-200" : ""}
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={editor.isActive("italic") ? "bg-gray-200" : ""}
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={editor.isActive("underline") ? "bg-gray-200" : ""}
              >
                <UnderlineIcon className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={editor.isActive("strike") ? "bg-gray-200" : ""}
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
              >
                <SubscriptIcon className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleSuperscript().run()}
                className={editor.isActive("superscript") ? "bg-gray-200" : ""}
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
              >
                {editor.isActive("link") ? (
                  <UnlinkIcon className="h-4 w-4" />
                ) : (
                  <LinkIcon className="h-4 w-4" />
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addImage}
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
              
              <div className="w-px h-6 bg-gray-300 mx-1" />
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
              >
                <Undo2 className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
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
            
            {errors.content && (
              <p className="text-sm text-red-500">{errors.content}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

