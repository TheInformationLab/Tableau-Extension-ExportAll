import React from 'react';
import Sheet from './Sheet/Sheet'

function SelectSheets(props) {

  if (props && props.sheets) {
    return props.sheets.map((sheet, index) => {
      return (
        <Sheet
          id={index}
          key={sheet.sheetName}
          name={sheet.sheetName}
          rename={sheet.changeName}
          sheets={props.sheets}
          selected={sheet.selected}
          select={() => props.selectSheet(index)}
          changeName={(name) => props.changeName(index,name)}
          changeOrder={(newPos) => props.changeOrder(index,newPos)}
          />
      );
    });
  } else {
    return (
      <div></div>
    )
  }

}

export default SelectSheets;
