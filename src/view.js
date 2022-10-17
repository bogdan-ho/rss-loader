/* eslint-disable no-console */
import onChange from 'on-change';

const renderErrors = (value, elements, i18n) => {
  const { feedbackEl } = elements;
  switch (value) {
    case ('errors.rssShouldBeValidUrl'):
      feedbackEl.textContent = i18n.t(value);
      break;
    case ('errors.rssAlreadyExist'):
      feedbackEl.textContent = i18n.t(value);
      break;
    default:
      break;
  }
};

const renderSuccessStatus = (value, elements, i18n) => {
  const { urlInput, feedbackEl, formButton } = elements;
  formButton.disabled = false;

  urlInput.classList.remove('is-invalid');
  urlInput.value = '';
  urlInput.focus();

  feedbackEl.classList.remove('text-danger');
  feedbackEl.classList.add('text-success');
  feedbackEl.textContent = i18n.t(value);
};

const renderFailStatus = (elements) => {
  const { urlInput, feedbackEl, formButton } = elements;
  formButton.disabled = false;
  urlInput.classList.add('is-invalid');

  feedbackEl.classList.remove('text-success');
  feedbackEl.classList.add('text-danger');
};

const renderFormLoading = (elements) => {
  const { rssForm, formButton } = elements;

  rssForm.focus();
  console.log(`formButton.disabled is ${formButton.disabled}`);
  formButton.disabled = true;
};

const renderProcessStatus = (value, elements, i18n) => {
  switch (value) {
    case ('loading'):
      renderFormLoading(elements);
      break;
    case ('success'):
      renderSuccessStatus(value, elements, i18n);
      break;
    case ('fail'):
      renderFailStatus(elements);
      break;
    default:
      throw new Error(`Wrong value: ${value}`);
  }
};

export default (state, elements, i18n) => onChange(state, (path, value) => {
  console.log(`path is ${path}`);
  console.log(`value is ${JSON.stringify(value)}`);

  switch (path) {
    case ('form.process'):
      renderProcessStatus(value, elements, i18n);
      break;
    case ('form.errors'):
      console.log(`case ('form.errors') is ${path}`);
      renderErrors(value, elements, i18n);
      break;
    case ('links'):
      console.log(`case ('links') is ${path}`);
      // renderErrors(value, elements, i18n);
      break;
    default:
      throw new Error(path);
  }
});
