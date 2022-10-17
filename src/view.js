/* eslint-disable no-console */
import onChange from 'on-change';

const renderValidationSuccess = (elements) => {
  const { urlInput, feedbackEl } = elements;

  urlInput.classList.remove('is-invalid');
  urlInput.value = '';
  urlInput.focus();

  feedbackEl.classList.remove('text-danger');
  feedbackEl.classList.add('text-success');
  feedbackEl.textContent = 'RSS успешно загружен';
};

const renderValidationFail = (validationErrors, elements) => {
  const { urlInput, feedbackEl } = elements;

  urlInput.classList.add('is-invalid');

  feedbackEl.classList.remove('text-success');
  feedbackEl.classList.add('text-danger');
  feedbackEl.textContent = `${validationErrors}`;
};

const renderFormLoading = (elements) => {
  const { rssForm, formButton } = elements;
  rssForm.reset();
  rssForm.focus();
  formButton.disabled = true;
};

const renderProcessStatus = (value, elements) => {
  switch (value) {
    case ('loading'):
      renderFormLoading(elements);
      break;
    case ('success'):
      break;
    case ('fail'):
      break;
    default:
      throw new Error(`Wrong value: ${value}`);
  }
};

export default (state, elements) => onChange(state, (path, value) => {
  console.log(`path is ${path}`);

  console.log(`value is ${JSON.stringify(value)}`);
  console.log(`value.at(-1) is ${JSON.stringify(value.at(-1))}`);

  switch (path) {
    case ('form.process'):
      renderProcessStatus(value, elements);
      break;
    default:
      throw new Error(path);
  }

  // const currentFeed = value.at(-1);
  // const { urlValid, validationErrors } = currentFeed;

  // console.log(`urlValid is ${urlValid}`);
  // console.log(`validationErrors is ${JSON.stringify(validationErrors)}`);

  // console.log(`previousValue is ${JSON.stringify(previousValue)}`);

  // if (urlValid) {
  //   console.log(`urlValid is ${urlValid} let's change`);
  //   renderValidationSuccess(elements);
  // } else {
  //   console.log(`urlValid is ${urlValid} let's change`);
  //   renderValidationFail(validationErrors, elements);
  // }
});
