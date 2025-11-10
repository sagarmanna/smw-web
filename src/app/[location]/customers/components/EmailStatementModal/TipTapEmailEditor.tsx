'use client';

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { Image } from '@tiptap/extension-image';
import { Underline } from '@tiptap/extension-underline';
import { Subscript as SubscriptMark } from '@tiptap/extension-subscript';
import { Superscript as SuperscriptMark } from '@tiptap/extension-superscript';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { FontFamily } from '@tiptap/extension-font-family';
import { Link } from '@tiptap/extension-link';
import { TextAlign } from '@tiptap/extension-text-align';
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight,
  Heading1, Heading2, Heading3, Quote, Code,
  Undo2, Redo2,
  TableIcon, Plus, Trash2, Maximize2, Minimize2,
  Save as SaveIcon, FilePlus, Eye, Printer, Code2, ChevronDown,
  Scissors, Copy as CopyIcon, ClipboardPaste, ClipboardType, FileText,
  X as CloseIcon, Search, BoxSelect, SpellCheck,
  LayoutPanelLeft, CheckSquare, CircleDot, Type as TypeIcon, AlignJustify, ChevronDown as ChevronDownSmall,
  MousePointerClick, Image as ImageIcon, EyeOff, Subscript as SubscriptIcon, Superscript as SuperscriptIcon, Eraser,
  ChevronLeft, ChevronRight, Languages, MoveLeft, MoveRight, Square, Link2 as Link2Icon, Link2Off as Link2OffIcon, Flag as FlagIcon
} from 'lucide-react';

interface TipTapEmailEditorProps {
  content: string;
  onChange: (html: string) => void;
  onFullscreenChange?: (isFullscreen: boolean) => void;
  isFullscreen?: boolean;
  className?: string;
  templates?: Array<{ label: string; content: string; description?: string }>;
  localStorageKey?: string;
}

type AnchorOption = {
  id: string;
  name?: string;
};

export default function TipTapEmailEditor({
  content,
  onChange,
  onFullscreenChange,
  isFullscreen = false,
  className = '',
  templates = [],
  localStorageKey = 'email-editor-draft'
}: TipTapEmailEditorProps) {
  const [isSourceView, setIsSourceView] = React.useState(false);
  const [sourceValue, setSourceValue] = React.useState('');
  const [showTemplates, setShowTemplates] = React.useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = React.useState(false);
  const [selectedTemplate, setSelectedTemplate] = React.useState<number>(0);
  const [showBlocks, setShowBlocks] = React.useState(false);
  const [replaceContents, setReplaceContents] = React.useState(true);
  const [saveHint, setSaveHint] = React.useState<string | null>(null);
  const [hasSelection, setHasSelection] = React.useState(false);
  const [isPasteOpen, setIsPasteOpen] = React.useState(false);
  const [pasteMode, setPasteMode] = React.useState<'rich' | 'plain' | 'word'>('rich');
  const [pasteInput, setPasteInput] = React.useState('');
  const [isFindOpen, setIsFindOpen] = React.useState(false);
  const [findText, setFindText] = React.useState('');
  const [replaceText, setReplaceText] = React.useState('');
  const [caseSensitive, setCaseSensitive] = React.useState(false);
  const [wholeWord, setWholeWord] = React.useState(false);
  const [cyclic, setCyclic] = React.useState(true);
  const [findTab, setFindTab] = React.useState<'find'|'replace'>('find');
  const [findWarning, setFindWarning] = React.useState<string | null>(null);
  const [isLinkOpen, setIsLinkOpen] = React.useState(false);
  const [linkTab, setLinkTab] = React.useState<'info'|'target'|'advanced'>('info');
  const [linkType, setLinkType] = React.useState<'url'|'anchor'|'email'>('url');
  const [protocol, setProtocol] = React.useState<'http'|'https'|'ftp'|'news'|'other'>('http');
  const [linkUrl, setLinkUrl] = React.useState('');
  const [linkText, setLinkText] = React.useState('');
  const [linkTitle, setLinkTitle] = React.useState('');
  const [linkNewWindow, setLinkNewWindow] = React.useState(true);
  const [targetOpt, setTargetOpt] = React.useState<'notset'|'frame'|'popup'|'_blank'|'_top'|'_self'|'_parent'>('notset');
  const [anchorList, setAnchorList] = React.useState<AnchorOption[]>([]);
  const [anchorTarget, setAnchorTarget] = React.useState('');
  const [anchorTargetByName, setAnchorTargetByName] = React.useState('');
  const [anchorTargetById, setAnchorTargetById] = React.useState('');
  const [emailAddr, setEmailAddr] = React.useState('');
  // Email extras for mailto links
  const [emailSubject, setEmailSubject] = React.useState('');
  const [emailBody, setEmailBody] = React.useState('');
  // Store selection when opening link modal
  const [linkSelectionFrom, setLinkSelectionFrom] = React.useState<number | null>(null);
  const [linkSelectionTo, setLinkSelectionTo] = React.useState<number | null>(null);
  // Advanced fields
  const [advId, setAdvId] = React.useState('');
  const [advName, setAdvName] = React.useState('');
  const [advLangDir, setAdvLangDir] = React.useState<'notset'|'ltr'|'rtl'>('notset');
  const [advLangCode, setAdvLangCode] = React.useState('');
  const [advAccessKey, setAdvAccessKey] = React.useState('');
  const [advTabIndex, setAdvTabIndex] = React.useState('');
  const [advTitle, setAdvTitle] = React.useState('');
  const [advClasses, setAdvClasses] = React.useState('');
  const [advRel, setAdvRel] = React.useState('');
  const [advStyle, setAdvStyle] = React.useState('');
  const [advContentType, setAdvContentType] = React.useState('');
  const [advCharset, setAdvCharset] = React.useState('');
  const [isAnchorOpen, setIsAnchorOpen] = React.useState(false);
  const [anchorId, setAnchorId] = React.useState('');
  const [anchorName, setAnchorName] = React.useState('');
  // Rich insertions
  const [imgAsTag, setImgAsTag] = React.useState(false);
  const [isFlashOpen, setIsFlashOpen] = React.useState(false);
  const [flashUrl, setFlashUrl] = React.useState('');
  const [flashWidth, setFlashWidth] = React.useState('');
  const [flashHeight, setFlashHeight] = React.useState('');
  const [flashHSpace, setFlashHSpace] = React.useState('');
  const [flashVSpace, setFlashVSpace] = React.useState('');
  const [flashTab, setFlashTab] = React.useState<'general'|'properties'|'advanced'>('general');
  const [flashScale, setFlashScale] = React.useState<'notset'|'showall'|'noborder'|'exactfit'>('notset');
  const [flashScriptAccess, setFlashScriptAccess] = React.useState<'notset'|'always'|'samedomain'|'never'>('notset');
  const [flashWindowMode, setFlashWindowMode] = React.useState<'notset'|'window'|'opaque'|'transparent'>('notset');
  const [flashQuality, setFlashQuality] = React.useState<'notset'|'best'|'high'|'autohigh'|'medium'|'autolow'|'low'>('high');
  const [flashAlign, setFlashAlign] = React.useState<'notset'|'left'|'absbottom'|'absmiddle'|'baseline'|'bottom'|'middle'|'right'|'texttop'|'top'>('notset');
  const [flashMenu, setFlashMenu] = React.useState(true);
  const [flashAutoPlay, setFlashAutoPlay] = React.useState(true);
  const [flashLoop, setFlashLoop] = React.useState(true);
  const [flashAllowFullscreen, setFlashAllowFullscreen] = React.useState(true);
  const [flashId, setFlashId] = React.useState('');
  const [flashBgColor, setFlashBgColor] = React.useState('');
  const [flashClasses, setFlashClasses] = React.useState('');
  const [flashStyle, setFlashStyle] = React.useState('');
  const [isIframeOpen, setIsIframeOpen] = React.useState(false);
  const [iframeTab, setIframeTab] = React.useState<'general'|'advanced'>('general');
  const [iframeUrl, setIframeUrl] = React.useState('');
  const [iframeWidth, setIframeWidth] = React.useState('');
  const [iframeHeight, setIframeHeight] = React.useState('');
  const [iframeAlign, setIframeAlign] = React.useState<'notset'|'left'|'right'|'top'|'middle'|'bottom'>('notset');
  const [iframeScrollbars, setIframeScrollbars] = React.useState(false);
  const [iframeBorder, setIframeBorder] = React.useState(false);
  const [iframeName, setIframeName] = React.useState('');
  const [iframeTitle, setIframeTitle] = React.useState('');
  const [iframeLongDesc, setIframeLongDesc] = React.useState('');
  const [iframeAllow, setIframeAllow] = React.useState(true);
  const [iframeId, setIframeId] = React.useState('');
  const [iframeStyle, setIframeStyle] = React.useState('');
  const [iframeClasses, setIframeClasses] = React.useState('');
  // Table insert modal
  const [isTableOpen, setIsTableOpen] = React.useState(false);
  const [tableTab, setTableTab] = React.useState<'props'|'advanced'>('props');
  const [tableRows, setTableRows] = React.useState('3');
  const [tableCols, setTableCols] = React.useState('3');
  const [tableWidth, setTableWidth] = React.useState('');
  const [tableHeight, setTableHeight] = React.useState('');
  const [tableHeaders, setTableHeaders] = React.useState<'none'|'row'|'col'|'both'>('none');
  const [tableBorder, setTableBorder] = React.useState('1');
  const [tableAlign, setTableAlign] = React.useState<'notset'|'left'|'center'|'right'>('notset');
  const [tableCellSpacing, setTableCellSpacing] = React.useState('1');
  const [tableCellPadding, setTableCellPadding] = React.useState('1');
  const [tableCaption, setTableCaption] = React.useState('');
  const [tableSummary, setTableSummary] = React.useState('');
  const [tableId, setTableId] = React.useState('');
  const [tableLangDir, setTableLangDir] = React.useState<'notset'|'ltr'|'rtl'>('notset');
  const [tableStyle, setTableStyle] = React.useState('');
  const [tableClasses, setTableClasses] = React.useState('');
  const [smileyOpen, setSmileyOpen] = React.useState(false);
  const [specialOpen, setSpecialOpen] = React.useState(false);
  const [specialSelected, setSpecialSelected] = React.useState<string | null>(null);
  // Form properties modal state (keep hooks grouped to ensure stable order)
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [formSelectionHtml, setFormSelectionHtml] = React.useState<string>('');
  const [formName, setFormName] = React.useState<string>('');
  const [formAction, setFormAction] = React.useState<string>('');
  const [formId, setFormId] = React.useState<string>('');
  const [formEncoding, setFormEncoding] = React.useState<''|'text/plain' | 'multipart/form-data' | 'application/x-www-form-urlencoded'>('');
  const [formTarget, setFormTarget] = React.useState<'notset' | '_blank' | '_top' | '_self' | '_parent'>('notset');
  const [formMethod, setFormMethod] = React.useState<' ' | 'GET' | 'POST'>(' ');

  // Checkbox/Radio properties modal state (keep order stable)
  const [isCRModalOpen, setIsCRModalOpen] = React.useState(false);
  const [crType, setCrType] = React.useState<'checkbox' | 'radio'>('checkbox');
  const [crName, setCrName] = React.useState<string>('');
  const [crValue, setCrValue] = React.useState<string>('');
  const [crSelected, setCrSelected] = React.useState<boolean>(false);

  // Text Field properties modal state
  const [isTFModalOpen, setIsTFModalOpen] = React.useState(false);
  const [tfName, setTfName] = React.useState<string>('');
  const [tfValue, setTfValue] = React.useState<string>('');
  const [tfWidth, setTfWidth] = React.useState<string>('');
  const [tfMax, setTfMax] = React.useState<string>('');
  const [tfType, setTfType] = React.useState<'text' | 'password' | 'email' | 'search' | 'tel' | 'url'>('text');

  // Textarea properties modal state
  const [isTAModalOpen, setIsTAModalOpen] = React.useState(false);
  const [taName, setTaName] = React.useState<string>('');
  const [taCols, setTaCols] = React.useState<string>('');
  const [taRows, setTaRows] = React.useState<string>('');
  const [taValue, setTaValue] = React.useState<string>('');

  // Selection field properties modal state
  const [isSELModalOpen, setIsSELModalOpen] = React.useState(false);
  const [selName, setSelName] = React.useState<string>('');
  const [selSize, setSelSize] = React.useState<string>('');
  const [selMultiple, setSelMultiple] = React.useState<boolean>(false);
  const [optText, setOptText] = React.useState<string>('');
  const [optValue, setOptValue] = React.useState<string>('');
  const [selOptions, setSelOptions] = React.useState<Array<{ text: string; value: string; selected: boolean }>>([]);
  const [selIndex, setSelIndex] = React.useState<number | null>(null);

  // Button properties modal state
  const [isBTNModalOpen, setIsBTNModalOpen] = React.useState(false);
  const [btnName, setBtnName] = React.useState<string>('');
  const [btnText, setBtnText] = React.useState<string>('');
  const [btnType, setBtnType] = React.useState<'button' | 'submit' | 'reset'>('button');

  // Image Button properties modal state
  const [isIMGModalOpen, setIsIMGModalOpen] = React.useState(false);
  const [imgTab, setImgTab] = React.useState<'info' | 'link' | 'advanced'>('info');
  const [imgUrl, setImgUrl] = React.useState<string>('');
  const [imgAlt, setImgAlt] = React.useState<string>('');
  const [imgWidth, setImgWidth] = React.useState<string>('');
  const [imgHeight, setImgHeight] = React.useState<string>('');
  const [imgKeepRatio, setImgKeepRatio] = React.useState<boolean>(false);
  const [imgBorder, setImgBorder] = React.useState<string>('');
  const [imgHSpace, setImgHSpace] = React.useState<string>('');
  const [imgVSpace, setImgVSpace] = React.useState<string>('');
  const [imgAlign, setImgAlign] = React.useState<'notset' | 'left' | 'right' | 'baseline' | 'top' | 'middle' | 'bottom'>('notset');
  // Advanced
  const [imgId, setImgId] = React.useState<string>('');
  const [imgLangDir, setImgLangDir] = React.useState<'notset' | 'ltr' | 'rtl'>('notset');
  const [imgLangCode, setImgLangCode] = React.useState<string>('');
  const [imgLongDesc, setImgLongDesc] = React.useState<string>('');
  const [imgClasses, setImgClasses] = React.useState<string>('');
  const [imgStyle, setImgStyle] = React.useState<string>('');
  const [imgRatio, setImgRatio] = React.useState<number | null>(null);

  // Hidden field modal state
  const [isHIDModalOpen, setIsHIDModalOpen] = React.useState(false);
  const [hidName, setHidName] = React.useState<string>('');
  const [hidValue, setHidValue] = React.useState<string>('');

  const [spellcheckEnabled, setSpellcheckEnabled] = React.useState(true);
  const [spellMenuOpen, setSpellMenuOpen] = React.useState(false);
  const [language, setLanguage] = React.useState<'en' | 'en-US' | 'en-GB' | 'en-CA'>('en-US');
  const [isDivModalOpen, setIsDivModalOpen] = React.useState(false);
  const [divTab, setDivTab] = React.useState<'general'|'advanced'>('general');
  const [divStylePreset, setDivStylePreset] = React.useState<'notset'|'special'>('notset');
  const [divClasses, setDivClasses] = React.useState('');
  const [divId, setDivId] = React.useState('');
  const [divLangCode, setDivLangCode] = React.useState('');
  const [divInlineStyle, setDivInlineStyle] = React.useState('');
  const [divTitle, setDivTitle] = React.useState('');
  const [divDir, setDivDir] = React.useState<'notset'|'ltr'|'rtl'>('notset');
  const [languageMenuOpen, setLanguageMenuOpen] = React.useState(false);
  const editor = useEditor({
    immediatelyRender: false, // Fix SSR hydration mismatch
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'email-table',
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
      Image,
      Underline,
      TextStyle,
      Color,
      FontFamily,
      SubscriptMark,
      SuperscriptMark,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'email-link',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right'],
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor-content',
      },
    },
  });

  // Helper to reliably apply text style to selection or caret
  const applyTextStyle = (attrs: Record<string, string>) => {
    if (!editor || isSourceView) return;
    const { state } = editor;
    const { empty, from, to, $from } = state.selection;
    // If there is no selection, apply to the entire current text block
    if (empty) {
      const blockStart = $from.start();
      const blockEnd = $from.end();
      const originalPos = from;
      editor
        .chain()
        .focus()
        .setTextSelection({ from: blockStart, to: blockEnd })
        .extendMarkRange('textStyle')
        .setMark('textStyle', attrs)
        .setTextSelection({ from: originalPos, to: originalPos })
        .run();
      return;
    }
    // With a selection, just apply to the selected range
    editor.chain().focus().extendMarkRange('textStyle').setMark('textStyle', attrs).run();
  };

  const applyStyleFromDropdown = (value: string) => {
    if (!editor || !value) return;
    const chain = editor.chain().focus();
    switch (value) {
      // Block styles
      case 'italic-title':
        chain.setHeading({ level: 2 }).run();
        editor.chain().focus().toggleItalic().run();
        break;
      case 'subtitle':
        chain.setParagraph().run();
        editor.chain().focus().toggleItalic().run();
        editor.chain().focus().setColor('#6b7280').run();
        editor.chain().focus().setMark('textStyle', { fontSize: '18px' }).run();
        break;
      case 'special-container':
        editor.commands.insertContent('<div style="border:1px solid #d1d5db;padding:12px;border-radius:6px;background:#f9fafb;">&ZeroWidthSpace;</div>');
        break;
      case 'blockquote':
        chain.toggleBlockquote().run();
        break;
      case 'code-block':
        chain.toggleCodeBlock().run();
        break;

      // Inline styles
      case 'marker':
        applyTextStyle({ backgroundColor: '#ffff00' });
        break;
      case 'big': {
        // 18px approximates Big; use larger if desired
        applyTextStyle({ fontSize: '18px' });
        break;
      }
      case 'small': {
        applyTextStyle({ fontSize: '12px' });
        break;
      }
      case 'typewriter':
        editor.chain().focus().setFontFamily("'Courier New', Courier, monospace").run();
        break;
      case 'computer-code':
        chain.toggleCode().run();
        break;
      case 'keyboard-phrase':
        editor.chain().focus().setFontFamily("'Courier New', Courier, monospace").run();
        editor.chain().focus().setMark('textStyle', { backgroundColor: '#f3f4f6' }).run();
        break;
      case 'sample-text':
        editor.chain().focus().setFontFamily("'Courier New', Courier, monospace").run();
        editor.chain().focus().toggleItalic().run();
        break;
      case 'variable':
        editor.chain().focus().toggleItalic().run();
        break;
      case 'deleted-text':
        chain.toggleStrike().run();
        break;
      case 'inserted-text':
        chain.toggleUnderline().run();
        break;
      case 'cited-work':
        editor.chain().focus().toggleItalic().run();
        break;
      case 'inline-quotation':
        editor.chain().focus().toggleItalic().run();
        break;
      case 'language-rtl':
        wrapSelectionWithDir('rtl');
        break;
      case 'language-ltr':
        wrapSelectionWithDir('ltr');
        break;
    }
  };

  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Keep source view in sync when we toggle it on
  React.useEffect(() => {
    if (!editor) return;
    if (isSourceView) {
      setSourceValue(editor.getHTML());
    }
  }, [isSourceView, editor]);

  // Track selection changes to enable/disable Cut/Copy dynamically
  React.useEffect(() => {
    if (!editor) return;
    const updateSelection = () => {
      setHasSelection(!editor.state.selection.empty);
    };
    updateSelection();
    editor.on('selectionUpdate', updateSelection);
    editor.on('transaction', updateSelection);
    return () => {
      editor.off('selectionUpdate', updateSelection);
      editor.off('transaction', updateSelection);
    };
  }, [editor]);

  // Keep spellcheck attribute in sync (place before any conditional returns)
  React.useEffect(() => {
    if (!editor) return;
    editor.view.dom.setAttribute('spellcheck', String(spellcheckEnabled));
    editor.view.dom.setAttribute('lang', language);
  }, [editor, spellcheckEnabled, language]);

  if (!editor) {
    return <div className="p-4 text-gray-500">Loading editor...</div>;
  }

  const ToolbarButton = ({ 
    onClick, 
    isActive = false, 
    disabled = false, 
    children, 
    title 
  }: { 
    onClick: () => void; 
    isActive?: boolean; 
    disabled?: boolean; 
    children: React.ReactNode; 
    title: string;
  }) => (
    <button
      onMouseDown={(e) => {
        // Prevent editor blur so selection stays intact for clipboard actions
        e.preventDefault();
      }}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
        isActive ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {children}
    </button>
  );

  const ToolbarDivider = () => (
    <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
  );

  

  const getCurrentHTML = (): string => {
    if (isSourceView) return sourceValue;
    return editor.getHTML();
  };

  const handleSave = () => {
    const html = getCurrentHTML();
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(localStorageKey, html);
        setSaveHint('Saved');
        setTimeout(() => setSaveHint(null), 1500);
      }
    } catch {
      // ignore storage errors
    }
  };

  const handleNewPage = () => {
    const proceed = typeof window === 'undefined' ? true : window.confirm('Start a new page? Current content will be cleared.');
    if (!proceed) return;
    onChange('');
    editor.commands.setContent('');
    if (isSourceView) setSourceValue('');
  };

  const getSelectionAsHtmlAndText = (): { html: string; text: string } | null => {
    if (typeof window === 'undefined') return null;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return null;
    const range = selection.getRangeAt(0);
    const container = document.createElement('div');
    container.appendChild(range.cloneContents());
    return { html: container.innerHTML, text: selection.toString() };
  };

  const replaceSelectionHtml = (html: string) => {
    // Insert HTML over the current selection
    editor.chain().focus().insertContent(html).run();
  };

  const writeToClipboard = async (_html: string, text: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (_) {
      // fall through to legacy execCommand
    }
    try {
      return document.execCommand('copy');
    } catch (_) {
      return false;
    }
  };

  const getAnchorsFromHtml = (html: string): AnchorOption[] => {
    const map = new Map<string, AnchorOption>();
    try {
      const div = document.createElement('div');
      div.innerHTML = html;
      const elements = div.querySelectorAll('[data-anchor-id], [data-anchor-name], a[id], a[name]');
      elements.forEach((el) => {
        const element = el as HTMLElement;
        const id = element.id?.trim();
        if (!id) return;
        const candidateName =
          element.getAttribute('data-anchor-name') ||
          element.getAttribute('name') ||
          undefined;
        const name = candidateName ? candidateName.trim() : undefined;
        const existing = map.get(id);
        if (existing) {
          if (!existing.name && name) {
            map.set(id, { id, name });
          }
        } else {
          map.set(id, { id, name });
        }
      });
    } catch {}
    return Array.from(map.values());
  };

  const openLinkModal = () => {
    const { from, to } = editor.state.selection;
    setLinkSelectionFrom(from);
    setLinkSelectionTo(to);

    const sel = getSelectionAsHtmlAndText();
    setLinkTab('info');
    setLinkType('url');
    setProtocol('http');
    setLinkText(sel?.text || '');
    setLinkUrl('');
    setLinkTitle('');
    setLinkNewWindow(true);
    setTargetOpt('notset');
    setAnchorTarget('');
    setAnchorTargetByName('');
    setAnchorTargetById('');
    setEmailAddr('');
    setEmailSubject('');
    setEmailBody('');
    setAdvId('');
    setAdvName('');
    setAdvLangDir('notset');
    setAdvLangCode('');
    setAdvAccessKey('');
    setAdvTabIndex('');
    setAdvTitle('');
    setAdvClasses('');
    setAdvRel('');
    setAdvStyle('');
    setAdvContentType('');
    setAdvCharset('');
    setAnchorList(getAnchorsFromHtml(editor.getHTML()));
    setIsLinkOpen(true);
  };

  const buildHref = (): string => {
    if (linkType === 'url') {
      const url = linkUrl.trim();
      if (!url) return '';
      if (protocol === 'other') return url;
      const prefix = protocol + '://';
      return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('ftp://') || url.startsWith('news://') ? url : `${prefix}${url}`;
    }
    if (linkType === 'anchor') {
      const target = anchorTarget.trim();
      if (!target) return '';
      return target.startsWith('#') ? target : `#${target}`;
    }
    // email
    const raw = emailAddr.trim();
    if (!raw) return '';
    const recipients = raw
      .split(/[;,]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .join(',');
    const params: string[] = [];
    if (emailSubject.trim()) params.push(`subject=${encodeURIComponent(emailSubject.trim())}`);
    if (emailBody.trim()) params.push(`body=${encodeURIComponent(emailBody.trim())}`);
    const query = params.length ? `?${params.join('&')}` : '';
    return `mailto:${recipients}${query}`;
  };

  const submitLinkModal = () => {
    const href = buildHref();
    if (!href) { setIsLinkOpen(false); return; }

    const linkAttrs: { href: string; target?: string | null; rel?: string | null; class?: string | null } = { href };
    const extraAttrs: Record<string, string> = {};

    // Target mapping
    if (targetOpt === '_blank') {
      linkAttrs.target = '_blank';
      linkAttrs.rel = 'noopener noreferrer';
    } else if (targetOpt !== 'notset' && targetOpt !== 'popup' && targetOpt !== 'frame') {
      linkAttrs.target = targetOpt;
    }

    // Advanced attributes
    if (advClasses.trim()) linkAttrs.class = advClasses.trim();
    if (advTitle.trim()) extraAttrs.title = advTitle.trim();
    if (advStyle.trim()) extraAttrs.style = advStyle.trim();
    if (advId.trim()) extraAttrs.id = advId.trim();
    if (advLangCode.trim()) extraAttrs.lang = advLangCode.trim();
    if (advLangDir !== 'notset') extraAttrs.dir = advLangDir;
    if (advRel.trim()) {
      const combinedRel = linkAttrs.rel ? `${linkAttrs.rel} ${advRel.trim()}` : advRel.trim();
      linkAttrs.rel = combinedRel;
    }

    const applyExtraAttrs = (chain: ReturnType<typeof editor.chain>) => {
      if (Object.keys(extraAttrs).length) {
        chain.updateAttributes('link', extraAttrs as { [key: string]: string | null });
      }
      return chain;
    };

    // Restore the saved selection and apply the link
    if (linkSelectionFrom !== null && linkSelectionTo !== null) {
      // If there was a selection when modal opened, restore it and apply link
      applyExtraAttrs(
        editor
        .chain()
        .focus()
        .setTextSelection({ from: linkSelectionFrom, to: linkSelectionTo })
        .setLink(linkAttrs)
      ).run();
    } else {
      // No selection - just insert the link with the URL as text
      const allAttrs = { ...linkAttrs, ...extraAttrs };
      const attrString = Object.entries(allAttrs)
        .filter(([, value]) => value != null && value !== '')
        .map(([key, value]) => `${key}="${escapeHtml(String(value))}"`)
      .join(' ');
      editor
        .chain()
        .focus()
        .insertContent(`<a ${attrString}>${escapeHtml(href)}</a>`)
        .run();
    }

    setLinkSelectionFrom(null);
    setLinkSelectionTo(null);
    setIsLinkOpen(false);
  };

  // Reusable Link Info section (used in Link modal and Image modal → Link tab)
  const LinkInfoFields = ({ withTypeSelector = true }: { withTypeSelector?: boolean }) => {
    const effectiveType = withTypeSelector ? linkType : 'url';
    const anchorNameOptions = Array.from(
      anchorList
        .filter((item): item is AnchorOption & { name: string } => Boolean(item.name))
        .reduce((acc, item) => {
          if (!acc.has(item.name)) acc.set(item.name, item);
          return acc;
        }, new Map<string, AnchorOption>())
        .values()
    );

    return (
    <div className="space-y-4">
        {withTypeSelector && (
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Link Type</label>
            <select
              value={linkType}
              onChange={(e)=>{
                const value = e.target.value as 'url'|'anchor'|'email';
                setLinkType(value);
                if (value !== 'anchor') {
                  setAnchorTarget('');
                  setAnchorTargetByName('');
                  setAnchorTargetById('');
                }
              }}
              className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm"
            >
              <option value="url">URL</option>
              <option value="anchor">Link to anchor in the text</option>
              <option value="email">E-mail</option>
            </select>
          </div>
        )}

        {effectiveType === 'url' && (
        <div className="grid grid-cols-12 gap-4 items-end">
          <div className="col-span-3">
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Protocol</label>
              <select
                value={protocol}
                onChange={(e)=>setProtocol(e.target.value as 'http'|'https'|'ftp'|'news'|'other')}
                className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm"
              >
              <option value="http">http://</option>
              <option value="https">https://</option>
              <option value="ftp">ftp://</option>
              <option value="news">news://</option>
              <option value="other">&lt;other&gt;</option>
            </select>
          </div>
          <div className="col-span-9">
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">URL</label>
              <input
                value={linkUrl}
                onChange={(e)=>setLinkUrl(e.target.value)}
                placeholder="example.com/path"
                className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm"
              />
          </div>
        </div>
      )}

        {withTypeSelector && effectiveType === 'anchor' && (
          <div className="grid grid-cols-2 gap-4">
        <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">By Anchor Name</label>
              <select
                value={anchorTargetByName}
                onChange={(e) => {
                  const value = e.target.value;
                  setAnchorTargetByName(value);
                  setAnchorTargetById('');
                  setAnchorTarget(value);
                }}
                disabled={anchorNameOptions.length === 0}
                className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm"
              >
                <option value="">{anchorNameOptions.length ? 'Select anchor name' : 'No named anchors'}</option>
                {anchorNameOptions.map((item) => (
                  <option key={`name-${item.id}`} value={item.id}>
                    {item.name} ({item.id})
                  </option>
            ))}
          </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">By Element Id</label>
              <select
                value={anchorTargetById}
                onChange={(e) => {
                  const value = e.target.value;
                  setAnchorTargetById(value);
                  setAnchorTargetByName('');
                  setAnchorTarget(value);
                }}
                className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm"
              >
                <option value="">{anchorList.length ? 'Select anchor id' : 'No anchors found'}</option>
                {anchorList.map((item) => (
                  <option key={`id-${item.id}`} value={item.id}>
                    {item.id}
                    {item.name ? ` (${item.name})` : ''}
                  </option>
                ))}
              </select>
            </div>
        </div>
      )}

        {withTypeSelector && effectiveType === 'email' && (
          <div className="space-y-3">
        <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">E-Mail Address</label>
              <input
                value={emailAddr}
                onChange={(e)=>setEmailAddr(e.target.value)}
                placeholder="user@example.com, second@example.com"
                className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Message Subject</label>
              <input
                value={emailSubject}
                onChange={(e)=>setEmailSubject(e.target.value)}
                className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Message Body</label>
              <textarea
                value={emailBody}
                onChange={(e)=>setEmailBody(e.target.value)}
                className="w-full min-h-[100px] rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm"
              />
            </div>
        </div>
      )}
    </div>
  );
  };

  const openAnchorModal = () => {
    setAnchorId('');
    setAnchorName('');
    setIsAnchorOpen(true);
  };

  const submitAnchorModal = () => {
    const id = anchorId.trim();
    if (!id) { setIsAnchorOpen(false); return; }
    const label = (anchorName.trim() || id).trim();
    const sel = getSelectionAsHtmlAndText();
    const inner = sel?.html && sel.html.trim() !== '' ? sel.html : '';
    const marker = `<span id="${escapeHtml(id)}" class="tiptap-anchor-marker" contenteditable="false" data-anchor-id="${escapeHtml(id)}" data-anchor-label="${escapeHtml(label)}"${anchorName.trim() ? ` data-anchor-name="${escapeHtml(anchorName.trim())}"` : ''}></span>`;
    if (inner) {
      insertHtml(`${marker}${inner}`);
    } else {
      insertHtml(`${marker}&nbsp;`);
    }
    setIsAnchorOpen(false);
    setAnchorId('');
    setAnchorName('');
    setAnchorList(getAnchorsFromHtml(editor.getHTML()));
  };

  const insertHorizontalRule = () => {
    editor.chain().focus().setHorizontalRule().run();
  };

  const openImageInsert = () => {
    setImgAsTag(true);
    openImageButtonModal();
  };

  const openFlashModal = () => {
    setFlashTab('general');
    setFlashUrl('');
    setFlashWidth('');
    setFlashHeight('');
    setFlashHSpace('');
    setFlashVSpace('');
    setFlashScale('notset');
    setFlashScriptAccess('notset');
    setFlashWindowMode('notset');
    setFlashQuality('high');
    setFlashAlign('notset');
    setFlashMenu(true);
    setFlashAutoPlay(true);
    setFlashLoop(true);
    setFlashAllowFullscreen(true);
    setFlashId('');
    setFlashBgColor('');
    setFlashClasses('');
    setFlashStyle('');
    setIsFlashOpen(true);
  };
  const submitFlashModal = () => {
    if (!flashUrl.trim()) { setIsFlashOpen(false); return; }
    const w = parseInt(flashWidth, 10); const h = parseInt(flashHeight, 10);
    const attrs: string[] = [`data=\"${escapeHtml(flashUrl.trim())}\"`, `type=\"application/x-shockwave-flash\"`];
    if (!Number.isNaN(w) && w>0) attrs.push(`width=\"${w}\"`);
    if (!Number.isNaN(h) && h>0) attrs.push(`height=\"${h}\"`);
    if (flashId.trim()) attrs.push(`id=\"${escapeHtml(flashId.trim())}\"`);
    const styleParts: string[] = [];
    const hs = parseInt(flashHSpace,10); if (!Number.isNaN(hs) && hs>0) styleParts.push(`margin-left:${hs}px;margin-right:${hs}px`);
    const vs = parseInt(flashVSpace,10); if (!Number.isNaN(vs) && vs>0) styleParts.push(`margin-top:${vs}px;margin-bottom:${vs}px`);
    if (flashBgColor.trim()) styleParts.push(`background:${flashBgColor.trim()}`);
    if (flashStyle.trim()) styleParts.push(flashStyle.trim());
    if (styleParts.length) attrs.push(`style=\"${styleParts.join(';')}\"`);
    if (flashClasses.trim()) attrs.push(`class=\"${escapeHtml(flashClasses.trim())}\"`);

    // Params as inner <param> tags for completeness
    const params: string[] = [];
    if (flashMenu) params.push('<param name="menu" value="true" />');
    if (flashAutoPlay) params.push('<param name="autoplay" value="true" />');
    if (flashLoop) params.push('<param name="loop" value="true" />');
    if (flashAllowFullscreen) params.push('<param name="allowFullScreen" value="true" />');
    if (flashScale !== 'notset') params.push(`<param name="scale" value="${flashScale}" />`);
    if (flashScriptAccess !== 'notset') params.push(`<param name="allowScriptAccess" value="${flashScriptAccess}" />`);
    if (flashWindowMode !== 'notset') params.push(`<param name="wmode" value="${flashWindowMode}" />`);
    if (flashQuality !== 'notset') params.push(`<param name="quality" value="${flashQuality}" />`);
    if (flashAlign !== 'notset') params.push(`<param name="salign" value="${flashAlign}" />`);
    const html = `<object ${attrs.join(' ')}>${params.join('')}</object>`;
    insertHtml(html);
    setIsFlashOpen(false);
  };

  const openIframeModal = () => {
    setIframeTab('general');
    setIframeUrl(''); setIframeWidth(''); setIframeHeight('');
    setIframeAlign('notset'); setIframeScrollbars(false); setIframeBorder(false);
    setIframeName(''); setIframeTitle(''); setIframeLongDesc('');
    setIframeAllow(true); setIframeId(''); setIframeStyle(''); setIframeClasses('');
    setIsIframeOpen(true);
  };
  const submitIframeModal = () => {
    if (!iframeUrl.trim()) { setIsIframeOpen(false); return; }
    const attrs: string[] = [`src=\"${escapeHtml(iframeUrl.trim())}\"`];
    const w = parseInt(iframeWidth, 10); if (!Number.isNaN(w) && w>0) attrs.push(`width=\"${w}\"`);
    const h = parseInt(iframeHeight, 10); if (!Number.isNaN(h) && h>0) attrs.push(`height=\"${h}\"`);
    if (iframeAllow) attrs.push(`allowfullscreen`);
    if (iframeName.trim()) attrs.push(`name=\"${escapeHtml(iframeName.trim())}\"`);
    if (iframeTitle.trim()) attrs.push(`title=\"${escapeHtml(iframeTitle.trim())}\"`);
    if (iframeLongDesc.trim()) attrs.push(`longdesc=\"${escapeHtml(iframeLongDesc.trim())}\"`);
    // frameborder & scrolling for legacy support
    attrs.push(`frameborder=\"${iframeBorder ? '1' : '0'}\"`);
    if (iframeScrollbars) attrs.push(`scrolling=\"yes\"`);
    if (iframeId.trim()) attrs.push(`id=\"${escapeHtml(iframeId.trim())}\"`);
    if (iframeClasses.trim()) attrs.push(`class=\"${escapeHtml(iframeClasses.trim())}\"`);
    const styleParts: string[] = [];
    if (iframeAlign==='left') styleParts.push('float:left');
    if (iframeAlign==='right') styleParts.push('float:right');
    if (iframeAlign==='top') styleParts.push('vertical-align:top');
    if (iframeAlign==='middle') styleParts.push('vertical-align:middle');
    if (iframeAlign==='bottom') styleParts.push('vertical-align:bottom');
    if (iframeStyle.trim()) styleParts.push(iframeStyle.trim());
    if (styleParts.length) attrs.push(`style=\"${styleParts.join(';')}\"`);
    insertHtml(`<iframe ${attrs.join(' ')}></iframe>`);
    setIsIframeOpen(false);
  };

  const insertPageBreak = () => {
    insertHtml('<div style="page-break-after: always;"></div>');
  };

  const insertChar = (s: string) => {
    editor.chain().focus().insertContent(s).run();
  };

  const openTableModal = () => {
    setTableTab('props');
    setIsTableOpen(true);
  };
  const submitTableModal = () => {
    const rowsNum = Math.max(1, parseInt(tableRows, 10) || 1);
    const colsNum = Math.max(1, parseInt(tableCols, 10) || 1);

    const attrs: string[] = [];
    if (tableBorder.trim()) attrs.push(`border=\"${escapeHtml(tableBorder.trim())}\"`);
    if (tableCellSpacing.trim()) attrs.push(`cellspacing=\"${escapeHtml(tableCellSpacing.trim())}\"`);
    if (tableCellPadding.trim()) attrs.push(`cellpadding=\"${escapeHtml(tableCellPadding.trim())}\"`);
    if (tableSummary.trim()) attrs.push(`summary=\"${escapeHtml(tableSummary.trim())}\"`);
    if (tableId.trim()) attrs.push(`id=\"${escapeHtml(tableId.trim())}\"`);
    if (tableClasses.trim()) attrs.push(`class=\"${escapeHtml(tableClasses.trim())}\"`);
    if (tableLangDir !== 'notset') attrs.push(`dir=\"${tableLangDir}\"`);
    const styleParts: string[] = [];
    const w = parseInt(tableWidth, 10); if (!Number.isNaN(w) && w>0) styleParts.push(`width:${w}px`);
    const h = parseInt(tableHeight, 10); if (!Number.isNaN(h) && h>0) styleParts.push(`height:${h}px`);
    if (tableAlign === 'left') styleParts.push('margin-left:0;margin-right:auto');
    if (tableAlign === 'center') styleParts.push('margin-left:auto;margin-right:auto');
    if (tableAlign === 'right') styleParts.push('margin-left:auto;margin-right:0');
    if (tableStyle.trim()) styleParts.push(tableStyle.trim());
    if (styleParts.length) attrs.push(`style=\"${styleParts.join(';')}\"`);

    const makeCells = (count: number, asHeader = false) =>
      new Array(count).fill(0).map(() => asHeader ? '<th></th>' : '<td></td>').join('');

    let thead = '';
    let bodyRows = rowsNum;
    if (tableHeaders === 'row' || tableHeaders === 'both') {
      thead = `<thead><tr>${makeCells(colsNum, true)}</tr></thead>`;
      bodyRows = Math.max(0, rowsNum - 1);
    }
    const useThInFirstCol = tableHeaders === 'col' || tableHeaders === 'both';
    const tbodyRows = new Array(bodyRows).fill(0).map(() => {
      const cells = new Array(colsNum).fill(0).map((_, i) => i===0 && useThInFirstCol ? '<th></th>' : '<td></td>').join('');
      return `<tr>${cells}</tr>`;
    }).join('');

    const caption = tableCaption.trim() ? `<caption>${escapeHtml(tableCaption.trim())}</caption>` : '';
    const html = `<table ${attrs.join(' ')}>${caption}${thead}<tbody>${tbodyRows}</tbody></table>`;
    insertHtml(html);
    setIsTableOpen(false);
  };

  const handleCopy = async () => {
    const data = getSelectionAsHtmlAndText();
    if (!data) return;
    await writeToClipboard(data.html, data.text);
  };

  const handleCut = async () => {
    const data = getSelectionAsHtmlAndText();
    if (!data) return;
    const ok = await writeToClipboard(data.html, data.text);
    if (ok) editor.chain().focus().deleteSelection().run();
  };

  const increaseIndent = () => {
    if (editor.isActive('listItem')) {
      editor.chain().focus().sinkListItem('listItem').run();
      return;
    }
    if (!editor.isActive('blockquote')) {
      editor.chain().focus().toggleBlockquote().run();
    }
  };

  const decreaseIndent = () => {
    if (editor.isActive('listItem')) {
      editor.chain().focus().liftListItem('listItem').run();
      return;
    }
    if (editor.isActive('blockquote')) {
      editor.chain().focus().toggleBlockquote().run();
    }
  };

  const wrapSelectionWithDir = (dir: 'ltr'|'rtl') => {
    const sel = getSelectionAsHtmlAndText();
    const inner = sel?.html && sel.html.trim() !== '' ? sel.html : '&ZeroWidthSpace;';
    replaceSelectionHtml(`<span dir="${dir}" style="unicode-bidi: embed;">${inner}</span>`);
  };

  const setSelectionLanguage = (lang: 'ar'|'fr'|'es'|null) => {
    const sel = getSelectionAsHtmlAndText();
    const inner = sel?.html && sel.html.trim() !== '' ? sel.html : '&ZeroWidthSpace;';
    if (lang) {
      replaceSelectionHtml(`<span lang="${lang}">${inner}</span>`);
    } else {
      // Remove language by re-wrapping without lang (keeps content intact)
      replaceSelectionHtml(`<span>${inner}</span>`);
    }
    setLanguageMenuOpen(false);
  };

  const openDivContainerModal = () => {
    setDivTab('general');
    setDivStylePreset('notset');
    setDivClasses('');
    setDivId('');
    setDivLangCode('');
    setDivInlineStyle('');
    setDivTitle('');
    setDivDir('notset');
    setIsDivModalOpen(true);
  };

  const submitDivContainerModal = () => {
    const attrs: string[] = [];
    if (divId.trim()) attrs.push(`id="${escapeHtml(divId.trim())}"`);
    const classes: string[] = [];
    if (divClasses.trim()) classes.push(divClasses.trim());
    if (divStylePreset === 'special') classes.push('special-container');
    if (classes.length) attrs.push(`class="${escapeHtml(classes.join(' '))}"`);
    const styles: string[] = [];
    if (divStylePreset === 'special') styles.push('border:1px dashed #9ca3af;padding:8px;border-radius:4px');
    if (divInlineStyle.trim()) styles.push(divInlineStyle.trim());
    if (styles.length) attrs.push(`style="${escapeHtml(styles.join(';'))}"`);
    if (divTitle.trim()) attrs.push(`title="${escapeHtml(divTitle.trim())}"`);
    if (divLangCode.trim()) attrs.push(`lang="${escapeHtml(divLangCode.trim())}"`);
    if (divDir !== 'notset') attrs.push(`dir="${divDir}"`);
    const sel = getSelectionAsHtmlAndText();
    const inner = sel?.html && sel.html.trim() !== '' ? sel.html : '<p>Container content…</p>';
    insertHtml(`<div ${attrs.join(' ')}>${inner}</div>`);
    setIsDivModalOpen(false);
  };

  const readClipboardHtmlOrText = async (): Promise<{ html?: string; text?: string } | null> => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        return { text };
      }
    } catch (_) {
      // ignore
    }
    return null;
  };

  const cleanWordHtml = (html: string): string => {
    let out = html;
    out = out.replace(/<!--[\s\S]*?-->/g, '');
    out = out.replace(/<(meta|link|style|script|title|xml)[^>]*>/gi, '');
    out = out.replace(/<\/?o:p[^>]*>/gi, '');
    out = out.replace(/\sclass="Mso[^"]*"/gi, '');
    out = out.replace(/\sstyle="[^"]*mso-[^"]*"/gi, '');
    out = out.replace(/\sstyle="\s*"/gi, '');
    return out;
  };

  const escapeHtml = (s: string) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  const browserFind = (query: string, isCaseSensitive: boolean, whole: boolean, wrap: boolean): boolean => {
    if (typeof window === 'undefined') return false;
    const w = window as unknown as { find?: (query: string, caseSensitive?: boolean, backwards?: boolean, wrapAround?: boolean, wholeWord?: boolean, searchInFrames?: boolean, showDialog?: boolean) => boolean };
    if (w && typeof w.find === 'function') {
      try {
        // Focus editor so the search starts within it
        try { editor?.view.dom.focus(); } catch {}
        // window.find(query, caseSensitive, backwards, wrapAround, wholeWord, searchInFrames, showDialog)
        return Boolean(w.find(query, isCaseSensitive, false, wrap, whole, false, false));
      } catch {
        return false;
      }
    }
    return false;
  };

  const getAdjacentChar = (dir: 'before' | 'after'): string | null => {
    if (typeof window === 'undefined') return null;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    const range = sel.getRangeAt(0);
    try {
      if (dir === 'before') {
        const node = range.startContainer as Text;
        if (node.nodeType === Node.TEXT_NODE && range.startOffset > 0) {
          return (node as Text).data.charAt(range.startOffset - 1);
        }
      } else {
        const node = range.endContainer as Text;
        if (node.nodeType === Node.TEXT_NODE && (node as Text).data.length > range.endOffset) {
          return (node as Text).data.charAt(range.endOffset);
        }
      }
    } catch {
      return null;
    }
    return null;
  };

  const isWholeWordCurrentSelection = (query: string): boolean => {
    if (typeof window === 'undefined') return false;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return false;
    const selected = sel.toString();
    const equal = caseSensitive ? selected === query : selected.toLowerCase() === query.toLowerCase();
    if (!equal) return false;
    const boundary = (ch: string | null) => ch == null || /[^\w]/.test(ch);
    return boundary(getAdjacentChar('before')) && boundary(getAdjacentChar('after'));
  };

  const findNextWithOptions = (): boolean => {
    if (!findText) {
      setFindWarning(null);
      return false;
    }
    const doc = editor.state.doc;
    const { from, to } = editor.state.selection;
    const startPos = to; // continue search from after current selection

    // Build linear text index and map to PM positions
    const segments: Array<{ pos: number; len: number; }> = [];
    let plain = '';
    doc.descendants((node, pos) => {
      if (node.isText && node.text) {
        segments.push({ pos, len: node.text.length });
        plain += node.text;
      }
      return true;
    });

    const textBefore = doc.textBetween(0, startPos);
    const startOffset = textBefore.length;
    const query = caseSensitive ? findText : findText.toLowerCase();
    const haystack = caseSensitive ? plain : plain.toLowerCase();

    const tryFindFrom = (offset: number): number => {
      return haystack.indexOf(query, Math.max(0, offset));
    };

    let idx = tryFindFrom(startOffset);
    if (idx === -1 && cyclic) {
      idx = tryFindFrom(0);
    }
    if (idx === -1) {
      setFindWarning('Word not found');
      return false;
    }

    // Whole word check using linear string boundaries
    const boundary = (ch: string | undefined) => !ch || /[^\w]/.test(ch);
    if (wholeWord) {
      const before = haystack[idx - 1];
      const after = haystack[idx + query.length];
      if (!(boundary(before) && boundary(after))) {
        // continue searching after this index
        let nextIdx = tryFindFrom(idx + 1);
        while (nextIdx !== -1) {
          const b = haystack[nextIdx - 1];
          const a = haystack[nextIdx + query.length];
          if (boundary(b) && boundary(a)) { idx = nextIdx; break; }
          nextIdx = tryFindFrom(nextIdx + 1);
        }
        if (nextIdx === -1) {
          setFindWarning('Word not found');
          return false;
        }
      }
    }

    // Map linear offset back to PM position
    let running = 0;
    let pmFrom = 0;
    let pmTo = 0;
    for (const seg of segments) {
      if (idx < running + seg.len) {
        const within = idx - running;
        pmFrom = seg.pos + within;
        pmTo = pmFrom + findText.length;
        break;
      }
      running += seg.len;
    }

    if (pmFrom === pmTo) {
      setFindWarning('Word not found');
      return false;
    }

    editor.chain().setTextSelection({ from: pmFrom, to: pmTo }).scrollIntoView().focus().run();
    setFindWarning(null);
    return true;
  };

  const replaceCurrent = () => {
    if (!findText) return;
    const selectionEqualsQuery = () => {
      if (typeof window === 'undefined') return false;
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return false;
      const txt = sel.toString();
      const equal = caseSensitive ? txt === findText : txt.toLowerCase() === findText.toLowerCase();
      if (!equal) return false;
      return wholeWord ? isWholeWordCurrentSelection(findText) : true;
    };

    editor.commands.focus();
    if (!selectionEqualsQuery()) {
      const ok = findNextWithOptions();
      if (!ok) return;
    }
    if (selectionEqualsQuery()) {
      editor.chain().focus().insertContent(replaceText).run();
    }
  };

  const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const replaceAllInEditor = () => {
    if (!findText) return;
    const flags = caseSensitive ? 'g' : 'gi';
    const pattern = wholeWord ? `\\b${escapeRegExp(findText)}\\b` : escapeRegExp(findText);
    const re = new RegExp(pattern, flags);
    const html = editor.getHTML();
    const replaced = html.replace(re, escapeHtml(replaceText));
    editor.commands.setContent(replaced);
  };

  // ---------- Form Elements Insertion ----------
  const insertHtml = (html: string) => {
    editor.chain().focus().insertContent(html).run();
  };

  

  const openFormModal = () => {
    const sel = getSelectionAsHtmlAndText();
    setFormSelectionHtml(sel?.html && sel.html.trim() !== '' ? sel.html : '<p>Form content…</p>');
    setIsFormOpen(true);
  };

  const submitFormModal = () => {
    const attrs: string[] = [];
    if (formName.trim()) attrs.push(`name="${escapeHtml(formName.trim())}"`);
    if (formAction.trim()) attrs.push(`action="${escapeHtml(formAction.trim())}"`);
    if (formId.trim()) attrs.push(`id="${escapeHtml(formId.trim())}"`);
    if (formEncoding) attrs.push(`enctype="${formEncoding}"`);
    if (formTarget !== 'notset') attrs.push(`target="${formTarget}"`);
    if (formMethod) attrs.push(`method="${formMethod.toLowerCase()}"`);
    const html = `<form ${attrs.join(' ')}>${formSelectionHtml}</form>`;
    insertHtml(html);
    setIsFormOpen(false);
  };

  const openCheckboxModal = () => {
    setCrType('checkbox');
    setCrName('');
    setCrValue('');
    setCrSelected(false);
    setIsCRModalOpen(true);
  };
  const openRadioModal = () => {
    setCrType('radio');
    setCrName('');
    setCrValue('');
    setCrSelected(false);
    setIsCRModalOpen(true);
  };
  const submitCRModal = () => {
    const nameAttr = crName.trim() ? ` name="${escapeHtml(crName.trim())}"` : (crType==='radio' ? ` name="group-${Date.now()}"` : '');
    const valueAttr = crValue.trim() ? ` value="${escapeHtml(crValue.trim())}"` : '';
    const checkedAttr = crSelected ? ' checked' : '';
    const labelText = crName.trim() || (crType==='radio' ? 'Option' : 'Checkbox');
    insertHtml(`<label><input type="${crType}"${nameAttr}${valueAttr}${checkedAttr} /> ${escapeHtml(labelText)}</label>`);
    setIsCRModalOpen(false);
  };
  const openTextFieldModal = () => {
    setTfName('');
    setTfValue('');
    setTfWidth('');
    setTfMax('');
    setTfType('text');
    setIsTFModalOpen(true);
  };
  const submitTFModal = () => {
    const attrs: string[] = [];
    if (tfType) attrs.push(`type="${tfType}"`);
    if (tfName.trim()) attrs.push(`name="${escapeHtml(tfName.trim())}"`);
    if (tfValue.trim()) attrs.push(`value="${escapeHtml(tfValue.trim())}"`);
    const widthNum = parseInt(tfWidth, 10);
    if (!Number.isNaN(widthNum) && widthNum > 0) attrs.push(`size="${widthNum}"`);
    const maxNum = parseInt(tfMax, 10);
    if (!Number.isNaN(maxNum) && maxNum > 0) attrs.push(`maxlength="${maxNum}"`);
    insertHtml(`<input ${attrs.join(' ')} />`);
    setIsTFModalOpen(false);
  };

  const openTextareaModal = () => {
    setTaName('');
    setTaCols('');
    setTaRows('');
    setTaValue('');
    setIsTAModalOpen(true);
  };
  const submitTAModal = () => {
    const attrs: string[] = [];
    if (taName.trim()) attrs.push(`name="${escapeHtml(taName.trim())}"`);
    const colsNum = parseInt(taCols, 10);
    if (!Number.isNaN(colsNum) && colsNum > 0) attrs.push(`cols="${colsNum}"`);
    const rowsNum = parseInt(taRows, 10);
    if (!Number.isNaN(rowsNum) && rowsNum > 0) attrs.push(`rows="${rowsNum}"`);
    const inner = escapeHtml(taValue);
    insertHtml(`<textarea ${attrs.join(' ')}>${inner}</textarea>`);
    setIsTAModalOpen(false);
  };
  const insertTextarea = () => insertHtml('<textarea rows="3" cols="30" placeholder="Textarea"></textarea>');
  const openSelectModal = () => {
    setSelName('');
    setSelSize('');
    setSelMultiple(false);
    setOptText('');
    setOptValue('');
    setSelOptions([]);
    setSelIndex(null);
    setIsSELModalOpen(true);
  };
  const addSelOption = () => {
    if (!optText.trim() && !optValue.trim()) return;
    setSelOptions((prev) => [...prev, { text: optText.trim() || optValue.trim(), value: optValue.trim() || optText.trim(), selected: false }]);
    setOptText('');
    setOptValue('');
  };
  const modifySelOption = () => {
    if (selIndex == null) return;
    setSelOptions((prev) => prev.map((o, i) => i === selIndex ? { ...o, text: optText || o.text, value: optValue || o.value } : o));
  };
  const moveSelOption = (dir: -1 | 1) => {
    if (selIndex == null) return;
    const i = selIndex;
    const j = i + dir;
    if (j < 0 || j >= selOptions.length) return;
    const next = selOptions.slice();
    const tmp = next[i];
    next[i] = next[j];
    next[j] = tmp;
    setSelOptions(next);
    setSelIndex(j);
  };
  const deleteSelOption = () => {
    if (selIndex == null) return;
    const next = selOptions.slice();
    next.splice(selIndex, 1);
    setSelOptions(next);
    setSelIndex(null);
  };
  const setAsSelectedValue = () => {
    if (selIndex == null) return;
    setSelOptions((prev) => prev.map((o, i) => ({ ...o, selected: i === selIndex ? true : (selMultiple ? o.selected : false) })));
  };
  const submitSELModal = () => {
    const attrs: string[] = [];
    if (selName.trim()) attrs.push(`name="${escapeHtml(selName.trim())}"`);
    const sizeNum = parseInt(selSize, 10);
    if (!Number.isNaN(sizeNum) && sizeNum > 0) attrs.push(`size="${sizeNum}"`);
    if (selMultiple) attrs.push('multiple');
    const optionsHtml = (selOptions.length ? selOptions : [{ text: 'Option 1', value: '1', selected: true }])
      .map(o => `<option value="${escapeHtml(o.value)}"${o.selected ? ' selected' : ''}>${escapeHtml(o.text)}</option>`).join('');
    insertHtml(`<select ${attrs.join(' ')}>${optionsHtml}</select>`);
    setIsSELModalOpen(false);
  };
  const openButtonModal = () => {
    setBtnName('');
    setBtnText('Button');
    setBtnType('button');
    setIsBTNModalOpen(true);
  };
  const submitBTNModal = () => {
    const attrs: string[] = [`type="${btnType}"`];
    if (btnName.trim()) attrs.push(`name="${escapeHtml(btnName.trim())}"`);
    const text = btnText.trim() ? escapeHtml(btnText.trim()) : 'Button';
    insertHtml(`<button ${attrs.join(' ')}>${text}</button>`);
    setIsBTNModalOpen(false);
  };

  const openImageButtonModal = () => {
    setImgTab('info');
    setImgUrl('');
    setImgAlt('');
    setImgWidth('');
    setImgHeight('');
    setImgKeepRatio(false);
    setImgBorder('');
    setImgHSpace('');
    setImgVSpace('');
    setImgAlign('notset');
    setImgId('');
    setImgLangDir('notset');
    setImgLangCode('');
    setImgLongDesc('');
    setImgClasses('');
    setImgStyle('');
    setImgRatio(null);
    setIsIMGModalOpen(true);
  };

  const openImageButtonProps = () => {
    setImgAsTag(false);
    openImageButtonModal();
  };
  const submitIMGModal = () => {
    if (!imgUrl.trim()) { setIsIMGModalOpen(false); return; }
    const attrs: string[] = imgAsTag ? [ `src="${escapeHtml(imgUrl.trim())}"` ] : [ `type="image"`, `src="${escapeHtml(imgUrl.trim())}"` ];
    if (imgAlt.trim()) attrs.push(`alt="${escapeHtml(imgAlt.trim())}"`);
    const w = parseInt(imgWidth, 10); if (!Number.isNaN(w) && w > 0) attrs.push(`width="${w}"`);
    const h = parseInt(imgHeight, 10); if (!Number.isNaN(h) && h > 0) attrs.push(`height="${h}"`);
    if (imgId.trim()) attrs.push(`id="${escapeHtml(imgId.trim())}"`);
    if (imgLangDir !== 'notset') attrs.push(`dir="${imgLangDir}"`);
    if (imgLangCode.trim()) attrs.push(`lang="${escapeHtml(imgLangCode.trim())}"`);
    const styles: string[] = [];
    const b = parseInt(imgBorder,10); if (!Number.isNaN(b) && b>0) styles.push(`border:${b}px solid #000`);
    const hs = parseInt(imgHSpace,10); const vs = parseInt(imgVSpace,10);
    if (!Number.isNaN(hs) && hs>0) styles.push(`margin-left:${hs}px;margin-right:${hs}px`);
    if (!Number.isNaN(vs) && vs>0) styles.push(`margin-top:${vs}px;margin-bottom:${vs}px`);
    if (imgAlign==='left') styles.push('float:left');
    if (imgAlign==='right') styles.push('float:right');
    if (imgStyle.trim()) styles.push(imgStyle.trim());
    if (styles.length) attrs.push(`style="${styles.join(';')}"`);
    if (imgClasses.trim()) attrs.push(`class="${escapeHtml(imgClasses.trim())}"`);
    if (imgLongDesc.trim()) attrs.push(`data-longdesc="${escapeHtml(imgLongDesc.trim())}"`);
    let html = imgAsTag ? `<img ${attrs.join(' ')} />` : `<input ${attrs.join(' ')} />`;
    // Optional Link wrapping when in insert-image mode
    if (imgAsTag && linkUrl.trim()) {
      const aAttrs: string[] = [`href="${escapeHtml(linkUrl.trim())}"`];
      if (targetOpt && targetOpt !== 'notset') aAttrs.push(`target="${targetOpt}"`);
      html = `<a ${aAttrs.join(' ')}>${html}</a>`;
    }
    insertHtml(html);
    setIsIMGModalOpen(false);
  };
  const insertImageButton = () => insertHtml('<input type="image" src="https://via.placeholder.com/100x32?text=Submit" alt="Submit" />');
  const openHiddenModal = () => {
    setHidName('');
    setHidValue('');
    setIsHIDModalOpen(true);
  };
  const submitHIDModal = () => {
    const attrs: string[] = ['type="hidden"'];
    if (hidName.trim()) attrs.push(`name="${escapeHtml(hidName.trim())}"`);
    if (hidValue.trim()) attrs.push(`value="${escapeHtml(hidValue.trim())}"`);
    insertHtml(`<input ${attrs.join(' ')} />`);
    setIsHIDModalOpen(false);
  };

  const handlePaste = async () => {
    const data = await readClipboardHtmlOrText();
    if (!data) return;
    if (data.html) {
      editor.chain().focus().insertContent(data.html).run();
    } else if (data.text) {
      editor.chain().focus().insertContent(data.text).run();
    }
  };

  const handlePastePlain = async () => {
    try {
      const text = navigator.clipboard ? await navigator.clipboard.readText() : '';
      if (text) editor.chain().focus().insertContent(text).run();
    } catch (_) {
      // ignore
    }
  };

  const handlePasteFromWord = async () => {
    const data = await readClipboardHtmlOrText();
    if (!data) return handlePastePlain();
    const html = data.html ? cleanWordHtml(data.html) : undefined;
    if (html) {
      editor.chain().focus().insertContent(html).run();
    } else if (data.text) {
      editor.chain().focus().insertContent(data.text).run();
    }
  };

  const openPreviewWindow = (html: string, doPrint = false) => {
    if (typeof window === 'undefined') return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.open();
    win.document.write(`<!doctype html><html><head><title>Email Preview</title><meta charset="utf-8" /><style>
      body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;padding:24px;color:#111827}
      table{border-collapse:collapse;width:100%}
      td,th{border:1px solid #d1d5db;padding:8px;text-align:left;vertical-align:top}
      h1,h2,h3{margin:0.5em 0}
      /* Right-align numeric columns in statement tables */
      table.email-statement th:nth-last-child(-n+2),
      table.email-statement td:nth-last-child(-n+2){text-align:right}
      table.email-statement-total td:last-child{text-align:right}
      /* Fallback generic: last two columns right-aligned */
      table th:nth-last-child(-n+2), table td:nth-last-child(-n+2){text-align:right}
    </style></head><body>${html}</body></html>`);
    win.document.close();
    if (doPrint) {
      // Wait a tick for rendering, then print
      const trigger = () => {
        win.focus();
        win.print();
      };
      if (win.document.readyState === 'complete') {
        setTimeout(trigger, 200);
      } else {
        win.onload = () => setTimeout(trigger, 200);
      }
    }
  };

  return (
    <div className={`tiptap-wrapper ${className}`}>
      <style jsx global>{`
        .tiptap-editor-wrapper .tiptap-anchor-marker {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
          font-size: 12px;
          line-height: 1;
          color: #dc2626;
          margin-right: 4px;
          cursor: default;
          position: relative;
        }
        .tiptap-editor-wrapper .tiptap-anchor-marker::before {
          content: '🚩';
        }
        .tiptap-editor-wrapper .tiptap-anchor-marker::after {
          content: attr(data-anchor-label);
          position: absolute;
          opacity: 0;
          background: #111827;
          color: #f9fafb;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          transform: translate(-50%, -150%);
          left: 50%;
          white-space: nowrap;
          pointer-events: none;
          z-index: 10;
        }
        .tiptap-editor-wrapper .tiptap-anchor-marker:hover::after {
          opacity: 1;
        }
      `}</style>
      {/* Toolbar */}
      <div className="tiptap-toolbar flex flex-wrap items-center gap-1 p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600 rounded-t-md">
        {/* Styles dropdown */}
        <div className="relative">
          <select
            className="appearance-none bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-sm rounded px-2 py-1 pr-6"
            title="Styles"
            onChange={(e)=>{ applyStyleFromDropdown(e.target.value); e.currentTarget.selectedIndex = 0; }}
          >
            <option value="" hidden>Styles</option>
            <optgroup label="Block Styles">
              <option value="italic-title" style={{ fontStyle: 'italic', fontWeight: 600 }}>Italic Title</option>
              <option value="subtitle" style={{ fontStyle: 'italic', color: '#6b7280' }}>Subtitle</option>
              <option value="special-container" style={{ border: '1px solid #d1d5db', padding: '2px 6px' }}>Special Container</option>
              <option value="blockquote" style={{ fontStyle: 'italic', color: '#6b7280' }}>Blockquote</option>
              <option value="code-block" style={{ fontFamily: 'JetBrains Mono, Fira Code, Courier New, monospace' }}>Code Block</option>
            </optgroup>
            <optgroup label="Inline Styles">
              <option value="marker" style={{ backgroundColor: '#ffff00' }}>Marker</option>
              <option value="big" style={{ fontSize: '18px' }}>Big</option>
              <option value="small" style={{ fontSize: '12px' }}>Small</option>
              <option value="typewriter" style={{ fontFamily: 'Courier New, Courier, monospace' }}>Typewriter</option>
              <option value="computer-code" style={{ fontFamily: 'JetBrains Mono, Fira Code, Courier New, monospace' }}>Computer Code</option>
              <option value="keyboard-phrase" style={{ fontFamily: 'Courier New, Courier, monospace', backgroundColor: '#f3f4f6' }}>Keyboard Phrase</option>
              <option value="sample-text" style={{ fontFamily: 'Courier New, Courier, monospace', fontStyle: 'italic' }}>Sample Text</option>
              <option value="variable" style={{ fontStyle: 'italic' }}>Variable</option>
              <option value="deleted-text" style={{ textDecoration: 'line-through' }}>Deleted Text</option>
              <option value="inserted-text" style={{ textDecoration: 'underline' }}>Inserted Text</option>
              <option value="cited-work" style={{ fontStyle: 'italic' }}>Cited Work</option>
              <option value="inline-quotation" style={{ fontStyle: 'italic' }}>Inline Quotation</option>
              <option value="language-rtl">Language: RTL</option>
              <option value="language-ltr">Language: LTR</option>
            </optgroup>
          </select>
        </div>

        {/* Paragraph format dropdown */}
        <div className="relative">
          <select
            className="appearance-none bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-sm rounded px-2 py-1 pr-6"
            title="Paragraph format"
            onChange={(e)=>{
              const v = e.target.value;
              if (!editor) return;
              if (v === 'p') editor.chain().focus().setParagraph().run();
              if (v.startsWith('h')) editor.chain().focus().setHeading({ level: Number(v.replace('h','')) as 1|2|3|4|5|6 }).run();
              e.currentTarget.selectedIndex = 0;
            }}
          >
            <option value="" hidden>Normal</option>
            <option value="p">Paragraph</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="h4">Heading 4</option>
            <option value="h5">Heading 5</option>
            <option value="h6">Heading 6</option>
          </select>
        </div>

        {/* Font family dropdown */}
        <div className="relative">
          <select
            className="appearance-none bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-sm rounded px-2 py-1 pr-6"
            title="Font"
            onChange={(e)=>{
              const v = e.target.value;
              if (!editor) return;
              if (v) editor.chain().focus().setFontFamily(v).run();
              e.currentTarget.selectedIndex = 0;
            }}
          >
            <option value="" hidden>Font</option>
            <option value="Arial, Helvetica, sans-serif">Arial</option>
            <option value="Georgia, serif">Georgia</option>
            <option value="'Times New Roman', Times, serif">Times New Roman</option>
            <option value="'Courier New', Courier, monospace">Courier New</option>
            <option value="Verdana, Geneva, Tahoma, sans-serif">Verdana</option>
            <option value="Tahoma, Geneva, sans-serif">Tahoma</option>
            <option value="'Trebuchet MS', Helvetica, sans-serif">Trebuchet MS</option>
            <option value="Impact, Charcoal, sans-serif">Impact</option>
          </select>
        </div>

        {/* Font size dropdown */}
        <div className="relative">
          <select
            className="appearance-none bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-sm rounded px-2 py-1 pr-6"
            title="Size"
            onChange={(e)=>{
              const v = e.target.value;
              if (!editor) return;
              if (v) editor.chain().focus().setMark('textStyle', { fontSize: v }).run();
              e.currentTarget.selectedIndex = 0;
            }}
          >
            <option value="" hidden>Size</option>
            <option value="10px">10</option>
            <option value="12px">12</option>
            <option value="14px">14</option>
            <option value="16px">16</option>
            <option value="18px">18</option>
            <option value="24px">24</option>
            <option value="36px">36</option>
          </select>
        </div>

        {/* Text color and Background color */}
        <div className="flex items-center gap-1 ml-1">
          <label className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300" title="Text color">
            <span>A</span>
            <input type="color" className="w-8 h-6 p-0 border border-gray-300 dark:border-gray-600 rounded" onChange={(e)=>editor?.chain().focus().setColor(e.target.value).run()} />
          </label>
          <label className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300" title="Background color">
            <span className="px-0.5 bg-gray-200 text-gray-800">A</span>
            <input type="color" className="w-8 h-6 p-0 border border-gray-300 dark:border-gray-600 rounded" onChange={(e)=>editor?.chain().focus().setMark('textStyle', { backgroundColor: e.target.value }).run()} />
          </label>
        </div>

        <ToolbarDivider />

        {/* File/Actions */}
        <ToolbarButton
          onClick={() => {
            if (isSourceView) {
              // Persist any edits made in source view back into the editor
              editor.commands.setContent(sourceValue);
              onChange(sourceValue);
            }
            setIsSourceView(!isSourceView);
          }}
          title="Source"
        >
          <Code2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={handleSave} title="Save">
          <SaveIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={handleNewPage} title="New Page">
          <FilePlus className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => openPreviewWindow(getCurrentHTML(), false)} title="Preview">
          <Eye className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => openPreviewWindow(getCurrentHTML(), true)} title="Print">
          <Printer className="h-4 w-4" />
        </ToolbarButton>
        {/* Find/Replace */}
        <ToolbarButton onClick={() => setIsFindOpen(true)} title="Find & Replace">
          <Search className="h-4 w-4" />
        </ToolbarButton>
        {/* Select All */}
        <ToolbarButton onClick={() => editor.chain().focus().selectAll().run()} title="Select All">
          <BoxSelect className="h-4 w-4" />
        </ToolbarButton>
        {/* Spellcheck menu */}
        <div className="relative">
          <ToolbarButton onClick={() => setSpellMenuOpen((v) => !v)} title="Spell Checker">
            <div className="flex items-center gap-1">
              <SpellCheck className="h-4 w-4" />
              <ChevronDown className="h-3 w-3" />
            </div>
          </ToolbarButton>
          {spellMenuOpen && (
            <div className="absolute z-20 mt-1 min-w-[200px] rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 shadow-lg">
              <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setSpellcheckEnabled((v) => !v)}>
                {spellcheckEnabled ? 'Disable' : 'Enable'} Spellcheck
              </button>
              <div className="px-3 py-2 text-xs uppercase text-gray-500">Language</div>
              {(['en-US','en-GB','en-CA'] as const).map((lng) => (
                <button key={lng} className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 ${language===lng?'font-semibold':''}`} onClick={() => { setLanguage(lng); setSpellMenuOpen(false); }}>
                  {lng}
                </button>
              ))}
              <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => { editor.view.dom.blur(); setTimeout(()=>editor.view.dom.focus(),0); setSpellMenuOpen(false); }}>
                Check Spelling
              </button>
            </div>
          )}
        </div>
        {/* Templates modal trigger */}
        <ToolbarButton onClick={() => setIsTemplatesOpen(true)} title="Templates">
          <div className="flex items-center gap-1">
            <span className="sr-only">Templates</span>
            <FilePlus className="h-4 w-4 rotate-90" />
            <ChevronDown className="h-3 w-3" />
          </div>
        </ToolbarButton>

        {saveHint && (
          <span className="ml-2 text-xs text-green-600 dark:text-green-400">{saveHint}</span>
        )}

        <ToolbarDivider />

        {/* Clipboard */}
        <ToolbarButton
          onClick={handleCut}
          disabled={!hasSelection}
          title="Cut"
        >
          <Scissors className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={handleCopy}
          disabled={!hasSelection}
          title="Copy"
        >
          <CopyIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => { setPasteMode('rich'); setPasteInput(''); setIsPasteOpen(true); }} title="Paste">
          <ClipboardPaste className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => { setPasteMode('plain'); setPasteInput(''); setIsPasteOpen(true); }} title="Paste as plain text">
          <ClipboardType className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => { setPasteMode('word'); setPasteInput(''); setIsPasteOpen(true); }} title="Paste from Word">
          <FileText className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Undo/Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo2 className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Text Formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="Underline"
        >
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().unsetSuperscript().toggleSubscript().run()}
          isActive={editor.isActive('subscript')}
          title="Subscript"
        >
          <SubscriptIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().unsetSubscript().toggleSuperscript().run()}
          isActive={editor.isActive('superscript')}
          title="Superscript"
        >
          <SuperscriptIcon className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />
        <ToolbarButton
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          title="Remove Formatting"
        >
          <Eraser className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Ordered List"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Alignment */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Links */}
        <ToolbarButton onClick={openLinkModal} title="Insert/Edit Link">
          <Link2Icon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().unsetLink().run()} title="Unlink">
          <Link2OffIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={openAnchorModal} title="Anchor">
          <FlagIcon className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Indent Controls */}
        <ToolbarButton onClick={decreaseIndent} title="Decrease indent">
          <ChevronLeft className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={increaseIndent} title="Increase indent">
          <ChevronRight className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Show Blocks */}
        <ToolbarButton onClick={() => setShowBlocks(v=>!v)} title="Show blocks" isActive={showBlocks}>
          <LayoutPanelLeft className="h-4 w-4" />
        </ToolbarButton>

        {/* Text Direction */}
        <ToolbarButton onClick={() => wrapSelectionWithDir('ltr')} title="Text direction: left to right">
          <MoveRight className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => wrapSelectionWithDir('rtl')} title="Text direction: right to left">
          <MoveLeft className="h-4 w-4" />
        </ToolbarButton>

        {/* Language Menu */}
        <div className="relative">
          <ToolbarButton onClick={() => setLanguageMenuOpen((v)=>!v)} title="Set language">
            <div className="flex items-center gap-1">
              <Languages className="h-4 w-4" />
              <ChevronDown className="h-3 w-3" />
            </div>
          </ToolbarButton>
          {languageMenuOpen && (
            <div className="absolute z-20 mt-1 min-w-[180px] rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 shadow-lg">
              <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setSelectionLanguage('ar')}>Arabic</button>
              <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setSelectionLanguage('fr')}>French</button>
              <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setSelectionLanguage('es')}>Spanish</button>
              <div className="border-t border-gray-200 dark:border-gray-700" />
              <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setSelectionLanguage(null)}>Remove language</button>
            </div>
          )}
        </div>

        <ToolbarDivider />

        {/* Create Div Container */}
        <ToolbarButton onClick={openDivContainerModal} title="Create Div Container">
          <div className="flex flex-col items-center leading-none">
            <span className="text-[10px] font-semibold -mb-0.5">DIV</span>
            <Code2 className="h-3.5 w-3.5" />
          </div>
        </ToolbarButton>

        <ToolbarDivider />

        {/* Media & Inserts */}
        <ToolbarButton onClick={openImageInsert} title="Insert Image">
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={openFlashModal} title="Insert Flash (deprecated)">
          <span className="text-xs font-semibold">SWF</span>
        </ToolbarButton>
        <ToolbarButton onClick={insertHorizontalRule} title="Insert Horizontal Line">
          <div className="h-0.5 w-4 bg-gray-700 dark:bg-gray-300" />
        </ToolbarButton>
        {/* Smiley */}
        <ToolbarButton onClick={() => setSmileyOpen(true)} title="Insert Smiley">
          <span className="text-base">😊</span>
        </ToolbarButton>

        {/* Special Character */}
        <div className="relative">
          <ToolbarButton onClick={() => setSpecialOpen(true)} title="Insert Special Character">
            <span className="text-sm font-semibold">Ω</span>
          </ToolbarButton>
        </div>

        {/* Page Break */}
        <ToolbarButton onClick={insertPageBreak} title="Insert Page Break for Printing">
          <div className="flex items-center"><div className="w-2 h-0.5 bg-gray-700 dark:bg-gray-300" /><div className="ml-1 border-l-2 h-4 border-gray-700 dark:border-gray-300" /></div>
        </ToolbarButton>

        {/* iFrame */}
        <ToolbarButton onClick={openIframeModal} title="Insert iFrame">
          <Square className="h-4 w-4" />
        </ToolbarButton>

        {/* Table Controls */}
        <ToolbarButton
          onClick={openTableModal}
          title="Insert Table"
        >
          <TableIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().addRowAfter().run()}
          disabled={!editor.can().addRowAfter()}
          title="Add Row"
        >
          <Plus className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().deleteRow().run()}
          disabled={!editor.can().deleteRow()}
          title="Delete Row"
        >
          <Trash2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().deleteTable().run()}
          disabled={!editor.can().deleteTable()}
          title="Delete Table"
        >
          <Trash2 className="h-4 w-4 text-red-600" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Form Elements */}
        <ToolbarButton onClick={openFormModal} title="Form">
          <LayoutPanelLeft className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={openCheckboxModal} title="Checkbox">
          <CheckSquare className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={openRadioModal} title="Radio Button">
          <CircleDot className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={openTextFieldModal} title="Text Field">
          <TypeIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={openTextareaModal} title="Textarea">
          <AlignJustify className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={openSelectModal} title="Selection Field">
          <ChevronDownSmall className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={openButtonModal} title="Button">
          <MousePointerClick className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={openImageButtonProps} title="Image Button">
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={openHiddenModal} title="Hidden Field">
          <EyeOff className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Other */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Blockquote"
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          title="Code Block"
        >
          <Code className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Fullscreen Toggle */}
        {onFullscreenChange && (
          <ToolbarButton
            onClick={() => onFullscreenChange(!isFullscreen)}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </ToolbarButton>
        )}
      </div>

      {/* Editor Content */}
      {isSourceView ? (
        <textarea
          value={sourceValue}
          onChange={(e) => setSourceValue(e.target.value)}
          className="tiptap-editor-wrapper bg-white dark:bg-gray-900 border-x border-b border-gray-300 dark:border-gray-600 rounded-b-md w-full p-4 font-mono text-xs whitespace-pre-wrap min-h-[300px] outline-none"
        />
      ) : (
        <EditorContent 
          editor={editor} 
          className={`tiptap-editor-wrapper bg-white dark:bg-gray-900 border-x border-b border-gray-300 dark:border-gray-600 rounded-b-md ${showBlocks ? 'tiptap-show-blocks' : ''}`}
        />
      )}

      {/* Templates Modal */}
      {isTemplatesOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setIsTemplatesOpen(false)} />
          <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-md bg-white dark:bg-gray-900 shadow-xl border border-gray-300 dark:border-gray-700">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Content Templates</h3>
              <button
                aria-label="Close templates"
                className="p-1.5 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setIsTemplatesOpen(false)}
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Please select the template to open in the editor</p>
              <div className="max-h-80 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded">
                {(templates && templates.length ? templates : [{ label: 'Blank', content: '' }]).map((tpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedTemplate(idx);
                      if (replaceContents) {
                        editor.chain().focus().setContent(tpl.content).run();
                      } else {
                        editor.chain().focus().insertContent(tpl.content).run();
                      }
                      if (isSourceView) setSourceValue(editor.getHTML());
                      setIsTemplatesOpen(false);
                    }}
                    className={`w-full text-left flex items-start gap-4 px-4 py-3 border-b border-gray-200 dark:border-gray-700 ${selectedTemplate === idx ? 'bg-yellow-50 dark:bg-gray-800/50' : 'bg-white dark:bg-gray-900'}`}
                  >
                    <div className="h-10 w-14 rounded border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">{tpl.label}</div>
                      {tpl.description && <div className="text-sm text-gray-600 dark:text-gray-300">{tpl.description}</div>}
                    </div>
                  </button>
                ))}
              </div>

              <label className="mt-4 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input type="checkbox" checked={replaceContents} onChange={(e) => setReplaceContents(e.target.checked)} />
                Replace actual contents
              </label>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-2">
              <button
                className="px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200"
                onClick={() => setIsTemplatesOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Properties Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setIsFormOpen(false)} />
          <div className="relative w-full max-w-xl rounded-md bg-white dark:bg-gray-900 shadow-xl border border-gray-300 dark:border-gray-700">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Form Properties</h3>
              <button aria-label="Close form props" className="p-1.5 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setIsFormOpen(false)}>
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input value={formName} onChange={(e)=>setFormName(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Action</label>
                <input value={formAction} onChange={(e)=>setFormAction(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Id</label>
                  <input value={formId} onChange={(e)=>setFormId(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Encoding</label>
                  <select value={formEncoding} onChange={(e)=>setFormEncoding(e.target.value as '' | 'text/plain' | 'multipart/form-data' | 'application/x-www-form-urlencoded')} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm">
                    <option value=""></option>
                    <option value="text/plain">text/plain</option>
                    <option value="multipart/form-data">multipart/form-data</option>
                    <option value="application/x-www-form-urlencoded">application/x-www-form-urlencoded</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Target</label>
                  <select value={formTarget} onChange={(e)=>setFormTarget(e.target.value as 'notset' | '_blank' | '_top' | '_self' | '_parent')} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm">
                    <option value="notset">&lt;not set&gt;</option>
                    <option value="_blank">New Window (_blank)</option>
                    <option value="_top">Topmost Window (_top)</option>
                    <option value="_self">Same Window (_self)</option>
                    <option value="_parent">Parent Window (_parent)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Method</label>
                  <select value={formMethod} onChange={(e)=>setFormMethod(e.target.value as ' ' | 'GET' | 'POST')} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm">
                    <option value=""></option>
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-2">
              <button className="px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200" onClick={() => setIsFormOpen(false)}>Cancel</button>
              <button className="px-3 py-2 text-sm rounded bg-blue-600 text-white" onClick={submitFormModal}>OK</button>
            </div>
          </div>
        </div>
      )}

       {/* Checkbox/Radio Properties Modal */}
       {isCRModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setIsCRModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-md bg-white dark:bg-gray-900 shadow-xl border border-gray-300 dark:border-gray-700">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{crType === 'checkbox' ? 'Checkbox Properties' : 'Radio Button Properties'}</h3>
              <button aria-label="Close properties" className="p-1.5 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setIsCRModalOpen(false)}>
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input value={crName} onChange={(e)=>setCrName(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Value</label>
                <input value={crValue} onChange={(e)=>setCrValue(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
              </div>
              <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input type="checkbox" checked={crSelected} onChange={(e)=>setCrSelected(e.target.checked)} /> Selected
              </label>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-2">
              <button className="px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200" onClick={() => setIsCRModalOpen(false)}>Cancel</button>
              <button className="px-3 py-2 text-sm rounded bg-blue-600 text-white" onClick={submitCRModal}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Text Field Properties Modal */}
      {isTFModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setIsTFModalOpen(false)} />
          <div className="relative w-full max-w-xl rounded-md bg-white dark:bg-gray-900 shadow-xl border border-gray-300 dark:border-gray-700">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Text Field Properties</h3>
              <button aria-label="Close properties" className="p-1.5 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setIsTFModalOpen(false)}>
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Name</label>
                  <input value={tfName} onChange={(e)=>setTfName(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Value</label>
                  <input value={tfValue} onChange={(e)=>setTfValue(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Character Width</label>
                  <input value={tfWidth} onChange={(e)=>setTfWidth(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Maximum Characters</label>
                  <input value={tfMax} onChange={(e)=>setTfMax(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Type</label>
                <select value={tfType} onChange={(e)=>setTfType(e.target.value as 'text' | 'email' | 'password' | 'search' | 'tel' | 'url')} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm">
                  <option value="text">Text</option>
                  <option value="email">Email</option>
                  <option value="password">Password</option>
                  <option value="search">Search</option>
                  <option value="tel">Telephone Number</option>
                  <option value="url">URL</option>
                </select>
              </div>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-2">
              <button className="px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200" onClick={() => setIsTFModalOpen(false)}>Cancel</button>
              <button className="px-3 py-2 text-sm rounded bg-blue-600 text-white" onClick={submitTFModal}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Textarea Properties Modal */}
      {isTAModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setIsTAModalOpen(false)} />
          <div className="relative w-full max-w-xl rounded-md bg-white dark:bg-gray-900 shadow-xl border border-gray-300 dark:border-gray-700">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Textarea Properties</h3>
              <button aria-label="Close properties" className="p-1.5 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setIsTAModalOpen(false)}>
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input value={taName} onChange={(e)=>setTaName(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Columns</label>
                  <input value={taCols} onChange={(e)=>setTaCols(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Rows</label>
                  <input value={taRows} onChange={(e)=>setTaRows(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Value</label>
                <textarea value={taValue} onChange={(e)=>setTaValue(e.target.value)} className="w-full min-h-[140px] rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
              </div>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-2">
              <button className="px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200" onClick={() => setIsTAModalOpen(false)}>Cancel</button>
              <button className="px-3 py-2 text-sm rounded bg-blue-600 text-white" onClick={submitTAModal}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Selection Field Properties Modal */}
      {isSELModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setIsSELModalOpen(false)} />
          <div className="relative w-full max-w-3xl rounded-md bg-white dark:bg-gray-900 shadow-xl border border-gray-300 dark:border-gray-700">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Selection Field Properties</h3>
              <button aria-label="Close properties" className="p-1.5 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setIsSELModalOpen(false)}>
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Name</label>
                  <input value={selName} onChange={(e)=>setSelName(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Size</label>
                    <input value={selSize} onChange={(e)=>setSelSize(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 pb-2">lines</span>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Available Options</div>
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-5">
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Text</label>
                    <input value={optText} onChange={(e)=>setOptText(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm mb-2" />
                    <select size={6} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-1 text-sm" value={selIndex != null ? String(selIndex) : undefined} onChange={(e)=>setSelIndex(Number(e.target.value))}>
                      {selOptions.map((o, i) => (
                        <option key={i} value={i}>{o.text}{o.selected ? ' (selected)' : ''}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-5">
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Value</label>
                    <input value={optValue} onChange={(e)=>setOptValue(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm mb-2" />
                    <select size={6} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-1 text-sm" value={selIndex != null ? String(selIndex) : undefined} onChange={(e)=>setSelIndex(Number(e.target.value))}>
                      {selOptions.map((o, i) => (
                        <option key={i} value={i}>{o.value}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2 flex flex-col gap-2">
                    <button className="px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600" onClick={addSelOption}>Add</button>
                    <button className="px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600" onClick={modifySelOption}>Modify</button>
                    <button className="px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600" onClick={()=>moveSelOption(-1)}>Up</button>
                    <button className="px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600" onClick={()=>moveSelOption(1)}>Down</button>
                    <button className="px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600" onClick={deleteSelOption}>Delete</button>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <button className="px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600" onClick={setAsSelectedValue}>Set as selected value</button>
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input type="checkbox" checked={selMultiple} onChange={(e)=>setSelMultiple(e.target.checked)} /> Allow multiple selections
                  </label>
                </div>
              </div>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-2">
              <button className="px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200" onClick={() => setIsSELModalOpen(false)}>Cancel</button>
              <button className="px-3 py-2 text-sm rounded bg-blue-600 text-white" onClick={submitSELModal}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Button Properties Modal */}
      {isBTNModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setIsBTNModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-md bg-white dark:bg-gray-900 shadow-xl border border-gray-300 dark:border-gray-700">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Button Properties</h3>
              <button aria-label="Close properties" className="p-1.5 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setIsBTNModalOpen(false)}>
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input value={btnName} onChange={(e)=>setBtnName(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Text (Value)</label>
                <input value={btnText} onChange={(e)=>setBtnText(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Type</label>
                <select value={btnType} onChange={(e)=>setBtnType(e.target.value as 'button' | 'submit' | 'reset')} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm">
                  <option value="button">Button</option>
                  <option value="submit">Submit</option>
                  <option value="reset">Reset</option>
                </select>
              </div>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-2">
              <button className="px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200" onClick={() => setIsBTNModalOpen(false)}>Cancel</button>
              <button className="px-3 py-2 text-sm rounded bg-blue-600 text-white" onClick={submitBTNModal}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Image Button Properties Modal (tabs) */}
      {isIMGModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setIsIMGModalOpen(false)} />
          <div className="relative w-full max-w-3xl rounded-md bg-white dark:bg-gray-900 shadow-xl border border-gray-300 dark:border-gray-700">
            <div className="px-4 pt-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{imgAsTag ? 'Image Properties' : 'Image Button Properties'}</h3>
                <button aria-label="Close properties" className="p-1.5 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setIsIMGModalOpen(false)}>
                  <CloseIcon className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 flex gap-2 border-b border-gray-200 dark:border-gray-700">
                <button className={`px-3 py-1.5 text-sm ${imgTab==='info'?'border-b-2 border-gray-900 dark:border-gray-100 font-medium':''}`} onClick={()=>setImgTab('info')}>Image Info</button>
                {imgAsTag && (
                  <button className={`px-3 py-1.5 text-sm ${imgTab==='link'?'border-b-2 border-gray-900 dark:border-gray-100 font-medium':''}`} onClick={()=>setImgTab('link')}>Link</button>
                )}
                <button className={`px-3 py-1.5 text-sm ${imgTab==='advanced'?'border-b-2 border-gray-900 dark:border-gray-100 font-medium':''}`} onClick={()=>setImgTab('advanced')}>Advanced</button>
              </div>
            </div>
            <div className="p-4">
              {imgTab === 'info' ? (
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">URL</label>
                      <input value={imgUrl} onChange={(e)=>setImgUrl(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                    </div>
                    <div className="mt-3">
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Alternative Text</label>
                      <input value={imgAlt} onChange={(e)=>setImgAlt(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-3 items-end">
                      <div>
                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Width</label>
                        <input value={imgWidth} onChange={(e)=>{ const v=e.target.value; if(imgKeepRatio && imgRatio && parseInt(v,10)>0){ setImgHeight(String(Math.round(parseInt(v,10)*imgRatio))); } setImgWidth(v);} } className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Height</label>
                        <input value={imgHeight} onChange={(e)=>{ const v=e.target.value; if(imgKeepRatio && imgRatio && parseInt(v,10)>0){ setImgWidth(String(Math.round(parseInt(v,10)/imgRatio))); } setImgHeight(v);} } className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                      </div>
                      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 mb-1">
                        <input type="checkbox" checked={imgKeepRatio} onChange={(e)=>{ setImgKeepRatio(e.target.checked); const w=parseInt(imgWidth,10); const h=parseInt(imgHeight,10); if(!Number.isNaN(w) && w>0 && !Number.isNaN(h) && h>0){ setImgRatio(h/w); } }} />
                        Lock Ratio
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div>
                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Border</label>
                        <input value={imgBorder} onChange={(e)=>setImgBorder(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Alignment</label>
                        <select value={imgAlign} onChange={(e)=>setImgAlign(e.target.value as 'notset' | 'left' | 'right' | 'baseline' | 'top' | 'middle' | 'bottom')} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm">
                          <option value="notset">&lt;not set&gt;</option>
                          <option value="left">Left</option>
                          <option value="right">Right</option>
                          <option value="baseline">Baseline</option>
                          <option value="top">Top</option>
                          <option value="middle">Middle</option>
                          <option value="bottom">Bottom</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div>
                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">HSpace</label>
                        <input value={imgHSpace} onChange={(e)=>setImgHSpace(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">VSpace</label>
                        <input value={imgVSpace} onChange={(e)=>setImgVSpace(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preview</div>
                    <div className="border border-gray-300 dark:border-gray-700 rounded p-2 h-[300px] overflow-auto bg-white dark:bg-gray-900 flex items-start justify-center">
                      {imgUrl ? (
                        <img src={imgUrl} alt={imgAlt} style={{
                          width: imgWidth ? Number(imgWidth) : undefined,
                          height: imgHeight ? Number(imgHeight) : undefined,
                          border: imgBorder ? `${Number(imgBorder)}px solid #000` : undefined,
                          marginLeft: imgHSpace ? Number(imgHSpace) : undefined,
                          marginRight: imgHSpace ? Number(imgHSpace) : undefined,
                          marginTop: imgVSpace ? Number(imgVSpace) : undefined,
                          marginBottom: imgVSpace ? Number(imgVSpace) : undefined,
                          float: (imgAlign==='left' ? 'left' : imgAlign==='right' ? 'right' : undefined) as React.CSSProperties['float'],
                        }} />
                      ) : (
                        <div className="text-sm text-gray-500">Enter URL to preview</div>
                      )}
                    </div>
                  </div>
                </div>
              ) : imgTab === 'link' ? (
                <div className="space-y-3">
                  <LinkInfoFields withTypeSelector={false} />
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Target</label>
                    <select value={targetOpt} onChange={(e)=>setTargetOpt(e.target.value as 'notset'|'frame'|'popup'|'_blank'|'_top'|'_self'|'_parent')} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm">
                      <option value="notset">&lt;not set&gt;</option>
                      <option value="_blank">New Window (_blank)</option>
                      <option value="_top">Topmost Window (_top)</option>
                      <option value="_self">Same Window (_self)</option>
                      <option value="_parent">Parent Window (_parent)</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Id</label>
                    <input value={imgId} onChange={(e)=>setImgId(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Language Direction</label>
                    <select value={imgLangDir} onChange={(e)=>setImgLangDir(e.target.value as 'notset' | 'ltr' | 'rtl')} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm">
                      <option value="notset">&lt;not set&gt;</option>
                      <option value="ltr">Left to Right (LTR)</option>
                      <option value="rtl">Right to Left (RTL)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Language Code</label>
                    <input value={imgLangCode} onChange={(e)=>setImgLangCode(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Long Description URL</label>
                    <input value={imgLongDesc} onChange={(e)=>setImgLongDesc(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Stylesheet Classes</label>
                    <input value={imgClasses} onChange={(e)=>setImgClasses(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Style</label>
                    <input value={imgStyle} onChange={(e)=>setImgStyle(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                  </div>
                </div>
              )}
            </div>
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-2">
              <button className="px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200" onClick={() => setIsIMGModalOpen(false)}>Cancel</button>
              <button className="px-3 py-2 text-sm rounded bg-blue-600 text-white" onClick={submitIMGModal}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Field Properties Modal */}
      {isHIDModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setIsHIDModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-md bg-white dark:bg-gray-900 shadow-xl border border-gray-300 dark:border-gray-700">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Hidden Field Properties</h3>
              <button aria-label="Close properties" className="p-1.5 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setIsHIDModalOpen(false)}>
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input value={hidName} onChange={(e)=>setHidName(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Value</label>
                <input value={hidValue} onChange={(e)=>setHidValue(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
              </div>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-2">
              <button className="px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200" onClick={() => setIsHIDModalOpen(false)}>Cancel</button>
              <button className="px-3 py-2 text-sm rounded bg-blue-600 text-white" onClick={submitHIDModal}>OK</button>
            </div>
          </div>
        </div>
      )}


      {/* Create Div Container Modal */}
      {isDivModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setIsDivModalOpen(false)} />
          <div className="relative w-full max-w-2xl rounded-md bg-white dark:bg-gray-900 shadow-xl border border-gray-300 dark:border-gray-700">
            <div className="px-4 pt-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Create Div Container</h3>
                <button aria-label="Close" className="p-1.5 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setIsDivModalOpen(false)}>
                  <CloseIcon className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 flex gap-2 border-b border-gray-200 dark:border-gray-700">
                <button className={`px-3 py-1.5 text-sm ${divTab==='general'?'border-b-2 border-gray-900 dark:border-gray-100 font-medium':''}`} onClick={()=>setDivTab('general')}>General</button>
                <button className={`px-3 py-1.5 text-sm ${divTab==='advanced'?'border-b-2 border-gray-900 dark:border-gray-100 font-medium':''}`} onClick={()=>setDivTab('advanced')}>Advanced</button>
              </div>
            </div>
            <div className="p-4">
              {divTab === 'general' ? (
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Style</label>
                    <select value={divStylePreset} onChange={(e)=>setDivStylePreset(e.target.value as 'notset'|'special')} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm">
                      <option value="notset">&lt;not set&gt;</option>
                      <option value="special">Special Container</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Stylesheet Classes</label>
                    <input value={divClasses} onChange={(e)=>setDivClasses(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Id</label>
                    <input value={divId} onChange={(e)=>setDivId(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Language Code</label>
                    <input value={divLangCode} onChange={(e)=>setDivLangCode(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Style</label>
                    <input value={divInlineStyle} onChange={(e)=>setDivInlineStyle(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Advisory Title</label>
                    <input value={divTitle} onChange={(e)=>setDivTitle(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Language Direction</label>
                    <select value={divDir} onChange={(e)=>setDivDir(e.target.value as 'notset'|'ltr'|'rtl')} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm">
                      <option value="notset">&lt;not set&gt;</option>
                      <option value="ltr">Left to Right (LTR)</option>
                      <option value="rtl">Right to Left (RTL)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-2">
              <button className="px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200" onClick={() => setIsDivModalOpen(false)}>Cancel</button>
              <button className="px-3 py-2 text-sm rounded bg-green-600 text-white" onClick={submitDivContainerModal}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Find & Replace Modal (with tabs & options) */}
      {isFindOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setIsFindOpen(false)} />
          <div className="relative w-full max-w-lg rounded-md bg-white dark:bg-gray-900 shadow-xl border border-gray-300 dark:border-gray-700">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Find & Replace</h3>
              <button aria-label="Close find" className="p-1.5 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setIsFindOpen(false)}>
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="px-4 pt-3 flex-1 overflow-y-auto">
              {/* Tabs */}
              <div className="flex gap-2 mb-3 border-b border-gray-200 dark:border-gray-700">
                <button className={`px-3 py-1.5 text-sm ${findTab==='find'?'border-b-2 border-gray-900 dark:border-gray-100 font-medium':''}`} onClick={()=>setFindTab('find')}>Find</button>
                <button className={`px-3 py-1.5 text-sm ${findTab==='replace'?'border-b-2 border-gray-900 dark:border-gray-100 font-medium':''}`} onClick={()=>setFindTab('replace')}>Replace</button>
              </div>

              {/* Body */}
              {findTab === 'find' ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <label className="w-24 text-sm text-gray-700 dark:text-gray-300">Find what:</label>
                    <input value={findText} onChange={(e)=>setFindText(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); findNextWithOptions(); } }} className="flex-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                    <button className="px-3 py-2 text-sm rounded bg-blue-600 text-white" onClick={findNextWithOptions}>Find</button>
                  </div>
                  {findWarning && <div className="mt-1 text-xs text-red-600">{findWarning}</div>}

                  <div className="mt-2 border border-gray-200 dark:border-gray-700 rounded">
                    <div className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">Find Options</div>
                    <div className="px-3 pb-3 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      <label className="flex items-center gap-2"><input type="checkbox" checked={caseSensitive} onChange={(e)=>setCaseSensitive(e.target.checked)} /> Match case</label>
                      <label className="flex items-center gap-2"><input type="checkbox" checked={wholeWord} onChange={(e)=>setWholeWord(e.target.checked)} /> Match whole word</label>
                      <label className="flex items-center gap-2"><input type="checkbox" checked={cyclic} onChange={(e)=>setCyclic(e.target.checked)} /> Match cyclic</label>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <label className="w-24 text-sm text-gray-700 dark:text-gray-300">Find what:</label>
                    <input value={findText} onChange={(e)=>setFindText(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); findNextWithOptions(); } }} className="flex-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                    <button className="px-3 py-2 text-sm rounded bg-blue-600 text-white" onClick={findNextWithOptions}>Replace</button>
                  </div>
                  {findWarning && <div className="mt-1 text-xs text-red-600">{findWarning}</div>}
                  <div className="flex items-center gap-3">
                    <label className="w-24 text-sm text-gray-700 dark:text-gray-300">Replace with:</label>
                    <input value={replaceText} onChange={(e)=>setReplaceText(e.target.value)} className="flex-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                    <button className="px-3 py-2 text-sm rounded bg-blue-600/90 text-white" onClick={replaceAllInEditor}>Replace All</button>
                  </div>

                  <div className="mt-2 border border-gray-200 dark:border-gray-700 rounded">
                    <div className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">Find Options</div>
                    <div className="px-3 pb-3 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      <label className="flex items-center gap-2"><input type="checkbox" checked={caseSensitive} onChange={(e)=>setCaseSensitive(e.target.checked)} /> Match case</label>
                      <label className="flex items-center gap-2"><input type="checkbox" checked={wholeWord} onChange={(e)=>setWholeWord(e.target.checked)} /> Match whole word</label>
                      <label className="flex items-center gap-2"><input type="checkbox" checked={cyclic} onChange={(e)=>setCyclic(e.target.checked)} /> Match cyclic</label>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-2">
              <button className="px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200" onClick={() => setIsFindOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Paste Modal */}
      {isPasteOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setIsPasteOpen(false)} />
          <div className="relative w-full max-w-xl rounded-md bg-white dark:bg-gray-900 shadow-xl border border-gray-300 dark:border-gray-700">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{pasteMode === 'plain' ? 'Paste as plain text' : pasteMode === 'word' ? 'Paste from Word' : 'Paste'}</h3>
              <button
                aria-label="Close paste"
                className="p-1.5 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setIsPasteOpen(false)}
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">Because of your browser security settings, the editor is not able to access your clipboard data directly. Please paste inside the following box using the keyboard <span className="font-bold">(Ctrl/Cmd+V)</span> and hit OK.</p>
              <textarea
                value={pasteInput}
                onChange={(e) => setPasteInput(e.target.value)}
                className="w-full min-h-[160px] rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm text-gray-900 dark:text-gray-100"
                placeholder="Paste here with Ctrl/Cmd+V"
              />
            </div>
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-2">
              <button
                className="px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200"
                onClick={() => setIsPasteOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-2 text-sm rounded bg-blue-600 text-white"
                onClick={() => {
                  const raw = pasteInput || '';
                  if (pasteMode === 'plain') {
                    editor.chain().focus().insertContent(escapeHtml(raw)).run();
                  } else if (pasteMode === 'word') {
                    editor.chain().focus().insertContent(cleanWordHtml(raw)).run();
                  } else {
                    editor.chain().focus().insertContent(raw).run();
                  }
                  if (isSourceView) setSourceValue(editor.getHTML());
                  setIsPasteOpen(false);
                  setPasteInput('');
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      

      {/* Flash Modal */}
      {isFlashOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setIsFlashOpen(false)} />
          <div className="relative w-full max-w-2xl rounded-md bg-white dark:bg-gray-900 shadow-xl border border-gray-300 dark:border-gray-700">
            <div className="px-4 pt-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Flash Properties</h3>
                <button aria-label="Close flash" className="p-1.5 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setIsFlashOpen(false)}>
                  <CloseIcon className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 flex gap-2 border-b border-gray-200 dark:border-gray-700">
                <button className={`px-3 py-1.5 text-sm ${flashTab==='general'?'border-b-2 border-gray-900 dark:border-gray-100 font-medium':''}`} onClick={()=>setFlashTab('general')}>General</button>
                <button className={`px-3 py-1.5 text-sm ${flashTab==='properties'?'border-b-2 border-gray-900 dark:border-gray-100 font-medium':''}`} onClick={()=>setFlashTab('properties')}>Properties</button>
                <button className={`px-3 py-1.5 text-sm ${flashTab==='advanced'?'border-b-2 border-gray-900 dark:border-gray-100 font-medium':''}`} onClick={()=>setFlashTab('advanced')}>Advanced</button>
              </div>
            </div>
            <div className="p-4">
              {flashTab === 'general' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">URL</label>
                    <input value={flashUrl} onChange={(e)=>setFlashUrl(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Width</label>
                      <input value={flashWidth} onChange={(e)=>setFlashWidth(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Height</label>
                      <input value={flashHeight} onChange={(e)=>setFlashHeight(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">HSpace</label>
                      <input value={flashHSpace} onChange={(e)=>setFlashHSpace(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">VSpace</label>
                      <input value={flashVSpace} onChange={(e)=>setFlashVSpace(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preview</div>
                    <div className="border border-gray-300 dark:border-gray-700 rounded p-2 h-[220px] bg-white dark:bg-gray-900" />
                  </div>
                </div>
              ) : flashTab === 'properties' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Scale</label>
                      <select value={flashScale} onChange={(e)=>setFlashScale(e.target.value as 'notset'|'showall'|'noborder'|'exactfit')} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm">
                        <option value="notset">&lt;not set&gt;</option>
                        <option value="showall">Show all</option>
                        <option value="noborder">No Border</option>
                        <option value="exactfit">Exact Fit</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Script Access</label>
                      <select value={flashScriptAccess} onChange={(e)=>setFlashScriptAccess(e.target.value as 'notset'|'always'|'samedomain'|'never')} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm">
                        <option value="notset">&lt;not set&gt;</option>
                        <option value="always">Always</option>
                        <option value="samedomain">Same domain</option>
                        <option value="never">Never</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Window mode</label>
                      <select value={flashWindowMode} onChange={(e)=>setFlashWindowMode(e.target.value as 'notset'|'window'|'opaque'|'transparent')} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm">
                        <option value="notset">&lt;not set&gt;</option>
                        <option value="window">Window</option>
                        <option value="opaque">Opaque</option>
                        <option value="transparent">Transparent</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Quality</label>
                      <select value={flashQuality} onChange={(e)=>setFlashQuality(e.target.value as 'notset'|'best'|'high'|'autohigh'|'medium'|'autolow'|'low')} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm">
                        <option value="notset">&lt;not set&gt;</option>
                        <option value="best">Best</option>
                        <option value="high">High</option>
                        <option value="autohigh">Auto High</option>
                        <option value="medium">Medium</option>
                        <option value="autolow">Auto Low</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Alignment</label>
                      <select value={flashAlign} onChange={(e)=>setFlashAlign(e.target.value as 'notset'|'left'|'absbottom'|'absmiddle'|'baseline'|'bottom'|'middle'|'right'|'texttop'|'top')} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm">
                        <option value="notset">&lt;not set&gt;</option>
                        <option value="left">Left</option>
                        <option value="absbottom">Abs Bottom</option>
                        <option value="absmiddle">Abs Middle</option>
                        <option value="baseline">Baseline</option>
                        <option value="bottom">Bottom</option>
                        <option value="middle">Middle</option>
                        <option value="right">Right</option>
                        <option value="texttop">Text Top</option>
                        <option value="top">Top</option>
                      </select>
                    </div>
                  </div>
                  <div className="border rounded p-2">
                    <div className="text-sm font-medium mb-1">Variables for Flash</div>
                    <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      <label className="flex items-center gap-2"><input type="checkbox" checked={flashMenu} onChange={(e)=>setFlashMenu(e.target.checked)} /> Enable Flash Menu</label>
                      <label className="flex items-center gap-2"><input type="checkbox" checked={flashAutoPlay} onChange={(e)=>setFlashAutoPlay(e.target.checked)} /> Auto Play</label>
                      <label className="flex items-center gap-2"><input type="checkbox" checked={flashLoop} onChange={(e)=>setFlashLoop(e.target.checked)} /> Loop</label>
                      <label className="flex items-center gap-2"><input type="checkbox" checked={flashAllowFullscreen} onChange={(e)=>setFlashAllowFullscreen(e.target.checked)} /> Allow Fullscreen</label>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Id</label>
                    <input value={flashId} onChange={(e)=>setFlashId(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Background color</label>
                    <input value={flashBgColor} onChange={(e)=>setFlashBgColor(e.target.value)} placeholder="#ffffff" className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Stylesheet Classes</label>
                    <input value={flashClasses} onChange={(e)=>setFlashClasses(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Style</label>
                    <input value={flashStyle} onChange={(e)=>setFlashStyle(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                  </div>
                </div>
              )}
              <p className="mt-3 text-xs text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 p-2 rounded">Note: Flash is deprecated in modern browsers. This inserts legacy &lt;object&gt; markup.</p>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-2">
              <button className="px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200" onClick={() => setIsFlashOpen(false)}>Cancel</button>
              <button className="px-3 py-2 text-sm rounded bg-blue-600 text-white" onClick={submitFlashModal}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Special Characters Modal */}
      {specialOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSpecialOpen(false)} />
          <div className="relative w-full max-w-3xl rounded-md bg-white dark:bg-gray-900 shadow-xl border border-gray-300 dark:border-gray-700">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Select Special Character</h3>
              <button aria-label="Close special" className="p-1.5 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setSpecialOpen(false)}>
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-9">
                  <div className="h-[360px] overflow-auto border border-gray-300 dark:border-gray-700 rounded p-2 bg-gray-50 dark:bg-gray-800">
                    <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}>
                      {(() => {
                        const chars = (
                          `!"#$%&'()*+,-./0123456789:;<>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_\`` +
                          `abcdefghijklmnopqrstuvwxyz{|}~` +
                          `©®™§±÷×µ£€¥¢–—•…←→↑↓∞≈≠≤≥ΩπηθδαβγΔ∑∫√∂°‰℉℃` +
                          `ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞß` +
                          `àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ` +
                          `¿¡ˇ˘¸˛ˆ˜˙¨`)
                          .split('');
                        return chars.map((ch, i) => (
                          <button
                            key={i}
                            className={`w-8 h-8 text-base flex items-center justify-center rounded border ${specialSelected===ch? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-gray-300 dark:border-gray-700'} hover:bg-gray-100 dark:hover:bg-gray-800`}
                            onMouseEnter={()=> setSpecialSelected(ch)}
                            onClick={()=> { insertChar(ch); setSpecialOpen(false); setSpecialSelected(null); }}
                            title={ch}
                          >{ch}</button>
                        ));
                      })()}
                    </div>
                  </div>
                </div>
                <div className="col-span-3">
                  <div className="border border-gray-300 dark:border-gray-700 rounded p-4 h-[120px] flex items-center justify-center text-5xl bg-white dark:bg-gray-900">
                    {specialSelected || ''}
                  </div>
                  <div className="mt-3 text-sm text-gray-800 dark:text-gray-200">
                    {specialSelected ? `&#${specialSelected.codePointAt(0)};` : '\u00A0'}
                  </div>
                </div>
              </div>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end">
              <button className="px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200" onClick={() => setSpecialOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Smiley Modal */}
      {smileyOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSmileyOpen(false)} />
          <div className="relative w-full max-w-md rounded-md bg-white dark:bg-gray-900 shadow-xl border border-gray-300 dark:border-gray-700">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Insert a Smiley</h3>
              <button aria-label="Close smiley" className="p-1.5 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setSmileyOpen(false)}>
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-8 gap-2">
                {[
                  '🙂','🙁','😐','😉','😮','😛','😲','😏',
                  '😳','😬','😴','😕','😔','😊','😇','🤓',
                  '😈','😢','💡','👍','👎','❤️','💔','💋',
                  '✉️'
                ].map((e)=> (
                  <button key={e} className="w-10 h-10 flex items-center justify-center text-xl rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={()=>{ insertChar(e); setSmileyOpen(false); }}
                  >{e}</button>
                ))}
              </div>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end">
              <button className="px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200" onClick={() => setSmileyOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* iFrame Modal */}
      {isIframeOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setIsIframeOpen(false)} />
          <div className="relative w-full max-w-2xl rounded-md bg-white dark:bg-gray-900 shadow-xl border border-gray-300 dark:border-gray-700">
            <div className="px-4 pt-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">IFrame Properties</h3>
                <button aria-label="Close iframe" className="p-1.5 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hoverbg-gray-800" onClick={() => setIsIframeOpen(false)}>
                  <CloseIcon className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 flex gap-2 border-b border-gray-200 dark:border-gray-700">
                <button className={`px-3 py-1.5 text-sm ${iframeTab==='general'?'border-b-2 border-gray-900 dark:border-gray-100 font-medium':''}`} onClick={()=>setIframeTab('general')}>General</button>
                <button className={`px-3 py-1.5 text-sm ${iframeTab==='advanced'?'border-b-2 border-gray-900 dark:border-gray-100 font-medium':''}`} onClick={()=>setIframeTab('advanced')}>Advanced</button>
              </div>
            </div>
            <div className="p-4">
              {iframeTab === 'general' ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">URL</label>
                    <input value={iframeUrl} onChange={(e)=>setIframeUrl(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Width</label>
                      <input value={iframeWidth} onChange={(e)=>setIframeWidth(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Height</label>
                      <input value={iframeHeight} onChange={(e)=>setIframeHeight(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Alignment</label>
                      <select value={iframeAlign} onChange={(e)=>setIframeAlign(e.target.value as 'notset'|'left'|'right'|'top'|'middle'|'bottom')} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm">
                        <option value="notset">&lt;not set&gt;</option>
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                        <option value="top">Top</option>
                        <option value="middle">Middle</option>
                        <option value="bottom">Bottom</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <input type="checkbox" checked={iframeScrollbars} onChange={(e)=>setIframeScrollbars(e.target.checked)} /> Enable scrollbars
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <input type="checkbox" checked={iframeBorder} onChange={(e)=>setIframeBorder(e.target.checked)} /> Show frame border
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Name</label>
                      <input value={iframeName} onChange={(e)=>setIframeName(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Advisory Title</label>
                      <input value={iframeTitle} onChange={(e)=>setIframeTitle(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Long Description URL</label>
                    <input value={iframeLongDesc} onChange={(e)=>setIframeLongDesc(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                  </div>
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input type="checkbox" checked={iframeAllow} onChange={(e)=>setIframeAllow(e.target.checked)} /> Allow Fullscreen
                  </label>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Id</label>
                    <input value={iframeId} onChange={(e)=>setIframeId(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Stylesheet Classes</label>
                    <input value={iframeClasses} onChange={(e)=>setIframeClasses(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Style</label>
                    <input value={iframeStyle} onChange={(e)=>setIframeStyle(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                  </div>
                </div>
              )}
            </div>
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-2">
              <button className="px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200" onClick={() => setIsIframeOpen(false)}>Cancel</button>
              <button className="px-3 py-2 text-sm rounded bg-blue-600 text-white" onClick={submitIframeModal}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Table Properties Modal */}
      {isTableOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setIsTableOpen(false)} />
          <div className="relative w-full max-w-xl rounded-md bg-white dark:bg-gray-900 shadow-xl border border-gray-300 dark:border-gray-700">
            <div className="px-4 pt-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Table Properties</h3>
                <button aria-label="Close table" className="p-1.5 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setIsTableOpen(false)}>
                  <CloseIcon className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 flex gap-2 border-b border-gray-200 dark:border-gray-700">
                <button className={`px-3 py-1.5 text-sm ${tableTab==='props'?'border-b-2 border-gray-900 dark:border-gray-100 font-medium':''}`} onClick={()=>setTableTab('props')}>Table Properties</button>
                <button className={`px-3 py-1.5 text-sm ${tableTab==='advanced'?'border-b-2 border-gray-900 dark:border-gray-100 font-medium':''}`} onClick={()=>setTableTab('advanced')}>Advanced</button>
              </div>
            </div>
            <div className="p-4">
              {tableTab === 'props' ? (
                <div className="grid grid-cols-3 gap-4">
                  {/* Row 1: Rows | Width | Height */}
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Rows</label>
                    <input value={tableRows} onChange={(e)=>setTableRows(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Width</label>
                    <input value={tableWidth} onChange={(e)=>setTableWidth(e.target.value)} placeholder="500" className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Height</label>
                    <input value={tableHeight} onChange={(e)=>setTableHeight(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                  </div>

                  {/* Row 2: Columns | Headers | Alignment */}
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Columns</label>
                    <input value={tableCols} onChange={(e)=>setTableCols(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Headers</label>
                    <select value={tableHeaders} onChange={(e)=>setTableHeaders(e.target.value as 'none'|'row'|'col'|'both')} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm">
                      <option value="none">None</option>
                      <option value="row">First Row</option>
                      <option value="col">First column</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Alignment</label>
                    <select value={tableAlign} onChange={(e)=>setTableAlign(e.target.value as 'notset'|'left'|'center'|'right')} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm">
                      <option value="notset">&lt;not set&gt;</option>
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>

                  {/* Row 3: Border size | Cell spacing | Cell padding */}
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Border size</label>
                    <input value={tableBorder} onChange={(e)=>setTableBorder(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Cell spacing</label>
                    <input value={tableCellSpacing} onChange={(e)=>setTableCellSpacing(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Cell padding</label>
                    <input value={tableCellPadding} onChange={(e)=>setTableCellPadding(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                  </div>

                  {/* Row 4: Caption (span 3) */}
                  <div className="col-span-3">
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Caption</label>
                    <input value={tableCaption} onChange={(e)=>setTableCaption(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                  </div>

                  {/* Row 5: Summary (span 3) */}
                  <div className="col-span-3">
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Summary</label>
                    <input value={tableSummary} onChange={(e)=>setTableSummary(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Id</label>
                    <input value={tableId} onChange={(e)=>setTableId(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Language Direction</label>
                    <select value={tableLangDir} onChange={(e)=>setTableLangDir(e.target.value as 'notset'|'ltr'|'rtl')} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm">
                      <option value="notset">&lt;not set&gt;</option>
                      <option value="ltr">Left to Right (LTR)</option>
                      <option value="rtl">Right to Left (RTL)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Style</label>
                    <input value={tableStyle} onChange={(e)=>setTableStyle(e.target.value)} placeholder="width:500px;" className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Stylesheet Classes</label>
                    <input value={tableClasses} onChange={(e)=>setTableClasses(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                  </div>
                </div>
              )}
            </div>
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-2">
              <button className="px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200" onClick={() => setIsTableOpen(false)}>Cancel</button>
              <button className="px-3 py-2 text-sm rounded bg-blue-600 text-white" onClick={submitTableModal}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Link Modal with tabs (Link Info, Target, Advanced) */}
      {isLinkOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setIsLinkOpen(false)} />
          <div className="relative w-full max-w-2xl rounded-md bg-white dark:bg-gray-900 shadow-xl border border-gray-300 dark:border-gray-700">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Link</h3>
              <button aria-label="Close link" className="p-1.5 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setIsLinkOpen(false)}>
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="px-4 pt-3">
              {/* Tabs */}
              <div className="flex gap-2 mb-3 border-b border-gray-200 dark:border-gray-700">
                <button className={`px-3 py-1.5 text-sm ${linkTab==='info'?'border-b-2 border-gray-900 dark:border-gray-100 font-medium':''}`} onClick={()=>setLinkTab('info')}>Link Info</button>
                <button className={`px-3 py-1.5 text-sm ${linkTab==='target'?'border-b-2 border-gray-900 dark:border-gray-100 font-medium':''}`} onClick={()=>setLinkTab('target')}>Target</button>
                <button className={`px-3 py-1.5 text-sm ${linkTab==='advanced'?'border-b-2 border-gray-900 dark:border-gray-100 font-medium':''}`} onClick={()=>setLinkTab('advanced')}>Advanced</button>
              </div>

              {/* Body */}
              {linkTab === 'info' && <LinkInfoFields withTypeSelector />}

              {linkTab === 'target' && (
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Target</label>
                  <select value={targetOpt} onChange={(e)=>setTargetOpt(e.target.value as 'notset'|'frame'|'popup'|'_blank'|'_top'|'_self'|'_parent')} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm">
                    <option value="notset">&lt;not set&gt;</option>
                    <option value="frame">&lt;frame&gt;</option>
                    <option value="popup">&lt;popup window&gt;</option>
                    <option value="_blank">New Window (_blank)</option>
                    <option value="_top">Topmost Window (_top)</option>
                    <option value="_self">Same Window (_self)</option>
                    <option value="_parent">Parent Window (_parent)</option>
                  </select>
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">Tip: For emails, _blank is recommended.</div>
                </div>
              )}

              {linkTab === 'advanced' && (
                <div className="grid grid-cols-3 gap-4">
                  {/* Row 1: Id | Language Direction | Access Key */}
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Id</label>
                    <input value={advId} onChange={(e)=>setAdvId(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Language Direction</label>
                    <select value={advLangDir} onChange={(e)=>setAdvLangDir(e.target.value as 'notset'|'ltr'|'rtl')} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm">
                      <option value="notset">&lt;not set&gt;</option>
                      <option value="ltr">Left to Right (LTR)</option>
                      <option value="rtl">Right to Left (RTL)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Access Key</label>
                    <input value={advAccessKey} onChange={(e)=>setAdvAccessKey(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                  </div>

                  {/* Row 2: Name | Language Code | Tab Index */}
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Name</label>
                    <input value={advName} onChange={(e)=>setAdvName(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Language Code</label>
                    <input value={advLangCode} onChange={(e)=>setAdvLangCode(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Tab Index</label>
                    <input value={advTabIndex} onChange={(e)=>setAdvTabIndex(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                  </div>

                  {/* Row 3: Advisory Title | Advisory Content Type | (empty) */}
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Advisory Title</label>
                    <input value={advTitle} onChange={(e)=>setAdvTitle(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Advisory Content Type</label>
                    <input value={advContentType} onChange={(e)=>setAdvContentType(e.target.value)} placeholder="text/html" className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                  </div>
                  <div />

                  {/* Row 4: Stylesheet Classes | Linked Resource Charset | (empty) */}
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Stylesheet Classes</label>
                    <input value={advClasses} onChange={(e)=>setAdvClasses(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Linked Resource Charset</label>
                    <input value={advCharset} onChange={(e)=>setAdvCharset(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                  </div>
                  <div />

                  {/* Row 5: Relationship | Style | (empty) */}
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Relationship</label>
                    <input value={advRel} onChange={(e)=>setAdvRel(e.target.value)} placeholder="nofollow, noopener" className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Style</label>
                    <input value={advStyle} onChange={(e)=>setAdvStyle(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                  </div>
                  <div />
                </div>
              )}
            </div>
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-2">
              <button className="px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200" onClick={() => setIsLinkOpen(false)}>Cancel</button>
              <button className="px-3 py-2 text-sm rounded bg-blue-600 text-white" onClick={submitLinkModal}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Anchor Modal */}
      {isAnchorOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setIsAnchorOpen(false)} />
          <div className="relative w-full max-w-md rounded-md bg-white dark:bg-gray-900 shadow-xl border border-gray-300 dark:border-gray-700">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Anchor Properties</h3>
              <button aria-label="Close anchor" className="p-1.5 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setIsAnchorOpen(false)}>
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Anchor Name (optional)</label>
                <input
                  value={anchorName}
                  onChange={(e)=>setAnchorName(e.target.value)}
                  placeholder="Statement Section"
                  className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Element Id</label>
                <input
                  value={anchorId}
                  onChange={(e)=>setAnchorId(e.target.value)}
                  placeholder="statement-section"
                  className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Use lowercase letters, numbers, or dashes. This is the value used in links (#statement-section).</p>
              </div>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-2">
              <button className="px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200" onClick={() => setIsAnchorOpen(false)}>Cancel</button>
              <button className="px-3 py-2 text-sm rounded bg-blue-600 text-white" onClick={submitAnchorModal}>OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

