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
  const [anchorList, setAnchorList] = React.useState<string[]>([]);
  const [anchorTarget, setAnchorTarget] = React.useState('');
  const [emailAddr, setEmailAddr] = React.useState('');
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
  // Rich insertions
  const [isImageInsertOpen, setIsImageInsertOpen] = React.useState(false);
  const [insImgUrl, setInsImgUrl] = React.useState('');
  const [insImgAlt, setInsImgAlt] = React.useState('');
  const [insImgWidth, setInsImgWidth] = React.useState('');
  const [insImgHeight, setInsImgHeight] = React.useState('');
  const [isFlashOpen, setIsFlashOpen] = React.useState(false);
  const [flashUrl, setFlashUrl] = React.useState('');
  const [flashWidth, setFlashWidth] = React.useState('');
  const [flashHeight, setFlashHeight] = React.useState('');
  const [isIframeOpen, setIsIframeOpen] = React.useState(false);
  const [iframeUrl, setIframeUrl] = React.useState('');
  const [iframeWidth, setIframeWidth] = React.useState('');
  const [iframeHeight, setIframeHeight] = React.useState('');
  const [iframeAllow, setIframeAllow] = React.useState(true);
  const [smileyOpen, setSmileyOpen] = React.useState(false);
  const [specialOpen, setSpecialOpen] = React.useState(false);
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
  const [imgTab, setImgTab] = React.useState<'info' | 'advanced'>('info');
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

  const getAnchorsFromHtml = (html: string): string[] => {
    const ids = new Set<string>();
    try {
      const div = document.createElement('div');
      div.innerHTML = html;
      const elements = div.querySelectorAll('[id]');
      elements.forEach((el) => {
        const id = (el as HTMLElement).id;
        if (id) ids.add(id);
      });
    } catch {}
    return Array.from(ids);
  };

  const openLinkModal = () => {
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
    setEmailAddr('');
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
    // collect anchors from current doc
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
      if (!anchorTarget.trim()) return '';
      return `#${anchorTarget.trim()}`;
    }
    // email
    const email = emailAddr.trim();
    if (!email) return '';
    return `mailto:${email}`;
  };

  const submitLinkModal = () => {
    const href = buildHref();
    if (!href) { setIsLinkOpen(false); return; }
    const attrs: Record<string, string> = { href };
    // Target mapping
    if (targetOpt === '_blank') {
      attrs.target = '_blank';
      attrs.rel = 'noopener noreferrer';
    } else if (targetOpt !== 'notset' && targetOpt !== 'popup' && targetOpt !== 'frame') {
      attrs.target = targetOpt;
    }
    // Title removed from Link Info tab; use Advanced 'Advisory Title' if needed
    // Advanced attributes
    if (advId.trim()) attrs.id = advId.trim();
    if (advName.trim()) attrs.name = advName.trim();
    if (advLangDir !== 'notset') attrs.dir = advLangDir;
    if (advLangCode.trim()) attrs.lang = advLangCode.trim();
    if (advAccessKey.trim()) attrs.accesskey = advAccessKey.trim();
    if (advTabIndex.trim()) attrs.tabindex = advTabIndex.trim();
    if (advClasses.trim()) attrs.class = advClasses.trim();
    if (advRel.trim()) attrs.rel = attrs.rel ? `${attrs.rel} ${advRel.trim()}` : advRel.trim();
    if (advStyle.trim()) attrs.style = advStyle.trim();
    if (advContentType.trim()) attrs.type = advContentType.trim();
    if (advCharset.trim()) attrs.charset = advCharset.trim();

    // Build attribute string
    const attrStr = Object.entries(attrs)
      .map(([k, v]) => `${k}="${escapeHtml(v)}"`)
      .join(' ');

    const sel = getSelectionAsHtmlAndText();
    const display = sel && sel.html && sel.html.trim() !== ''
      ? sel.html
      : escapeHtml(href);
    editor.chain().focus().insertContent(`<a ${attrStr}>${display}</a>`).run();
    setIsLinkOpen(false);
  };

  const openAnchorModal = () => {
    setAnchorId('');
    setIsAnchorOpen(true);
  };

  const submitAnchorModal = () => {
    const id = anchorId.trim();
    if (!id) { setIsAnchorOpen(false); return; }
    const sel = getSelectionAsHtmlAndText();
    const inner = sel?.html && sel.html.trim() !== '' ? sel.html : '';
    if (inner) {
      insertHtml(`<span id="${escapeHtml(id)}">${inner}</span>`);
    } else {
      insertHtml(`<a id="${escapeHtml(id)}"></a>`);
    }
    setIsAnchorOpen(false);
  };

  const insertHorizontalRule = () => {
    editor.chain().focus().setHorizontalRule().run();
  };

  const openImageInsert = () => {
    setInsImgUrl('');
    setInsImgAlt('');
    setInsImgWidth('');
    setInsImgHeight('');
    setIsImageInsertOpen(true);
  };
  const submitImageInsert = () => {
    if (!insImgUrl.trim()) { setIsImageInsertOpen(false); return; }
    const attrs: string[] = [`src=\"${escapeHtml(insImgUrl.trim())}\"`];
    if (insImgAlt.trim()) attrs.push(`alt=\"${escapeHtml(insImgAlt.trim())}\"`);
    const w = parseInt(insImgWidth, 10); if (!Number.isNaN(w) && w > 0) attrs.push(`width=\"${w}\"`);
    const h = parseInt(insImgHeight, 10); if (!Number.isNaN(h) && h > 0) attrs.push(`height=\"${h}\"`);
    insertHtml(`<img ${attrs.join(' ')} />`);
    setIsImageInsertOpen(false);
  };

  const openFlashModal = () => {
    setFlashUrl('');
    setFlashWidth('');
    setFlashHeight('');
    setIsFlashOpen(true);
  };
  const submitFlashModal = () => {
    if (!flashUrl.trim()) { setIsFlashOpen(false); return; }
    const w = parseInt(flashWidth, 10); const h = parseInt(flashHeight, 10);
    const size = `${!Number.isNaN(w)&&w>0?` width=\"${w}\"`:''}${!Number.isNaN(h)&&h>0?` height=\"${h}\"`:''}`;
    const html = `<object data=\"${escapeHtml(flashUrl.trim())}\" type=\"application/x-shockwave-flash\"${size}></object>`;
    insertHtml(html);
    setIsFlashOpen(false);
  };

  const openIframeModal = () => {
    setIframeUrl(''); setIframeWidth(''); setIframeHeight(''); setIframeAllow(true); setIsIframeOpen(true);
  };
  const submitIframeModal = () => {
    if (!iframeUrl.trim()) { setIsIframeOpen(false); return; }
    const attrs: string[] = [`src=\"${escapeHtml(iframeUrl.trim())}\"`, `frameborder=\"0\"`];
    const w = parseInt(iframeWidth, 10); if (!Number.isNaN(w) && w>0) attrs.push(`width=\"${w}\"`);
    const h = parseInt(iframeHeight, 10); if (!Number.isNaN(h) && h>0) attrs.push(`height=\"${h}\"`);
    if (iframeAllow) attrs.push(`allowfullscreen`);
    insertHtml(`<iframe ${attrs.join(' ')}></iframe>`);
    setIsIframeOpen(false);
  };

  const insertPageBreak = () => {
    insertHtml('<div style="page-break-after: always;"></div>');
  };

  const insertChar = (s: string) => {
    editor.chain().focus().insertContent(s).run();
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
  const submitIMGModal = () => {
    if (!imgUrl.trim()) { setIsIMGModalOpen(false); return; }
    const attrs: string[] = [ `type="image"`, `src="${escapeHtml(imgUrl.trim())}"` ];
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
    insertHtml(`<input ${attrs.join(' ')} />`);
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
      {/* Toolbar */}
      <div className="tiptap-toolbar flex flex-wrap items-center gap-1 p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600 rounded-t-md">
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
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
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
        <ToolbarButton onClick={openImageButtonModal} title="Image Button">
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
          className="tiptap-editor-wrapper bg-white dark:bg-gray-900 border-x border-b border-gray-300 dark:border-gray-600 rounded-b-md"
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
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Image Button Properties</h3>
                <button aria-label="Close properties" className="p-1.5 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setIsIMGModalOpen(false)}>
                  <CloseIcon className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 flex gap-2 border-b border-gray-200 dark:border-gray-700">
                <button className={`px-3 py-1.5 text-sm ${imgTab==='info'?'border-b-2 border-gray-900 dark:border-gray-100 font-medium':''}`} onClick={()=>setImgTab('info')}>Image Info</button>
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

      {/* Insert Image Modal */}
      {isImageInsertOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setIsImageInsertOpen(false)} />
          <div className="relative w-full max-w-md rounded-md bg-white dark:bg-gray-900 shadow-xl border border-gray-300 dark:border-gray-700">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Insert Image</h3>
              <button aria-label="Close image" className="p-1.5 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setIsImageInsertOpen(false)}>
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">URL</label>
                <input value={insImgUrl} onChange={(e)=>setInsImgUrl(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Alternative Text</label>
                <input value={insImgAlt} onChange={(e)=>setInsImgAlt(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Width</label>
                  <input value={insImgWidth} onChange={(e)=>setInsImgWidth(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Height</label>
                  <input value={insImgHeight} onChange={(e)=>setInsImgHeight(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                </div>
              </div>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-2">
              <button className="px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200" onClick={() => setIsImageInsertOpen(false)}>Cancel</button>
              <button className="px-3 py-2 text-sm rounded bg-blue-600 text-white" onClick={submitImageInsert}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Flash Modal */}
      {isFlashOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setIsFlashOpen(false)} />
          <div className="relative w-full max-w-md rounded-md bg-white dark:bg-gray-900 shadow-xl border border-gray-300 dark:border-gray-700">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Insert Flash</h3>
              <button aria-label="Close flash" className="p-1.5 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setIsFlashOpen(false)}>
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">URL</label>
                <input value={flashUrl} onChange={(e)=>setFlashUrl(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Width</label>
                  <input value={flashWidth} onChange={(e)=>setFlashWidth(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Height</label>
                  <input value={flashHeight} onChange={(e)=>setFlashHeight(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                </div>
              </div>
              <p className="text-xs text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 p-2 rounded">Note: Flash is deprecated in modern browsers. This inserts legacy &lt;object&gt; markup.</p>
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
          <div className="relative w-full max-w-xl rounded-md bg-white dark:bg-gray-900 shadow-xl border border-gray-300 dark:border-gray-700">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Insert Special Character</h3>
              <button aria-label="Close special" className="p-1.5 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setSpecialOpen(false)}>
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-10 gap-2">
                {['©','®','™','§','±','÷','×','µ','£','€','¥','¢','–','—','•','…','←','→','↑','↓','∞','≈','≠','≤','≥','Ω','π','η','θ','δ','α','β','γ','Δ','∑','∫','√','∂','°','‰','℉','℃'].map((ch)=> (
                  <button key={ch} className="px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={()=>{ insertChar(ch); setSpecialOpen(false); }}>{ch}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Smiley Modal */}
      {smileyOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSmileyOpen(false)} />
          <div className="relative w-full max-w-xl rounded-md bg-white dark:bg-gray-900 shadow-xl border border-gray-300 dark:border-gray-700">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Insert Smiley</h3>
              <button aria-label="Close smiley" className="p-1.5 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setSmileyOpen(false)}>
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-10 gap-2">
                {['😀','😁','😂','🤣','😊','😇','😉','😍','😘','😎','🤔','😢','😭','😡','👍','👎','👏','🙏','🎉','💡','✅','❌','⭐','❤️','🔥','⚠️','😴','🤒','🤩','🤯','🥳','😐','😕','😮','🙃','😇','🤗','😏','🤤','😴','🤕','🤧','🤮','🤠','🤡','👀','👋','👌','✌️','🤞','👊','🙏','💪','💯','✨','🎁','🍰','☕','🍕','🏆','🚀','📌','📎','🔒','🔑'].map((e)=> (
                  <button key={e} className="px-2 py-1 text-lg rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={()=>{ insertChar(e); setSmileyOpen(false); }}>{e}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* iFrame Modal */}
      {isIframeOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setIsIframeOpen(false)} />
          <div className="relative w-full max-w-md rounded-md bg-white dark:bg-gray-900 shadow-xl border border-gray-300 dark:border-gray-700">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Insert iFrame</h3>
              <button aria-label="Close iframe" className="p-1.5 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setIsIframeOpen(false)}>
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">URL</label>
                <input value={iframeUrl} onChange={(e)=>setIframeUrl(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Width</label>
                  <input value={iframeWidth} onChange={(e)=>setIframeWidth(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Height</label>
                  <input value={iframeHeight} onChange={(e)=>setIframeHeight(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                </div>
              </div>
              <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input type="checkbox" checked={iframeAllow} onChange={(e)=>setIframeAllow(e.target.checked)} /> Allow Fullscreen
              </label>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-2">
              <button className="px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200" onClick={() => setIsIframeOpen(false)}>Cancel</button>
              <button className="px-3 py-2 text-sm rounded bg-blue-600 text-white" onClick={submitIframeModal}>OK</button>
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
              {linkTab === 'info' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 items-end">
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Link Type</label>
                      <select value={linkType} onChange={(e)=>setLinkType(e.target.value as 'url'|'anchor'|'email')} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm">
                        <option value="url">URL</option>
                        <option value="anchor">Link to anchor in the text</option>
                        <option value="email">E-mail</option>
                      </select>
                    </div>
                    {/* Text field removed per requirements */}
                  </div>

                  {linkType === 'url' && (
                    <div className="grid grid-cols-12 gap-4 items-end">
                      <div className="col-span-3">
                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Protocol</label>
                        <select value={protocol} onChange={(e)=>setProtocol(e.target.value as 'http'|'https'|'ftp'|'news'|'other')} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm">
                          <option value="http">http://</option>
                          <option value="https">https://</option>
                          <option value="ftp">ftp://</option>
                          <option value="news">news://</option>
                          <option value="other">&lt;other&gt;</option>
                        </select>
                      </div>
                      <div className="col-span-9">
                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">URL</label>
                        <input value={linkUrl} onChange={(e)=>setLinkUrl(e.target.value)} placeholder="example.com/path" className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                      </div>
                    </div>
                  )}

                  {linkType === 'anchor' && (
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Select Anchor</label>
                      <select value={anchorTarget} onChange={(e)=>setAnchorTarget(e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm">
                        <option value=""></option>
                        {anchorList.map((id)=> (
                          <option key={id} value={id}>#{id}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {linkType === 'email' && (
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">E-mail</label>
                      <input value={emailAddr} onChange={(e)=>setEmailAddr(e.target.value)} placeholder="user@example.com" className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
                    </div>
                  )}

                  {/* Title field removed per requirements */}
                </div>
              )}

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
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Anchor Name</label>
                <input value={anchorId} onChange={(e)=>setAnchorId(e.target.value)} placeholder="section-1" className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm" />
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

