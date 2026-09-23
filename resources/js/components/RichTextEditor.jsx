import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

// Correct named imports for Tiptap extensions
import { Underline } from '@tiptap/extension-underline';
import { TextAlign } from '@tiptap/extension-text-align';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Highlight } from '@tiptap/extension-highlight';

import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    List,
    ListOrdered,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Quote,
    Code,
    Heading1,
    Heading2,
    Heading3,
    Table as TableIcon,
    Highlighter,
    Undo,
    Redo,
    RemoveFormatting,
} from 'lucide-react';

export default function RichTextEditor({ value, onChange, placeholder = 'Write question content here...' }) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                bulletList: { keepMarks: true, keepAttributes: false },
                orderedList: { keepMarks: true, keepAttributes: false },
            }),
            Underline,
            Highlight.configure({ multicolor: true }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
        ],
        content: value || '',
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class:
                    'prose prose-sm max-w-none p-4 min-h-[160px] focus:outline-none focus:ring-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_table]:border-collapse [&_table]:w-full [&_td]:border [&_td]:border-slate-300 [&_td]:p-2 [&_th]:border [&_th]:border-slate-300 [&_th]:p-2 [&_th]:bg-slate-100',
            },
        },
    });

    // Keep editor content in sync when 'value' changes externally (e.g., in edit modals)
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value || '');
        }
    }, [value, editor]);

    if (!editor) return null;

    const ToolButton = ({ onClick, isActive, children, title }) => (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={`p-1.5 text-xs rounded transition-colors ${
                isActive
                    ? 'bg-slate-200 text-slate-900 font-semibold shadow-inner'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/60'
            }`}
        >
            {children}
        </button>
    );

    const Divider = () => <div className="w-px h-5 bg-slate-300 my-auto mx-1" />;

    return (
        <div className="text-sm mt-2 rounded-md border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            {/* CKEditor Style Multi-Row Toolbar */}
            <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 p-2 text-slate-700">
                
                {/* History Options */}
                <ToolButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
                    <Undo className="w-4 h-4" />
                </ToolButton>
                <ToolButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
                    <Redo className="w-4 h-4" />
                </ToolButton>

                <Divider />

                {/* Headings */}
                <ToolButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    isActive={editor.isActive('heading', { level: 1 })}
                    title="Heading 1"
                >
                    <Heading1 className="w-4 h-4" />
                </ToolButton>
                <ToolButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    isActive={editor.isActive('heading', { level: 2 })}
                    title="Heading 2"
                >
                    <Heading2 className="w-4 h-4" />
                </ToolButton>
                <ToolButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    isActive={editor.isActive('heading', { level: 3 })}
                    title="Heading 3"
                >
                    <Heading3 className="w-4 h-4" />
                </ToolButton>

                <Divider />

                {/* Text Formatting */}
                <ToolButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive('bold')}
                    title="Bold (Ctrl+B)"
                >
                    <Bold className="w-4 h-4" />
                </ToolButton>
                <ToolButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive('italic')}
                    title="Italic (Ctrl+I)"
                >
                    <Italic className="w-4 h-4" />
                </ToolButton>
                <ToolButton
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    isActive={editor.isActive('underline')}
                    title="Underline (Ctrl+U)"
                >
                    <UnderlineIcon className="w-4 h-4" />
                </ToolButton>
                <ToolButton
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    isActive={editor.isActive('strike')}
                    title="Strikethrough"
                >
                    <Strikethrough className="w-4 h-4" />
                </ToolButton>
                <ToolButton
                    onClick={() => editor.chain().focus().toggleHighlight().run()}
                    isActive={editor.isActive('highlight')}
                    title="Highlight Text"
                >
                    <Highlighter className="w-4 h-4 text-amber-500" />
                </ToolButton>

                <Divider />

                {/* Alignment */}
                <ToolButton
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    isActive={editor.isActive({ textAlign: 'left' })}
                    title="Align Left"
                >
                    <AlignLeft className="w-4 h-4" />
                </ToolButton>
                <ToolButton
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    isActive={editor.isActive({ textAlign: 'center' })}
                    title="Align Center"
                >
                    <AlignCenter className="w-4 h-4" />
                </ToolButton>
                <ToolButton
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    isActive={editor.isActive({ textAlign: 'right' })}
                    title="Align Right"
                >
                    <AlignRight className="w-4 h-4" />
                </ToolButton>
                <ToolButton
                    onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                    isActive={editor.isActive({ textAlign: 'justify' })}
                    title="Justify"
                >
                    <AlignJustify className="w-4 h-4" />
                </ToolButton>

                <Divider />

                {/* Lists */}
                <ToolButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive('bulletList')}
                    title="Bullet List"
                >
                    <List className="w-4 h-4" />
                </ToolButton>
                <ToolButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive('orderedList')}
                    title="Numbered List"
                >
                    <ListOrdered className="w-4 h-4" />
                </ToolButton>

                <Divider />

                {/* Extra Block Elements */}
                <ToolButton
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    isActive={editor.isActive('blockquote')}
                    title="Blockquote"
                >
                    <Quote className="w-4 h-4" />
                </ToolButton>
                <ToolButton
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    isActive={editor.isActive('codeBlock')}
                    title="Code Block"
                >
                    <Code className="w-4 h-4" />
                </ToolButton>
                <ToolButton
                    onClick={() =>
                        editor
                            .chain()
                            .focus()
                            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                            .run()
                    }
                    title="Insert 3x3 Table"
                >
                    <TableIcon className="w-4 h-4" />
                </ToolButton>

                <Divider />

                {/* Clear Formatting */}
                <ToolButton
                    onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
                    title="Clear Formatting"
                >
                    <RemoveFormatting className="w-4 h-4 text-rose-500" />
                </ToolButton>
            </div>

            {/* Editor Input Area */}
            <EditorContent editor={editor} />
        </div>
    );
}