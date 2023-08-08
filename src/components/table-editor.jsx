import { useState } from 'react';
import { EditorState } from "prosemirror-state";
import { ProseMirror } from "@nytimes/react-prosemirror";
import { EditorView } from "prosemirror-view";
import { DOMParser, Schema } from "prosemirror-model";
import { schema as baseSchema } from "prosemirror-schema-basic";
import { baseKeymap } from "prosemirror-commands";
import { keymap } from "prosemirror-keymap";
import { exampleSetup, buildMenuItems } from "prosemirror-example-setup";
import { MenuItem, Dropdown } from "prosemirror-menu";
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
  deleteTable
} from "prosemirror-tables";
import {
  tableEditing,
  columnResizing,
  tableNodes,
  fixTables
} from "prosemirror-tables";

let schema = new Schema({
  nodes: baseSchema.spec.nodes.append(
    tableNodes({
      tableGroup: "block",
      cellContent: "block+",
      cellAttributes: {
        background: {
          default: null,
          getFromDOM(dom) {
            return (dom.style && dom.style.backgroundColor) || null;
          },
          setDOMAttr(value, attrs) {
            if (value)
              attrs.style = (attrs.style || "") + `background-color: ${value};`;
          }
        }
      }
    })
  ),
  marks: baseSchema.spec.marks
});

let menu = buildMenuItems(schema).fullMenu;
function item(label, cmd) {
  return new MenuItem({ label, select: cmd, run: cmd });
}
let tableMenu = [
  item("Insert column before", addColumnBefore),
  item("Insert column after", addColumnAfter),
  item("Delete column", deleteColumn),
  item("Insert row before", addRowBefore),
  item("Insert row after", addRowAfter),
  item("Delete row", deleteRow),
  item("Delete table", deleteTable),
  item("Merge cells", mergeCells),
  item("Split cell", splitCell),
  item("Toggle header column", toggleHeaderColumn),
  item("Toggle header row", toggleHeaderRow),
  item("Toggle header cells", toggleHeaderCell),
  item("Make cell green", setCellAttr("background", "#dfd")),
  item("Make cell not-green", setCellAttr("background", null))
];
menu.splice(2, 0, [new Dropdown(tableMenu, { label: "Table" })]);
// const contentElement = document.querySelector('#content');
// if (!contentElement) {
//   throw new Error('Failed to find #content');
// }
// const doc = DOMParser.fromSchema(schema).parse(contentElement);
// let state = EditorState.create({
//   doc,
//   plugins: [
//     columnResizing(),
//     tableEditing(),
//     keymap({
//       Tab: goToNextCell(1),
//       "Shift-Tab": goToNextCell(-1)
//     })
//   ].concat(exampleSetup({ schema, menuContent: menu }))
// });
// let fix = fixTables(state);
// if (fix) state = state.apply(fix.setMeta("addToHistory", false));

/*
document.execCommand("enableObjectResizing", false, false);
document.execCommand("enableInlineTableEditing", false, false);
const editor = document.createElement("div");
editor.id = "editor";
if (!document.querySelector("#editor")) {
  document.querySelector("body").appendChild(editor);
  window.view = new EditorView(document.querySelector("#editor"), { state });
}
*/

export default function TableEditor() {
  const [mount, setMount] = useState();
  const [editorState, setEditorState] = useState(
    EditorState.create({
      schema,
      plugins: [
        columnResizing(),
        tableEditing(),
        keymap({
          Tab: goToNextCell(1),
          "Shift-Tab": goToNextCell(-1)
        })
      ].concat(exampleSetup({ schema, menuContent: menu }))
    })
  );
  return (
    <ProseMirror
      mount={mount}
      state={editorState}
      dispatchTransaction={(tr) => {
        setEditorState((s) => s.apply(tr));
      }}
    >
      <div ref={setMount} />
    </ProseMirror>
  );
}


