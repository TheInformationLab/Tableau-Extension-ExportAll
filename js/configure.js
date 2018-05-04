const sheetSettingsKey = 'selectedSheets';
var worksheets = [];
var selectedSheets = [];

$(document).ready(function () {
    tableau.extensions.initializeDialogAsync().then(function (openPayload) {

      $('#saveBtn').click(saveSettings);
      $('#cancelBtn').click(closeSettings);

      if(tableau.extensions.settings.get(sheetSettingsKey)) {
        selectedSheets = JSON.parse(tableau.extensions.settings.get(sheetSettingsKey));
      }

      worksheets = tableau.extensions.dashboardContent._dashboard.worksheets;
      for (var i =0; i < worksheets.length; i++) {
        var sheet = worksheets[i];
        var checked = "";
        if (selectedSheets.indexOf(sheet.name) > -1) {
          checked = " checked";
        }
        var item = `<li class="mdc-list-item checkbox-list-ripple-surface">
        <div class="mdc-form-field">
          <div class="mdc-checkbox">
            <input type="checkbox"
                   id="`+i+`"
                   class="mdc-checkbox__native-control"`+checked+`/>
            <div class="mdc-checkbox__background">
              <svg class="mdc-checkbox__checkmark"
                   viewBox="0 0 24 24">
                <path class="mdc-checkbox__checkmark-path"
                      fill="none"
                      stroke="white"
                      d="M1.73,12.91 8.1,19.28 22.79,4.59"/>
              </svg>
              <div class="mdc-checkbox__mixedmark"></div>
            </div>
          </div>

          <label for=`+i+`>`+sheet.name+`</label>
          </div>
        </li>`;
        $('#Sheets').append(item);
      }

      window.mdc.autoInit();
      mdc.tabs.MDCTabBarScroller.attachTo(document.querySelector('#basic-tab-bar'));

    });
  });

  function saveSettings() {
    selectedSheets = [];
    $('.mdc-checkbox__native-control').each(function(i) {
      if ($(this).prop("checked")) {
        selectedSheets.push(worksheets[i].name);
      }
    });
    tableau.extensions.settings.set(sheetSettingsKey, JSON.stringify(selectedSheets));

    tableau.extensions.settings.saveAsync().then((newSavedSettings) => {
      tableau.extensions.ui.closeDialog('done');
    });
  }

  function closeSettings() {
    tableau.extensions.ui.closeDialog('done');
  }
