const Remarkable = require('remarkable');
const path = require('path');
const hljs = require('highlight.js');
const noteBlocks = require('../src/note_blocks');
const sequence = require('../src/sequence');
const include = require('../src/include');
const media = require('../src/media');
const links = require('../src/links');
const platformSection = require('../src/platform_section');
require('chai').should();

/* eslint-disable no-empty */
const md = new Remarkable({
  html: true,    // Enable HTML tags in source
  breaks: true,    // Convert '\n' in paragraphs into <br>
  langPrefix: 'language-',  // CSS language prefix for fenced blocks
  // Highlighter function. Should return escaped HTML,
  // or '' if the source string is not changed
  highlight: (str, lang) => {
    hljs.configure({ classPrefix: '' });
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(lang, str).value;
      } catch (err) {}
    }

    try {
      return hljs.highlightAuto(str).value;
    } catch (err) {}

    return ''; // use external default escaping
  },
  platform_section: {
    platform_section: 'Android'
  }
});

md.use(platformSection);

describe('Platform Section', () => {
  it('Single Platform Match Should Show', () => {
    const dd = '@![Android]\nhello world!\n\n!@';
    const html = md.render(dd).trim();

    html.should.equal('<p>hello world!</p>');
  });

  it('Multiple Platform Match Should Show', () => {
    const dd = '@![Android,iOS]\nhello world!\n\n!@';
    const html = md.render(dd).trim();

    html.should.equal('<p>hello world!</p>');
  });

  it('Multiple Platform Case Insensitive Match Should Show', () => {
    const dd = '@![ANDROID,iOS]\nhello world!\n\n!@';
    const html = md.render(dd).trim();

    html.should.equal('<p>hello world!</p>');
  });

  it('Single Platform No Match Should Not Show', () => {
    const dd = '@![iOS]\nhello world!\n\n!@';
    const html = md.render(dd).trim();

    html.should.equal('');
  });

  it('Multiple Sections Only Last One Shows', () => {
    const dd = '@![iOS]\nhello iOS world!\n\n!@\n@![Android]\nhello Android world!\n\n!@';
    const html = md.render(dd).trim();

    html.should.equal('<p>hello Android world!</p>');
  });

  it('Multiple Sections Only First One Shows', () => {
    const dd = '@![Android]\nhello Android world!\n\n!@\n@![iOS]\nhello iOS world!\n\n!@';
    const html = md.render(dd).trim();

    html.should.equal('<p>hello Android world!</p>');
  });

  it('Single Platform Match Shows With Code', () => {
    const dd = '@![Android]\nhello world!\n``` java\nString test = "android";\n```\n!@';
    const html = md.render(dd).trim();

    html.should.equal('<p>hello world!</p>\n<pre><code class="language-java">String test = <span class="string">"android"</span>;\n</code></pre>');
  });
});
