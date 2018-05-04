const sheetSettingsKey = 'selectedSheets';

$(document).ready(function () {

  $('#exportBtn').click(exportData);

  tableau.extensions.initializeAsync({'configure': configure}).then(function() {
    tableau.extensions.settings.addEventListener(tableau.TableauEventType.SettingsChanged, (settingsEvent) => {
      updateExtensionBasedOnSettings(settingsEvent.newSettings)
    });
    if(!tableau.extensions.settings.get(sheetSettingsKey)) {
      $('#exportBtn').attr("disabled", "disabled");
    } else {
      $('#exportBtn').removeAttr("disabled");
    }
  });
});

function configure() {
  const popupUrl = `${window.location.origin}/configure.html`;
  tableau.extensions.ui.displayDialogAsync(popupUrl, 'Payload Message', { height: 500, width: 500 }).then((closePayload) => {

    if(!tableau.extensions.settings.get(sheetSettingsKey)) {
      $('#exportBtn').attr("disabled", "disabled");
    } else {
      $('#exportBtn').removeAttr("disabled");
    }

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

function exportData() {
  var selectedSheets = tableau.extensions.settings.get(sheetSettingsKey);
  var worksheets = tableau.extensions.dashboardContent.dashboard.worksheets;
  var wb = XLSX.utils.book_new();
  var sheetCount = 0;
  var totalSheets = 0;
  var sheetList = [];
  for (var i = 0; i < worksheets.length; i++) {
    var sheet = worksheets[i];
    if (selectedSheets.indexOf(sheet.name) > -1) {
      totalSheets = totalSheets + 1;
      sheetList.push(sheet.name);
    }
  }
  for (var i = 0; i < worksheets.length; i++) {
    var sheet = worksheets[i];
    if (selectedSheets.indexOf(sheet.name) > -1) {
      sheet.getSummaryDataAsync({ignoreSelection: true}).then((data) => {
        var headers = [];
        var columns = data.columns;
        for (var j = 0; j < columns.length; j++) {
          headers.push(columns[j].fieldName);
        }
        decodeRows(columns, data.data, function(rows) {
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
}

function decodeRows(columns, dataset, callback, ret) {
  if (!ret || ret == null) {
    var retArr = [];
  } else {
    var retArr = ret;
  }
  var thisRow = dataset[0];
  var meta = {};
  for (var j = 0; j < columns.length; j++) {
    meta[columns[j].fieldName] = thisRow[j].formattedValue;
  }
  retArr.push(meta);
  dataset.splice(0,1);
  if (dataset.length == 0) {
    callback(retArr);
  } else {
    decodeRows(columns, dataset, callback, retArr);
  }
}
