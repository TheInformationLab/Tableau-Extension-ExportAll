import React from 'react';
import { Checkbox, TextField, Stepper } from '@tableau/tableau-ui';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import MuiExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
  },
  details: {
    alignItems: 'center',
  },
  column: {
    flexBasis: '50%',
  },
  label: {
    display: 'block',
    fontSize: 10,
    lineHeight: '10px',
    order: 0,
    marginBottom: 3,
  },
  group: {
    color: 'rgba(0, 0, 0, 0.56)',
    display: 'inline-flex',
    flexDirection: 'column',
    fontFamily: 'Benton Sans, Arial, Helvetica, sans-serif',
    position: 'relative',
  },
  stepper: {
    marginBottom: 13
  },
  strikeThrough: {
    textDecoration: 'line-through',
    color: 'rgba(156, 156, 156, 0.8)',
    marginRight: 5,
  }
}));

const ExpansionPanel = withStyles({
  root: {
    boxShadow: 'none',
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    '&:before': {
      display: 'none',
    },
    '&$expanded': {
      margin: 'auto',
    },
  },
  expanded: {},
})(MuiExpansionPanel);

function Column(props) {

  const classes = useStyles();

  const inputProps = {
    label: 'Rename',
    onChange: e => props.changeName(e.target.value),
    onClear: () => {
      props.changeName(null);
    },
    placeholder: props.name || 'Override Export Column Name',
    style: { width: 200 },
    value: props.rename || '',
  };

  function renderColName(name, rename) {
    if (rename) {
      return (
        <div>
          <span className={classes.strikeThrough}>{name}</span>
          <span>{rename}</span>
        </div>
      )
    }
    return (
      <div>{name}</div>
    )
  }

  return (
    <div className={classes.root}>
      <ExpansionPanel square>
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1c-content"
          id="panel1c-header"
        >
          <div>
            <Checkbox checked={props.selected} onChange={props.select}>{renderColName(props.name, props.rename)}</Checkbox>
          </div>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails className={classes.details}>
          <div className={classes.column}>
            <TextField {...inputProps} />
          </div>
          <div className={classes.column}>
            <div className={classes.group}>
              <label className={classes.label}>Change Order</label>
              <Stepper min={1} max={props.cols.length} step={1} pageSteps={1} value={props.id + 1} onValueChange={value => props.changeOrder(value)} className={classes.stepper} />
            </div>
          </div>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    </div>
  );

}

export default Column;
