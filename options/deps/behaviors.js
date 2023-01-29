/**
 * @file
 * Front-end behaviors on the extension settings page.
 */

// The non-jQuery equivalent of $(document).ready();
document.addEventListener('DOMContentLoaded', function () {
  "use strict";

  /**
   * Create and populate each fieldset.
   */
  let options = {};
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
   * Make a row that can be added to the form, with values in place if provided.
   *
   * @param pattern
   * @param orientation
   * @param bgcolor
   * @returns {HTMLFieldSetElement}
   */
  function buildRow(pattern, orientation, bgcolor) {
    // Defaults (ternary).
    pattern = typeof pattern !== 'undefined' ? pattern : '';
    orientation = typeof orientation !== 'undefined' ? orientation : 'top';
    bgcolor = typeof bgcolor !== 'undefined' ? bgcolor : '#ff0000';

    // Build out a row.
    let row = document.createElement("fieldset");
    row.draggable = true;
    let rowContent = `<div>
      <label>
        <span>Regex Pattern</span>
        <input class="pattern" placeholder=".*\\.local\\/.*" type="text" value="${pattern}">
      </label>
      <label>
        <span>Effect</span>
        <select class="orientation">`;

    for (let i = 0; i < options.orientations.length; i++) {
      rowContent += '<option value="' + options.orientations[i] + '"';
      if (orientation === options.orientations[i]) {
        rowContent += ' selected';
      }
      rowContent += '>' + options.orientations[i] + '</option>';
    }

    rowContent += `
        </select>
      </label>
      <label>
        <span>Color</span>
        <input class="bgcolor" type="color" value="${bgcolor}">
      </label>
    </div><span class="remove">&times;</span>`;

    row.innerHTML = rowContent;
    return row;
  }

  /**
   * When the script loads, fire off a call to the synced values.
   */
  chrome.storage.sync.get('rows', function (items) {
    let row;
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
   *
   * @returns {*[]}
   */
  function getValues() {
    const values = [];
    const rows = options.rowForm.querySelectorAll("fieldset");
    for (let i = 0; i < rows.length; i++) {
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
    const values = getValues();
    chrome.storage.sync.set({'rows': values}, function () {
    });
  }

  /**
   * The form should never submit.
   */
  options.rowForm.addEventListener('submit', function (evt) {
    evt.preventDefault();
  }, false);

  /**
   * Add another row.
   */
  document.querySelector("#add-row").addEventListener('click', function (evt) {
    evt.preventDefault();

    const row = buildRow();
    options.rowForm.appendChild(row);
  }, false);

  /**
   * Listen for remove xs.
   */
  options.rowForm.addEventListener('click', function (evt) {
    if (evt.target.closest('.remove')) {
      options.rowForm.removeChild(evt.target.parentNode);
      saveValues();
    }
  }, false);

  /**
   * Drag and drop rows.
   */
  let srcElem = null;

  /**
   * When a draggable element is clicked and held.
   */
  options.rowForm.addEventListener('dragstart', function (evt) {
    // Only operate on fieldsets and their children.
    if (evt.target !== document && evt.target.closest('fieldset')) {
      srcElem = evt.target.closest('fieldset');

      evt.dataTransfer.effectAllowed = 'move';
      evt.dataTransfer.setData('text/html', srcElem.innerHTML);
    }
  }, false);

  /**
   * When a dragged element invades another element's space.
   */
  options.rowForm.addEventListener('dragenter', function () {
    this.classList.add('over');
  }, false);

  /**
   * When the dragged element leaves another element's airspace.
   */
  options.rowForm.addEventListener('dragleave', function () {
    this.classList.remove('over');
  }, false);

  /**
   * No tutorial has anything but false returns for this event.
   */
  options.rowForm.addEventListener('dragover', function (evt) {
    evt.preventDefault();
    return false;
  }, false);

  /**
   * When the held-and-dragged element is released, determine whether to do
   * anything.
   */
  options.rowForm.addEventListener('drop', function (evt) {
    evt.stopPropagation();

    // If dropped where it was, do nothing. Otherwise let's invert the elements.
    if (srcElem !== evt.target.closest('fieldset')) {
      const thisElem = evt.target.closest('fieldset');
      thisElem.classList.remove('over');

      srcElem.innerHTML = thisElem.innerHTML;
      thisElem.innerHTML = evt.dataTransfer.getData('text/html');

      saveValues();
    }
  }, false);

  /**
   * Any change on the form should trigger a storage sync.
   */
  options.rowForm.addEventListener('change', function (evt) {
    // Ensure selected dropdowns save state when dragged.
    if (evt.target.localName === "select") {
      const selectNode = evt.target,
        selectedElement = selectNode.selectedIndex;
      selectNode.innerHTML = selectNode.innerHTML.replace(/selected(=\".*?\")?/, '');
      selectNode[selectedElement].setAttribute("selected", "true");
    }

    saveValues();
  }, false);
});
