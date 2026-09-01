import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  type KeyboardEvent,
} from "react";
import {
  Plate,
  PlateContent,
  PlateElement,
  PlateLeaf,
  ParagraphPlugin,
  usePlateEditor,
  useEditorRef,
  type PlateElementProps,
  type PlateLeafProps,
} from "platejs/react";
import {
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
  StrikethroughPlugin,
  CodePlugin,
  H1Plugin,
  H2Plugin,
  H3Plugin,
  BlockquotePlugin,
} from "@platejs/basic-nodes/react";
import { ListPlugin } from "@platejs/list/react";
import { LinkPlugin } from "@platejs/link/react";
import { MarkdownPlugin, deserializeMd, serializeMd } from "@platejs/markdown";
import { Checkbox } from "@/components/ui/checkbox";
import { EditorToolbar } from "./EditorToolbar";
import { cn } from "@/lib/utils";
import { isMarkdownEmpty } from "@/lib/markdown";

export interface MarkdownEditorProps {
  value?: string | null;
  onChange?: (markdown: string) => void;
  onSaveShortcut?: (markdown: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  minHeight?: string;
  maxHeight?: string;
  autoFocus?: boolean;
  showToolbar?: boolean;
}

export interface MarkdownEditorRef {
  getMarkdown: () => string;
  setMarkdown: (markdown: string) => void;
  focus: () => void;
}

const TodoListNode = (props: PlateElementProps) => {
  const { checked } = props.element as any;
  const isChecked = Boolean(checked);
  const editor = useEditorRef();

  const handleCheckedChange = (newVal: boolean) => {
    const path = editor.api.findPath(props.element);
    if (path) {
      editor.tf.setNodes({ checked: newVal }, { at: path });
    }
  };

  return (
    <PlateElement as="div" className="flex items-start gap-2 my-1 text-sm text-[var(--text-primary)]" {...props}>
      <span contentEditable={false} className="inline-flex pt-0.5 select-none">
        <Checkbox
          checked={isChecked}
          onCheckedChange={handleCheckedChange}
          className="h-3.5 w-3.5 rounded border-slate-300 dark:border-slate-600 data-checked:bg-[var(--brand)] data-checked:border-[var(--brand)] cursor-pointer"
        />
      </span>
      <span className={cn("flex-1 min-w-0", isChecked && "line-through opacity-60 text-[var(--text-muted)]")}>
        {props.children}
      </span>
    </PlateElement>
  );
};

const ParagraphNode = (props: PlateElementProps) => {
  const { listStyleType, checked } = props.element as any;
  if (listStyleType === "todo" || checked !== undefined) {
    return <TodoListNode {...props} />;
  }
  return (
    <PlateElement as="p" className="my-1 leading-relaxed text-sm text-[var(--text-primary)]" {...props} />
  );
};

const H1Node = (props: PlateElementProps) => (
  <PlateElement as="h1" className="text-xl font-bold mt-2.5 mb-1 text-[var(--text-primary)]" {...props} />
);

const H2Node = (props: PlateElementProps) => (
  <PlateElement as="h2" className="text-lg font-semibold mt-2 mb-0.5 text-[var(--text-primary)]" {...props} />
);

const H3Node = (props: PlateElementProps) => (
  <PlateElement as="h3" className="text-base font-semibold mt-1.5 mb-0.5 text-[var(--text-primary)]" {...props} />
);

const BlockquoteNode = (props: PlateElementProps) => (
  <PlateElement
    as="blockquote"
    className="border-l-2 border-[var(--brand)] pl-3 italic text-[var(--text-muted)] my-1.5 text-sm"
    {...props}
  />
);

const ListNode = (props: PlateElementProps) => {
  const { checked, listStyleType } = props.element as any;
  const isTodo = checked !== undefined || listStyleType === "todo";

  if (isTodo) {
    return <TodoListNode {...props} />;
  }

  const isOrdered = Boolean(listStyleType === "decimal");
  return (
    <PlateElement
      as={isOrdered ? "ol" : "ul"}
      className={cn(
        "my-1 pl-5 text-sm text-[var(--text-primary)]",
        isOrdered ? "list-decimal" : "list-disc"
      )}
      {...props}
    />
  );
};

const LinkNode = (props: PlateElementProps) => {
  return (
    <PlateElement
      as="a"
      className="text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:opacity-80 transition-opacity inline"
      {...props}
    >
      {props.children}
    </PlateElement>
  );
};

// Custom Leaf Components
const BoldLeaf = (props: PlateLeafProps) => (
  <PlateLeaf as="strong" className="font-bold text-[var(--text-primary)]" {...props} />
);

const ItalicLeaf = (props: PlateLeafProps) => (
  <PlateLeaf as="em" className="italic" {...props} />
);

const UnderlineLeaf = (props: PlateLeafProps) => (
  <PlateLeaf as="u" className="underline underline-offset-2" {...props} />
);

const StrikethroughLeaf = (props: PlateLeafProps) => (
  <PlateLeaf as="s" className="line-through opacity-70" {...props} />
);

const CodeLeaf = (props: PlateLeafProps) => (
  <PlateLeaf
    as="code"
    className="rounded bg-[var(--bg-soft)] px-1 py-0.5 font-mono text-xs text-[var(--text-primary)] border border-[var(--border-subtle)]"
    {...props}
  />
);

const parseMarkdownToSlate = (editor: any, markdown: string) => {
  if (!markdown || isMarkdownEmpty(markdown)) {
    return [{ type: "p", children: [{ text: "" }] }];
  }
  try {
    const rawNodes = deserializeMd(editor, markdown);
    const lines = markdown.split(/\r?\n/).filter((l) => l.trim().length > 0);
    return rawNodes.map((node: any, idx: number) => {
      const line = lines[idx]?.trim() ?? "";
      const taskMatch = line.match(/^[-*]\s+\[([ xX])\]\s*(.*)$/);
      if (taskMatch) {
        return {
          ...node,
          type: "p",
          listStyleType: "todo",
          checked: taskMatch[1].toLowerCase() === "x",
        };
      }
      return node;
    });
  } catch {
    return [{ type: "p", children: [{ text: markdown }] }];
  }
};

const serializeSlateToMarkdown = (editor: any): string => {
  if (!editor) return "";
  try {
    const nodes = (editor.children as any[]) || [];
    const hasSpecialLists = nodes.some((n) => n.listStyleType === "todo" || n.checked !== undefined);
    if (!hasSpecialLists) {
      const standardMd = serializeMd(editor);
      return isMarkdownEmpty(standardMd) ? "" : standardMd.replace(/[\u200B-\u200D\u2060\uFEFF]/g, "").trim();
    }

    const lines = nodes.map((node) => {
      const text = (node.children?.map((c: any) => c.text ?? "").join("") ?? "")
        .replace(/[\u200B-\u200D\u2060\uFEFF]/g, "");
      if (node.listStyleType === "todo" || node.checked !== undefined) {
        return `- [${node.checked ? "x" : " "}] ${text}`;
      }
      if (node.listStyleType === "disc") {
        return `- ${text}`;
      }
      if (node.listStyleType === "decimal") {
        return `1. ${text}`;
      }
      if (node.type === "h1") return `# ${text}`;
      if (node.type === "h2") return `## ${text}`;
      if (node.type === "h3") return `### ${text}`;
      if (node.type === "blockquote") return `> ${text}`;
      return text;
    });

    const result = lines.join("\n");
    return isMarkdownEmpty(result) ? "" : result.trim();
  } catch {
    return "";
  }
};

export const MarkdownEditor = forwardRef<MarkdownEditorRef, MarkdownEditorProps>(
  (
    {
      value = "",
      onChange,
      onSaveShortcut,
      placeholder = "Digite observações em markdown (ex: - checklist, **negrito**)...",
      disabled = false,
      className,
      minHeight = "100px",
      maxHeight = "240px",
      autoFocus = false,
      showToolbar = true,
    },
    ref
  ) => {
    const editorPlugins = useMemo(
      () => [
        ParagraphPlugin.configure({ node: { component: ParagraphNode } }),
        H1Plugin.configure({ node: { component: H1Node } }),
        H2Plugin.configure({ node: { component: H2Node } }),
        H3Plugin.configure({ node: { component: H3Node } }),
        BlockquotePlugin.configure({ node: { component: BlockquoteNode } }),
        BoldPlugin.configure({ node: { component: BoldLeaf } }),
        ItalicPlugin.configure({ node: { component: ItalicLeaf } }),
        UnderlinePlugin.configure({ node: { component: UnderlineLeaf } }),
        StrikethroughPlugin.configure({ node: { component: StrikethroughLeaf } }),
        CodePlugin.configure({ node: { component: CodeLeaf } }),
        ListPlugin.configure({
          node: {
            component: ListNode,
          },
          override: {
            components: {
              action_item: TodoListNode,
              todo: TodoListNode,
            },
          },
        }),
        LinkPlugin.configure({ node: { component: LinkNode } }),
        MarkdownPlugin,
      ],
      []
    );

    const initialEditorValue = useMemo(() => {
      if (!value || isMarkdownEmpty(value)) {
        return [{ type: "p", children: [{ text: "" }] }];
      }
      return undefined;
    }, [value]);

    const editor = usePlateEditor({
      plugins: editorPlugins,
      value: initialEditorValue,
    });

    const isInitializedRef = useRef(false);

    // Synchronize external value into editor
    useEffect(() => {
      if (!editor) return;

      if (!isInitializedRef.current) {
        if (value && value.trim().length > 0) {
          const parsed = parseMarkdownToSlate(editor, value);
          editor.tf.setValue(parsed);
        }
        isInitializedRef.current = true;
      }
    }, [editor, value]);

    const getMarkdownString = useCallback((): string => {
      if (!editor) return "";
      return serializeSlateToMarkdown(editor);
    }, [editor]);

    useImperativeHandle(
      ref,
      () => ({
        getMarkdown: () => getMarkdownString(),
        setMarkdown: (newMd: string) => {
          if (!editor) return;
          const parsed = parseMarkdownToSlate(editor, newMd);
          editor.tf.setValue(parsed);
        },
        focus: () => {
          editor?.tf.focus();
        },
      }),
      [editor, getMarkdownString]
    );

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        const md = getMarkdownString();
        onSaveShortcut?.(md);
      }
    };

    const handlePlateChange = () => {
      if (!onChange || !editor) return;
      const md = getMarkdownString();
      onChange(md);
    };

    return (
      <div
        className={cn(
          "flex flex-col rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-soft)] focus-within:border-[var(--brand)] focus-within:ring-1 focus-within:ring-[var(--brand)] transition-all overflow-hidden",
          disabled && "opacity-60 cursor-not-allowed",
          className
        )}
      >
        <Plate
          editor={editor}
          onValueChange={handlePlateChange}
          readOnly={disabled}
        >
          {showToolbar && <EditorToolbar disabled={disabled} />}

          <div
            className="overflow-y-auto px-3 py-2 text-xs text-[var(--text-primary)]"
            style={{ minHeight, maxHeight }}
          >
            <PlateContent
              autoFocus={autoFocus}
              placeholder={placeholder}
              onKeyDown={handleKeyDown}
              className="outline-none min-h-full font-sans"
            />
          </div>
        </Plate>
      </div>
    );
  }
);

MarkdownEditor.displayName = "MarkdownEditor";

export default MarkdownEditor;
