// The non-jQuery equivalent of $(document).ready();
document.addEventListener('DOMContentLoaded',function() {
  "use strict";

  /**
   * Create and populate each fieldset.
   */
  var options = {};
  options.rowForm = document.querySelector("form");
  options.orientations = [
    'top',
    'right',
    'bottom',
    'left',
    'cover',
    'replace',
    'background',
    'xor-top'
  ];

  /**
   * Make a row the can be added to the form, with values in place if provided.
   */
  function buildRow(pattern, orientation, bgcolor) {
    // Defaults (ternary).
    pattern = typeof pattern !== 'undefined' ? pattern : '';
    orientation = typeof orientation !== 'undefined' ? orientation : 'top';
    bgcolor = typeof bgcolor !== 'undefined' ? bgcolor : '#ff0000';

    // Build out a row.
    var row = document.createElement("fieldset");
    row.draggable = 'true';
    var rowContent = '<div>';
    rowContent += '<label><span>Regex Pattern</span><input class="pattern" placeholder=".*\\.local\\/.*" type="text" value="';
    rowContent += pattern;
    rowContent += '"></label><label><span>Effect</span><select class="orientation">';
    for (var i = 0; i < options.orientations.length; i++) {
      rowContent += '<option value="' + options.orientations[i] + '"';
      if (orientation === options.orientations[i]) {
        rowContent += ' selected';
      }
      rowContent += '>' + options.orientations[i] + '</option>';
    }
    rowContent += '</select></label><label><span>Color</span><input class="bgcolor" type="color" value="';
    rowContent += bgcolor;
    rowContent += '"></label></div><span class="remove">&times;</span>';
    row.innerHTML = rowContent;
    return row;
  }

  /**
   * When the script loads, fire off a call to the synced values.
   */
  chrome.storage.sync.get('rows', function(items) {
    var row;
    if (items.rows.length < 1) {
      row = buildRow();
      options.rowForm.appendChild(row);
    }
    else {
      for (var i = 0; i < items.rows.length; i++) {
        row = buildRow(
          items.rows[i].pattern,
          items.rows[i].orientation,
          items.rows[i].bgcolor
        );
        options.rowForm.appendChild(row);
      }
    }
  });

  /**
   * Get all values (in order).
   */
  function getValues() {
    var values = [];
    var rows = options.rowForm.querySelectorAll("fieldset");
    for (var i = 0; i < rows.length; i++) {
      values.push({
        'pattern': rows[i].querySelector(".pattern").value,
        'orientation': rows[i].querySelector(".orientation").value,
        'bgcolor': rows[i].querySelector(".bgcolor").value
      });
    }
    return values;
  }

  /**
   * Save retrieved values
   */
  function saveValues() {
    var values = getValues();
    chrome.storage.sync.set({'rows': values}, function() {
      console.log('Sync successful.');
    });
  }

  var findParentFieldset = function (domElement) {
    while (domElement.tagName.toUpperCase() !== 'FIELDSET' && domElement.tagName.toUpperCase() !== 'BODY') {
      domElement = domElement.parentNode;
    }
    if (domElement.tagName.toUpperCase() === 'FIELDSET') {
      return domElement;
    }
    return null;
  };

  /**
   * The form should never submit.
   */
  options.rowForm.addEventListener('submit', function(evt) {
    evt.preventDefault();
  }, false);

  /**
   * Add another row.
   */
  document.querySelector("#add-row").addEventListener('click', function(evt) {
    var row = buildRow();
    options.rowForm.appendChild(row);
    evt.preventDefault();
  }, false);

  /**
   * Listen for remove xs.
   */
  options.rowForm.addEventListener('click', function(evt) {
    if (evt.toElement.classList[0] === 'remove') {
      options.rowForm.removeChild(evt.toElement.parentNode);
      saveValues();
    }
  }, false);

  /**
   * Drag and drop rows.
   */
  var srcElem = null;

  options.rowForm.addEventListener('dragstart', function(evt) {
    evt.dataTransfer.effectAllowed = 'move';
    evt.dataTransfer.setData('text/html', evt.srcElement.innerHTML);
    srcElem = evt.srcElement;
  }, false);

  options.rowForm.addEventListener('dragenter', function(evt) {
    var targetElement = findParentFieldset(evt.srcElement);

    if (targetElement) {
      targetElement.classList.add('over');
    }
  }, false);

  options.rowForm.addEventListener('dragleave', function(evt) {
    var targetElement = findParentFieldset(evt.srcElement);

    if (targetElement) {
      targetElement.classList.remove('over');
    }
  }, false);

  options.rowForm.addEventListener('dragover', function(evt) {
    evt.preventDefault();
  }, false);

  options.rowForm.addEventListener('drop', function(evt) {
    var targetElement = findParentFieldset(evt.srcElement);

    if (targetElement) {
      targetElement.classList.remove('over');
      srcElem.innerHTML = targetElement.innerHTML;
      targetElement.innerHTML = evt.dataTransfer.getData('text/html');
      saveValues();
    }
  }, false);

  /**
   * Any change on the form should trigger a storage sync.
   */
  options.rowForm.addEventListener('change', function(evt){
    // Ensure selected dropdowns save state when dragged.
    if (evt.srcElement.localName === "select") {
      var selectNode = evt.srcElement,
          selectedElement = selectNode.selectedIndex;
      selectNode.innerHTML = selectNode.innerHTML.replace(/selected(=\".*?\")?/, '');
      selectNode[selectedElement].setAttribute("selected", "true");
    }

    saveValues();
  }, false);
});

