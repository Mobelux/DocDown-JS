var Remarkable = require('remarkable'),
    path       = require('path'),
    hljs       = require('highlight.js'),
    hmi_blocks = require('../hmi_blocks'),
    sequence   = require('../sequence'),
    include    = require('../include'),
    media      = require('../media'),
    links      = require('../links'),
    should     = require('chai').should();


var md = new Remarkable({
    html:         true,        // Enable HTML tags in source
    breaks:       true,        // Convert '\n' in paragraphs into <br>
    langPrefix:   'language-',  // CSS language prefix for fenced blocks
    // Highlighter function. Should return escaped HTML,
    // or '' if the source string is not changed
    highlight: function (str, lang) {
        hljs.configure({classPrefix: ''});
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
            'to/nowhere': 'home/localhost',
        },
    },
    sequence: {
        prefix: '<div class="visual-link-wrapper"><a href="#" data-src="{{{ image_url }}}" class="visual-link"><div class="visual-link__body"><div class="t-h6 visual-link__title">{{ title }}</div><p class="t-default">',
        postfix: '</p></div><div class="visual-link__link fx-wrapper fx-s-between fx-a-center"><span class="fc-theme">View Diagram</span><span class="icon">{% svg "standard/icon-visual" %}</span></div></a></div>\n<img class="visual-print-image" src="{{{ image_url }}}">',
    },
    hmi_block: {
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
            }
        }
    },
    include: {
        root_dir: __dirname,
        current_dir: __dirname,
        asset_dir_name: 'assets'
    }
});

md.use(hmi_blocks).use(sequence).use(include).use(links).use(media);



describe('HMI Blocks', function() {
    it('must note', function() {
        var dd = '!!! MUST\nhello world!\n!!!',
            html = md.render(dd);

        html.should.equal('<div class="must"><div class="icon">{% svg "standard/icon-must" %}<img class="icon--pdf" src="{% static "svg/standard/icon-must.svg" %}"></div><h5>Must</h5><p>hello world!</p>\n</div>');
    });

    it('generic note', function() {
        var dd = '!!! NOTE\nhello world!\n!!!',
            html = md.render(dd);

        html.should.equal('<div class="note"><div class="icon">{% svg "standard/icon-note" %}<img class="icon--pdf" src="{% static "svg/standard/icon-note.svg" %}"></div><h5>Note</h5><p>hello world!</p>\n</div>');
    });

    it('may note', function() {
        var dd = '!!! MAY\nhello world!\n!!!',
            html = md.render(dd);

        html.should.equal('<div class="may"><div class="icon">{% svg "standard/icon-may" %}<img class="icon--pdf" src="{% static "svg/standard/icon-may.svg" %}"></div><h5>May</h5><p>hello world!</p>\n</div>');
    });

    it('SDL note', function() {
        var dd = '!!! SDL\nhello world!\n\n!!!',
            html = md.render(dd);

        html.should.equal('<div class="sdl"><div class="icon">{% svg "standard/icon-sdl" %}<img class="icon--pdf" src="{% static "svg/standard/icon-sdl.svg" %}"></div><h5>SDL</h5><p>hello world!</p>\n</div>');
    });

    it('must note with markdown content list', function() {
        var dd = '!!! MUST\n### list intro message\n\n1. _list item 1_\n    * sub list item 1\n    * sub list item 2\n2. list item 2\n3. list item 3\n\ntest next block of content\n!!!',
            html = md.render(dd);

        html.should.equal('<div class="must"><div class="icon">{% svg "standard/icon-must" %}<img class="icon--pdf" src="{% static "svg/standard/icon-must.svg" %}"></div><h5>Must</h5><h3>list intro message</h3>\n<ol>\n<li><em>list item 1</em>\n<ul>\n<li>sub list item 1</li>\n<li>sub list item 2</li>\n</ul></li>\n<li>list item 2</li>\n<li>list item 3</li>\n</ol>\n<p>test next block of content</p>\n</div>');
    });

    it('random note', function() {
        var dd = '!!! JSON\nhello world!\n!!!',
            html = md.render(dd);

        html.should.equal('<div class="json"><div class="icon">{% svg "" %}<img class="icon--pdf" src="{% static "" %}"></div><h5>json</h5><p>hello world!</p>\n</div>');
    });
});


describe('Media URL', function() {
    it('image with http url', function() {
        var dd = '![test image](http://mobelux.com/static/img/mobelux-mark.99537226e971.png)',
            html = md.render(dd).trim();

        html.should.equal('<p><img src="http://mobelux.com/static/img/mobelux-mark.99537226e971.png" alt="test image"></p>');
    });

    it('local image', function() {
        var dd = '![test image](assets/mobelux-mark.png)',
            html = md.render(dd).trim();

        html.should.equal('<p><img src="https://smartdevicelink.com/media/assets/mobelux-mark.png" alt="test image"></p>');
    });
});

describe('Links', function() {
    it('test link not in link map', function() {
        var dd = '[this is a link](http://mobelux.com/)',
            html = md.render(dd).trim();

        html.should.equal('<p><a href="http://mobelux.com/">this is a link</a></p>');
    });

    it('test link in map', function() {
        var dd = '[this is a link](to/nowhere)',
            html = md.render(dd).trim();

        html.should.equal('<p><a href="home/localhost">this is a link</a></p>');
    });

    it('test link in map with hash', function() {
        var dd = '[this is a link](to/nowhere#testhash)',
            html = md.render(dd).trim();

        html.should.equal('<p><a href="home/localhost#testhash">this is a link</a></p>');
    });


});


describe('Include Code', function() {
    it('JSON file', function() {
        var dd = '# JSON\n+++ test.json',
            html = md.render(dd).trim();

        html.should.equal('<h1>JSON</h1>\n<pre><code class="language-json">{\n    <span class="attr">"test"</span>: <span class="string">"json"</span>,\n    <span class="attr">"asdf"</span>: <span class="literal">true</span>\n}\n</code></pre>');
    });

    it('CSV file', function() {
        var dd = '# CSV Table\n+++ test.csv',
            html = md.render(dd).trim();

        html.should.equal('<h1>CSV Table</h1>\n<table><tr><td>Test 1</td><td>Test 2</td><td>Test 3</td></tr><tr><td>a</td><td>b</td><td>c</td></tr><tr><td>1</td><td>2</td><td>3</td></tr></table>');
    });

    it('missing file', function() {
        var dd = '# CSV Table\n+++ nope.cpp',
            html = md.render(dd).trim();

        html.should.equal('<h1>CSV Table</h1>');
    });
});


describe('Sequence Diagrams', function() {
    it('sequence diagram with default title', function() {
        var dd = '# Sequence Diagrams\n|||\nActivate App\n![](assets/ActivateApp.png)\n|||\n',
            html = md.render(dd).trim();

        html.should.equal('<h1>Sequence Diagrams</h1>\n<div class="visual-link-wrapper"><a href="#" data-src="https://smartdevicelink.com/media/assets/ActivateApp.png" class="visual-link"><div class="visual-link__body"><div class="t-h6 visual-link__title">Sequence Diagram</div><p class="t-default"><p>Activate App</p>\n</p></div><div class="visual-link__link fx-wrapper fx-s-between fx-a-center"><span class="fc-theme">View Diagram</span><span class="icon">{% svg "standard/icon-visual" %}</span></div></a></div>\n<img class="visual-print-image" src="https://smartdevicelink.com/media/assets/ActivateApp.png">');
    });

    it('sequence diagram with custom title', function() {
        var dd = '# Sequence Diagrams\n|||\nActivate App\n![Activate App Sequence Diagram](./assets/ActivateApp.png)\n|||\n',
            html = md.render(dd).trim();

        html.should.equal('<h1>Sequence Diagrams</h1>\n<div class="visual-link-wrapper"><a href="#" data-src="https://smartdevicelink.com/media/assets/ActivateApp.png" class="visual-link"><div class="visual-link__body"><div class="t-h6 visual-link__title">Activate App Sequence Diagram</div><p class="t-default"><p>Activate App</p>\n</p></div><div class="visual-link__link fx-wrapper fx-s-between fx-a-center"><span class="fc-theme">View Diagram</span><span class="icon">{% svg "standard/icon-visual" %}</span></div></a></div>\n<img class="visual-print-image" src="https://smartdevicelink.com/media/assets/ActivateApp.png">');
    });

    it('back to back sequence diagrams', function() {
        var dd = '# Sequence Diagrams\n|||\nActivate App\n![](./assets/ActivateApp.png)\n|||\n\n|||\nActivate App 2\n![](./assets/ActivateApp2.png)\n|||\n',
            html = md.render(dd).trim();

        html.should.equal('<h1>Sequence Diagrams</h1>\n<div class="visual-link-wrapper"><a href="#" data-src="https://smartdevicelink.com/media/assets/ActivateApp.png" class="visual-link"><div class="visual-link__body"><div class="t-h6 visual-link__title">Sequence Diagram</div><p class="t-default"><p>Activate App</p>\n</p></div><div class="visual-link__link fx-wrapper fx-s-between fx-a-center"><span class="fc-theme">View Diagram</span><span class="icon">{% svg "standard/icon-visual" %}</span></div></a></div>\n<img class="visual-print-image" src="https://smartdevicelink.com/media/assets/ActivateApp.png"><div class="visual-link-wrapper"><a href="#" data-src="https://smartdevicelink.com/media/assets/ActivateApp2.png" class="visual-link"><div class="visual-link__body"><div class="t-h6 visual-link__title">Sequence Diagram</div><p class="t-default"><p>Activate App 2</p>\n</p></div><div class="visual-link__link fx-wrapper fx-s-between fx-a-center"><span class="fc-theme">View Diagram</span><span class="icon">{% svg "standard/icon-visual" %}</span></div></a></div>\n<img class="visual-print-image" src="https://smartdevicelink.com/media/assets/ActivateApp2.png">');
    });

    it('sequence diagram with default title and inline styles', function() {
        var dd = '# Sequence Diagrams\n|||\n_Activate App_\n![](assets/ActivateApp.png)\n|||\n',
            html = md.render(dd).trim();

        html.should.equal('<h1>Sequence Diagrams</h1>\n<div class="visual-link-wrapper"><a href="#" data-src="https://smartdevicelink.com/media/assets/ActivateApp.png" class="visual-link"><div class="visual-link__body"><div class="t-h6 visual-link__title">Sequence Diagram</div><p class="t-default"><p><em>Activate App</em></p>\n</p></div><div class="visual-link__link fx-wrapper fx-s-between fx-a-center"><span class="fc-theme">View Diagram</span><span class="icon">{% svg "standard/icon-visual" %}</span></div></a></div>\n<img class="visual-print-image" src="https://smartdevicelink.com/media/assets/ActivateApp.png">');
    });

    it('sequence diagram with default title and block styles', function() {
        var dd = '# Sequence Diagrams\n|||\n### Activate App\n![](assets/ActivateApp.png)\n|||\n',
            html = md.render(dd).trim();

        html.should.equal('<h1>Sequence Diagrams</h1>\n<div class="visual-link-wrapper"><a href="#" data-src="https://smartdevicelink.com/media/assets/ActivateApp.png" class="visual-link"><div class="visual-link__body"><div class="t-h6 visual-link__title">Sequence Diagram</div><p class="t-default"><h3>Activate App</h3>\n</p></div><div class="visual-link__link fx-wrapper fx-s-between fx-a-center"><span class="fc-theme">View Diagram</span><span class="icon">{% svg "standard/icon-visual" %}</span></div></a></div>\n<img class="visual-print-image" src="https://smartdevicelink.com/media/assets/ActivateApp.png">');
    });
});
