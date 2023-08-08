// import 'prosemirror-view/style/prosemirror.css';
// import 'prosemirror-menu/style/menu.css';
// import 'prosemirror-example-setup/style/style.css';
// import 'prosemirror-gapcursor/style/gapcursor.css';
// import '../style/tables.css';

import React, { useState, useEffect } from 'react';
import { schema as baseSchema } from "prosemirror-schema-basic"
import { baseKeymap } from "prosemirror-commands";
import { keymap } from "prosemirror-keymap";
import { Schema } from "prosemirror-model";
import { EditorState } from "prosemirror-state";
import { addListNodes } from "prosemirror-schema-list"
//import { exampleSetup } from "prosemirror-example-setup"
//import { createRoot } from "react-dom/client";
//import { EditorView } from 'prosemirror-view';
//import { EditorState } from 'prosemirror-state';
//import { DOMParser, Schema } from 'prosemirror-model';
//import { schema as baseSchema } from 'prosemirror-schema-basic';
//import { keymap } from 'prosemirror-keymap';
import { exampleSetup, buildMenuItems } from 'prosemirror-example-setup';
import { MenuItem, Dropdown } from 'prosemirror-menu';
import {
  NodeViewComponentProps,
  ProseMirror,
  useEditorEffect,
  useEditorState,
  useNodeViews,
  ReactNodeViewConstructor,
} from "@nytimes/react-prosemirror";
import {
  addColumnAfter,
  addColumnBefore,
  deleteColumn,
  addRowAfter,
  addRowBefore,
  deleteRow,
  mergeCells,
  splitCell,
  setCellAttr,
  toggleHeaderRow,
  toggleHeaderColumn,
  toggleHeaderCell,
  goToNextCell,
  deleteTable,
} from 'prosemirror-tables';
import {
  tableEditing,
  columnResizing,
  tableNodes,
  fixTables
} from 'prosemirror-tables';

const menu = buildMenuItems(baseSchema).fullMenu;
function item(label: string, cmd: (state: EditorState) => boolean) {
  return new MenuItem({ label, select: cmd, run: cmd });
}
const tableMenu = [
  item('Insert column before', addColumnBefore),
  item('Insert column after', addColumnAfter),
  item('Delete column', deleteColumn),
  item('Insert row before', addRowBefore),
  item('Insert row after', addRowAfter),
  item('Delete row', deleteRow),
  item('Delete table', deleteTable),
  item('Merge cells', mergeCells),
  item('Split cell', splitCell),
  item('Toggle header column', toggleHeaderColumn),
  item('Toggle header row', toggleHeaderRow),
  item('Toggle header cells', toggleHeaderCell),
  item('Make cell green', setCellAttr('background', '#dfd')),
  item('Make cell not-green', setCellAttr('background', null)),
];

menu.splice(2, 0, [new Dropdown(tableMenu, { label: 'Table' })]);

/*
const contentElement = document.querySelector('#content');
if (!contentElement) {
  throw new Error('Failed to find #content');
}
const doc = DOMParser.fromSchema(schema).parse(contentElement);

(window as any).view = new EditorView(document.querySelector('#editor'), {
  state,
  });

document.execCommand('enableObjectResizing', false, 'false');
document.execCommand('enableInlineTableEditing', false, 'false');

*/

// const schema = new Schema({
//   nodes: {
//     doc: { content: "block+" },
//     paragraph: { group: "block", content: "inline*" },
//     text: { group: "inline" },
//   },
//   // nodes: addListNodes(baseSchema.spec.nodes, "paragraph block*", "block"),
//   marks: baseSchema.spec.marks
// });


const nodes = {
  doc: { content: "block" },
  paragraph: { group: "block", content: "inline*" },
  text: { group: "inline" },
};

const schema = new Schema({
  nodes: (new Schema({nodes})).spec.nodes.append(
    tableNodes({
      tableGroup: 'block',
      cellContent: 'block+',
      cellAttributes: {
        background: {
          default: null,
          getFromDOM(dom) {
            return dom.style.backgroundColor || null;
          },
          setDOMAttr(value, attrs) {
            if (value)
              attrs.style = (attrs.style || '') + `background-color: ${value};`;
          },
        },
      },
    }),
  ),
  marks: baseSchema.spec.marks,
});

// const editorState = EditorState.create({
//   schema,
//   plugins: exampleSetup({ schema: baseSchema }),
// });

let editorState = EditorState.create({
  //  doc,
  schema,
  plugins: [
    columnResizing(),
    tableEditing(),
    keymap({
      Tab: goToNextCell(1),
      'Shift-Tab': goToNextCell(-1),
    }),
  ].concat(
    exampleSetup({
      schema,
      // @ts-expect-error: prosemirror-example-setup exports wrong types here.
      menuContent: menu,
    }),
  ),
});

const fix = fixTables(editorState);
if (fix) state = editorState.apply(fix.setMeta('addToHistory', false));

function Paragraph({ children }: NodeViewComponentProps) {
  return <p>{children}</p>;
}

function Table({ children }: NodeViewComponentProps) {
  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>1</th>
            <th>2</th>
            <th>3</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>One</td>
            <td>Two</td>
            <td>Three</td>
          </tr>
          <tr>
            <td>Four</td>
            <td>Five</td>
            <td>Six</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

const reactNodeViews: Record<string, ReactNodeViewConstructor> = {
  paragraph: () => ({
    component: Table,
    dom: document.createElement("div"),
    contentDOM: document.createElement("div"),
  }),
};

export function Editor() {
  const [ showEditor, setShowEditor ] = useState(false);
  const { nodeViews, renderNodeViews } = useNodeViews(reactNodeViews);
  const [ mount, setMount ] = useState();
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
