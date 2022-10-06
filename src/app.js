/* eslint-disable no-console */
import { string } from 'yup';
import axios from 'axios';
import { generateWatchedState } from './view';

export default () => {
  // Model

  // const state = {
  //   feeds: [
  //     {
  //       RSSUrl: new URL('https://ru.hexlet.io/lessons.rss'),
  //       title: 'Новые уроки на Хекслете',
  //       description: 'Практические уроки по программированию',
  //       urlValid: true,
  //       errors: [],
  //     },
  //   ],
  //   items: [
  //     {
  //       RSSurl: new URL('https://ru.hexlet.io/lessons.rss'),
  //       itemUrl: new URL('https://ru.hexlet.io/courses/graphs/lessons/network/theory_unit'),
  //       title: 'Поточная сеть / Теория графов',
  //       description: 'Цель: Объединяем графы и практические задачи',
  //       guid: '2982',
  //       pubDate: new Date('Fri, 07 Oct 2022 16:42:17 +0500'),
  //     },
  //   ],
  // };

  const state = {
    feeds: [],
    items: [],
  };

  // View - взаимодействие с DOM на основе state

  const watchedState = generateWatchedState(state);

  // console.log(`state is ${JSON.stringify(state)}`);
  // Controller - обработчики изменяющие state

  // const validate = (stateForCheck, url) => {
  //   const schema = string()
  //     .url('Ссылка должна быть валидным URL')
  //     .notOneOf(stateForCheck.feeds.map((feed) => feed.rssUrl), 'RSS уже существует');
  //     // где то в этом месте теперь нужно делать http запрос на этот адрес
  //     // и если пришли данные то валидация пройдена и добавляем данные в state

  //   schema.validate(url)
  //     .then(() => {
  //       stateForCheck.feeds.push({
  //         rssUrl: url,
  //         urlValid: true,
  //         validationErrors: [],
  //       });
  //       console.log(`then state is ${JSON.stringify(stateForCheck)}`);
  //     })
  //     .catch((err) => {
  //       stateForCheck.feeds.push({
  //         rssUrl: url,
  //         urlValid: false,
  //         validationErrors: err.errors,
  //       });
  //       console.log(`catch state is ${JSON.stringify(stateForCheck)}`);
  //     });
  // };

  const validate = (stateForCheck, url) => {
    const schema = string()
      .url('Ссылка должна быть валидным URL')
      .notOneOf(stateForCheck.feeds.map((feed) => feed.rssUrl), 'RSS уже существует');
      // где то в этом месте теперь нужно делать http запрос на этот адрес
      // и если пришли данные то валидация пройдена и добавляем данные в state

    return schema.validate(url);
  };

  const rssForm = document.querySelector('.rss-form');

  rssForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const rssUrl = formData.get('url');
    console.log(`rssUrl is ${rssUrl}`);

    validate(watchedState, rssUrl)
      .then(() => {
        watchedState.feeds.push({
          rssUrl,
          urlValid: true,
          validationErrors: [],
        });
        console.log(`then state is ${JSON.stringify(watchedState)}`);
      })
      .catch((err) => {
        watchedState.feeds.push({
          rssUrl,
          urlValid: false,
          validationErrors: err.errors,
        });
        console.log(`catch state is ${JSON.stringify(watchedState)}`);
      });
  });
};
