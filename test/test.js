const Remarkable = require('remarkable');
const path = require('path');
const hljs = require('highlight.js');
const noteBlocks = require('../src/note_blocks');
const sequence = require('../src/sequence');
const include = require('../src/include');
const media = require('../src/media');
const links = require('../src/links');
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
  media_url: 'https://smartdevicelink.com/media/',
  links: {
    link_map: {
      'to/nowhere': 'home/localhost'
    }
  },
  sequence: {
    prefix: '<div class="visual-link-wrapper"><a href="#" data-src="{{{ image_url }}}" class="visual-link"><div class="visual-link__body"><div class="t-h6 visual-link__title">{{ title }}</div><p class="t-default">',
    postfix: '</p></div><div class="visual-link__link fx-wrapper fx-s-between fx-a-center"><span class="fc-theme">View Diagram</span><span class="icon">{% svg "standard/icon-visual" %}</span></div></a></div>\n<img class="visual-print-image" src="{{{ image_url }}}">'
  },
  note_blocks: {
    prefix: '<div class="{{ tag }}"><div class="icon">{% svg "{{{ svg }}}" %}<img class="icon--pdf" src="{% static "{{{ svg_path }}}" %}"></div><h5>{{ title }}</h5>',
    postfix: '</div>',
    tags: {
      must: {
        svg: 'standard/icon-must',
        svg_path: 'svg/standard/icon-must.svg',
        title: 'Must'
      },
      note: {
        svg: 'standard/icon-note',
        svg_path: 'svg/standard/icon-note.svg',
        title: 'Note'
      },
      may: {
        svg: 'standard/icon-may',
        svg_path: 'svg/standard/icon-may.svg',
        title: 'May'
      },
      sdl: {
        svg: 'standard/icon-sdl',
        svg_path: 'svg/standard/icon-sdl.svg',
        title: 'SDL'
      },
      prefix: {
        svg: 'standard/icon-sdl',
        svg_path: 'svg/standard/icon-sdl.svg',
        title: 'Prefixed',
        prefix: '<div class="prefixed {{ tag }}"><div class="icon">{% svg "{{{ svg }}}" %}<img class="icon--pdf" src="{% static "{{{ svg_path }}}" %}"></div><h5>{{ title }}</h5>'
      },
      postfix: {
        svg: 'standard/icon-sdl',
        svg_path: 'svg/standard/icon-sdl.svg',
        title: 'Postfixed',
        postfix: '<span>postfix</span></div>'
      }
    }
  },
  include: {
    root_dir: __dirname,
    current_dir: path.join(__dirname, 'deep', 'deeper'),
    asset_dir_name: 'assets',
    extension_map: { jason: 'json' }
  }
});

md.use(noteBlocks)
  .use(sequence)
  .use(include)
  .use(links)
  .use(media);

describe('Note Blocks', () => {
  it('must note', () => {
    const dd = '!!! MUST\nhello world!\n!!!';
    const html = md.render(dd);

    html.should.equal('<div class="must"><div class="icon">{% svg "standard/icon-must" %}<img class="icon--pdf" src="{% static "svg/standard/icon-must.svg" %}"></div><h5>Must</h5><p>hello world!</p>\n</div>');
  });

  it('generic note', () => {
    const dd = '!!! NOTE\nhello world!\n!!!';
    const html = md.render(dd);

    html.should.equal('<div class="note"><div class="icon">{% svg "standard/icon-note" %}<img class="icon--pdf" src="{% static "svg/standard/icon-note.svg" %}"></div><h5>Note</h5><p>hello world!</p>\n</div>');
  });

  it('may note', () => {
    const dd = '!!! MAY\nhello world!\n!!!';
    const html = md.render(dd);

    html.should.equal('<div class="may"><div class="icon">{% svg "standard/icon-may" %}<img class="icon--pdf" src="{% static "svg/standard/icon-may.svg" %}"></div><h5>May</h5><p>hello world!</p>\n</div>');
  });

  it('SDL note', () => {
    const dd = '!!! SDL\nhello world!\n\n!!!';
    const html = md.render(dd);

    html.should.equal('<div class="sdl"><div class="icon">{% svg "standard/icon-sdl" %}<img class="icon--pdf" src="{% static "svg/standard/icon-sdl.svg" %}"></div><h5>SDL</h5><p>hello world!</p>\n</div>');
  });

  it('must note with markdown content list', () => {
    const dd = '!!! MUST\n### list intro message\n\n1. _list item 1_\n    * sub list item 1\n    * sub list item 2\n2. list item 2\n3. list item 3\n\ntest next block of content\n!!!';
    const html = md.render(dd);

    html.should.equal('<div class="must"><div class="icon">{% svg "standard/icon-must" %}<img class="icon--pdf" src="{% static "svg/standard/icon-must.svg" %}"></div><h5>Must</h5><h3>list intro message</h3>\n<ol>\n<li><em>list item 1</em>\n<ul>\n<li>sub list item 1</li>\n<li>sub list item 2</li>\n</ul></li>\n<li>list item 2</li>\n<li>list item 3</li>\n</ol>\n<p>test next block of content</p>\n</div>');
  });

  it('random note', () => {
    const dd = '!!! JSON\nhello world!\n!!!';
    const html = md.render(dd);

    html.should.equal('<div class="json"><div class="icon">{% svg "" %}<img class="icon--pdf" src="{% static "" %}"></div><h5>json</h5><p>hello world!</p>\n</div>');
  });

  it('prefixed note', () => {
    const dd = '!!! PREFIX\nhello world!\n!!!';
    const html = md.render(dd);

    html.should.equal('<div class="prefixed prefix"><div class="icon">{% svg "standard/icon-sdl" %}<img class="icon--pdf" src="{% static "svg/standard/icon-sdl.svg" %}"></div><h5>Prefixed</h5><p>hello world!</p>\n</div>');
  });

  it('postfixed note', () => {
    const dd = '!!! POSTFIX\nhello world!\n!!!';
    const html = md.render(dd);

    html.should.equal('<div class="postfix"><div class="icon">{% svg "standard/icon-sdl" %}<img class="icon--pdf" src="{% static "svg/standard/icon-sdl.svg" %}"></div><h5>Postfixed</h5><p>hello world!</p>\n<span>postfix</span></div>');
  });

  it('default_tag option sets tag if specified tag does not exist', () => {
    const mdWithDefault = new Remarkable({
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
      media_url: 'https://smartdevicelink.com/media/',
      note_blocks: {
        prefix: '<div class="{{ tag }}"><div class="icon">{% svg "{{{ svg }}}" %}<img class="icon--pdf" src="{% static "{{{ svg_path }}}" %}"></div><h5>{{ title }}</h5>',
        postfix: '</div>',
        default_tag: 'note',
        tags: {
          note: {
            svg: 'standard/icon-note',
            svg_path: 'svg/standard/icon-note.svg',
            title: 'Note'
          }
        }
      }
    });

    mdWithDefault.use(noteBlocks);

    const dd = '!!! DOESNOTEXIST\nhello world!\n!!!';
    const html = mdWithDefault.render(dd);

    html.should.equal('<div class="note"><div class="icon">{% svg "standard/icon-note" %}<img class="icon--pdf" src="{% static "svg/standard/icon-note.svg" %}"></div><h5>Note</h5><p>hello world!</p>\n</div>');
  });
});


describe('Media URL', () => {
  it('image with http url', () => {
    const dd = '![test image](http://mobelux.com/static/img/mobelux-mark.99537226e971.png)';
    const html = md.render(dd).trim();

    html.should.equal('<p><img src="http://mobelux.com/static/img/mobelux-mark.99537226e971.png" alt="test image"></p>');
  });

  it('local image', () => {
    const dd = '![test image](assets/mobelux-mark.png)';
    const html = md.render(dd).trim();

    html.should.equal('<p><img src="https://smartdevicelink.com/media/assets/mobelux-mark.png" alt="test image"></p>');
  });

  it('local image with ./', () => {
    const dd = '![test image](./assets/mobelux-mark.png)';
    const html = md.render(dd).trim();

    html.should.equal('<p><img src="https://smartdevicelink.com/media/assets/mobelux-mark.png" alt="test image"></p>');
  });
});

describe('Links', () => {
  it('test link not in link map', () => {
    const dd = '[this is a link](http://mobelux.com/)';
    const html = md.render(dd).trim();

    html.should.equal('<p><a href="http://mobelux.com/">this is a link</a></p>');
  });

  it('test link in map', () => {
    const dd = '[this is a link](to/nowhere)';
    const html = md.render(dd).trim();

    html.should.equal('<p><a href="home/localhost">this is a link</a></p>');
  });

  it('test link in map with hash', () => {
    const dd = '[this is a link](to/nowhere#testhash)';
    const html = md.render(dd).trim();

    html.should.equal('<p><a href="home/localhost#testhash">this is a link</a></p>');
  });
});

describe('Include Code', () => {
  it('JSON file', () => {
    const dd = '# JSON\n+++ test.json';
    const html = md.render(dd).trim();

    html.should.equal('<h1>JSON</h1>\n<pre><code class="language-json">{\n    <span class="attr">"test"</span>: <span class="string">"json"</span>,\n    <span class="attr">"asdf"</span>: <span class="literal">true</span>\n}\n</code></pre>');
  });

  it('custom extension JSON file', () => {
    const dd = '# JaSON\n+++ test.jason';
    const html = md.render(dd).trim();

    html.should.equal('<h1>JaSON</h1>\n<pre><code class="language-json">{\n    <span class="attr">"test"</span>: <span class="string">"jason"</span>,\n    <span class="attr">"asdf"</span>: <span class="literal">true</span>\n}\n</code></pre>');
  });

  it('CSV file', () => {
    const dd = '# CSV Table\n+++ test.csv';
    const html = md.render(dd).trim();

    html.should.equal('<h1>CSV Table</h1>\n<table><tr><td>Test 1</td><td>Test 2</td><td>Test 3</td></tr><tr><td>a</td><td>b</td><td>c</td></tr><tr><td>1</td><td>2</td><td>3</td></tr></table>');
  });

  it('C++ file', () => {
    const dd = '# C++\n+++ test.cpp';
    const html = md.render(dd).trim();

    html.should.equal('<h1>C++</h1>\n<pre><code class="language-cpp"><span class="meta">#<span class="meta-keyword">include</span> <span class="meta-string">&lt;iostream&gt;</span></span>\n\n<span class="keyword">using</span> <span class="keyword">namespace</span> <span class="built_in">std</span>;\n\n<span class="function"><span class="keyword">int</span> <span class="title">main</span><span class="params">()</span>\n</span>{\n\t<span class="built_in">cout</span> &lt;&lt; <span class="string">"Test"</span> &lt;&lt; <span class="built_in">endl</span>;\n\t<span class="keyword">return</span> <span class="number">0</span>;\n}\n</code></pre>');
  });

  it('Obj-C file', () => {
    const dd = '# M\n+++ test.m';
    const html = md.render(dd).trim();

    html.should.equal('<h1>M</h1>\n<pre><code class="language-c"><span class="meta">#import <span class="meta-string">&lt;Foundation/Foundation.h&gt;</span></span>\n\n<span class="function"><span class="keyword">int</span> <span class="title">main</span> <span class="params">(<span class="keyword">int</span> argc, <span class="keyword">const</span> <span class="keyword">char</span> * argv[])</span>\n</span>{\n        NSAutoreleasePool *pool = [[NSAutoreleasePool alloc] init];\n        NSLog (@<span class="string">"Test"</span>);\n        [pool drain];\n        <span class="keyword">return</span> <span class="number">0</span>;\n}\n</code></pre>');
  });


  it('missing file', () => {
    const dd = '# CSV Table\n+++ nope.cpp';
    const html = md.render(dd).trim();

    html.should.equal('<h1>CSV Table</h1>');
  });
});


describe('Sequence Diagrams', () => {
  it('sequence diagram with default title', () => {
    const dd = '# Sequence Diagrams\n|||\nActivate App\n![](assets/ActivateApp.png)\n|||\n';
    const html = md.render(dd).trim();

    html.should.equal('<h1>Sequence Diagrams</h1>\n<div class="visual-link-wrapper"><a href="#" data-src="https://smartdevicelink.com/media/assets/ActivateApp.png" class="visual-link"><div class="visual-link__body"><div class="t-h6 visual-link__title">Sequence Diagram</div><p class="t-default"><p>Activate App</p>\n</p></div><div class="visual-link__link fx-wrapper fx-s-between fx-a-center"><span class="fc-theme">View Diagram</span><span class="icon">{% svg "standard/icon-visual" %}</span></div></a></div>\n<img class="visual-print-image" src="https://smartdevicelink.com/media/assets/ActivateApp.png">');
  });

  it('sequence diagram with custom title', () => {
    const dd = '# Sequence Diagrams\n|||\nActivate App\n![Activate App Sequence Diagram](./assets/ActivateApp.png)\n|||\n';
    const html = md.render(dd).trim();

    html.should.equal('<h1>Sequence Diagrams</h1>\n<div class="visual-link-wrapper"><a href="#" data-src="https://smartdevicelink.com/media/assets/ActivateApp.png" class="visual-link"><div class="visual-link__body"><div class="t-h6 visual-link__title">Activate App Sequence Diagram</div><p class="t-default"><p>Activate App</p>\n</p></div><div class="visual-link__link fx-wrapper fx-s-between fx-a-center"><span class="fc-theme">View Diagram</span><span class="icon">{% svg "standard/icon-visual" %}</span></div></a></div>\n<img class="visual-print-image" src="https://smartdevicelink.com/media/assets/ActivateApp.png">');
  });

  it('back to back sequence diagrams', () => {
    const dd = '# Sequence Diagrams\n|||\nActivate App\n![](./assets/ActivateApp.png)\n|||\n\n|||\nActivate App 2\n![](./assets/ActivateApp2.png)\n|||\n';
    const html = md.render(dd).trim();

    html.should.equal('<h1>Sequence Diagrams</h1>\n<div class="visual-link-wrapper"><a href="#" data-src="https://smartdevicelink.com/media/assets/ActivateApp.png" class="visual-link"><div class="visual-link__body"><div class="t-h6 visual-link__title">Sequence Diagram</div><p class="t-default"><p>Activate App</p>\n</p></div><div class="visual-link__link fx-wrapper fx-s-between fx-a-center"><span class="fc-theme">View Diagram</span><span class="icon">{% svg "standard/icon-visual" %}</span></div></a></div>\n<img class="visual-print-image" src="https://smartdevicelink.com/media/assets/ActivateApp.png"><div class="visual-link-wrapper"><a href="#" data-src="https://smartdevicelink.com/media/assets/ActivateApp2.png" class="visual-link"><div class="visual-link__body"><div class="t-h6 visual-link__title">Sequence Diagram</div><p class="t-default"><p>Activate App 2</p>\n</p></div><div class="visual-link__link fx-wrapper fx-s-between fx-a-center"><span class="fc-theme">View Diagram</span><span class="icon">{% svg "standard/icon-visual" %}</span></div></a></div>\n<img class="visual-print-image" src="https://smartdevicelink.com/media/assets/ActivateApp2.png">');
  });

  it('sequence diagram with default title and inline styles', () => {
    const dd = '# Sequence Diagrams\n|||\n_Activate App_\n![](assets/ActivateApp.png)\n|||\n';
    const html = md.render(dd).trim();

    html.should.equal('<h1>Sequence Diagrams</h1>\n<div class="visual-link-wrapper"><a href="#" data-src="https://smartdevicelink.com/media/assets/ActivateApp.png" class="visual-link"><div class="visual-link__body"><div class="t-h6 visual-link__title">Sequence Diagram</div><p class="t-default"><p><em>Activate App</em></p>\n</p></div><div class="visual-link__link fx-wrapper fx-s-between fx-a-center"><span class="fc-theme">View Diagram</span><span class="icon">{% svg "standard/icon-visual" %}</span></div></a></div>\n<img class="visual-print-image" src="https://smartdevicelink.com/media/assets/ActivateApp.png">');
  });

  it('sequence diagram with default title and block styles', () => {
    const dd = '# Sequence Diagrams\n|||\n### Activate App\n![](assets/ActivateApp.png)\n|||\n';
    const html = md.render(dd).trim();

    html.should.equal('<h1>Sequence Diagrams</h1>\n<div class="visual-link-wrapper"><a href="#" data-src="https://smartdevicelink.com/media/assets/ActivateApp.png" class="visual-link"><div class="visual-link__body"><div class="t-h6 visual-link__title">Sequence Diagram</div><p class="t-default"><h3>Activate App</h3>\n</p></div><div class="visual-link__link fx-wrapper fx-s-between fx-a-center"><span class="fc-theme">View Diagram</span><span class="icon">{% svg "standard/icon-visual" %}</span></div></a></div>\n<img class="visual-print-image" src="https://smartdevicelink.com/media/assets/ActivateApp.png">');
  });
});
