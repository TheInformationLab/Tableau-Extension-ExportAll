$(document).ready(function () {



  tableau.extensions.initializeAsync({'configure': configure}).then(function() {
    if(tableau.extensions.settings.get(buttonLabelKey)) {
      console.log("label",tableau.extensions.settings.get(buttonLabelKey))
      $('#buttonLabel').html(tableau.extensions.settings.get(buttonLabelKey));
    };
    if (tableau.extensions.environment.context == "desktop") {
      $('#exportBtn').click(exportToWindow);
    } else {
      $('#exportBtn').click(exportToExcel);
    }
    tableau.extensions.settings.addEventListener(tableau.TableauEventType.SettingsChanged, (settingsEvent) => {
      //updateExtensionBasedOnSettings(settingsEvent.newSettings)
      var existingSetting = false;
      $('#exportBtn').attr("disabled", "disabled");
      if(tableau.extensions.settings.get(sheetSettingsKey)) {
        var settings = JSON.parse(tableau.extensions.settings.get(sheetSettingsKey));
        for (var i = 0; i < settings.length; i++) {
          if (settings[i].selected) {
            $('#exportBtn').removeAttr("disabled");
            existingSetting = true;
            break;
          }
        }
      }
      if (!existingSetting) {
        configure();
      }
      if(tableau.extensions.settings.get(buttonLabelKey)) {
        console.log("label",tableau.extensions.settings.get(buttonLabelKey))
        $('#buttonLabel').html(tableau.extensions.settings.get(buttonLabelKey));
      };
    });
    console.log("Checing for existing settings");
    if(!tableau.extensions.settings.get(sheetSettingsKey)) {
      console.log("No settings exist. Initialize meta");
      $('#exportBtn').attr("disabled", "disabled");
      func.initializeMeta(function(meta) {
        console.log("Meta built. Saving", meta);
        func.saveSettings(meta, function(settings) {
          console.log("settings saved", settings);
        });
      });
    } else {
      var meta = JSON.parse(tableau.extensions.settings.get(sheetSettingsKey));
      console.log("Settings found", meta);
      $('#exportBtn').removeAttr("disabled");
    }
  });
});

function configure() {
  const popupUrl = `${window.location.origin}/configure.html`;
  tableau.extensions.ui.displayDialogAsync(popupUrl, 'Payload Message', { height: 500, width: 500 }).then((closePayload) => {

  }).catch((error) => {
    switch(error.errorCode) {
      case tableau.ErrorCodes.DialogClosedByUser:
        console.log("Dialog was closed by user");
        break;
      default:
        console.error(error.message);
    }
  });
}

function exportToWindow() {
  const popupUrl = `${window.location.origin}/summary.html`;
  tableau.extensions.ui.displayDialogAsync(popupUrl, 'Payload Message', { height: 500, width: 800 }).then((closePayload) => {

  }).catch((error) => {
    switch(error.errorCode) {
      case tableau.ErrorCodes.DialogClosedByUser:
        console.log("Dialog was closed by user");
        break;
      default:
        console.error(error.message);
    }
  });
}

function exportToExcel() {
  func.getMeta(function(meta) {
    console.log("Got Meta", meta);
    // func.saveSettings(meta, function(newSettings) {
      // console.log("Saved settings", newSettings);
      var worksheets = tableau.extensions.dashboardContent.dashboard.worksheets;
      var wb = XLSX.utils.book_new();
      var totalSheets = sheetCount = 0;
      var sheetList = [];
      var columnList = [];
      for (var i =0; i < meta.length; i++) {
        if (meta[i].selected) {
          sheetList.push(meta[i].sheetName);
          columnList.push(meta[i].columns);
          totalSheets = totalSheets + 1;
        }
      }
      for (var i = 0; i < worksheets.length; i++) {
        var sheet = worksheets[i];
        if (sheetList.indexOf(sheet.name) > -1) {
          sheet.getSummaryDataAsync({ignoreSelection: true}).then((data) => {
            var headers = [];
            var columns = data.columns;
            var columnMeta = columnList[sheetCount];
            for (var j = 0; j < columnMeta.length; j++) {
              if (columnMeta[j].selected) {
                headers.push(columnMeta[j].name);
              }
            }
            decodeRows(columns, headers, data.data, function(rows) {
              var ws = XLSX.utils.json_to_sheet(rows, {header:headers});
              var sheetname = sheetList[sheetCount];
              sheetCount = sheetCount + 1;
              XLSX.utils.book_append_sheet(wb, ws, sheetname);
              if (sheetCount == totalSheets) {
                var wopts = { bookType:'xlsx', bookSST:false, type:'array' };
                var wbout = XLSX.write(wb,wopts);
                saveAs(new Blob([wbout],{type:"application/octet-stream"}), "export.xlsx");
              }
            });
          });
        }
      }
    // });
  })
}

function decodeRows(columns, headers, dataset, callback, ret) {
  if (!ret || ret == null) {
    var retArr = [];
  } else {
    var retArr = ret;
  }
  var thisRow = dataset[0];
  var meta = {};
  for (var j = 0; j < columns.length; j++) {
    if (headers.indexOf(columns[j].fieldName) > -1) {
      meta[columns[j].fieldName] = thisRow[j].formattedValue;
    }
  }
  retArr.push(meta);
  dataset.splice(0,1);
  if (dataset.length == 0) {
    callback(retArr);
  } else {
    decodeRows(columns, headers, dataset, callback, retArr);
  }
}
