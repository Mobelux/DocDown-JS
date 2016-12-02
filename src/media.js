function mediaParser(state) {
  const tokens = state.tokens;

  for (const token of tokens) {
    if (token.type === 'inline') {
      const children = token.children;
      for (const childToken of children) {
        if (childToken.type === 'image') {
          let src = childToken.src;
          if (!src.startsWith('http')) {
            if (src.startsWith('./')) {
              src = src.substring(2);
            }
            childToken.src = state.options.media_url + src;
          }
        }
      }
    }
  }
}

module.exports = function media(md, options) {
  md.core.ruler.after('linkify', 'media', mediaParser, options);
};
