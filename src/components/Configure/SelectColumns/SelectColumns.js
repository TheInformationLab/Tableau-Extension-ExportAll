import React from 'react';
import Sheet from './Sheet/Sheet'

function SelectColumns(props) {

  if (props && props.sheets) {
    return props.sheets.map((sheet, index) => {
      if (sheet.selected) {
        return (
          <div key={sheet.sheetName}>
            <div><b>{sheet.sheetName}</b></div>
            <Sheet
              id={index}
              name={sheet.sheetName}
              cols={sheet.columns}
              colSelect={props.colSelect}
              changeName={props.changeName}
              changeOrder={props.changeOrder}
              />
          </div>
        );
      } else {
        return (
          <div key={sheet.sheetName}></div>
        )
      }
    });
  } else {
    return (
      <div></div>
    )
  }

}

export default SelectColumns;
