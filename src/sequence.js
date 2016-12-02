// |||
// Content
// ![alt text](assets/diagram.jpg)
// |||
const Mustache = require('mustache');

function sequenceParser(state, startLine, endLine, silent) {
  let nextLine;
  let mem;
  let imgLine;
  let haveEndMarker = false;
  let pos = state.bMarks[startLine] + state.tShift[startLine];
  let max = state.eMarks[startLine];
  const options = state.options.sequence;
  const mediaUrl = state.options.media_url;
  let title;
  let imageUrl = '';

  if (pos + 3 > max) {
    return false;
  }

  const marker = state.src.charCodeAt(pos);

  if (marker !== 0x7C/* | */) {
    return false;
  }

  // scan marker length
  mem = pos;
  pos = state.skipChars(pos, marker);

  const len = pos - mem;

  if (len < 3) { return false; }

  // Since start is found, we can report success here in validation mode
  if (silent) { return true; }

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

    if (state.src.charCodeAt(pos) === 0x21/* ! */) {
      if (silent) {
        return true;
      }
      const line = state.getLines(nextLine, nextLine + 1, 0, false).trim();
      const re = line.match(/!\[((.|\n)*)]\(((.|\n)*)\)/m);
      if (re) {
        imgLine = line;
        title = re[1];
        if (!title) {
          title = 'Sequence Diagram';
        }
        imageUrl = re[3];
        if (imageUrl.startsWith('./')) {
          imageUrl = imageUrl.substring(2);
        }
        if (!imageUrl.startsWith('http')) {
          imageUrl = mediaUrl + imageUrl;
        }
      }
    }

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

  const context = { title, image_url: imageUrl };

  state.tokens.push({
    type: 'htmltag',
    content: Mustache.render(options.prefix, context),
    level: state.level
  });

  state.parser.tokenize(state, startLine + 1, nextLine);

  // remove the inline image markdown from the last inline token
  const lastInlineToken = state.tokens[state.tokens.length - 2];
  lastInlineToken.content = lastInlineToken.content.replace(imgLine, '').trim();

  /* eslint-disable no-param-reassign */
  state.line = nextLine + (haveEndMarker ? 1 : 0);
  /* eslint-enable */

  state.tokens.push({
    type: 'htmltag',
    content: Mustache.render(options.postfix, context),
    level: state.level
  });

  return true;
}

module.exports = function sequenceDiagrams(md, _options) {
  md.block.ruler.before('code', 'sequence', sequenceParser, { alt: ['paragraph'] });
};
