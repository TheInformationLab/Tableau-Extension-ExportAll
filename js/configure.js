$(document).ready(function () {
    tableau.extensions.initializeDialogAsync().then(function (openPayload) {

      $('.resetBtn').click(resetSettings);

      if(tableau.extensions.settings.get(buttonLabelKey)) {
        console.log("label",tableau.extensions.settings.get(buttonLabelKey))
        $('#button-label').val(tableau.extensions.settings.get(buttonLabelKey));
      };

      $('#button-label').on('keyup', function() {
        tableau.extensions.settings.set(buttonLabelKey, $(this).val());
        tableau.extensions.settings.saveAsync();
      });

      $('.mdc-tab').click(function() {
        $('.mdc-tab').removeClass('mdc-tab--active');
        $(this).addClass('mdc-tab--active');
        $('.mdc-card').hide();
        $('.'+$(this).attr('id')+'-card').show();
        mdc.textField.MDCTextField.attachTo(document.querySelector('.mdc-text-field'));
      });

      func.getMeta(function(meta) {
        func.saveSettings(meta, function(newSettings) {
          addSheets(meta, function() {
            buildColumnsForm();
          });
        });
      });

      window.mdc.autoInit();

      mdc.tabs.MDCTabBarScroller.attachTo(document.querySelector('#basic-tab-bar'));
    });
  });

  function addSheets(meta, callback) {
    $('#sheetsList').html('');
    for (var i =0; i < meta.length; i++) {
      var sheet = meta[i];
      var checked = selected = "";
      if (sheet.selected) {
        checked = " checked";
        selected = " selectedIcon";
      }
      var item = `<li class="mdc-list-item checkbox-list-ripple-surface">
          <label for=`+i+`><i class="material-icons`+selected+`" id="icon`+i+`">insert_chart</i><span class="sheetTitle"> `+sheet.sheetName+`</span></label>
          <span class="mdc-list-item__meta">
            <div class="mdc-checkbox">
              <input type="checkbox"
                     data-name="`+sheet.sheetName+`"
                     class="mdc-checkbox__native-control sheetCheckbox"`+checked+`/>
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
          </span>
        </li>`;
      $('#sheetsList').append(item);
    }
    $('.sheetCheckbox').click(function() {
      if ($(this).prop("checked")) {
        $($($(this).parents().eq(2)).find('i')[0]).addClass('selectedIcon');
      } else {
        $($($(this).parents().eq(2)).find('i')[0]).removeClass('selectedIcon');
      }
      func.updateMetaSheet($(this).attr("data-name"),$(this).prop("checked"));
      buildColumnsForm();
    });
    callback();
  }

  function addColumns(settings) {
    console.log("addColumns", settings);
    var name = settings.sheetName;
    var listGroup = `<div class="mdc-list-group">
      <h3 class="mdc-list-group__subheader"><i class="material-icons selectedIcon">insert_chart</i><span class="sheetTitle"> `+name+`</span></h3>
      <ul class="mdc-list mdc-list--dense">`
    var columns = settings.columns;
    for (var i = 0; i < columns.length; i++) {
      //$('#columnsList').append(columns[i].fieldName);
      //listGroup += '<li class="mdc-list-item">'+columns[i].fieldName+'</li>'
      console.log(columns[i]);
      var checked = '';
      if (columns[i].selected) {
        checked = 'checked';
      }
      listGroup += `<li class="mdc-list-item checkbox-list-ripple-surface">
        <label for=`+columns[i].fieldName+i+`>`+columns[i].name+`</label>
        <span class="mdc-list-item__meta">
          <div class="mdc-checkbox">
            <input type="checkbox"
                   data-sheet="`+name+`"
                   data-column="`+columns[i].name+`"
                   class="mdc-checkbox__native-control columnCheckbox"`+checked+`/>
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
        </span>
    </li>`
    }
    $('#columnsList').append(listGroup+'<li role="separator" class="mdc-list-divider"></li></ul>')
    $( "input[data-sheet='"+name+"']" ).click(function() {
      // if ($(this).prop("checked")) {
      //
      // } else {
      //
      // }
      func.updateMetaColumn($(this).attr("data-sheet"),$(this).attr("data-column"),$(this).prop("checked"));
    });
  }

  function buildColumnsForm() {
    $('#columnsList').html('');
    var settings = JSON.parse(tableau.extensions.settings.get(sheetSettingsKey));
    var sheetsSelected = false;
    for (var i = 0; i < settings.length; i++) {
      if (settings[i].selected) {
        addColumns(settings[i]);
        sheetsSelected = true;
      }
    }
    if (!sheetsSelected) {
      $('#columnsList').html('<div style="padding-left: 20px; margin-top: 10px;">No Sheets Selected</div>');
    }
  }

  function resetSettings() {
    func.initializeMeta(function(meta) {
      console.log("Meta built. Saving", meta);
      func.saveSettings(meta, function(settings) {
        console.log("Settinsg reset", settings);
        addSheets(meta, function() {
          buildColumnsForm();
        });
      });
    });
  }
