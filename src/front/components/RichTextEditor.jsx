import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { Color } from "@tiptap/extension-color";
import { TextStyle, FontSize } from "@tiptap/extension-text-style";
import { Highlight } from "@tiptap/extension-highlight";
import { Extension } from "@tiptap/core";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useRef, useState } from "react";

const EnterAsLineBreak = Extension.create({
    name: "enterAsLineBreak",
    addKeyboardShortcuts() {
        return {
            Enter: () => {
                if (this.editor.isActive("bulletList") || this.editor.isActive("orderedList")) {
                    return false;
                }
                return this.editor.commands.setHardBreak();
            },
        };
    },
});
import "./RichTextEditor.css";

const FONT_SIZES = ["12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px", "36px", "48px"];

const ToolbarBtn = ({ onClick, active, title, children, disabled }) => (
    <button
        type="button"
        className={`rte-btn${active ? " active" : ""}${disabled ? " disabled" : ""}`}
        onClick={onClick}
        title={title}
        disabled={disabled}
    >
        {children}
    </button>
);

const Divider = () => <span className="rte-divider" />;

export default function RichTextEditor({ content, onChange, placeholder, titleSlot }) {
    const colorRef = useRef(null);
    const [toolbarOpen, setToolbarOpen] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
            Underline,
            TextStyle,
            FontSize,
            Color,
            Highlight.configure({ multicolor: true }),
            TextAlign.configure({ types: ["heading", "paragraph"] }),
            EnterAsLineBreak,
            Placeholder.configure({ placeholder: placeholder || "" }),
        ],
        content: content || "",
        onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
        editorProps: {
            attributes: { class: "rte-content", "data-placeholder": placeholder || "" }
        }
    });

    useEffect(() => {
        if (!editor) return;
        if (editor.getHTML() !== content) {
            editor.commands.setContent(content || "", false);
        }
    }, [content]);

    if (!editor) return null;

    const getCurrentFontSize = () => {
        const attrs = editor.getAttributes("textStyle");
        return attrs.fontSize || "16px";
    };

    return (
        <div className="rte-wrapper">
            <div className={`rte-toolbar${toolbarOpen ? " rte-toolbar--open" : ""}`}>
                <button
                    type="button"
                    className="rte-toolbar-toggle"
                    onClick={() => setToolbarOpen(o => !o)}
                    title="Opciones de formato"
                >
                    <span className="rte-toggle-label">formato</span>
                    <span className={`rte-toggle-arrow${toolbarOpen ? " open" : ""}`}>▾</span>
                </button>
                <div className="rte-toolbar-items">

                {/* Font size */}
                <select
                    className="rte-select rte-select--sm"
                    value={getCurrentFontSize()}
                    onChange={e => editor.chain().focus().setFontSize(e.target.value).run()}
                    title="Tamaño de fuente"
                >
                    {FONT_SIZES.map(s => (
                        <option key={s} value={s}>{s.replace("px", "")}</option>
                    ))}
                </select>

                <Divider />

                {/* Format */}
                <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Negrita (Ctrl+B)">
                    <strong>B</strong>
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Cursiva (Ctrl+I)">
                    <em>I</em>
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Subrayado (Ctrl+U)">
                    <span style={{ textDecoration: "underline" }}>U</span>
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Tachado">
                    <span style={{ textDecoration: "line-through" }}>S</span>
                </ToolbarBtn>

                <Divider />

                {/* Color */}
                <button
                    type="button"
                    className="rte-btn rte-color-btn"
                    title="Color de texto"
                    onClick={() => colorRef.current?.click()}
                >
                    <span className="rte-color-icon">
                        <span>A</span>
                        <span className="rte-color-bar" style={{ background: editor.getAttributes("textStyle").color || "#1A1A1A" }} />
                    </span>
                    <input
                        ref={colorRef}
                        type="color"
                        defaultValue="#1A1A1A"
                        style={{ display: "none" }}
                        onChange={e => editor.chain().focus().setColor(e.target.value).run()}
                    />
                </button>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleHighlight({ color: "#FFF176" }).run()} active={editor.isActive("highlight")} title="Resaltar texto">
                    <span style={{ background: "#FFF176", padding: "0 2px", borderRadius: "2px" }}>H</span>
                </ToolbarBtn>

                <Divider />

                {/* Align */}
                <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Alinear izquierda">
                    ≡
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Centrar">
                    ☰
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Alinear derecha">
                    <span style={{ display: "block", textAlign: "right" }}>≡</span>
                </ToolbarBtn>

                <Divider />

                {/* Lists */}
                <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Lista con viñetas">
                    •≡
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Lista numerada">
                    1≡
                </ToolbarBtn>

                <Divider />

                {/* History */}
                <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Deshacer (Ctrl+Z)">
                    ↩
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Rehacer (Ctrl+Y)">
                    ↪
                </ToolbarBtn>

                </div>
            </div>

            {titleSlot}

            <div className="rte-editor-area">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}
