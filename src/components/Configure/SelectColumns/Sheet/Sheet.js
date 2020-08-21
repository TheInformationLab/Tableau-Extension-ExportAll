import React from 'react';
import Column from './Column/Column'

function Sheets(props) {

  if (props && props.cols) {
    return props.cols.map((col, index) => {
      return (
        <Column
          id={index}
          key={col.index}
          name={col.name}
          rename={col.changeName}
          selected={col.selected}
          select={() => props.colSelect(props.id, index)}
          changeName={(name) => props.changeName(props.id, index, name)}
          cols={props.cols}
          changeOrder={(newPos) => props.changeOrder(props.id, index, newPos)}
          />
      );
    });
  } else {
    return (
      <div></div>
    )
  }

}

export default Sheets;
