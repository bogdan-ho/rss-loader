import onChange from 'on-change';

const renderModal = (value, elements) => {
  const { modalTitle, modalBody, modalButton } = elements;

  const allTitles = elements.postsEl.querySelectorAll('a');
  allTitles.forEach((title) => {
    if (title.href === value.link) {
      title.classList.remove('fw-bold');
      title.classList.add('fw-normal');
    }
  });

  modalTitle.textContent = value.title;
  modalBody.textContent = value.description;
  modalButton.setAttribute('href', value.link);
};

const renderErrors = (value, elements, i18n) => {
  const { feedbackEl } = elements;
  switch (value) {
    case ('errors.rssShouldBeValidUrl'):
      feedbackEl.textContent = i18n.t(value);
      break;
    case ('errors.rssAlreadyExist'):
      feedbackEl.textContent = i18n.t(value);
      break;
    case ('errors.rssNotValid'):
      feedbackEl.textContent = i18n.t(value);
      break;
    case ('AxiosError'):
      feedbackEl.textContent = i18n.t('errors.networkError');
      break;
    default:
      break;
  }
};

const renderFeeds = (value, elements, i18n) => {
  const { feedsEl } = elements;

  const cardEl = document.createElement('div');
  cardEl.classList.add('card', 'border-0');

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  const header = document.createElement('h2');
  header.classList.add('card-title', 'h4');
  header.textContent = i18n.t('feeds');

  const listGroupEls = document.createElement('ul');
  listGroupEls.classList.add('list-group', 'border-0', 'rounded-0');

  value.forEach((feed) => {
    const listGroupItem = document.createElement('li');
    listGroupItem.classList.add('list-group-item', 'border-0', 'border-end-0');

    const feedHeader = document.createElement('h3');
    feedHeader.classList.add('h6', 'm-0');
    feedHeader.textContent = feed.title;

    const feedDescription = document.createElement('p');
    feedDescription.classList.add('m-0', 'small', 'text-black-50');
    feedDescription.textContent = feed.description;

    listGroupItem.append(feedHeader);
    listGroupItem.append(feedDescription);

    listGroupEls.append(listGroupItem);
  });

  cardBody.append(header);
  cardEl.append(cardBody);
  cardEl.append(listGroupEls);
  feedsEl.innerHTML = '';
  feedsEl.append(cardEl);
};

const renderPosts = (value, elements, i18n) => {
  const { postsEl } = elements;

  const cardEl = document.createElement('div');
  cardEl.classList.add('card', 'border-0');

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  const header = document.createElement('h2');
  header.classList.add('card-title', 'h4');
  header.textContent = i18n.t('feeds');

  const listGroupEls = document.createElement('ul');
  listGroupEls.classList.add('list-group', 'border-0', 'rounded-0');

  value.forEach((post) => {
    const listGroupItem = document.createElement('li');
    listGroupItem.classList.add('list-group-item', 'border-0', 'border-end-0', 'd-flex', 'justify-content-between', 'align-items-start');

    const postLink = document.createElement('a');
    postLink.classList.add('fw-bold');
    postLink.setAttribute('href', post.link);
    postLink.setAttribute('target', '_blank');
    postLink.setAttribute('rel', 'noopener noreferrer');
    postLink.setAttribute('data-id', post.postId);
    postLink.textContent = post.title;

    const postButton = document.createElement('button');
    postButton.setAttribute('type', 'button');
    postButton.classList.add('btn', 'btn-outline-primary', 'btn-sm');

    postButton.dataset.id = post.postId;
    postButton.dataset.bsToggle = 'modal';
    postButton.dataset.bsTarget = '#modal';

    postButton.textContent = i18n.t('inspect');

    listGroupItem.append(postLink);
    listGroupItem.append(postButton);

    listGroupEls.append(listGroupItem);
  });

  cardBody.append(header);
  cardEl.append(cardBody);
  cardEl.append(listGroupEls);
  postsEl.innerHTML = '';
  postsEl.append(cardEl);
};

const renderSuccessStatus = (value, elements, i18n) => {
  const {
    rssForm, urlInput, feedbackEl, formButton,
  } = elements;
  formButton.disabled = false;

  urlInput.classList.remove('is-invalid');
  rssForm.reset();
  urlInput.focus();

  feedbackEl.classList.remove('text-muted');
  feedbackEl.classList.remove('text-danger');
  feedbackEl.classList.add('text-success');
  feedbackEl.textContent = i18n.t(value);
};

const renderFailStatus = (elements) => {
  const { urlInput, feedbackEl, formButton } = elements;
  formButton.disabled = false;
  urlInput.classList.add('is-invalid');

  feedbackEl.classList.remove('text-muted');
  feedbackEl.classList.remove('text-success');
  feedbackEl.classList.add('text-danger');
};

const renderFormLoading = (value, elements, i18n) => {
  const { rssForm, formButton, feedbackEl } = elements;

  rssForm.focus();
  formButton.disabled = true;
  feedbackEl.classList.add('text-muted');
  feedbackEl.textContent = i18n.t(value);
};

const renderProcessStatus = (value, elements, i18n) => {
  switch (value) {
    case ('loading'):
      renderFormLoading(value, elements, i18n);
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
  switch (path) {
    case ('form.process'):
      renderProcessStatus(value, elements, i18n);
      break;
    case ('form.errors'):
      renderErrors(value, elements, i18n);
      break;
    case ('feeds'):
      renderFeeds(value, elements, i18n);
      break;
    case ('posts'):
      renderPosts(value, elements, i18n);
      break;
    case ('currentPost'):
      renderModal(value, elements, i18n);
      break;
    default:
      break;
  }
});
