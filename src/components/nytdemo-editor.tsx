import React, { useState, useEffect } from 'react';
import { baseKeymap } from "prosemirror-commands";
import { keymap } from "prosemirror-keymap";
import { Schema } from "prosemirror-model";
import { EditorState } from "prosemirror-state";
import "prosemirror-view/style/prosemirror.css";
import { createRoot } from "react-dom/client";
import {
  NodeViewComponentProps,
  ProseMirror,
  useEditorEffect,
  useEditorState,
  useEditorEventListener,
  useNodeViews,
  ReactNodeViewConstructor,
} from "@nytimes/react-prosemirror";

const schema = new Schema({
  nodes: {
    doc: { content: "block+" },
    paragraph: { group: "block", content: "inline*" },
    text: { group: "inline" },
  },
});

const editorState = EditorState.create({
  schema,
  plugins: [keymap(baseKeymap)],
});

function Paragraph({ children }: NodeViewComponentProps) {
  useEditorEventListener("keydown", (view, event) => {
    console.log("Paragraph() doc=" + view.state.doc.toString());
    //view.dispatch(event);
  });
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
  const [mount, setMount] = useState<HTMLDivElement | null>(null);
  useEffect(() => {
    // To avoid SSR of the editor.
    setShowEditor(true);
  }, []);
  return (
    showEditor &&
    <main>
      <h1>React ProseMirror Demo</h1>
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
