"use client";

import React, { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Link } from "@tiptap/extension-link";
import { Image } from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import { TextAlign } from "@tiptap/extension-text-align";
import { FontFamily } from "@tiptap/extension-font-family";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Quote,
  Code2,
  Maximize2,
  Minimize2,
  Scissors,
  Copy,
  ClipboardPaste,
  ClipboardType,
  FileText,
  Eraser,
  Minus,
  Type,
} from "lucide-react";
import { toast } from "sonner";

export type RichTextEditorMode = "simple" | "full";

export interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  mode?: RichTextEditorMode;
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
  mode = "simple",
  placeholder = "Start typing...",
  minHeight = "200px",
  label,
  error = false,
  errorMessage,
  disabled = false,
}: RichTextEditorProps) {
  const [isSourceView, setIsSourceView] = useState(false);
  const [sourceValue, setSourceValue] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [textColor, setTextColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");

  // Helper function to convert inline styles on block elements to spans
  const convertBlockElementStyles = React.useCallback((html: string): string => {
    if (typeof window === 'undefined') return html;
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Find all block elements (p, div, h1-h6) with inline color styles
    const blockElements = tempDiv.querySelectorAll('p[style*="color"], div[style*="color"], h1[style*="color"], h2[style*="color"], h3[style*="color"], h4[style*="color"], h5[style*="color"], h6[style*="color"]');
    
    blockElements.forEach((element) => {
      const style = element.getAttribute('style');
      if (style && style.includes('color:')) {
        // Extract color value
        const colorMatch = style.match(/color:\s*([^;]+)/i);
        if (colorMatch) {
          const color = colorMatch[1].trim();
          
          // Remove color from block element's style
          const newStyle = style.replace(/color:\s*[^;]+;?/gi, '').trim().replace(/^;+|;+$/g, '').replace(/;\s*;/g, ';');
          if (newStyle && newStyle !== ';') {
            element.setAttribute('style', newStyle);
          } else {
            element.removeAttribute('style');
          }
          
          // Wrap all content in a span with color
          // This preserves nested elements like <strong>
          const span = document.createElement('span');
          span.setAttribute('style', `color: ${color}`);
          
          // Clone all child nodes to the span (preserve original structure)
          const childNodes = Array.from(element.childNodes);
          childNodes.forEach((node) => {
            span.appendChild(node.cloneNode(true));
          });
          
          // Clear element and add the span
          element.innerHTML = '';
          element.appendChild(span);
        }
      }
    });
    
    return tempDiv.innerHTML;
  }, []);

  // Convert value before passing to editor
  const convertedValue = React.useMemo(() => {
    return convertBlockElementStyles(value);
  }, [value, convertBlockElementStyles]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: mode === "full" ? [1, 2, 3, 4, 5, 6] : [1, 2, 3],
        },
      }),
      ...(mode === "full"
        ? [
            Table.configure({
              resizable: true,
              HTMLAttributes: {
                class: "border-collapse border border-input",
              },
            }),
            TableRow,
            TableHeader,
            TableCell,
            TextAlign.configure({
              types: ["heading", "paragraph"],
              alignments: ["left", "center", "right", "justify"],
            }),
            FontFamily,
          ]
        : []),
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
    content: convertedValue,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editable: !disabled,
  });

  useEffect(() => {
    if (editor && convertedValue !== editor.getHTML()) {
      editor.commands.setContent(convertedValue);
    }
  }, [convertedValue, editor]);

  useEffect(() => {
    if (editor && isSourceView) {
      setSourceValue(editor.getHTML());
    }
  }, [editor, isSourceView]);

  const toggleSourceView = () => {
    if (isSourceView) {
      if (editor) {
        editor.commands.setContent(sourceValue);
        onChange(sourceValue);
      }
    } else if (editor) {
      setSourceValue(editor.getHTML());
    }
    setIsSourceView(!isSourceView);
  };

  const setLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) return;

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addImage = () => {
    if (!editor) return;
    const url = window.prompt("Image URL");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const insertTable = () => {
    if (!editor) return;
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const insertHorizontalRule = () => {
    if (!editor) return;
    editor.chain().focus().setHorizontalRule().run();
  };

  const handleCopy = async () => {
    if (!editor) return;
    const html = editor.getHTML();
    try {
      await navigator.clipboard.writeText(html);
      toast.success("Content copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handlePaste = async () => {
    if (!editor) return;
    try {
      const text = await navigator.clipboard.readText();
      editor.chain().focus().insertContent(text).run();
    } catch {
      toast.error("Failed to paste");
    }
  };

  const handlePasteAsText = async () => {
    if (!editor) return;
    try {
      const text = await navigator.clipboard.readText();
      editor.chain().focus().insertContent(text, { parseOptions: { preserveWhitespace: "full" } }).run();
    } catch {
      toast.error("Failed to paste");
    }
  };

  const handleCut = () => {
    if (!editor) return;
    editor.chain().focus().deleteSelection().run();
    toast.success("Content cut");
  };

  const removeFormat = () => {
    if (!editor) return;
    editor.chain().focus().clearNodes().unsetAllMarks().run();
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
      editor.chain().focus().setMark("textStyle", { backgroundColor: color }).run();
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
      
      {/* Toolbar */}
      <div className={`border border-input rounded-t-md p-2 bg-muted space-y-2 ${error ? "border-red-500" : ""}`}>
        {/* Row 1: File/Edit Actions (Full mode only) */}
        {mode === "full" && (
          <div className="flex flex-wrap gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={toggleSourceView}
              className={isSourceView ? "bg-gray-200" : ""}
              title="Source"
              disabled={disabled}
            >
              <Code2 className="h-4 w-4 mr-1" />
              Source
            </Button>
            
            <div className="w-px h-6 bg-gray-300 mx-1" />
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              title="Copy"
              disabled={disabled}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCut}
              title="Cut"
              disabled={disabled}
            >
              <Scissors className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handlePaste}
              title="Paste"
              disabled={disabled}
            >
              <ClipboardPaste className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handlePasteAsText}
              title="Paste as text"
              disabled={disabled}
            >
              <ClipboardType className="h-4 w-4" />
            </Button>
            
            <div className="w-px h-6 bg-gray-300 mx-1" />
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo() || disabled}
              title="Undo"
            >
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo() || disabled}
              title="Redo"
            >
              <Redo2 className="h-4 w-4" />
            </Button>
            
            <div className="w-px h-6 bg-gray-300 mx-1" />
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => window.print()}
              title="Print"
              disabled={disabled}
            >
              <FileText className="h-4 w-4" />
            </Button>
            
            <div className="w-px h-6 bg-gray-300 mx-1" />
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title="Fullscreen"
              disabled={disabled}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}

        {/* Row 2: Text Formatting */}
        <div className="flex flex-wrap gap-1">
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
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={editor.isActive("strike") ? "bg-gray-200" : ""}
            title="Strikethrough"
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
            title="Subscript"
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
            title="Superscript"
            disabled={disabled}
          >
            <SuperscriptIcon className="h-4 w-4" />
          </Button>
          
          <div className="w-px h-6 bg-gray-300 mx-1" />
          
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
                <Type className="h-4 w-4" />
                <div 
                  className="w-3 h-3 rounded border border-input ml-1"
                  style={{ backgroundColor: textColor }}
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2">
              <div className="grid grid-cols-8 gap-1">
                {commonColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="w-6 h-6 rounded border border-input hover:scale-110 transition"
                    style={{ backgroundColor: color }}
                    onClick={() => setTextColorValue(color)}
                  />
                ))}
              </div>
              <Input
                type="color"
                value={textColor}
                onChange={(e) => setTextColorValue(e.target.value)}
                className="mt-2 h-8"
              />
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
              >
                <Type className="h-4 w-4" />
                <div 
                  className="w-3 h-3 rounded border border-input ml-1 bg-yellow-200 dark:bg-yellow-800"
                  style={{ backgroundColor: bgColor }}
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2">
              <div className="grid grid-cols-8 gap-1">
                {commonColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="w-6 h-6 rounded border border-input hover:scale-110 transition"
                    style={{ backgroundColor: color }}
                    onClick={() => setBgColorValue(color)}
                  />
                ))}
              </div>
              <Input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColorValue(e.target.value)}
                className="mt-2 h-8"
              />
            </PopoverContent>
          </Popover>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={removeFormat}
            title="Remove Format"
            disabled={disabled}
          >
            <Eraser className="h-4 w-4" />
          </Button>
          
          <div className="w-px h-6 bg-gray-300 mx-1" />
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
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
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive("orderedList") ? "bg-gray-200" : ""}
            title="Numbered List"
            disabled={disabled}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          
          {mode === "full" && (
            <>
              <div className="w-px h-6 bg-gray-300 mx-1" />
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={editor.isActive("blockquote") ? "bg-gray-200" : ""}
                title="Blockquote"
                disabled={disabled}
              >
                <Quote className="h-4 w-4" />
              </Button>
              
              <div className="w-px h-6 bg-gray-300 mx-1" />
              
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
            </>
          )}
          
          <div className="w-px h-6 bg-gray-300 mx-1" />
          
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
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addImage}
            title="Image"
            disabled={disabled}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          
          {mode === "full" && (
            <>
              <div className="w-px h-6 bg-gray-300 mx-1" />
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={insertTable}
                title="Insert Table"
                disabled={disabled}
              >
                <FileText className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={insertHorizontalRule}
                title="Horizontal Rule"
                disabled={disabled}
              >
                <Minus className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {/* Row 3: Styles, Format, Font, Size (Full mode only) */}
        {mode === "full" && (
          <div className="flex flex-wrap gap-1 items-center">
            <Select
              onValueChange={(value) => {
                if (value === "p") {
                  editor.chain().focus().setParagraph().run();
                } else if (value.startsWith("h")) {
                  const level = parseInt(value.replace("h", "")) as 1 | 2 | 3 | 4 | 5 | 6;
                  editor.chain().focus().toggleHeading({ level }).run();
                }
              }}
            >
              <SelectTrigger className="w-[120px] h-8 text-xs" disabled={disabled}>
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="p">Paragraph</SelectItem>
                <SelectItem value="h1">Heading 1</SelectItem>
                <SelectItem value="h2">Heading 2</SelectItem>
                <SelectItem value="h3">Heading 3</SelectItem>
                <SelectItem value="h4">Heading 4</SelectItem>
                <SelectItem value="h5">Heading 5</SelectItem>
                <SelectItem value="h6">Heading 6</SelectItem>
              </SelectContent>
            </Select>

            <Select
              onValueChange={(value) => {
                editor.chain().focus().setFontFamily(value).run();
              }}
            >
              <SelectTrigger className="w-[120px] h-8 text-xs" disabled={disabled}>
                <SelectValue placeholder="Font" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Arial">Arial</SelectItem>
                <SelectItem value="Helvetica">Helvetica</SelectItem>
                <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                <SelectItem value="Courier New">Courier New</SelectItem>
                <SelectItem value="Verdana">Verdana</SelectItem>
                <SelectItem value="Georgia">Georgia</SelectItem>
                <SelectItem value="Palatino">Palatino</SelectItem>
                <SelectItem value="Garamond">Garamond</SelectItem>
                <SelectItem value="Comic Sans MS">Comic Sans MS</SelectItem>
                <SelectItem value="Trebuchet MS">Trebuchet MS</SelectItem>
                <SelectItem value="Impact">Impact</SelectItem>
              </SelectContent>
            </Select>

            <Select
              onValueChange={(value) => {
                editor.chain().focus().setMark("textStyle", { fontSize: value }).run();
              }}
            >
              <SelectTrigger className="w-[100px] h-8 text-xs" disabled={disabled}>
                <SelectValue placeholder="Size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="8px">8</SelectItem>
                <SelectItem value="10px">10</SelectItem>
                <SelectItem value="12px">12</SelectItem>
                <SelectItem value="14px">14</SelectItem>
                <SelectItem value="16px">16</SelectItem>
                <SelectItem value="18px">18</SelectItem>
                <SelectItem value="24px">24</SelectItem>
                <SelectItem value="32px">32</SelectItem>
                <SelectItem value="48px">48</SelectItem>
                <SelectItem value="72px">72</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Editor Content */}
      {isSourceView ? (
        <div className="border border-input border-t-0 rounded-b-md bg-background" style={{ minHeight }}>
          <textarea
            value={sourceValue}
            onChange={(e) => setSourceValue(e.target.value)}
            className="w-full font-mono text-sm p-2 border-0 rounded-b-md bg-background text-foreground"
            style={{ minHeight }}
            placeholder="HTML source code"
            disabled={disabled}
          />
          <div className="p-2 border-t border-input">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={toggleSourceView}
              disabled={disabled}
            >
              Update
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={`border border-input border-t-0 rounded-b-md p-4 prose prose-sm dark:prose-invert max-w-none bg-background text-foreground ${isFullscreen ? "fixed inset-4 z-50 bg-background rounded-lg shadow-2xl" : ""} ${error ? "border-red-500" : ""}`}
          style={{ minHeight }}
        >
          <EditorContent
            editor={editor}
            className="[&_.ProseMirror]:outline-none [&_.ProseMirror]:prose [&_.ProseMirror]:prose-sm [&_.ProseMirror]:dark:prose-invert [&_.ProseMirror]:max-w-none [&_.ProseMirror]:text-foreground [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0"
          />
        </div>
      )}
      
      {error && errorMessage && (
        <p className="text-sm text-red-500">{errorMessage}</p>
      )}
    </div>
  );
}

