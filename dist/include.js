'use strict';

// +++ filename.ext

var path = require('path');
var fs = require('fs');
var parse = require('csv-parse/lib/sync');

var extensionLanguageMap = {
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
  var currentDir = options.current_dir;
  var assetDirName = options.asset_dir_name;
  var rootDir = path.join(options.root_dir, assetDirName);
  var assetDir = path.join(currentDir, assetDirName);
  var filePath = path.join(assetDir, filename);

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
  var tableHtml = void 0;
  var pos = state.bMarks[startLine] + state.tShift[startLine];
  var max = state.eMarks[startLine];
  var options = state.options.include;

  Object.assign(extensionLanguageMap, options.extension_map);

  if (pos + 3 > max) {
    return false;
  }

  var marker = state.src.charCodeAt(pos);

  /* + */
  if (marker !== 0x2B) {
    return false;
  }

  // scan marker length
  var mem = pos;
  pos = state.skipChars(pos, marker);

  var len = pos - mem;

  if (len < 3) {
    return false;
  }

  var includeLine = state.getLines(startLine, startLine + 1, 0, false).trim();
  var fileName = includeLine.substring(4);
  var filePath = findFilePath(fileName, options);

  if (filePath) {
    var fileContent = fs.readFileSync(filePath, 'utf-8');
    var ext = path.extname(filePath).substring(1);
    var lang = extensionLanguageMap[ext] || ext;

    if (ext === 'csv') {
      tableHtml = '<table>';
      var records = parse(fileContent);
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = records[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var row = _step.value;

          tableHtml += '<tr>';
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = row[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var content = _step2.value;

              tableHtml += '<td>' + content + '</td>';
            }
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
          }

          tableHtml += '</tr>';
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
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