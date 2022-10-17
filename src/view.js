/* eslint-disable no-console */
import onChange from 'on-change';

const urlInput = document.querySelector('#url-input');
const feedbackEl = document.querySelector('.feedback');

const renderValidationSuccess = () => {
  urlInput.classList.remove('is-invalid');
  urlInput.value = '';
  urlInput.focus();

  feedbackEl.classList.remove('text-danger');
  feedbackEl.classList.add('text-success');
  feedbackEl.textContent = 'RSS успешно загружен';
};

const renderValidationFail = (validationErrors) => {
  urlInput.classList.add('is-invalid');

  feedbackEl.classList.remove('text-success');
  feedbackEl.classList.add('text-danger');
  feedbackEl.textContent = `${validationErrors}`;
};

export default (state) => onChange(state, (path, value, previousValue) => {
  console.log(`path is ${path}`);

  console.log(`value is ${JSON.stringify(value)}`);
  console.log(`value.at(-1) is ${JSON.stringify(value.at(-1))}`);
  const currentFeed = value.at(-1);
  const { urlValid, validationErrors } = currentFeed;

  console.log(`urlValid is ${urlValid}`);
  console.log(`validationErrors is ${JSON.stringify(validationErrors)}`);

  console.log(`previousValue is ${JSON.stringify(previousValue)}`);

  if (urlValid) {
    console.log(`urlValid is ${urlValid} let's change`);
    renderValidationSuccess();
  } else {
    console.log(`urlValid is ${urlValid} let's change`);
    renderValidationFail(validationErrors);
  }
});
