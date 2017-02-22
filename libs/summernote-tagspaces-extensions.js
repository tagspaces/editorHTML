(function(factory) {
  /* global define */
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['jquery'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node/CommonJS
    module.exports = factory(require('jquery'));
  } else {
    // Browser globals
    factory(window.jQuery);
  }
}(function($) {
  // Extends plugins for adding Checkbox.
  $.extend($.summernote.plugins, {
    /**
     * @param {Object} context - context object has status of editor.
     */
    'checkbox': function(context) {
      const self = this;
      const ui = $.summernote.ui;

      const $editor = context.layoutInfo.editor;

      context.memo('button.checkbox', function() {
        const button = ui.button({
          contents: '<i class="fa fa-check"/>',
          tooltip: 'Add Checkbox / ToDo',
          click: function() {
            context.invoke('insertNode', self.createCheckbox());
          }
        });

        return button.render();
      });

      this.createCheckbox = function() {
        const checkbox = document.createElement('input');
        checkbox.type = "checkbox";
        checkbox.className = "tsCheckBox";

        const span = document.createElement('span');
        span.appendChild(checkbox);
        span.text = " ";
        return span;
      };


      // This events will be attached when editor is initialized.
      this.events = {
        'summernote.init': function(we, e) {
        },
        'summernote.keyup': function(we, e) {
        }
      };

      this.initialize = function() {
        $editor.click(function(event) {
          if (event.target.type && event.target.type == 'checkbox') {
            const checked = $(event.target).is(':checked');
            $(event.target).attr('checked', checked);
            context.invoke('insertText', '');
          }
        });
      };

      this.destroy = function() {

      };
    },

    /**
     * @param {Object} context - context object has status of editor.
     */
    'toggleSelectAllCheckboxes': function(context) {
      const self = this;
      const ui = $.summernote.ui;

      context.memo('button.toggleSelectAllCheckboxes', function() {
        const button = ui.button({
          contents: '<i class="fa fa-check-square"/>',
          tooltip: 'Select/Deselect All Check boxes / ToDo',
          click: function() {
            context.invoke('insertNode', self.selectAllCheckboxes());
          }
        });

        return button.render();
      });

      this.selectAllCheckboxes = function() {
        const inputs = document.getElementsByTagName('input');

        for (var i = 0; i < inputs.length; i++) {
          if (inputs[i].className === 'tsCheckBox' && !inputs[i].hasAttribute('checked')) {
            inputs[i].setAttribute('checked', 'checked');
          } else {
            inputs[i].removeAttribute('checked', 'checked');
          }
        }
        return inputs;
      };


      // This events will be attached when editor is initialized.
      this.events = {
        'summernote.init': function(we, e) {
        },
        'summernote.keyup': function(we, e) {
        }
      };

      this.initialize = function() {
        var layoutInfo = context.layoutInfo;
        var $editor = layoutInfo.editor;

        $editor.click(function(event) {
          if (event.target.type && event.target.className === 'tsCheckBox') {
            const checked = $(event.target).is(':checked');
            $(event.target).attr('checked', checked);
            context.invoke('insertText', '');
          }
        });
      };

      this.destroy = function() {

      };
    }
  });
}));