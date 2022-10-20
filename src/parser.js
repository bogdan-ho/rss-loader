const getFeed = (domDoc) => {
  const title = domDoc.querySelector('channel > title').textContent;
  const description = domDoc.querySelector('channel > description').textContent;

  return { title, description };
};

const getPosts = (domDoc) => {
  const items = domDoc.querySelectorAll('channel item');
  const posts = [];
  items.forEach((item) => {
    const title = item.querySelector('title').textContent;
    const description = item.querySelector('description').textContent;
    const link = item.querySelector('link').textContent;

    posts.push({ title, description, link });
  });

  return posts;
};

export default (content) => {
  const { contents } = content.data;
  const parser = new DOMParser();
  const domDoc = parser.parseFromString(contents, 'text/xml');
  const parserError = domDoc.querySelector('parsererror');

  if (parserError) {
    throw new Error(parserError);
  }

  const feed = getFeed(domDoc);
  const posts = getPosts(domDoc);

  return { feed, posts };
};
