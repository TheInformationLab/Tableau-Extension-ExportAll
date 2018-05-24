const sheetSettingsKey = 'selectedSheets';
const buttonLabelKey = "buttonLabel";

var func = {};

func.saveSettings = function(meta, callback) {
  tableau.extensions.settings.set(sheetSettingsKey, JSON.stringify(meta));
  tableau.extensions.settings.saveAsync().then((newSavedSettings) => {
    callback(newSavedSettings);
  });
}

func.getSheetColumns = function(sheet, existingCols, modified, callback) {
  sheet.getSummaryDataAsync({ignoreSelection: true}).then((data) => {
    var columns = data.columns;
    var cols = [];
    var existingNames = [];
    if (modified) {
      for (var i = 0; i < existingCols.length; i++) {
        existingNames.push(existingCols[i].name);
      }
      for (var j = 0; j < columns.length; j++) {
        //console.log(columns[j]);
        var col = {};
        col.name = columns[j].fieldName;
        col.dataType = columns[j].dataType;
        if (existingNames.indexOf(columns[j].fieldName) > -1) {
          var ind = existingNames.indexOf(columns[j].fieldName);
          col.selected = existingCols[ind].selected;
        } else {
          col.selected = false;
        }
        cols.push(col);
      }
    } else {
      for (var j = 0; j < columns.length; j++) {
        var col = {};
        col.name = columns[j].fieldName;
        col.selected = true;
        cols.push(col);
      }
    }
    callback(cols);
  });
}

func.initializeMeta = function(callback) {
  var meta = [];
  worksheets = tableau.extensions.dashboardContent._dashboard.worksheets;
  var sheetInd = 0;
  for (var i =0; i < worksheets.length; i++) {
    var sheet = worksheets[i];
    var item = {};
    item.sheetName = sheet.name;
    item.selected = false;
    item.customCols = false;
    meta.push(item);
    func.getSheetColumns(sheet, null, false, function(cols) {
      var sheetMeta = meta[sheetInd];
      sheetMeta.columns = cols;
      meta[sheetInd] = sheetMeta;
      sheetInd  = sheetInd + 1;
      if (sheetInd == worksheets.length) {
        callback(meta);
      }
    });
  }
}

func.getMeta = function(callback) {
  // Do settings already exist?
  console.log("Checking for existing settings");
  if(tableau.extensions.settings.get(sheetSettingsKey)) {
    console.log("Settings exist. Recovering");
    var meta = [];
    var settings = JSON.parse(tableau.extensions.settings.get(sheetSettingsKey));
    worksheets = tableau.extensions.dashboardContent._dashboard.worksheets;
    var existingSheets = [];
    var sheetInd = 0;
    for (var i =0; i < settings.length; i++) {
      existingSheets.push(settings[i].sheetName);
    }
    for (var i =0; i < worksheets.length; i++) {
      var sheet = worksheets[i];

      // Is the sheet already known?
      if (existingSheets.indexOf(sheet.name) > -1) {
        var item = settings[existingSheets.indexOf(sheet.name)];
        meta.push(item);
        func.getSheetColumns(sheet, item.columns, item.customCols, function(cols) {
          var sheetMeta = meta[sheetInd];
          sheetMeta.columns = cols;
          meta[sheetInd] = sheetMeta;
          sheetInd  = sheetInd + 1;
          if (sheetInd == worksheets.length) {
            callback(meta);
          }
        });
      } else {
        var item = {};
        item.sheetName = sheet.name;
        item.selected = false;
        meta.push(item);
        func.getSheetColumns(sheet, null, false, function(cols) {
          var sheetMeta = meta[sheetInd];
          sheetMeta.columns = cols;
          meta[sheetInd] = sheetMeta;
          sheetInd  = sheetInd + 1;
          if (sheetInd == worksheets.length) {
            callback(meta);
          }
        });
      }
    }
  } else {
    console.log("No settings found. Initialize Meta");
    func.initializeMeta(function(meta) {
      callback(meta);
    });
  }
}

func.updateMetaSheet = function(sheetName, checked) {
  var settings = JSON.parse(tableau.extensions.settings.get(sheetSettingsKey));
  for (var i = 0; i < settings.length; i++) {
    if (settings[i].sheetName == sheetName) {
      var set = settings[i];
      set.selected = checked;
      settings[i] = set;
      func.saveSettings(settings, function(savedSettings) {
        console.log("Settings updated", savedSettings);
      });
      break;
    }

  }
}

func.updateMetaColumn = function(sheetName, columnName, checked) {
  var settings = JSON.parse(tableau.extensions.settings.get(sheetSettingsKey));
  for (var i = 0; i < settings.length; i++) {
    if (settings[i].sheetName == sheetName) {
      var sheet = settings[i];
      sheet.customCols = true;
      var cols = sheet.columns;
      for (var j = 0; j < cols.length; j++) {
        if (cols[j].name == columnName) {
          var col = cols[j];
          col.selected = checked;
          cols[j] = col;
          settings[i].columns = cols;
          func.saveSettings(settings, function(savedSettings) {
            console.log("Settings updated", savedSettings);
          });
          break;
        }
      }
      break;
    }
  }
}
