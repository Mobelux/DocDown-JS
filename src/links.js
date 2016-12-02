function linkParser(state) {
  const tokens = state.tokens;

  for (const token of tokens) {
    if (token.type === 'inline') {
      const children = token.children;
      const linkMap = state.options.links.link_map;
      let url;
      let hash;

      for (const childToken of children) {
        if (childToken.type === 'link_open') {
          const href = childToken.href;
          if (href.includes('#')) {
            const parts = href.split('#');
            url = parts[0];
            hash = parts.slice(1).join('#');
          } else {
            url = href;
          }

          if (linkMap && linkMap[url]) {
            childToken.href = linkMap[url];
            if (hash) {
              childToken.href += `#${hash}`;
            }
          }
        }
      }
    }
  }
}

module.exports = function links(md, options) {
  md.core.ruler.after('linkify', 'links', linkParser, options);
};
