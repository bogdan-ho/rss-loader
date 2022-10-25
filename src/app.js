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
      errors: [],
    },
    feeds: [],
    posts: [],
    links: [],
    readedPosts: [],
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
    const schema = yup.string().required()
      .url()
      .notOneOf(feeds);
    // console.log(`state.links is ${JSON.stringify(state.links)}`);
    // console.log(`feeds is ${JSON.stringify(feeds)}`);

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
    // console.log(`rssUrl is ${rssUrl}`);

    validate(watchedState.links, rssUrl)
      .then((validUrl) => {
        // console.log(`validUrl is ${validUrl}`);
        // console.log(`then state is ${JSON.stringify(watchedState)}`);

        watchedState.links.push(validUrl);
        const proxiedUrl = createProxiedUrl(validUrl);
        // console.log(`proxiedUrl is ${proxiedUrl}`);
        axios.get(proxiedUrl)
          .then((content) => {
            watchedState.form.process = 'success';
            watchedState.links.push(validUrl);

            // console.log(`content is ${JSON.stringify(content)}`);
            try {
              const { feed, posts } = parser(content);
              const feedId = _.uniqueId();
              const formattedPosts = posts.map((post) => ({ ...post, validUrl, feedId }));

              watchedState.feeds.push({ ...feed, validUrl, feedId });
              const previousPosts = watchedState.posts;
              watchedState.posts = previousPosts.concat(formattedPosts);
            } catch (err) {
              // handle parser errors
              watchedState.form.process = 'fail';
              watchedState.form.errors = err.message;
            }
            // console.log(`feed is ${feed}`);
            // console.log(`state after adding feed is ${JSON.stringify(watchedState)}`);
          }).catch((err) => {
            // console.log(`catch after axios is  ${JSON.stringify(err)}`);
            // console.log(`err.message is  ${JSON.stringify(err.message)}`);
            // handle axios errors
            watchedState.form.process = 'fail';
            watchedState.form.errors = err.name;
          });
      })
      .catch((err) => {
        watchedState.form.process = 'fail';

        // handle validation errors
        watchedState.form.errors = err.message;

        // console.log(`catch state is ${JSON.stringify(watchedState)}`);
      });
  });

  postsEl.addEventListener('click', (e) => {
    const postLink = e.target.href ?? e.target.previousElementSibling.href;
    const currentPost = watchedState.posts.find((post) => post.link === postLink);
    // console.log(`currentPost is ${JSON.stringify(currentPost)}`);
    if (!currentPost) return;

    watchedState.currentPost = currentPost;
    watchedState.readedPosts.push(currentPost);
  });

  const updatePosts = () => {
    const { feeds, posts } = watchedState;

    const promise = feeds.map((feed) => {
      const { validUrl, feedId } = feed;
      const proxiedUrl = createProxiedUrl(validUrl);

      const getNewPosts = axios.get(proxiedUrl)
        .then((content) => {
          const oldPosts = posts.filter((post) => post.feedId === feedId);
          // console.log(`oldPosts is ${JSON.stringify(oldPosts)}`);

          const currentPosts = parser(content).posts;
          const formattedPosts = currentPosts.map((post) => ({ ...post, validUrl, feedId }));
          // console.log(`formattedPosts is ${JSON.stringify(formattedPosts)}`);

          const oldPostsNoPostId = oldPosts.map((post) => {
            const { title, description, link } = post;
            return { title, description, link };
          });
          const currentPostsNoPostId = formattedPosts.map((post) => {
            const { title, description, link } = post;
            return { title, description, link };
          });

          const postsDiff = _.differenceWith(currentPostsNoPostId, oldPostsNoPostId, _.isEqual);
          // console.log(`postsDiff is ${JSON.stringify(postsDiff)}`);

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
