const getFeed = (domDoc) => {
  const title = domDoc.querySelector('channel > title').textContent;
  const description = domDoc.querySelector('channel > description').textContent;
  const link = domDoc.querySelector('channel > link').textContent;

  return { title, description, link };
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
  // console.log(`domDoc is ${JSON.stringify(domDocument)}`);
  const parserError = domDoc.querySelector('parsererror');
  // console.log(`parserError is ${JSON.stringify(parserError)}`);

  if (parserError) {
    throw new Error(parserError);
  }

  const feed = getFeed(domDoc);
  const posts = getPosts(domDoc);
  // console.log(`title is ${JSON.stringify(title)}`);


  return { feed, posts };
};
