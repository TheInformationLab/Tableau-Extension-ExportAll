import XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Declare this so our linter knows that tableau is a global object
/* global tableau */


//array_move function from stackoverflow solution:
//https://stackoverflow.com/questions/5306680/move-an-array-element-from-one-array-position-to-another
function array_move(arr, old_index, new_index) {
  if (new_index >= arr.length) {
      var k = new_index - arr.length + 1;
      while (k--) {
          arr.push(undefined);
      }
  }
  arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
  return arr; // for testing
};

const saveSettings = () => new Promise((resolve, reject) => {
  console.log('[func.js] Saving settings');
  tableau.extensions.settings.set('metaVersion', 2);
  console.log('[func.js] Authoring mode', tableau.extensions.environment.mode);
  if (tableau.extensions.environment.mode === "authoring") {
    tableau.extensions.settings.saveAsync()
    .then(newSavedSettings => {
      //console.log('[func.js] newSavedSettings', newSavedSettings);
      resolve(newSavedSettings);
    }).catch(reject);
  } else {
    resolve();
  }
  
});

const setSettings = (type, value) => new Promise((resolve, reject) => {
  console.log('[func.js] Set settings', type, value);
  let settingKey = '';
  switch(type) {
    case 'sheets':
      settingKey = 'selectedSheets';
      break;
    case 'label':
      settingKey = 'buttonLabel';
      break;
    case 'style':
      settingKey = 'buttonStyle';
      break;
    case 'filename':
      settingKey = 'filename';
      break;
    case 'version':
      settingKey = 'metaVersion';
      break;
    default:
      settingKey = 'unknown';
  }
  tableau.extensions.settings.set(settingKey, JSON.stringify(value));
  resolve();
});

const getSheetColumns = (sheet, existingCols, modified) => new Promise((resolve, reject) => {
  sheet.getSummaryDataAsync({ignoreSelection: true}).then((data) => {
    //console.log('[func.js] Sheet Summary Data', data);
    console.log('[func.js] getSheetColumns existingCols', JSON.stringify(existingCols));
    const columns = data.columns;
    let cols = [];
    const existingIdx = [];
    if (modified) {
      for (var j = 0; j < columns.length; j++) {
        //console.log(columns[j]);
        var col = {};
        col.index = columns[j].index;
        col.name = columns[j].fieldName;
        col.dataType = columns[j].dataType;
        col.changeName = null;
        col.selected = false;
        cols.push(col);
      }
      for (var i = 0; i < existingCols.length; i++) {
        if (existingCols[i] && existingCols[i].hasOwnProperty("name")) {
          existingIdx.push(existingCols[i].name);
        }
      }
      console.log('[func.js] getSheetColumns existingIdx', existingIdx);
      let maxPos = existingIdx.length;
      cols = cols.map((col, idx) => {
        //console.log('[func.js] getSheetColumns Looking for col', col);
        const eIdx = existingIdx.indexOf(col.name);
        const ret = {...col};
        if (eIdx > -1) {
          ret.selected = existingCols[eIdx].selected;
          ret.changeName = existingCols[eIdx].changeName;
          ret.order = eIdx;
        } else {
          ret.order = maxPos;
          maxPos += 1;
        }
        return ret;
      });
    } else {
      for (var k = 0; k < columns.length; k++) {
        var newCol = {};
        newCol.index = columns[k].index;
        newCol.name = columns[k].fieldName;
        newCol.dataType = columns[k].dataType;
        newCol.selected = true;
        newCol.order = k + 1;
        cols.push(newCol);
      }
    }
    cols = cols.sort((a, b) => (a.order > b.order) ? 1 : -1)
    resolve(cols);
  })
  .catch(error => {
    console.log('[func.js] Error with getSummaryDataAsync', sheet, error);
  });
});

const initializeMeta = () => new Promise((resolve, reject) => {
  console.log('[func.js] Initialise Meta');
  var promises = [];
  const worksheets = tableau.extensions.dashboardContent._dashboard.worksheets;
  //console.log('[func.js] Worksheets in dashboard', worksheets);
  var meta = worksheets.map(worksheet => {
    var sheet = worksheet;
    var item = {};
    item.sheetName = sheet.name;
    item.selected = false;
    item.changeName = null;
    item.customCols = false;
    promises.push(getSheetColumns(sheet, null, false));
    return item;
  });

  console.log(`[func.js] Found ${meta.length} sheets`, meta);

  Promise.all(promises).then((sheetArr) => {
    for (var i = 0; i < sheetArr.length; i++) {
      var sheetMeta = meta[i];
      sheetMeta.columns = sheetArr[i];
      meta[i] = sheetMeta;
      console.log(`[func.js] Added ${sheetArr[i].length} columns to ${sheetMeta.sheetName}`, meta);
    }
    //console.log(`[func.js] Meta initialised`, meta);
    resolve(meta);
  });
});

const revalidateMeta = (existing) => new Promise((resolve, reject) => {
  console.log('[func.js] Revalidate Meta');
  var promises = [];
  const worksheets = tableau.extensions.dashboardContent._dashboard.worksheets;
  //console.log('[func.js] Worksheets in dashboard', worksheets);
  var meta = worksheets.map(worksheet => {
    var sheet = worksheet;
    const sheetIdx = existing.findIndex((e) => {
      return e.sheetName === sheet.name;
    });
    if (sheetIdx > -1) {
      console.log(`[func.js] Existing sheet ${sheet.name} columns`, JSON.stringify(existing[sheetIdx].columns));
      promises.push(getSheetColumns(sheet, existing[sheetIdx].columns, true));
      existing[sheetIdx].existed = true;
      return existing[sheetIdx];
    } else {
      var item = {};
      item.sheetName = sheet.name;
      item.selected = false;
      item.changeName = null;
      item.customCols = false;
      item.existed = false;
      promises.push(getSheetColumns(sheet, null, false));
      return item;
    }
  });

  console.log(`[func.js] Found ${meta.length} sheets`, meta);

  Promise.all(promises).then((sheetArr) => {

    for (var i = 0; i < sheetArr.length; i++) {
      var sheetMeta = meta[i];
      sheetMeta.columns = sheetArr[i];
      meta[i] = sheetMeta;
      //console.log(`[func.js] Added ${sheetArr[i].length} columns to ${sheetMeta.sheetName}`, meta);
    }
    meta.forEach((sheet, idx) => {
      if (sheet && sheet.sheetName) {
        const eIdx = existing.findIndex((e) => {
          return e.sheetName === sheet.sheetName;
        });
        meta = array_move(meta, idx, eIdx);
      } else {
        console.log('[func.js] Sheet ordering issue. No sheet defined in idx', idx);
      }
    })
    console.log(`[func.js] Meta revalidated`, JSON.stringify(meta));
    resolve(meta);
  });
});

const exportToExcel = (meta, env, filename) => new Promise((resolve, reject) => {
  let xlsFile = "export.xlsx";
  if (filename && filename.length > 0) {
    xlsFile = filename + ".xlsx";
  }
  buildExcelBlob(meta).then(wb => {
    // add ignoreEC:false to prevent excel crashes during text to column
    var wopts = { bookType:'xlsx', bookSST:false, type:'array', ignoreEC:false };
    var wbout = XLSX.write(wb,wopts);
    saveAs(new Blob([wbout],{type:"application/octet-stream"}), xlsFile);
    resolve();
  });
});



// krisd: move excel creation to caller (to support extra export to methodss)
// callback receives a blob to save or transfer
const buildExcelBlob = (meta) => new Promise((resolve, reject) => {
  console.log("[func.js] Got Meta", meta);
  // func.saveSettings(meta, function(newSettings) {
    // console.log("Saved settings", newSettings);
  const worksheets = tableau.extensions.dashboardContent.dashboard.worksheets;
  const wb = XLSX.utils.book_new();
  let totalSheets = 0;
  let sheetCount = 0;
  const sheetList = [];
  const columnList = [];
  const tabNames = [];
  for (let i =0; i < meta.length; i++) {
    if (meta[i] && meta[i].selected) {
      let tabName = meta[i].changeName || meta[i].sheetName;
      tabName = tabName.replace(/[*?/\\[\]]/gi, '');
      sheetList.push(meta[i].sheetName);
      tabNames.push(tabName);
      columnList.push(meta[i].columns);
      totalSheets = totalSheets + 1;
    }
  }
  sheetList.map((metaSheet, idx) => {
    //console.log("[func.js] Finding sheet", metaSheet, worksheets);
    const sheet = worksheets.find(s => s.name === metaSheet);
    // eslint-disable-next-line
    sheet.getSummaryDataAsync({ignoreSelection: true}).then((data) => {
      const columns = data.columns;
      const columnMeta = columnList[sheetCount];
      const headerOrder = [];
      columnMeta.map((colMeta, idx) => {
        if (colMeta && colMeta.selected) {
          headerOrder.push(colMeta.changeName || colMeta.name);
        }
        return colMeta;
      });
      columns.map((column, idx) => {
        //console.log("[func.js] Finding column", column.fieldName, columnMeta);
        const objCol = columnMeta.find(o => o.name === column.fieldName);
        if (objCol) {
          let col = { ...column, selected: objCol.selected  }
          col.outputName = objCol.changeName || objCol.name;
          columns[idx] = col;
          return col;
        } else {
          return null;
        }
      });
      //console.log("[func.js] Running decodeRows", columns, data.data);
      decodeDataset(columns, data.data)
        .then((rows) => {
          //console.log("[func.js] decodeRows returned", rows);
          console.log("[func.js] Header Order", headerOrder);
          var ws = XLSX.utils.json_to_sheet(rows, {header: headerOrder});
          var sheetname = tabNames[sheetCount];
          sheetCount = sheetCount + 1;
          XLSX.utils.book_append_sheet(wb, ws, sheetname);
          if (sheetCount === totalSheets) {
            resolve(wb);
          }
      });
    });
    return sheet;
  });
});


// krisd: Remove recursion to work with larger data sets
// and translate cell data types
const decodeDataset = (columns, dataset) => new Promise((resolve, reject) => {
  let promises = [];
  for (let i=0; i<dataset.length; i++) {
    promises.push(decodeRow(columns, dataset[i]));
  }
  Promise.all(promises).then((datasetArr) => {
    //console.log('[func.js] datasetArr', datasetArr);
    resolve(datasetArr);
  });

});

const decodeRow = (columns, row) => new Promise((resolve, reject) => {
  let meta = {};
  for (let j = 0; j < columns.length; j++) {
    if (columns[j].selected) {
      // krisd: let's assign the sheetjs type according to the summary data column type
      let dtype = undefined;
      let dval = undefined;
      // console.log('[func.js] Row', row[j]);
      if (row[j].value === '%null%' && row[j].nativeValue === null && row[j].formattedValue === 'Null') {
        dtype = 'z';
        dval = null;
      } else {
        switch (columns[j]._dataType) {
          case 'int':
          case 'float':
            dtype = 'n';
            dval = Number(row[j].value);  // let nums be raw w/o formatting
            if (isNaN(dval)) dval = row[j].formattedValue;  // protect in case issue
            break;
          case 'date':
          case 'date-time':
            dtype = 's';
            dval = row[j].formattedValue;
            break;
          case 'bool':
            dtype = 'b';
            dval = row[j].value;
            break;
          default:
            dtype = 's';
            dval = row[j].formattedValue;
        }
      }
      let o = {v:dval, t:dtype};
      meta[columns[j].outputName] = o;
    }
  }
  resolve(meta);
});



export {
  initializeMeta,
  revalidateMeta,
  saveSettings,
  setSettings,
  exportToExcel,
}
