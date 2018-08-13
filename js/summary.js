var tableData = [];

$(document).ready(function () {
    tableau.extensions.initializeDialogAsync().then(function (openPayload) {

      func.getMeta(function(meta) {
        console.log(meta);
        func.saveSettings(meta, function(newSettings) {
          addTabs(meta, function() {
            //mdc.tabs.MDCTabBarScroller.attachTo(document.querySelector('#basic-tab-bar'));
            $('.mdc-tab').click(function() {
              $('.mdc-tab').removeClass('mdc-tab--active');
              $(this).addClass('mdc-tab--active');
              getTable($(this).attr('id'));
            });
          });
          buildTables(meta, function(tableArr) {
            tableData = tableArr;
            getTable(0);
          });
        });
      });

      //window.mdc.autoInit();
    });
  });

function addTabs(meta, callback) {
  $('#basic-tab-bar').html('');
  var tabInd = 0;
  for (var i = 0; i < meta.length; i++) {
    var tab = '';
    if (meta[i].selected) {
      if (tabInd == 0) {
        tab = '<a class="mdc-tab mdc-tab--active" id="'+tabInd+'" data-name="'+meta[i].sheetName+'">'+meta[i].sheetName+'<span class="mdc-tab__indicator"></span>';
      } else {
        tab = '<a class="mdc-tab" id="'+tabInd+'">'+meta[i].sheetName+'<span class="mdc-tab__indicator"></span>';
      }
      $('#basic-tab-bar').append(tab);
      tabInd = tabInd + 1;
    }
  }
  callback();
}

function getTable(id) {
  $('#dataTable').html('');
  var data = tableData[id];
  console.log(id, data);
  // Header class mdc-data-table__header mdc-data-table__header--sortable mdc-data-table__header--numeric
    var table = `<div class="mdc-data-table mdc-data-table--select-multiple">
    <table class="mdc-data-table__content allowCopy" id="selectTable">
      <thead>
        <tr class="mdc-data-table__row">`
    for (var i = 0; i < data.headers.length; i++) {
      var header = data.headers[i];
      table += `<th class="mdc-data-table__header">`+header+`</th>`;
    }
    table +=  `</tr>
      </thead>
      <tbody>`
    var rowCount = data.rows.length;
    var curRow = 0;
    for (var i = 0; i < rowCount; i++) {
      var row = data.rows[i];
      htmlRow(data.headers, row, function(tr) {
        table += `<tr class='mdc-data-table__row'>` + tr + `</tr>`;
        curRow = curRow + 1;
        if (curRow == rowCount) {
          table += `</tbody>
            </table>
          </div>`;
        $('#dataTable').html(table);
        }
      });
    }
  mdc.autoInit();
  // Get elements
  const dataTable = document.querySelector(".mdc-data-table");
  const thead = dataTable.querySelector("thead");
  const tbody = dataTable.querySelector("tbody");
  let sortableEl = null;

  thead.addEventListener("click", e => {
    if(!e.target.classList.contains("mdc-data-table__header--sortable")) return;

    if(sortableEl === e.target) {
      const order = sortableEl.getAttribute("aria-sort");
      sortableEl.setAttribute("aria-sort", order === "descending" ? "ascending" : "descending");
    } else {
      if(sortableEl != null) {
        sortableEl.removeAttribute("aria-sort");
      }
      e.target.setAttribute("aria-sort", "descending")
      sortableEl = e.target;
    }
  });
}

function htmlRow(headers, row, callback) {
  //Cell class mdc-data-table__cell--numeric
  var html = "";
  for (var i = 0; i < headers.length; i++) {
    var html = html + `<td class="mdc-data-table__cell">`+row[headers[i]]+`</td>`;
  }
  callback(html);
}

function buildTables(meta, callback) {
  var worksheets = tableau.extensions.dashboardContent.dashboard.worksheets;
  var totalSheets = sheetCount = 0;
  var sheetList = [];
  var columnList = [];
  var retArr = [];
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
          retArr.push({'rows':rows,'headers':headers});
          sheetCount = sheetCount + 1;
          if (sheetCount == totalSheets) {
            callback(retArr);
          }
        });
      });
    }
  }
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
