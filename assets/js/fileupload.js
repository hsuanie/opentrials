require('blueimp-file-upload/js/jquery.fileupload');


$(() => {
  'use strict';

  $('.direct-upload').find('input:file').each((i, elem) => {
    const fileInput = $(elem);
    const form = $(fileInput.parents('form:first'));
    const submitButton = form.find('[type="submit"]');
    const progressText = submitButton.find('.progress-text');
    const contentTypeInput = $('<input type="hidden" name="Content-Type" />').prependTo(form);

    fileInput.fileupload({
      fileInput,
      url: form.data('url'),
      type: 'POST',
      autoUpload: false,
      multipart: true,
      replaceFileInput: false,
      add(_, data) {
        const contentType = data.files[0].type;
        contentTypeInput.attr('value', contentType);

        form.off('submit').on('submit', (e) => {
          e.preventDefault();
          data.submit();
        });
      },
      progressall(e, data) {
        const progress = parseInt((data.loaded / data.total) * 100, 10);
        progressText.text(`${progress}%`);
      },
      start() {
        submitButton.prop('disabled', true);
        progressText.text('0%');
      },
      done: _addResponseAndSubmit(form),
      fail: _addResponseAndSubmit(form),
    });
  });

  function _addResponseAndSubmit(form) {
    return function (e, data) {
      const response = $('<input />', {
        type: 'hidden',
        name: 'response',
        value: data.jqXHR.responseText,
      });
      const responseStatus = $('<input />', {
        type: 'hidden',
        name: 'responseStatus',
        value: data.jqXHR.status,
      });
      form.append(response, responseStatus);

      form.off('submit').submit();
    };
  }
});
