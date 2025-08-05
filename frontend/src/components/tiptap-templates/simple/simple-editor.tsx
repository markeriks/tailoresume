'use client'

import * as React from 'react'
import { getAuth } from "firebase/auth";
import { getFirestore, doc, updateDoc, increment } from "firebase/firestore";
import { EditorContent, EditorContext, useEditor } from '@tiptap/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X } from 'lucide-react'
import html2pdf from 'html2pdf.js';

// --- Extensions ---
import { StarterKit } from '@tiptap/starter-kit'
import { TaskItem, TaskList } from '@tiptap/extension-list'
import { TextAlign } from '@tiptap/extension-text-align'
import { Typography } from '@tiptap/extension-typography'
import { Highlight } from '@tiptap/extension-highlight'
import { Subscript } from '@tiptap/extension-subscript'
import { Superscript } from '@tiptap/extension-superscript'
import { Selection } from '@tiptap/extensions'
import { Paragraph } from '@tiptap/extension-paragraph';

// --- UI Primitives ---
import { Button } from '@/components/tiptap-ui-primitive/button'
import { Spacer } from '@/components/tiptap-ui-primitive/spacer'
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from '@/components/tiptap-ui-primitive/toolbar'

// --- Nodes ---
import { HorizontalRule } from '@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension'

// --- Styling ---
import '@/components/tiptap-node/blockquote-node/blockquote-node.scss'
import '@/components/tiptap-node/code-block-node/code-block-node.scss'
import '@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss'
import '@/components/tiptap-node/list-node/list-node.scss'
import '@/components/tiptap-node/heading-node/heading-node.scss'
import '@/components/tiptap-node/paragraph-node/paragraph-node.scss'

// --- UI ---
import { HeadingDropdownMenu } from '@/components/tiptap-ui/heading-dropdown-menu'
import { ListDropdownMenu } from '@/components/tiptap-ui/list-dropdown-menu'
import { BlockquoteButton } from '@/components/tiptap-ui/blockquote-button'
import { CodeBlockButton } from '@/components/tiptap-ui/code-block-button'
import {
  ColorHighlightPopover,
  ColorHighlightPopoverContent,
  ColorHighlightPopoverButton,
} from '@/components/tiptap-ui/color-highlight-popover'
import { MarkButton } from '@/components/tiptap-ui/mark-button'
import { TextAlignButton } from '@/components/tiptap-ui/text-align-button'
import { UndoRedoButton } from '@/components/tiptap-ui/undo-redo-button'

// --- Icons ---
import { ArrowLeftIcon } from '@/components/tiptap-icons/arrow-left-icon'
import { HighlighterIcon } from '@/components/tiptap-icons/highlighter-icon'
import { LinkIcon } from '@/components/tiptap-icons/link-icon'

// --- Hooks ---
import { useIsMobile } from '@/hooks/use-mobile'

// --- Styles ---
import '@/components/tiptap-templates/simple/simple-editor.scss'

// --- SelectionToolbar ---
import { SelectionToolbar } from '@/app/components/SelectionToolbar'

interface SimpleEditorProps {
  originalResume: string;
  modifiedResume: string | null;
  jobTitle?: string | null;
}

function highlightTextDiff(original: string, modified: string): string {
  // 1. Create DOM parsers for both
  console.log("started Highlight function");
  const parser = new DOMParser();
  const origDoc = parser.parseFromString(`<div>${original}</div>`, 'text/html');
  const modDoc = parser.parseFromString(`<div>${modified}</div>`, 'text/html');
  const origRoot = origDoc.body.firstElementChild;
  const modRoot = modDoc.body.firstElementChild;
  if (!origRoot || !modRoot) {
    console.warn("Empty parsed DOM. Skipping diff.");
    return modified;
  }

  // 2. Recursive function to diff text nodes
  function diffNodes(origNode: ChildNode, modNode: ChildNode) {
    if (origNode.nodeType === Node.TEXT_NODE && modNode.nodeType === Node.TEXT_NODE) {
      const origText = origNode.textContent || '';
      const modText = modNode.textContent || '';

      // Simple diff — highlight all text differences by wrapping changed parts
      if (origText !== modText) {
        const parent = modNode.parentElement;
        if (parent) {
          parent.classList.add('highlight');
          parent.setAttribute('data-original', origText);
        }
      }
    } else if (origNode.childNodes.length === modNode.childNodes.length) {
      // If both have same number of children, recurse
      console.log("Starting recursion");
      for (let i = 0; i < origNode.childNodes.length; i++) {
        diffNodes(origNode.childNodes[i], modNode.childNodes[i]);
      }
    } else {
      console.warn("Different number of child nodes, skipping recursion");
    }
  }

  diffNodes(origRoot!, modRoot!);

  // 3. Return modified innerHTML without the wrapper <div>
  return (modDoc.body.firstChild as Element)?.innerHTML || '';
}


const ParagraphWithClass = Paragraph.extend({
  addAttributes() {
    return {
      class: {
        default: null,
        parseHTML: element => element.getAttribute('class'),
        renderHTML: attributes => {
          return {
            class: attributes.class || null,
          };
        },
      },
    };
  },
});

// Changes Popup Component
const ChangesPopup = ({ 
  onApplyChanges, 
  onRollback, 
  show 
}: { 
  onApplyChanges: () => void;
  onRollback: () => void;
  show: boolean;
}) => {
  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 flex items-center gap-3"
      style={{ top: '7rem' }}
    >
      <span className="text-sm font-medium text-gray-700">
        Resume has been modified
      </span>
      <div className="flex gap-2">
        <Button
          onClick={onApplyChanges}
          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 text-sm rounded-md flex items-center gap-1"
        >
          <Check size={14} />
          Apply Changes
        </Button>
        <Button
          onClick={onRollback}
          className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 text-sm rounded-md flex items-center gap-1"
        >
          <X size={14} />
          Rollback
        </Button>
      </div>
    </motion.div>
  );
};

export function SimpleEditor({ originalResume, modifiedResume, jobTitle }: SimpleEditorProps) {
  const isMobile = useIsMobile()
  const [mobileView, setMobileView] = React.useState<'main' | 'highlighter' | 'link'>('main')
  const toolbarRef = React.useRef<HTMLDivElement>(null)
  const [copied, setCopied] = React.useState(false);

  const [selectionRect, setSelectionRect] = React.useState<DOMRect | null>(null)
  const [selectedText, setSelectedText] = React.useState('')
  const [contentLoaded, setContentLoaded] = React.useState(false);
  const [showChangesPopup, setShowChangesPopup] = React.useState(false);
  const [editorDisabled, setEditorDisabled] = React.useState(false);

  const editor = useEditor({
    editorProps: {
      attributes: {
        autocomplete: 'off',
        autocorrect: 'off',
        autocapitalize: 'off',
        'aria-label': 'Main content area, start typing to enter text.',
        class: 'simple-editor',
      },
    },
    extensions: [
      StarterKit.configure({
        paragraph: false,
        horizontalRule: false,
      }),
      ParagraphWithClass,
      HorizontalRule,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Typography,
      Superscript,
      Subscript,
      Selection,
    ],
    content: '',
    editable: !editorDisabled,
    injectCSS: true,
    autofocus: false,
    parseOptions: { preserveWhitespace: false },

    onCreate({ editor }) {
      if (originalResume && modifiedResume) {
        const highlightedContent = highlightTextDiff(originalResume, modifiedResume);
        editor.commands.setContent(highlightedContent, {
          parseOptions: { preserveWhitespace: false },
        });
        setContentLoaded(true);
        setShowChangesPopup(true);
        setEditorDisabled(true);
      } else {
        // Fallback: just load original while waiting
        editor.commands.setContent(originalResume, {
          parseOptions: { preserveWhitespace: false },
        });
      }
    },

    immediatelyRender: false,
  })

  React.useEffect(() => {
    if (!editor || !modifiedResume || contentLoaded) return;

    setTimeout(() => {
      const highlighted = highlightTextDiff(originalResume, modifiedResume);
      editor.commands.setContent(highlighted, { parseOptions: { preserveWhitespace: false } });
      setContentLoaded(true);
      setShowChangesPopup(true);
      setEditorDisabled(true);
    }, 400);
  }, [editor, modifiedResume, originalResume, contentLoaded]);

  // Function to apply changes by removing 'highlight' class from all nodes
  const applyChanges = React.useCallback(() => {
    if (!editor) return;

    const { tr } = editor.state;
    let modified = false;

    editor.state.doc.descendants((node, pos) => {
      if (node.attrs && node.attrs.class && node.attrs.class.includes('highlight')) {
        const newClass = node.attrs.class.replace(/\bhighlight\b/g, '').trim() || null;
        tr.setNodeMarkup(pos, null, { ...node.attrs, class: newClass });
        modified = true;
      }
    });

    if (modified) {
      editor.view.dispatch(tr);
    }

    setShowChangesPopup(false);
    setEditorDisabled(false);
    editor.setEditable(true);
  }, [editor]);

  // Function to rollback to original resume
  const rollbackChanges = React.useCallback(() => {
    if (!editor) return;

    editor.commands.setContent(originalResume, {
      parseOptions: { preserveWhitespace: false },
    });

    setShowChangesPopup(false);
    setEditorDisabled(false);
    editor.setEditable(true);
  }, [editor, originalResume]);

  React.useEffect(() => {
    if (!isMobile && mobileView !== 'main') {
      setMobileView('main')
    }
  }, [isMobile, mobileView])

  React.useEffect(() => {
    if (!editor) return

    const handleSelectionChange = () => {
      const selection = window.getSelection()

      if (!selection || selection.isCollapsed) {
        setSelectionRect(null)
        setSelectedText('')
        return
      }

      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      setSelectionRect(rect)
      setSelectedText(selection.toString())
    }

    document.addEventListener('selectionchange', handleSelectionChange)

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange)
    }
  }, [editor])

  const onSelectionAction = async (action: string) => {
    if (!editor) return;

    const trimmedText = selectedText.trim();
    if (!trimmedText) {
      console.warn("No text selected");
      return;
    }

    console.log("Sending to API:", { action, text: trimmedText });

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.error("User not authenticated");
        return;
      }

      const db = getFirestore();
      const userRef = doc(db, "users", user.uid);

      await updateDoc(userRef, {
        selectCalls: increment(1),
      });

      const idToken = await user.getIdToken();

      const response = await fetch(
        "https://backend-late-snow-4268.fly.dev/transform",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ action, text: trimmedText }),
        }
      );

      if (!response.ok) {
        console.error("API request failed:", response.statusText);
        return;
      }

      const data = await response.json();
      const newText = data.result.replace(/^"+|"+$/g, "");
      console.log("Received from API:", newText);

      editor.chain().focus().deleteSelection().run();

      let currentIndex = 0;

      function typeNextChar() {
        if (!editor) return;
        if (currentIndex < newText.length) {
          editor.chain().focus().insertContent(newText[currentIndex]).run();
          currentIndex++;
          setTimeout(typeNextChar, 30);
        }
      }

      typeNextChar();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error calling transform API:", error.message);
      } else {
        console.error("Unknown error calling transform API:", error);
      }
    }
  };

  const MobileToolbarContent = ({
    type,
    onBack,
  }: {
    type: 'highlighter' | 'link'
    onBack: () => void
  }) => (
    <>
      <ToolbarGroup>
        <Button data-style="ghost" onClick={onBack}>
          <ArrowLeftIcon className="tiptap-button-icon" />
          {type === 'highlighter' ? (
            <HighlighterIcon className="tiptap-button-icon" />
          ) : (
            <LinkIcon className="tiptap-button-icon" />
          )}
        </Button>
      </ToolbarGroup>
      <ToolbarSeparator />
      <ColorHighlightPopoverContent />
    </>
  )

  const MainToolbarContent = ({
    onHighlighterClick,
    isMobile,
  }: {
    onHighlighterClick: () => void
    onLinkClick: () => void
    isMobile: boolean
  }) => (
    <>
      <Spacer />
      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <HeadingDropdownMenu levels={[1, 2, 3, 4]} portal={isMobile} />
        <ListDropdownMenu types={['bulletList', 'orderedList', 'taskList']} portal={isMobile} />
        <BlockquoteButton />
        <CodeBlockButton />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <MarkButton type="underline" />
        {!isMobile ? (
          <ColorHighlightPopover />
        ) : (
          <ColorHighlightPopoverButton onClick={onHighlighterClick} />
        )}
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <Button
          onClick={async () => {
            if (!editor) return;
            const html = editor.getHTML();
            try {
              if (navigator.clipboard && window.ClipboardItem) {
                await navigator.clipboard.write([
                  new ClipboardItem({
                    'text/html': new Blob([html], { type: 'text/html' }),
                  }),
                ]);
              } else {
                await navigator.clipboard.writeText(editor.getText());
              }
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            } catch (err) {
              console.error('Failed to copy: ', err);
            }
          }}
        >
          {copied ? (
            <>
              <Check size={16} />
              Copied
            </>
          ) : (
            'Copy Resume'
          )}
        </Button>

        <Button onClick={() => {
          const element = document.querySelector('.simple-editor-content');
          if (!element) return;

          const opt = {
            margin: [15, 0, 15, 0],
            filename: 'resume.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['css', 'legacy'] }
          };

          html2pdf().set(opt).from(element).save().catch((err: unknown) => {
            console.error('PDF generation error:', err);
          });
        }}>
          Download Resume
        </Button>
      </ToolbarGroup>
      <Spacer />
      {isMobile && <ToolbarSeparator />}
    </>
  )

  return (
    <div className="simple-editor-wrapper mt-10 md:mt-25">
      {/* Changes Popup */}
      <AnimatePresence>
        <ChangesPopup
          show={showChangesPopup}
          onApplyChanges={applyChanges}
          onRollback={rollbackChanges}
        />
      </AnimatePresence>

      {jobTitle && !contentLoaded && (
        <div className="relative md:fixed md:top-30 md:right-4 mt-15 md:mt-0 mb-4 p-4 rounded-xl bg-green-50 border border-green-300 text-green-800 text-base font-medium overflow-hidden transition-all duration-500 max-w-md mx-auto md:mx-0">
          <div className="flex items-center justify-between">
            <span>
              Tailoring resume to: <span className="font-semibold">{jobTitle}</span>
            </span>
          </div>

          {/* Animated progress bar */}
          <div className="mt-2 w-full h-2 bg-green-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full progress-bar"
            />
          </div>
        </div>
      )}

      {editor && (
        <EditorContext.Provider value={{ editor }}>
          <Toolbar
            ref={toolbarRef}
            style={{
              position: 'fixed',
              left: 0,
              right: 0,
              zIndex: 5,
              top: 64,
              opacity: 1,
              pointerEvents: editorDisabled ? 'none' : 'auto',
            }}
          >
            {mobileView === 'main' ? (
              <MainToolbarContent
                onHighlighterClick={() => setMobileView('highlighter')}
                onLinkClick={() => setMobileView('link')}
                isMobile={isMobile}
              />
            ) : (
              <MobileToolbarContent type={mobileView} onBack={() => setMobileView('main')} />
            )}
          </Toolbar>

          {/* Selection Toolbar */}
          {selectionRect && selectedText && !editorDisabled && (
            <SelectionToolbar rect={selectionRect} selectedText={selectedText} onAction={onSelectionAction} />
          )}

          <AnimatePresence mode="wait">
            {!contentLoaded && (
              <motion.div
                key="original"
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="editor-wrapper"
              >
                <EditorContent
                  editor={editor}
                  role="presentation"
                  className={`simple-editor-content ${editorDisabled ? 'pointer-events-none opacity-75' : ''}`}
                />
              </motion.div>
            )}

            {contentLoaded && (
              <motion.div
                key="modified"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="editor-wrapper"
              >
                <EditorContent
                  editor={editor}
                  role="presentation"
                  className={`simple-editor-content ${editorDisabled ? 'pointer-events-none' : ''}`}
                />
              </motion.div>
            )}
          </AnimatePresence>

        </EditorContext.Provider>
      )}
    </div>
  )
}