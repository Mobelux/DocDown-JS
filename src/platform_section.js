function platformSectionParser(state, startLine, endLine, silent) {
  const options = state.options.platform_section;
  let nextLine;
  let mem;
  let haveEndMarker = false;
  let pos = state.bMarks[startLine] + state.tShift[startLine];
  let max = state.eMarks[startLine];

  if (pos + 3 > max) {
    return false;
  }

  const marker = state.src.substring(pos, pos + 3);

  /* @![ */
  if (marker !== '@![') {
    return false;
  }

  let endPos = state.src.indexOf(']', pos);
  if (endPos > max) {
    return false;
  }

  // Since start is found, we can report success here in validation mode
  if (silent) {
    return true;
  }

  let tag = state.src.slice(pos + 3, endPos);
  let sections = tag.split(',').map(function(value) {
    return value.toLowerCase().trim();
  });

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

    if (state.src.substring(pos, pos + 2) === '!@') {
      pos = state.skipSpaces(pos + 2);
      if (pos >= max) {
        haveEndMarker = true;
        // found!
        break;
      }
    }
  }

  if (sections.includes(options.platform_section.toLowerCase().trim())) {
    state.parser.tokenize(state, startLine + 1, nextLine);
  }

  /* eslint-disable no-param-reassign */
  state.line = nextLine + (haveEndMarker ? 1 : 0);
  /* eslint-enable */

  return true;
}

module.exports = function platformSection(md, _options) {
  md.block.ruler.before('code', 'platform_section', platformSectionParser, { alt: ['paragraph'] });
};
