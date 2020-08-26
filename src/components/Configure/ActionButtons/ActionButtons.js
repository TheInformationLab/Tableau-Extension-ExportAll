import React from 'react';
import { Button } from '@tableau/tableau-ui';
import packageJson from '../../../../package.json';

const placeButtons = {
  bottom: 10,
  right: 10,
  position: 'fixed'
}

const version = {
  left: 10,
  bottom: 10,
  position: 'fixed',
  color: '#4f4f4f',
  fontSize: 12
}

function ActionButtons(props) {

  return (
    <div>
      <div style={version}>v{packageJson.version}</div>
      <div style={placeButtons}>
        <Button kind={'outline'} style={{marginRight: 12}} onClick={props.resetSettings}>Reset</Button>
        <Button kind={'primary'} style={{marginRight: 12}} disabled={!props.enableButton} onClick={props.save}>Save Changes</Button>
      </div>
    </div>
  )

}

export default ActionButtons;
