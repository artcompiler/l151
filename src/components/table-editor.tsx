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
import { exampleSetup } from 'prosemirror-example-setup';
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

function Paragraph({ children }: NodeViewComponentProps) {
  return <p>{children}</p>;
}


/*
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
            <td>4</td>
            <td>5</td>
            <td>6</td>
          </tr>
          <tr>
            <td>7</td>
            <td>8</td>
            <td>9</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
*/

let defaultEditorState = EditorState.create({
  data: { foo: "bar" },
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
    }),
  ),
});

const fix = fixTables(defaultEditorState);
if (fix) state = defaultEditorState.apply(fix.setMeta('addToHistory', false));

function TableEditor({ reactNodeViews }) {
  const [ showEditor, setShowEditor ] = useState(false);
  const { nodeViews, renderNodeViews } = useNodeViews(reactNodeViews);
  const [ mount, setMount ] = useState();
  const [ editorState, setEditorState ] = useState(defaultEditorState);
  return (
    <main>
      <ProseMirror
        mount={mount}
        defaultState={defaultEditorState}
        state={defaultEditorState}
        dispatchTransaction={(tr) => {
          setEditorState((s) => s.apply(tr));
        }}
        nodeViews={nodeViews}
      >
        <div ref={setMount} />
        {renderNodeViews()}
      </ProseMirror>
    </main>
  );
}

const buildTable = ({ data }) => {
  return function Table({ children }) {
    const editorState = useEditorState();
    const { table_name, row_name, desc, cols = [], rows = [] } = data;
    return (
      <div className="pt-10">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            { /*<h1 className="text-base font-semibold leading-6 text-gray-900">
                {table_name}
                </h1> */
            }
            <p className="mt-2 text-sm text-gray-700">
              { desc }
            </p>
          </div>
        </div>
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    {
                      cols.map((col, index) => (
                        <th key={index} scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-gray-900 sm:pl-0">
                          {col}
                        </th>
                      ))
                    }
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {
                    rows.map((row, index) => (
                      <tr key={index}>
                        {
                          cols.map((col, index) => (
                            <td key={index} className="whitespace-nowrap py-2 pl-4 pr-3 text-xs font-medium text-gray-900 sm:pl-0">
                              {row[col]}
                            </td>
                          ))
                        }
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export function Editor({ data }) {
  const [ showEditor, setShowEditor ] = useState(false);
  const reactNodeViews: Record<string, ReactNodeViewConstructor> = {
    paragraph: () => ({
      component: buildTable({ data }),
      dom: document.createElement("div"),
      contentDOM: document.createElement("div"),
    }),
  };
  useEffect(() => {
    // To avoid SSR of the editor.
    setShowEditor(true);
  }, []);
  return (
    showEditor && <TableEditor reactNodeViews={reactNodeViews} /> || <div />
  );
}
