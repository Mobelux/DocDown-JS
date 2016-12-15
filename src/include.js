// +++ filename.ext

const path = require('path');
const fs = require('fs');
const parse = require('csv-parse/lib/sync');

const extensionLanguageMap = {
  json: 'json',
  html: 'html',
  js: 'javascript',
  css: 'css',
  m: 'c',
  h: 'c',
  txt: 'text',
  swift: 'swift',
  cpp: 'cpp',
  c: 'c',
  java: 'java'
};

function fileExists(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.R_OK);
    return true;
  } catch (err) {
    /* eslint-disable no-console */
    console.log(err.message);
    /* eslint-enable */
  }
  return false;
}

function findFilePath(filename, options) {
  const currentDir = options.current_dir;
  const assetDirName = options.asset_dir_name;
  const rootDir = path.join(options.root_dir, assetDirName);
  let assetDir = path.join(currentDir, assetDirName);
  let filePath = path.join(assetDir, filename);

  while (!fileExists(filePath)) {
    if (assetDir === rootDir) {
      return null;
    }
    assetDir = path.join(path.dirname(path.dirname(assetDir)), assetDirName);
    filePath = path.join(assetDir, filename);
  }
  return filePath;
}

function includeParser(state, startLine, _endLine, _silent) {
  let tableHtml;
  let pos = state.bMarks[startLine] + state.tShift[startLine];
  const max = state.eMarks[startLine];
  const options = state.options.include;

  Object.assign(extensionLanguageMap, options.extension_map);

  if (pos + 3 > max) {
    return false;
  }

  const marker = state.src.charCodeAt(pos);

  /* + */
  if (marker !== 0x2B) {
    return false;
  }

  // scan marker length
  const mem = pos;
  pos = state.skipChars(pos, marker);

  const len = pos - mem;

  if (len < 3) {
    return false;
  }

  const includeLine = state.getLines(startLine, startLine + 1, 0, false).trim();
  const fileName = includeLine.substring(4);
  const filePath = findFilePath(fileName, options);

  if (filePath) {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const ext = path.extname(filePath).substring(1);
    const lang = extensionLanguageMap[ext] || ext;

    if (ext === 'csv') {
      tableHtml = '<table>';
      const records = parse(fileContent);
      for (const row of records) {
        tableHtml += '<tr>';
        for (const content of row) {
          tableHtml += `<td>${content}</td>`;
        }
        tableHtml += '</tr>';
      }
      tableHtml += '</table>';
      state.tokens.push({
        type: 'htmltag',
        content: tableHtml,
        level: state.level
      });
    } else {
      state.tokens.push({
        type: 'fence',
        params: lang,
        content: fileContent,
        lines: [startLine, startLine + 1],
        level: state.level
      });
    }
  }

  /* eslint-disable no-param-reassign */
  state.line = startLine + 1;
  /* eslint-enable */

  return true;
}

module.exports = function include(md, options) {
  md.block.ruler.before('code', 'include', includeParser, options);
};
