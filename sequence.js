// |||
// Content
// ![alt text](assets/diagram.jpg)
// |||

'use strict';

var Mustache = require('mustache');

var parser = function sequence(state, startLine, endLine, silent) {
    var marker, len, params, nextLine, mem, context, imgLine,
        haveEndMarker = false,
        pos = state.bMarks[startLine] + state.tShift[startLine],
        max = state.eMarks[startLine],
        options = state.options.sequence,
        mediaUrl = state.options.media_url,
        title,
        image_url = '';

    if (pos + 3 > max) { return false; }

    marker = state.src.charCodeAt(pos);

    if (marker !== 0x7C/* | */) {
        return false;
    }

    // scan marker length
    mem = pos;
    pos = state.skipChars(pos, marker);

    len = pos - mem;

    if (len < 3) { return false; }

    // Since start is found, we can report success here in validation mode
    if (silent) { return true; }

    // search end of block
    nextLine = startLine;

    for (;;) {
        nextLine++;
        if (nextLine >= endLine) {
            // unclosed block should be autoclosed by end of document.
            // also block seems to be autoclosed by end of parent
            break;
        }

        pos = mem = state.bMarks[nextLine] + state.tShift[nextLine];
        max = state.eMarks[nextLine];

        if (state.src.charCodeAt(pos) == 0x21/* ! */) {
            if (silent) {
                return true;
            }
            var line = state.getLines(nextLine, nextLine + 1, 0, false).trim();
            var re = line.match(/!\[((.|\n)*)\]\(((.|\n)*)\)/m);
            if (re) {
                imgLine = line;
                title = re[1];
                if (!title) {
                    title = 'Sequence Diagram';
                }
                image_url = re[3];
                if (image_url.startsWith('./')) {
                    image_url = image_url.substring(2);
                }
                if (!image_url.startsWith('http')) {
                    image_url = mediaUrl + image_url;
                }
            }
        }

        if (state.src.charCodeAt(pos) !== marker) { continue; }

        pos = state.skipChars(pos, marker);

        // closing code fence must be at least as long as the opening one
        if (pos - mem < len) { continue; }

        // make sure tail has spaces only
        pos = state.skipSpaces(pos);

        if (pos < max) { continue; }

        haveEndMarker = true;
        // found!
        break;
    }

    context = {image_url: image_url, title: title};

    state.tokens.push({
        type: 'htmltag',
        content: Mustache.render(options.prefix, context),
        level: state.level
    });

    state.parser.tokenize(state, startLine + 1, nextLine);

    // remove the inline image markdown from the last inline token
    var lastInlineToken = state.tokens[state.tokens.length - 2];
    lastInlineToken.content = lastInlineToken.content.replace(imgLine, '').trim();

    state.line = nextLine + (haveEndMarker ? 1 : 0);

    state.tokens.push({
        type: 'htmltag',
        content: Mustache.render(options.postfix, context),
        level: state.level
    });

    return true;
};

module.exports = function hmi_blocks(md, options) {
    md.block.ruler.before('code', 'sequence', parser, {alt: ['paragraph']});
}
