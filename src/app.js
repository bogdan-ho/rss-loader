import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import _ from 'lodash';
import generateWatchedState from './view';
import languages from './locales/index';
import parser from './parser';

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
        url: 'errors.rssShouldBeValidUrl',
      },
      mixed: {
        notOneOf: 'errors.rssAlreadyExist',
      },
    });
  });

  const state = {
    form: {
      process: '',
      errors: '',
    },
    feeds: [],
    posts: [],
    readedPosts: new Set(),
    currentPost: {},
  };

  const elements = {
    rssForm: document.querySelector('.rss-form'),
    urlInput: document.querySelector('#url-input'),
    feedbackEl: document.querySelector('.feedback'),
    formButton: document.querySelector('.rss-form .btn'),
    postsEl: document.querySelector('.posts'),
    feedsEl: document.querySelector('.feeds'),
    modalEl: document.querySelector('#modal'),
    modalTitle: document.querySelector('#modal .modal-title'),
    modalBody: document.querySelector('#modal .modal-body'),
    modalButton: document.querySelector('#modal .btn-primary'),
  };

  // View - взаимодействие с DOM на основе state
  const watchedState = generateWatchedState(state, elements, i18n);

  // Controller - обработчики изменяющие state
  const validate = (feeds, url) => {
    const rssUrls = feeds.map((feed) => feed.rssUrl);
    const schema = yup.string().required()
      .url()
      .notOneOf(rssUrls);

    return schema.validate(url);
  };

  const createProxiedUrl = (url) => {
    const proxy = 'https://allorigins.hexlet.app/';
    const proxyUrl = new URL('/get', proxy);
    const searchParams = new URLSearchParams('');
    searchParams.append('url', url);
    searchParams.append('disableCache', true);
    proxyUrl.search = searchParams;

    return proxyUrl;
  };

  const { rssForm, postsEl } = elements;

  rssForm.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.form.process = 'loading';

    const formData = new FormData(e.target);
    const rssUrl = formData.get('url');

    validate(watchedState.feeds, rssUrl)
      .then((validUrl) => {
        const proxiedUrl = createProxiedUrl(validUrl);
        return proxiedUrl;
      })
      .then((proxiedUrl) => axios.get(proxiedUrl))
      .then((content) => parser(content))
      .then(({ feed, posts }) => {
        const feedId = _.uniqueId();
        const formattedPosts = posts.map((post) => ({ ...post, rssUrl, feedId }));

        watchedState.feeds.push({ ...feed, rssUrl, feedId });
        const previousPosts = watchedState.posts;
        watchedState.posts = previousPosts.concat(formattedPosts);
        watchedState.form.process = 'success';
      })
      .catch((err) => {
        // handle errors
        watchedState.form.errors = '';
        watchedState.form.errors = err.message;
        watchedState.form.process = 'fail';
      });
  });

  postsEl.addEventListener('click', (e) => {
    const postLink = e.target.href ?? e.target.previousElementSibling.href;
    const currentPost = watchedState.posts.find((post) => post.link === postLink);
    if (!currentPost) return;

    const { postId } = currentPost;

    watchedState.currentPost = currentPost;
    watchedState.readedPosts.add(postId);
  });

  const updatePosts = () => {
    const { feeds, posts } = watchedState;

    const promise = feeds.map((feed) => {
      const { validUrl, feedId } = feed;
      const proxiedUrl = createProxiedUrl(validUrl);

      const getNewPosts = axios.get(proxiedUrl)
        .then((content) => {
          const oldPosts = posts.filter((post) => post.feedId === feedId);
          const currentPosts = parser(content).posts;
          const formattedPosts = currentPosts.map((post) => ({ ...post, validUrl, feedId }));

          const oldPostsNoPostId = oldPosts
            .map(({ title, description, link }) => ({ title, description, link }));
          const currentPostsNoPostId = formattedPosts
            .map(({ title, description, link }) => ({ title, description, link }));

          const postsDiff = _.differenceWith(currentPostsNoPostId, oldPostsNoPostId, _.isEqual);
          if (postsDiff.length > 0) {
            postsDiff.forEach((post) => {
              const postId = _.uniqueId();
              watchedState.posts.unshift({ ...post, feedId, postId });
            });
          }
        });

      return getNewPosts;
    });

    Promise.allSettled(promise)
      .finally(() => {
        setTimeout(updatePosts, 5000);
      });
  };
  updatePosts();
};

export default app;
