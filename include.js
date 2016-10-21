// +++ filename.ext

'use strict';

const Mustache = require('mustache'),
    path = require('path'),
    fs = require('fs'),
    parse = require('csv-parse/lib/sync');

var fileExists = function(filePath) {
    try {
        fs.accessSync(filePath, fs.constants.R_OK);
        return true;
    } catch (err) {
    }
    return false;
}

var findFilePath = function(filename, options) {
    var currentDir = options.current_dir,
        assetDirName = options.asset_dir_name,
        assetDir = path.join(currentDir, assetDirName),
        rootDir = path.join(options.root_dir, assetDirName),
        filePath = path.join(assetDir, filename);

    while (!fileExists(filePath)) {
        if (assetDir === rootDir) {
            return null;
        }
        assetDir = path.join(path.dirname(path.dirname(assetDir)), assetDirName);
        filePath = path.join(assetDir, filename);
    }
    return filePath;
}

var parser = function include_parser(state, startLine, endLine, silent) {
    var marker, len, params, nextLine, mem, fileName, filePath,
        pos = state.bMarks[startLine] + state.tShift[startLine],
        max = state.eMarks[startLine],
        options = state.options.include,
        title = 'Sequence Diagram',
        image_url = '';

    if (pos + 3 > max) { return false; }

    marker = state.src.charCodeAt(pos);

    if (marker !== 0x2B/* + */) {
        return false;
    }

    // scan marker length
    mem = pos;
    pos = state.skipChars(pos, marker);

    len = pos - mem;

    if (len < 3) { return false; }

    var include_line = state.getLines(startLine, startLine + 1, 0, false).trim();
    fileName = include_line.substring(4);
    filePath = findFilePath(fileName, options);

    if (filePath) {
        var fileContent = fs.readFileSync(filePath, 'utf-8');
        var ext = path.extname(filePath).substring(1);

        if (ext === 'csv') {
            var table_html = '<table>';
            var records = parse(fileContent);
            for(var x = 0; x < records.length; x++) {
                table_html += '<tr>';
                var row = records[x];
                for (var y = 0; y < row.length; y++) {
                    var content = row[y];
                    table_html += ('<td>' + content + '</td>');
                }
                table_html += '</tr>';
            }
            table_html += '</table>';
            state.tokens.push({
                type: 'htmltag',
                content: table_html,
                level: state.level
            });
        } else {
            state.tokens.push({
                type: 'fence',
                params: ext,
                content: fileContent,
                lines: [startLine, startLine + 1],
                level: state.level
            });
        }
    }

    state.line = startLine + 1;

    return true;
};

module.exports = function include(md, options) {
    md.block.ruler.before('code', 'include', parser, options);
}
