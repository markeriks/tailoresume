'use client'

import * as React from 'react'
import { getAuth } from "firebase/auth";
import { getFirestore, doc, updateDoc, increment, getDoc } from "firebase/firestore";
import { EditorContent, EditorContext, useEditor } from '@tiptap/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Upload, Link, FileText, Sparkles, ArrowRight } from 'lucide-react'
import html2pdf from 'html2pdf.js';
import * as mammoth from 'mammoth';

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
  setCredits: React.Dispatch<React.SetStateAction<number>>;
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

// Setup Container Component
const SetupContainer = ({
  currentStep,
  jobUrl,
  setJobUrl,
  uploadedFile,
  handleFileUpload,
  handleContinueToEditor,
  onStepNext,
}: {
  currentStep: 1 | 2;
  jobUrl: string;
  setJobUrl: (url: string) => void;
  uploadedFile: File | null;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleContinueToEditor: () => void;
  onStepNext: () => void;
}) => {
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-40">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 max-w-2xl w-full mx-4"
      >
        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'} text-sm font-semibold`}>
              1
            </div>
            <div className={`w-12 h-1 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'} rounded`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'} text-sm font-semibold`}>
              2
            </div>
          </div>
        </div>

        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-center"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Enter Job Posting URL
            </h2>
            <p className="text-gray-600 mb-8">
              Paste the URL of the job you're applying for to get started
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-2 mb-3 justify-center">
                <Link className="w-5 h-5 text-blue-600" />
                <span className="text-lg font-medium text-gray-900">Job URL</span>
              </div>
              <input
                type="url"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                placeholder="https://example.com/job-posting"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && jobUrl.trim()) {
                    e.preventDefault();
                    onStepNext();
                  }
                }}
              />
            </div>

            <Button
              onClick={onStepNext}
              disabled={!jobUrl.trim()}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 mx-auto"
            >
              Next Step
              <ArrowRight size={16} />
            </Button>
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-center"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Upload Your Resume (Optional)
            </h2>
            <p className="text-gray-600 mb-8">
              You can upload a .docx file or start with a blank editor
            </p>

            <div className="flex flex-col items-center space-y-6 mb-8">
              {/* Upload Option */}
              <div className="w-full max-w-md">
                <div className="flex items-center space-x-2 mb-3 justify-center">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <span className="text-lg font-medium text-gray-900">Upload File (Optional)</span>
                </div>
                <input
                  type="file"
                  accept=".docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="resume-upload"
                />
                <label
                  htmlFor="resume-upload"
                  className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600 text-center">
                    {uploadedFile ? uploadedFile.name : 'Click to upload .docx file (optional)'}
                  </span>
                </label>
              </div>
            </div>

            <Button
              onClick={handleContinueToEditor}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all flex items-center gap-2 mx-auto"
            >
              Continue to Editor
              <ArrowRight size={16} />
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export function SimpleEditor({ setCredits }: SimpleEditorProps) {
  const isMobile = useIsMobile()
  const [mobileView, setMobileView] = React.useState<'main' | 'highlighter' | 'link'>('main')
  const toolbarRef = React.useRef<HTMLDivElement>(null)
  const [copied, setCopied] = React.useState(false);

  const [selectionRect, setSelectionRect] = React.useState<DOMRect | null>(null)
  const [selectedText, setSelectedText] = React.useState('')
  const [contentLoaded, setContentLoaded] = React.useState(false);
  const [showChangesPopup, setShowChangesPopup] = React.useState(false);
  const [editorDisabled, setEditorDisabled] = React.useState(true);

  // Setup flow state
  const [setupMode, setSetupMode] = React.useState(true);
  const [currentStep, setCurrentStep] = React.useState<1 | 2>(1);
  const [jobUrl, setJobUrl] = React.useState<string>("");
  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);
  const [isProcessing, setIsProcessing] = React.useState<boolean>(false);
  const [jobTitle, setJobTitle] = React.useState<string>("");
  const [originalResume, setOriginalResume] = React.useState<string>("");
  const [modifiedResume, setModifiedResume] = React.useState<string | null>(null);
  const [showNoCreditsModal, setShowNoCreditsModal] = React.useState(false);

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
    content: '<p>Start typing your resume content here...</p>',
    editable: !editorDisabled,
    injectCSS: true,
    autofocus: false,
    parseOptions: { preserveWhitespace: false },

    onCreate({ editor }) {
      // Editor starts empty in setup mode
      if (!setupMode && originalResume && modifiedResume) {
        const highlightedContent = highlightTextDiff(originalResume, modifiedResume);
        editor.commands.setContent(highlightedContent, {
          parseOptions: { preserveWhitespace: false },
        });
        setContentLoaded(true);
        setShowChangesPopup(true);
        setEditorDisabled(true);
      }
    },

    immediatelyRender: false,
  })

  React.useEffect(() => {
    if (!editor || !modifiedResume || contentLoaded || setupMode) return;

    setTimeout(() => {
      const highlighted = highlightTextDiff(originalResume, modifiedResume);
      editor.commands.setContent(highlighted, { parseOptions: { preserveWhitespace: false } });
      setContentLoaded(true);
      setShowChangesPopup(true);
      setEditorDisabled(true);
    }, 400);
  }, [editor, modifiedResume, originalResume, contentLoaded, setupMode]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      setUploadedFile(file);
    } else {
      alert('Please upload a .docx file');
    }
  };

  const handleContinueToEditor = async () => {
    setSetupMode(false);
    setEditorDisabled(false);

    if (uploadedFile) {
      // If file is uploaded, convert it to HTML and load in editor
      try {
        const arrayBuffer = await uploadedFile.arrayBuffer();
        const { value: originalHtml } = await mammoth.convertToHtml({ arrayBuffer });
        setOriginalResume(originalHtml);

        if (editor) {
          editor.commands.setContent(originalHtml, {
            parseOptions: { preserveWhitespace: false },
          });
          editor.setEditable(true);
        }
      } catch (error) {
        console.error('Error converting file:', error);
        if (editor) {
          editor.setEditable(true);
          editor.commands.focus();
        }
      }
    } else {
      // No file uploaded, start with empty editor
      if (editor) {
        editor.setEditable(true);
        editor.commands.focus();
      }
    }
  };

  const handleTailorResume = async () => {
    if (!jobUrl || !editor) {
      alert('Please provide job URL');
      return;
    }

    // Get current HTML content from editor
    const currentHTML = editor.getHTML();
    console.log(currentHTML)

    if (!currentHTML || currentHTML === '<p></p>' || currentHTML.trim() === '<p>Start typing your resume content here...</p>') {
      alert('Please add some content to your resume first');
      return;
    }

    setIsProcessing(true);

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.error("User not authenticated");
        setIsProcessing(false);
        return;
      }

      const db = getFirestore();
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        console.error("User document does not exist");
        setIsProcessing(false);
        return;
      }

      const userData = userSnap.data();
      const userCredits = userData?.credits ?? 0;

      if (userCredits < 5) {
        setShowNoCreditsModal(true);
        setIsProcessing(false);
        return;
      }

      // 1. Extract job title & text using Diffbot
      const token = process.env.NEXT_PUBLIC_DIFFBOT_TOKEN!;
      const diffbotUrl = `https://api.diffbot.com/v3/job?token=${token}&url=${encodeURIComponent(jobUrl)}`;

      const diffbotResponse = await fetch(diffbotUrl);
      if (!diffbotResponse.ok) {
        throw new Error(`Diffbot API error: ${diffbotResponse.statusText}`);
      }
      const jobData = await diffbotResponse.json();
      console.log('Extracted job data:', JSON.stringify(jobData, null, 2));

      const jobObj = jobData.objects?.[0];
      const title = jobObj?.title || 'Untitled Job';
      const text = jobObj?.text || '';
      const combinedJobContent = `${title}\n\n${text}`;

      // Set job title and original resume from current editor content
      setJobTitle(title);
      setOriginalResume(currentHTML);

      // Disable editor during processing
      editor.setEditable(false);
      setEditorDisabled(true);

      // 3. Send current resume content + job data to backend for tailoring
      const idToken = await user.getIdToken();

      await updateDoc(userRef, {
        credits: increment(-5),
        tailorCalls: increment(1)
      });
      setCredits((prevCredits: number) => prevCredits - 1);

      const tailoredResumePromise = fetch('https://backend-late-snow-4268.fly.dev/tailor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          jobContent: combinedJobContent,
          resumeContent: currentHTML,
        }),
      })
        .then(res => {
          if (!res.ok) throw new Error(`Backend error: ${res.statusText}`);
          return res.json();
        })
        .then(data => {
          const tailored = data.tailoredResume || currentHTML;
          setModifiedResume(tailored);
          return tailored;
        })
        .catch(error => {
          console.error("Failed to get tailored resume:", error);
          setModifiedResume(currentHTML);
          return currentHTML;
        });

      await tailoredResumePromise;

    } catch (error) {
      console.error('Error during tailoring resume:', error);
      alert('An error occurred while tailoring your resume.');
    } finally {
      setIsProcessing(false);
    }
  };

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
    if (!editor) return;

    const handleSelectionChange = () => {
      // Prevent clearing the toolbar if we're clicking/typing inside it
      const activeEl = document.activeElement;
      if (activeEl && activeEl.closest(".selection-toolbar")) {
        return;
      }

      const selection = window.getSelection();

      if (!selection || selection.isCollapsed) {
        setSelectionRect(null);
        setSelectedText("");
        return;
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectionRect(rect);
      setSelectedText(selection.toString());
    };

    document.addEventListener("selectionchange", handleSelectionChange);

    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [editor]);


  const onSelectionAction = async (action: string) => {
    if (!editor) return;

    const trimmedText = selectedText.trim();
    if (!trimmedText) {
      console.warn("No text selected");
      return;
    }

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.error("User not authenticated");
        return;
      }

      const db = getFirestore();
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        console.error("User document does not exist");
        return;
      }

      const userData = userSnap.data();
      const userCredits = userData?.credits ?? 0;

      if (userCredits < 1) {
        setShowNoCreditsModal(true);
        return;
      }

      // Deduct 1 credit before making the API call
      await updateDoc(userRef, {
        credits: increment(-1),
        selectCalls: increment(1),
      });
      setCredits((prevCredits: number) => prevCredits - 1);

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
    <div className="simple-editor-wrapper mt-25 md:mt-25">
      {/* Setup Container Overlay */}
      {setupMode && (
        <SetupContainer
          currentStep={currentStep}
          jobUrl={jobUrl}
          setJobUrl={setJobUrl}
          uploadedFile={uploadedFile}
          handleFileUpload={handleFileUpload}
          handleContinueToEditor={handleContinueToEditor}
          onStepNext={() => setCurrentStep(2)}
        />
      )}

      {/* No Credits Modal */}
      {showNoCreditsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm text-center">
            <h2 className="text-xl font-semibold mb-2">Not Enough Credits</h2>
            <p className="mb-4">You don't have enough credits.</p>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={() => setShowNoCreditsModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Changes Popup */}
      <AnimatePresence>
        <ChangesPopup
          show={showChangesPopup}
          onApplyChanges={applyChanges}
          onRollback={rollbackChanges}
        />
      </AnimatePresence>

      {/* Job Title Loading Indicator */}
      {jobTitle && !contentLoaded && !setupMode && (
        <div className="relative md:fixed md:top-30 md:right-4 mt-0 md:mt-0 mb-4 p-4 rounded-xl bg-green-50 border border-green-300 text-green-800 text-base font-medium overflow-hidden transition-all duration-500 max-w-md mx-auto md:mx-0">
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

      {/* "Tailor My Resume" Button for editor mode */}
      {!setupMode && !showChangesPopup && jobUrl && !jobTitle && !contentLoaded && (
        <div className="relative sm:fixed sm:top-30 sm:right-10 mb-4 sm:mb-0 mx-auto sm:mx-0 z-2">
          <button
            onClick={handleTailorResume}
            disabled={editorDisabled || isProcessing}
            className="whitespace-nowrap px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-lg"
          >
            {isProcessing ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5" />
                <span>Tailor My Resume</span>
              </div>
            )}
          </button>
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
              opacity: setupMode ? 0.3 : 1,
              pointerEvents: (editorDisabled || setupMode) ? 'none' : 'auto',
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
          {selectionRect && selectedText && !editorDisabled && !setupMode && (
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
                  className={`simple-editor-content ${(editorDisabled || setupMode) ? 'pointer-events-none opacity-75' : ''}`}
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
                  className={`simple-editor-content ${(editorDisabled || setupMode) ? 'pointer-events-none' : ''}`}
                />
              </motion.div>
            )}
          </AnimatePresence>

        </EditorContext.Provider>
      )}
    </div>
  )
}