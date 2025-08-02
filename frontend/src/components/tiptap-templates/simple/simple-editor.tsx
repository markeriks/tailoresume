'use client'

import * as React from 'react'
import { getAuth } from "firebase/auth";
import { EditorContent, EditorContext, useEditor } from '@tiptap/react'


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
import {
  LinkPopover,
  LinkContent,
  LinkButton,
} from '@/components/tiptap-ui/link-popover'
import { MarkButton } from '@/components/tiptap-ui/mark-button'
import { TextAlignButton } from '@/components/tiptap-ui/text-align-button'
import { UndoRedoButton } from '@/components/tiptap-ui/undo-redo-button'

// --- Icons ---
import { ArrowLeftIcon } from '@/components/tiptap-icons/arrow-left-icon'
import { HighlighterIcon } from '@/components/tiptap-icons/highlighter-icon'
import { LinkIcon } from '@/components/tiptap-icons/link-icon'

// --- Hooks ---
import { useIsMobile } from '@/hooks/use-mobile'
import { useWindowSize } from '@/hooks/use-window-size'
import { useCursorVisibility } from '@/hooks/use-cursor-visibility'
import { useScrolling } from '@/hooks/use-scrolling'

// --- Styles ---
import '@/components/tiptap-templates/simple/simple-editor.scss'

// --- SelectionToolbar ---
import { SelectionToolbar } from '@/app/components/SelectionToolbar'

interface SimpleEditorProps {
  originalResume: string;
  modifiedResume: string;
  jobTitle?: string | null;
}

function highlightTextDiff(original: string, modified: string): string {
  // 1. Create DOM parsers for both
  console.log("started Highlight function");
  const parser = new DOMParser();
  const origDoc = parser.parseFromString(`<div>${original}</div>`, 'text/html');
  const modDoc = parser.parseFromString(`<div>${modified}</div>`, 'text/html');

  // 2. Recursive function to diff text nodes
  function diffNodes(origNode: ChildNode, modNode: ChildNode) {
    if (origNode.nodeType === Node.TEXT_NODE && modNode.nodeType === Node.TEXT_NODE) {
      const origText = origNode.textContent || '';
      const modText = modNode.textContent || '';

      // Simple diff — highlight all text differences by wrapping changed parts
      if (origText !== modText) {
        console.log("Text nodes differ:", origText, modText);
        const parent = modNode.parentElement;
        if (parent) {
          parent.classList.add('highlight');
        }
      }
    } else if (origNode.childNodes.length === modNode.childNodes.length) {
      // If both have same number of children, recurse
      console.log("Starting recursion");
      for (let i = 0; i < origNode.childNodes.length; i++) {
        diffNodes(origNode.childNodes[i], modNode.childNodes[i]);
      }
    }
  }

  diffNodes(origDoc.body.firstChild!, modDoc.body.firstChild!);

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



export function SimpleEditor({ originalResume, modifiedResume, jobTitle }: SimpleEditorProps) {
  const isMobile = useIsMobile()
  const windowSize = useWindowSize()
  const [mobileView, setMobileView] = React.useState<'main' | 'highlighter' | 'link'>('main')
  const toolbarRef = React.useRef<HTMLDivElement>(null)

  const [selectionRect, setSelectionRect] = React.useState<DOMRect | null>(null)
  const [selectedText, setSelectedText] = React.useState('')

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
        link: { openOnClick: false, enableClickSelection: true },
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
    editable: true,
    injectCSS: true,
    autofocus: false,
    parseOptions: { preserveWhitespace: false },

    onCreate({ editor }) {
      if (originalResume && modifiedResume) {
        console.log("Original Resume:", originalResume);
        console.log("Modified Resume:", modifiedResume);
        const highlightedContent = highlightTextDiff(originalResume, modifiedResume);
        editor.commands.setContent(highlightedContent, { parseOptions: { preserveWhitespace: false } });
      }
    },

    immediatelyRender: false,
  })

  const isScrolling = useScrolling()
  const rect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  })

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
    } catch (error) {
      console.error("Error calling transform API:", error);
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
      {type === 'highlighter' ? <ColorHighlightPopoverContent /> : <LinkContent />}
    </>
  )

  const MainToolbarContent = ({
    onHighlighterClick,
    onLinkClick,
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
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
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
      <Spacer />
      {isMobile && <ToolbarSeparator />}
    </>
  )

  return (
    <div className="simple-editor-wrapper mt-10 md:mt-25">
      {jobTitle && (
        <div className="mb-4 p-4 rounded-xl bg-gray-100 text-gray-800 text-lg font-medium">
          Tailoring resume to: <span className="font-semibold">{jobTitle}</span>
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
              zIndex: 2,
              ...(isMobile
                ? {
                  bottom: `calc(100% - ${windowSize.height - rect.y}px)`,
                }
                : {
                  top: 64,
                }),
              ...(isScrolling && isMobile
                ? { opacity: 0, transition: 'opacity 0.1s ease-in-out' }
                : {}),
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
          {selectionRect && selectedText && (
            <SelectionToolbar rect={selectionRect} selectedText={selectedText} onAction={onSelectionAction} />
          )}

          <EditorContent editor={editor} role="presentation" className="simple-editor-content" />
        </EditorContext.Provider>
      )}
    </div>
  )
}
