var updateMedia = function(state) {
    var l, x, y, token, children, childToken, src,
        tokens = state.tokens;

    for(x = 0, l = tokens.length; x < l; x++) {
        token = tokens[x];
        if (token.type !== 'inline') { continue; }
        children = token.children;

        for(y = 0; y < children.length; y++) {
            childToken = children[y];

            if (childToken.type !== 'image') { continue; }
            src = childToken.src;
            if (! src.startsWith('http')) {
                if (src.startsWith('./')) {
                    src = src.substring(2);
                }
                childToken.src = state.options.media_url + src;
            }
        }
    }
};

module.exports = function media(md, options) {
    md.core.ruler.after('linkify', 'media', updateMedia, options);
}
