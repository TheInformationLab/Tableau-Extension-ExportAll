import React, { useEffect } from 'react';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import './DesktopExport.css';
// import { exportToExcel } from '../func/func';

// Declare this so our linter knows that tableau is a global object
/* global tableau */

function DesktopExport() {

  console.log('[DesktopExport.js] Initialise Export Screen');

  const emailMessage = `Hi Michael,

I'm such a huge fan of the Export All extension created by Craig Bloodworth. Trouble is my users make use of Tableau Desktop just as much as Server and I really want them to feel the same love for all things data in Excel. Please please please please enable the downloads API in extensions. It would make such a huge difference to my Tableau life. I promise I won't export all my data, just the important stuff.

Thanks so much for your time and helping to build an amazing product!`;

  const encodedMessage = encodeURI(emailMessage);
  const hrefEncoded = 'mailto:mkovner@tableau.com?cc=craig.bloodworth@theinformationlab.co.uk&subject=Please%20Enable%20Downloads%20in%20Desktop%20Extensions&body=' + encodedMessage;

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
          <p>Wouldn't it be amazing for your Excel file to be downloading right now? Trouble is you're using Tableau Desktop and the extensibility team haven't enabled the downloads API for the built-in browser that extensions use. If you <b>publish your awesome dashboard to Tableau Server</b> and use the Export All button in your regular browser, it will work just fine! Even IE11 :-)</p>
          <p>If, like me, you think that Tableau should enable downloads in Desktop then please send your request to Michael Kovner (<a href={hrefEncoded}>click this to get a pre-written email</a>).</p>
          <p>Thanks for your help!</p>
          <p>Craig</p>
        </Typography>
      </Grid>
    </Grid>
  );
}

export default DesktopExport;
