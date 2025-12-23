"use client";

import { useRef, useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import type { AnyFieldApi } from "@tanstack/react-form";
import { Toggle } from "@/components/ui/toggle";
import { Bold, Italic, List, ListOrdered, Heading2 } from "lucide-react";

interface FormRichTextProps {
    field: AnyFieldApi;
    label: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
    error?: string;
}

export function FormRichText({
    field,
    label,
    required,
    className,
    disabled,
    error,
}: FormRichTextProps) {
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    // 1. Initial Content Parsing (JSON or HTML)
    const [initialValue] = useState(() => {
        const val = field.state.value;
        if (!val || val === "") return "";
        try {
            // Tiptap can accept JSON objects directly if we tell it to
            return typeof val === "string" ? JSON.parse(val) : val;
        } catch {
            return val; // Fallback to string/html
        }
    });

    // 2. Initialize Tiptap Editor
    const editor = useEditor({
        extensions: [StarterKit],
        content: initialValue,
        editable: !disabled,
        onUpdate: ({ editor }) => {
            const json = editor.getJSON();
            
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
            debounceTimer.current = setTimeout(() => {
                // Store as JSON string to match your Plate logic
                field.handleChange(JSON.stringify(json));
            }, 500);
        },
        editorProps: {
            attributes: {
                class: "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[350px] p-4",
            },
        },
    });

    // Handle external "disabled" prop changes
    useEffect(() => {
        if (editor) {
            editor.setEditable(!disabled);
        }
    }, [disabled, editor]);

    const activeError = error
        ? [{ message: error }]
        : field.state.meta.isTouched && field.state.meta.errors.length
        ? field.state.meta.errors
        : undefined;

    return (
        <Field className={className}>
            <FieldLabel>
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
            </FieldLabel>

            <div className="w-full border rounded-md bg-background overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                {/* 3. shadcn-styled Toolbar */}
                {editor && (
                    <div className="flex flex-wrap gap-1 p-1 border-b bg-muted/50">
                        <Toggle
                            size="sm"
                            pressed={editor.isActive("bold")}
                            onPressedChange={() => editor.chain().focus().toggleBold().run()}
                        >
                            <Bold className="h-4 w-4" />
                        </Toggle>
                        <Toggle
                            size="sm"
                            pressed={editor.isActive("italic")}
                            onPressedChange={() => editor.chain().focus().toggleItalic().run()}
                        >
                            <Italic className="h-4 w-4" />
                        </Toggle>
                        <Toggle
                            size="sm"
                            pressed={editor.isActive("heading", { level: 2 })}
                            onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        >
                            <Heading2 className="h-4 w-4" />
                        </Toggle>
                        <Toggle
                            size="sm"
                            pressed={editor.isActive("bulletList")}
                            onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
                        >
                            <List className="h-4 w-4" />
                        </Toggle>
                        <Toggle
                            size="sm"
                            pressed={editor.isActive("orderedList")}
                            onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
                        >
                            <ListOrdered className="h-4 w-4" />
                        </Toggle>
                    </div>
                )}

                {/* 4. The Editor Area */}
                <div className="h-[400px] overflow-y-auto">
                    <EditorContent editor={editor} />
                </div>
            </div>

            {activeError && (
                <FieldError className="pl-2" errors={activeError} />
            )}
        </Field>
    );
}