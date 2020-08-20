import React, { useEffect } from 'react';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import './DesktopExport.css';
// import { exportToExcel } from '../func/func';

// Declare this so our linter knows that tableau is a global object
/* global tableau */

function DesktopExport() {

  console.log('[DesktopExport.js] Initialise Export Screen');

  useEffect(() => {
    console.log('[DesktopExport.js] useEffect');
    //Initialise Extension
    tableau.extensions.initializeDialogAsync().then((openPayload) => {

      console.log('[DesktopExport.js] Initialise Dialog', openPayload);

      let sheetSettings = tableau.extensions.settings.get('selectedSheets');

      if (sheetSettings && sheetSettings != null) {
        // console.log('[DesktopExport.js] Existing Sheet Settings Found', sheetSettings);
        // const meta = JSON.parse(sheetSettings);
        // exportToExcel(meta, 'desktop')
        //   .then((blob) => {
        //     navigator.webkitPersistentStorage.requestQuota (
        //         blob.byteLength, function(grantedBytes) {
        //             window.webkitRequestFileSystem(window.PERSISTENT, grantedBytes, onInitFs, handleError);
        //
        //         }, function(e) { console.log('Error', e); }
        //     );
        //   });
      }

    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Grid
      container
      spacing={0}
      align="left"
      justify="center"
    >
      <Grid item>
        <Typography component="div" style={{padding: 20}}>
          <p>Hi There!</p>
          <p>It looks like you're trying to create the Excel file using a desktop version earlier than 2019.4. Unfortunately you {"can't"} as the download function is disabled, however there are two solutions. Either publish your dashboard to Server where the Excel file will download as expected, or upgrade your copy of Desktop to 2019.4 or greater.</p>
          <p>To those who've previously emailed Tableau to request they enable the download feature...we did it!! Thank you so much for taking the time to present the case, I {"can't"} believe how many emails you sent. {"I'm"} humbled.</p>
          <p>Craig</p>
        </Typography>
      </Grid>
    </Grid>
  );
}

export default DesktopExport;
