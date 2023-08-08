import React, { useState, useEffect } from 'react';
//import { EditorState } from "prosemirror-state"
//import { EditorView } from "prosemirror-view"
//import { Schema, DOMParser } from "prosemirror-model"
//import { schema } from "prosemirror-schema-basic"
//import { addListNodes } from "prosemirror-schema-list"
//import { exampleSetup } from "prosemirror-example-setup"
import { ProseMirror, useEditorEffect } from "@nytimes/react-prosemirror";

import {
  useNodeViews,
  useEditorEventCallback,
  NodeViewComponentProps,
} from "@nytimes/react-prosemirror";
import { EditorState } from "prosemirror-state";
import { schema } from "prosemirror-schema-basic";

// Paragraph is more or less a normal React component, taking and rendering
// its children. The actual children will be constructed by ProseMirror and
// passed in here. Take a look at the NodeViewComponentProps type to
// see what other props will be passed to NodeView components.
function Paragraph({ children }: NodeViewComponentProps) {
  const onClick = useEditorEventCallback((view) => console.log(view.state.doc)); /*view.dispatch(whatever));*/
  return <p onClick={onClick}>{children}</p>;
}

// Make sure that your ReactNodeViews are defined outside of
// your component, or are properly memoized. ProseMirror will
// teardown and rebuild all NodeViews if the nodeView prop is
// updated, leading to unbounded recursion if this object doesn't
// have a stable reference.
const reactNodeViews = {
  paragraph: () => ({
    component: Paragraph,
    // We render the Paragraph component itself into a div element
    dom: document.createElement("div"),
    // We render the paragraph node's ProseMirror contents into
    // a span, which will be passed as children to the Paragraph
    // component.
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
    <ProseMirror
      mount={mount}
      defaultState={EditorState.create({ schema })}
      nodeViews={nodeViews}
    >
      <div ref={setMount} />
      {renderNodeViews()}
    </ProseMirror> || <div />
  );
}

/*
export function Editor() {
  const [showEditor, setShowEditor] = useState(false);
  const [mount, setMount] = useState();
  // Mix the nodes from prosemirror-schema-list into the basic schema to
  // create a schema with list support.
  const mySchema = new Schema({
    nodes: addListNodes(schema.spec.nodes, "paragraph block*", "block"),
    marks: schema.spec.marks
  });

  const [editorState, setEditorState] = useState(
    EditorState.create({
      mySchema,
      doc: mount,
      plugins: [
        exampleSetup({schema: mySchema}),
      ],
    })
  );
  
  useEffect(() => {
    // To avoid SSR of the editor.
    setShowEditor(true);
  }, []);

  return (
    showEditor &&
    <ProseMirror
      mount={mount}
      state={editorState}
      dispatchTransaction={(transaction) => {
        setEditorState((editorState) => editorState.apply(transaction));
        console.log("Document size went from", transaction.before.content.size,
                    "to", transaction.doc.content.size)
      }}
    >
      <div ref={setMount} />
    </ProseMirror> || <div />
  );
}
*/
