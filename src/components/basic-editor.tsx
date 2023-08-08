import React, { useState, useEffect } from 'react';
import { schema as baseSchema } from "prosemirror-schema-basic"
import { baseKeymap } from "prosemirror-commands";
import { keymap } from "prosemirror-keymap";
import { Schema } from "prosemirror-model";
import { EditorState } from "prosemirror-state";
import { addListNodes } from "prosemirror-schema-list"
import { exampleSetup } from "prosemirror-example-setup"
import { createRoot } from "react-dom/client";
import {
  NodeViewComponentProps,
  ProseMirror,
  useEditorEffect,
  useEditorState,
  useNodeViews,
  ReactNodeViewConstructor,
} from "@nytimes/react-prosemirror";

const schema = new Schema({
  nodes: {
    doc: { content: "block+" },
    paragraph: { group: "block", content: "inline*" },
    text: { group: "inline" },
  },
  // nodes: addListNodes(baseSchema.spec.nodes, "paragraph block*", "block"),
  marks: baseSchema.spec.marks
});

const editorState = EditorState.create({
  schema,
  plugins: exampleSetup({ schema: baseSchema }),
});

function Paragraph({ children }: NodeViewComponentProps) {
  return <p>{children}</p>;
}

const reactNodeViews: Record<string, ReactNodeViewConstructor> = {
  paragraph: () => ({
    component: Paragraph,
    dom: document.createElement("div"),
    contentDOM: document.createElement("span"),
  }),
};

export function Editor() {
  const [showEditor, setShowEditor] = useState(false);
  const { nodeViews, renderNodeViews } = useNodeViews(reactNodeViews);
  const [mount, setMount] = useState();
  useEffect(() => {
    // To avoid SSR of the editor.
    setShowEditor(true);
  }, []);
  return (
    showEditor &&
    <main>
      <ProseMirror
        mount={mount}
        defaultState={editorState}
        nodeViews={nodeViews}
      >
        <div ref={setMount} />
        {renderNodeViews()}
      </ProseMirror>
    </main> || <div />
  );
}
