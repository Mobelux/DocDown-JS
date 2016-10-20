'use strict';

var Mustache = require('mustache');

var parser = function hmi_block_parser(state, startLine, endLine, silent) {
    var marker, len, tag, nextLine, mem,
        haveEndMarker = false,
        pos = state.bMarks[startLine] + state.tShift[startLine],
        max = state.eMarks[startLine],
        options = state.options.hmi_block;

    if (pos + 3 > max) { return false; }

    marker = state.src.charCodeAt(pos);

    if (marker !== 0x21/* ! */) {
        return false;
    }

    // scan marker length
    mem = pos;
    pos = state.skipChars(pos, marker);

    len = pos - mem;

    if (len < 3) { return false; }

    tag = state.src.slice(pos, max).trim().toLowerCase();

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

    // If a fence has heading spaces, they should be removed from its inner block
    len = state.tShift[startLine];

    state.line = nextLine + (haveEndMarker ? 1 : 0);

    var content = state.getLines(startLine+1, nextLine, state.blkIndent, false).trim();
    var context = options.tags[tag] || {};
    context.tag = tag;

    if (! context.title) {
        context.title = tag;
    }

    state.tokens.push({
        type: 'htmltag',
        content: Mustache.render(options.prefix, context),
        level: state.level
    });

    state.tokens.push({
        type: 'inline',
        content: content,
        level: state.level + 1,
        lines: [ startLine, state.line ],
        children: []
    });

    state.tokens.push({
        type: 'htmltag',
        content: Mustache.render(options.postfix, context),
        level: state.level
    });

    return true;
};

module.exports = function hmi_blocks(md, options) {
    md.block.ruler.before('code', 'hmi_blocks', parser, options);
}
