"use client";

import React, { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { Link } from "@tiptap/extension-link";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import { TextAlign } from "@tiptap/extension-text-align";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Link2 as LinkIcon,
  Link2Off as UnlinkIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Palette,
  Highlighter,
  Eraser,
} from "lucide-react";

export type RichTextEditorMode = "simple" | "full";

export interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  mode?: RichTextEditorMode; // Kept for backward compatibility, but simplified editor ignores it
  placeholder?: string;
  minHeight?: string;
  label?: React.ReactNode;
  error?: boolean;
  errorMessage?: string;
  disabled?: boolean;
}

const commonColors = [
  "#000000", "#FFFFFF", "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF",
  "#800000", "#008000", "#000080", "#808000", "#800080", "#008080", "#C0C0C0", "#808080",
];

export function RichTextEditor({
  value,
  onChange,
  mode = "simple", // Kept for backward compatibility
  placeholder = "Start typing...",
  minHeight = "200px",
  label,
  error = false,
  errorMessage,
  disabled = false,
}: RichTextEditorProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [textColor, setTextColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  // Use value directly - no conversion needed for simplified editor
  const convertedValue = value;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false, // Disable headings
        blockquote: false, // Disable blockquote
        codeBlock: false, // Disable code blocks
        horizontalRule: false, // Disable horizontal rule
        // Lists are enabled by default in StarterKit
      }),
      Underline, // Keep underline
      TextStyle, // Required for Color extension
      Color, // Text color
      Highlight.configure({
        multicolor: true,
      }), // Background color/highlight
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
        defaultAlignment: "left",
      }), // Text alignment
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline",
        },
      }),
    ],
    content: convertedValue,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editable: !disabled,
    editorProps: {
      attributes: {
        "data-placeholder": placeholder,
        class: "cursor-text",
      },
    },
  });

  useEffect(() => {
    if (editor && convertedValue !== editor.getHTML()) {
      editor.commands.setContent(convertedValue);
    }
  }, [convertedValue, editor]);

  const setLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href || "";
    setLinkUrl(previousUrl);
    setShowLinkModal(true);
  };

  const handleLinkSubmit = () => {
    if (!editor) return;
    
    const trimmedUrl = linkUrl.trim();
    
    if (trimmedUrl === "") {
      // Remove link if URL is empty
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      // Add http:// if no protocol is specified
      const urlWithProtocol = trimmedUrl.match(/^https?:\/\//) 
        ? trimmedUrl 
        : `https://${trimmedUrl}`;
      
      editor.chain().focus().extendMarkRange("link").setLink({ href: urlWithProtocol }).run();
    }
    
    setShowLinkModal(false);
    setLinkUrl("");
  };

  const handleRemoveLink = () => {
    if (!editor) return;
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setShowLinkModal(false);
    setLinkUrl("");
  };

  const setTextColorValue = (color: string) => {
    setTextColor(color);
    if (editor) {
      editor.chain().focus().setColor(color).run();
    }
    setShowColorPicker(false);
  };

  const setBgColorValue = (color: string) => {
    setBgColor(color);
    if (editor) {
      editor.chain().focus().setHighlight({ color }).run();
    }
    setShowBgColorPicker(false);
  };


  if (!editor) {
    return null;
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium">
          {label}
        </label>
      )}
      
      {/* Toolbar - Simplified: Only essential formatting options */}
      <div className={`border border-input rounded-t-md p-2.5 bg-muted ${error ? "border-red-500" : ""}`}>
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Basic Text Formatting */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive("bold") ? "bg-gray-200" : ""}
            title="Bold"
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
            title="Italic"
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
            title="Underline"
            disabled={disabled}
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
          
          <div className="w-px h-5 bg-border mx-0.5" />
          
          {/* Text Color */}
          <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                title="Text Color"
                disabled={disabled}
              >
                <Palette className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3">
              <div className="text-xs font-medium mb-2 text-muted-foreground">Text Color</div>
              <div className="grid grid-cols-8 gap-1.5 mb-3">
                {commonColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="w-7 h-7 rounded-md border-2 border-transparent hover:border-foreground/20 hover:scale-110 transition-all shadow-sm"
                    style={{ backgroundColor: color }}
                    onClick={() => setTextColorValue(color)}
                    title={color}
                  />
                ))}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Custom Color</label>
                <Input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColorValue(e.target.value)}
                  className="h-10 w-full cursor-pointer"
                />
              </div>
            </PopoverContent>
          </Popover>
          
          {/* Background Color */}
          <Popover open={showBgColorPicker} onOpenChange={setShowBgColorPicker}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                title="Background Color"
                disabled={disabled}
                className={editor.isActive("highlight") ? "bg-gray-200 dark:bg-gray-700" : ""}
              >
                <Highlighter className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3">
              <div className="text-xs font-medium mb-2 text-muted-foreground">Background Color</div>
              <div className="grid grid-cols-8 gap-1.5 mb-3">
                {commonColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="w-7 h-7 rounded-md border-2 border-transparent hover:border-foreground/20 hover:scale-110 transition-all shadow-sm"
                    style={{ backgroundColor: color }}
                    onClick={() => setBgColorValue(color)}
                    title={color}
                  />
                ))}
              </div>
              <div className="space-y-2 mb-3">
                <label className="text-xs font-medium text-muted-foreground">Custom Color</label>
                <Input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColorValue(e.target.value)}
                  className="h-10 w-full cursor-pointer"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  if (editor) {
                    editor.chain().focus().unsetHighlight().run();
                  }
                  setShowBgColorPicker(false);
                }}
              >
                Remove Highlight
              </Button>
            </PopoverContent>
          </Popover>
          
          <div className="w-px h-5 bg-border mx-0.5" />
          
          {/* Lists */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleBulletList().run();
            }}
            className={editor.isActive("bulletList") ? "bg-gray-200" : ""}
            title="Bullet List"
            disabled={disabled}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleOrderedList().run();
            }}
            className={editor.isActive("orderedList") ? "bg-gray-200" : ""}
            title="Numbered List"
            disabled={disabled}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          
          <div className="w-px h-5 bg-border mx-0.5" />
          
          {/* Text Alignment */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={editor.isActive({ textAlign: "left" }) ? "bg-gray-200" : ""}
            title="Align Left"
            disabled={disabled}
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={editor.isActive({ textAlign: "center" }) ? "bg-gray-200" : ""}
            title="Align Center"
            disabled={disabled}
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={editor.isActive({ textAlign: "right" }) ? "bg-gray-200" : ""}
            title="Align Right"
            disabled={disabled}
          >
            <AlignRight className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            className={editor.isActive({ textAlign: "justify" }) ? "bg-gray-200" : ""}
            title="Justify"
            disabled={disabled}
          >
            <AlignJustify className="h-4 w-4" />
          </Button>
          
          <div className="w-px h-5 bg-border mx-0.5" />
          
          {/* Remove Format */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              editor.chain().focus().unsetAllMarks().clearNodes().run();
            }}
            title="Remove Format"
            disabled={disabled}
          >
            <Eraser className="h-4 w-4" />
          </Button>
          
          <div className="w-px h-5 bg-border mx-0.5" />
          
          {/* Link */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={setLink}
            className={editor.isActive("link") ? "bg-gray-200" : ""}
            title="Link"
            disabled={disabled}
          >
            {editor.isActive("link") ? (
              <UnlinkIcon className="h-4 w-4" />
            ) : (
              <LinkIcon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Editor Content */}
      <div
        className={`border border-input border-t-0 rounded-b-md p-4 prose prose-sm dark:prose-invert max-w-none bg-background text-foreground cursor-text ${error ? "border-red-500" : ""}`}
        style={{ minHeight }}
        onClick={(e) => {
          if (editor && !disabled) {
            // Focus the editor when clicking anywhere in the container
            const target = e.target as HTMLElement;
            // Only focus if clicking on the wrapper or empty space, not on interactive elements
            if (target === e.currentTarget || target.closest('.ProseMirror')) {
              editor.commands.focus();
            }
          }
        }}
      >
        <EditorContent
          editor={editor}
          className="rich-text-editor-content [&_.ProseMirror]:outline-none [&_.ProseMirror]:prose [&_.ProseMirror]:prose-sm [&_.ProseMirror]:dark:prose-invert [&_.ProseMirror]:max-w-none [&_.ProseMirror]:text-foreground [&_.ProseMirror]:cursor-text [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_p]:cursor-text [&_.ProseMirror_p]:min-h-[1.5rem] [&_.ProseMirror_p]:pointer-events-auto"
        />
        <style dangerouslySetInnerHTML={{ __html: `
          .rich-text-editor-content .ProseMirror {
            cursor: text !important;
            outline: none !important;
            min-height: 100%;
          }
          .rich-text-editor-content .ProseMirror p {
            cursor: text !important;
            min-height: 1.5rem !important;
            margin: 0.5rem 0 !important;
            padding: 0 !important;
            pointer-events: auto !important;
          }
          .rich-text-editor-content .ProseMirror p:first-child {
            margin-top: 0 !important;
          }
          .rich-text-editor-content .ProseMirror p:last-child {
            margin-bottom: 0 !important;
          }
          .rich-text-editor-content .ProseMirror p.is-editor-empty {
            min-height: 1.5rem !important;
            pointer-events: auto !important;
            cursor: text !important;
          }
          .rich-text-editor-content .ProseMirror ul {
            list-style-type: disc !important;
            margin-left: 1.5rem !important;
            padding-left: 1.5rem !important;
            list-style-position: outside !important;
            pointer-events: auto !important;
          }
          .rich-text-editor-content .ProseMirror ol {
            list-style-type: decimal !important;
            margin-left: 1.5rem !important;
            padding-left: 1.5rem !important;
            list-style-position: outside !important;
            pointer-events: auto !important;
          }
          .rich-text-editor-content .ProseMirror li {
            display: list-item !important;
            margin-top: 0.25rem !important;
            margin-bottom: 0.25rem !important;
            cursor: text !important;
            pointer-events: auto !important;
          }
        `}} />
      </div>
      
      {error && errorMessage && (
        <p className="text-sm text-red-500">{errorMessage}</p>
      )}

      {/* Link Modal */}
      <Dialog open={showLinkModal} onOpenChange={setShowLinkModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editor?.isActive("link") ? "Edit Link" : "Add Link"}
            </DialogTitle>
            <DialogDescription>
              Enter the URL you want to link to. Leave empty to remove the link.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                type="url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleLinkSubmit();
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter className="flex-row justify-between sm:justify-between">
            {editor?.isActive("link") && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleRemoveLink}
              >
                Remove Link
              </Button>
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowLinkModal(false);
                  setLinkUrl("");
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleLinkSubmit}
              >
                {editor?.isActive("link") ? "Update Link" : "Add Link"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

