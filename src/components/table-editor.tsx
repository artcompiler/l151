import React, { useState, useEffect } from 'react';
import { schema as baseSchema } from "prosemirror-schema-basic"
import { baseKeymap } from "prosemirror-commands";
import { keymap } from "prosemirror-keymap";
import { Schema, DOMParser } from "prosemirror-model";
import { EditorState } from "prosemirror-state";
import { addListNodes } from "prosemirror-schema-list"
import { exampleSetup } from 'prosemirror-example-setup';
import {
  NodeViewComponentProps,
  ProseMirror,
  useEditorEffect,
  useEditorState,
  useNodeViews,
  useEditorEventCallback,
  useEditorEventListener,
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

let defaultEditorState = EditorState.create({
  schema,
  plugins: [
    columnResizing(),
    tableEditing(),
    keymap({
      Tab: goToNextCell(1),
      'Shift-Tab': goToNextCell(-1),
    }),
  ]
});

const fix = fixTables(defaultEditorState);
if (fix) defaultEditorState = defaultEditorState.apply(fix.setMeta('addToHistory', false));

// TODO encode/decode prosemirror state
// TODO embed table editor in playground

function TableEditor({ reactNodeViews }: { reactNodeViews }) {
  const [ showEditor, setShowEditor ] = useState(false);
  const { nodeViews, renderNodeViews } = useNodeViews(reactNodeViews);
  const [ mount, setMount ] = useState<HTMLDivElement | null>(null);
  const [ editorState, setEditorState ] = useState(defaultEditorState);
  return (
    <main>
      <ProseMirror
        mount={mount}
        //defaultState={defaultEditorState}
        state={editorState}
        dispatchTransaction={
          (tr) => {
            if (mount) {
              const node = DOMParser.fromSchema(schema).parse(mount);
              console.log("TableEditor() tr=" + JSON.stringify(tr));
              console.log("TableEditor() node=" + JSON.stringify(node.toJSON(), null, 2));
            }
            setEditorState((s) => {
              return s.apply(tr);
            });
          }
        }
        nodeViews={nodeViews}
      >
        <div ref={setMount} />
        { renderNodeViews() }
      </ProseMirror>
    </main>
  );
}

const buildTable = ({ data }) => {
  return function Table() {
    const { table_name, row_name, desc, cols = [], rows = [] } = data;
    useEditorEventListener("keydown", (view, event) => {
      let tr = view.state.tr
      view.dispatch(tr);
    });
    return (
      <div className="pt-10">
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
