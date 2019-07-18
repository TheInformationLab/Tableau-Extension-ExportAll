import React from 'react';
import { Button } from '@tableau/tableau-ui';

const placeButtons = {
  bottom: 10,
  right: 10,
  position: 'fixed'
}

function ActionButtons(props) {

  return (
    <div style={placeButtons}>
      <Button kind={'outline'} style={{marginRight: 12}} onClick={props.resetSettings}>Reset</Button>
      <Button kind={'primary'} style={{marginRight: 12}} disabled={!props.enableButton} onClick={props.save}>Save Changes</Button>
    </div>
  )

}

export default ActionButtons;
