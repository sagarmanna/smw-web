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
  MousePointerClick, Image as ImageIcon, EyeOff
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
          <div className="relative w-full max-w-2xl rounded-md bg-white dark:bg-gray-900 shadow-xl border border-gray-300 dark:border-gray-700">
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
            <div className="px-4 pt-3">
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
    </div>
  );
}

