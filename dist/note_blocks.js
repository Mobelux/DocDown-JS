'use strict';

var Mustache = require('mustache');

function noteBlockParser(state, startLine, endLine, silent) {
  var options = state.options.note_blocks;
  var nextLine = void 0;
  var mem = void 0;
  var haveEndMarker = false;
  var pos = state.bMarks[startLine] + state.tShift[startLine];
  var max = state.eMarks[startLine];

  if (pos + 3 > max) {
    return false;
  }

  var marker = state.src.charCodeAt(pos);

  /* ! */
  if (marker !== 0x21) {
    return false;
  }

  // scan marker length
  mem = pos;
  pos = state.skipChars(pos, marker);

  var len = pos - mem;

  if (len < 3) {
    return false;
  }

  // Since start is found, we can report success here in validation mode
  if (silent) {
    return true;
  }

  var tag = state.src.slice(pos, max).trim().toLowerCase();
  if (!options.tags[tag] && options.default_tag) {
    tag = options.default_tag;
  }

  // search end of block
  nextLine = startLine;

  for (;;) {
    nextLine += 1;
    if (nextLine >= endLine) {
      // unclosed block should be autoclosed by end of document.
      // also block seems to be autoclosed by end of parent
      break;
    }

    pos = mem = state.bMarks[nextLine] + state.tShift[nextLine];
    max = state.eMarks[nextLine];

    if (state.src.charCodeAt(pos) === marker) {
      pos = state.skipChars(pos, marker);

      // closing code fence must be at least as long as the opening one
      if (pos - mem >= len) {
        // make sure tail has spaces only
        pos = state.skipSpaces(pos);

        if (pos >= max) {
          haveEndMarker = true;
          // found!
          break;
        }
      }
    }
  }

  var context = options.tags[tag] || {};
  context.tag = tag;

  if (!context.title) {
    context.title = tag;
  }

  var prefix = context.prefix || options.prefix;
  var postfix = context.postfix || options.postfix;

  state.tokens.push({
    type: 'htmltag',
    content: Mustache.render(prefix, context),
    level: state.level
  });

  state.parser.tokenize(state, startLine + 1, nextLine);

  /* eslint-disable no-param-reassign */
  state.line = nextLine + (haveEndMarker ? 1 : 0);
  /* eslint-enable */

  state.tokens.push({
    type: 'htmltag',
    content: Mustache.render(postfix, context),
    level: state.level
  });

  return true;
}

module.exports = function noteBlocks(md, _options) {
  md.block.ruler.before('code', 'note_blocks', noteBlockParser, { alt: ['paragraph'] });
};