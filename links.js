var linker = function(state) {
    var l, x, y, token, children, childToken, href, url, hash, parts,
        tokens = state.tokens;

    for(x = 0, l = tokens.length; x < l; x++) {
        token = tokens[x];
        if (token.type !== 'inline') { continue; }
        children = token.children,
        linkMap = state.options.links.link_map;

        for(y = 0; y < children.length; y++) {
            childToken = children[y];
            if (childToken.type !== 'link_open') { continue; }
            href = childToken.href;
            if (href.includes('#')) {
                parts = href.split('#');
                url = parts[0];
                hash = parts.slice(1).join('#');
            } else {
                url = href;
            }

            if (linkMap && linkMap.hasOwnProperty(url)) {
                childToken.href = linkMap[url];
                if (hash) {
                    childToken.href += ('#' + hash);
                }
            }
        }
    }
};

module.exports = function links(md, options) {
    md.core.ruler.after('linkify', 'links', linker, options);
}
