/* eslint-disable no-console */
import * as yup from 'yup';
import i18next from 'i18next';
import generateWatchedState from './view';
import languages from './locales/index';

const app = () => {
  // Model

  // создание экземпляра i18next
  const i18n = i18next.createInstance();
  i18n.init({
    lng: 'ru',
    debug: true,
    resources:
      languages,
  }).then(() => {
    yup.setLocale({
      string: {
        url: i18n.t('errors.rssShouldBeValidUrl'),
      },
      mixed: {
        notOneOf: i18n.t('errors.rssAlreadyExist'),
      },
    });
  });

  const state = {
    form: {
      process: '',
      errors: [],
    },
    feeds: [],
    items: [],
    links: [],
    readedPosts: [],
    currentPost: {},
  };
  // View - взаимодействие с DOM на основе state

  const watchedState = generateWatchedState(state);

  // Controller - обработчики изменяющие state

  const validate = (feeds, url) => {
    const schema = yup.string().required()
      .url()
      .notOneOf(state.links);
    console.log(`state.links is ${JSON.stringify(state.links)}`);
    console.log(`feeds is ${JSON.stringify(feeds)}`);

    return schema.validate(url);
  };

  const rssForm = document.querySelector('.rss-form');

  rssForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const rssUrl = formData.get('url');
    console.log(`rssUrl is ${rssUrl}`);

    validate(watchedState.links, rssUrl)
      .then((validUrl) => {
        console.log(`validUrl is ${validUrl}`);
        watchedState.links.push(validUrl);
        console.log(`then state is ${JSON.stringify(watchedState)}`);
      })
      .catch((err) => {
        watchedState.links.push({
          rssUrl,
          urlValid: false,
          validationErrors: err.errors,
        });
        console.log(`catch state is ${JSON.stringify(watchedState)}`);
      });
  });
};

export default app;
