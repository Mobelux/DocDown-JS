'use strict';

function linkParser(state) {
  var tokens = state.tokens;

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = tokens[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var token = _step.value;

      if (token.type === 'inline') {
        var children = token.children;
        var linkMap = state.options.links.link_map;
        var url = void 0;
        var hash = void 0;

        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = children[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var childToken = _step2.value;

            if (childToken.type === 'link_open') {
              var href = childToken.href;
              if (href.includes('#')) {
                var parts = href.split('#');
                url = parts[0];
                hash = parts.slice(1).join('#');
              } else {
                url = href;
              }

              if (linkMap && linkMap[url]) {
                childToken.href = linkMap[url];
                if (hash) {
                  childToken.href += '#' + hash;
                }
              }
            }
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
      }
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
}

module.exports = function links(md, options) {
  md.core.ruler.after('linkify', 'links', linkParser, options);
};