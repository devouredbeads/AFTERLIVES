/* AFTERLIVES — a static, build-free research prototype.
   Reads window.AFTERLIVES_DATA (data.js). Notes are saved in the browser's localStorage. */
(function () {
  'use strict';
  var D = window.AFTERLIVES_DATA;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var store = {
    get: function (k, def) { try { var v = localStorage.getItem('afterlives:' + k); return v ? JSON.parse(v) : def; } catch (e) { return def; } },
    set: function (k, v) { try { localStorage.setItem('afterlives:' + k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
  };

  var V = {}; D.versions.forEach(function (v) { V[v.id] = v; });
  var TOPIC = {}; D.topics.forEach(function (t) { TOPIC[t.id] = t; });
  var STATUS = { verified: 'Verified fact', interpretation: 'Interpretation', missing: 'Missing information', ai: 'AI-generated' };
  var REL = { 'documented adaptation': 'e-doc', 'stated inspiration': 'e-stated', 'thematic parallel': 'e-theme' };

  var S = {
    node: D.versions[0].id, edge: null,
    A: D.versions[0].id, B: D.versions[D.versions.length - 1].id, diff: true,
    ledger: D.versions[0].id, filter: 'all', pair: 'all',
    ann: store.get('ann', {}), lens: store.get('lens', {})
  };

  var pill = function (cls, t) { return '<span class="pill ' + cls + '">' + esc(t) + '</span>'; };
  var vs = function (id) { return esc(V[id].short); };
  var pairKey = function (a, b) { return [a, b].sort().join('|'); };
  var edgeBetween = function (a, b) {
    return D.edges.filter(function (e) { return (e.from === a && e.to === b) || (e.from === b && e.to === a); })[0];
  };
  var relCls = function (t) { return REL[t] || 'e-theme'; };

  /* ---------- word-level "potential differences" (content words missing from the other passage) ---------- */
  var STOP = new Set(('the a an and of to in on at for with by from as is was were be been it its his her their he she they them that this these those but or so than then when while which who whom whose into out up down over under after before until during about against between through again once here there all any both each few more most other some such nor not only own same too very can will just should now until').split(' '));
  function contentSet(t) {
    var set = new Set(); (t.toLowerCase().match(/[a-z’']+/g) || []).forEach(function (w) { if (w.length > 3 && !STOP.has(w)) set.add(w); }); return set;
  }
  function highlight(text, other) {
    return text.split(/([A-Za-z’']+)/).map(function (p, i) {
      if (i % 2 === 0) return esc(p);
      var k = p.toLowerCase();
      return (k.length > 3 && !STOP.has(k) && !other.has(k)) ? '<mark>' + esc(p) + '</mark>' : esc(p);
    }).join('');
  }

  /* ---------- views ---------- */
  function viewHome() {
    var c = D.collection;
    return '<section class="hero"><p class="eyebrow">A digital literary research studio</p>' +
      '<h1>Every story leaves traces.</h1>' +
      '<p class="lede">Explore how narratives change across languages, cultures, and media.</p></section>' +
      '<section class="grid3">' +
      '<a class="card feature" href="#/lineage"><p class="eyebrow">Featured research collection</p><h2>' + esc(c.title) + '</h2><p>' + esc(c.subtitle) + '</p><span class="btn">Explore story lineages</span></a>' +
      '<a class="card" href="#/compare"><h2>Compare versions</h2><p>Examine changes side by side.</p></a>' +
      '<a class="card" href="#/notes"><h2>Research notes</h2><p>Save evidence and interpretations.</p></a></section>' +
      '<section class="four" aria-label="Core features">' +
      '<a class="tile" href="#/lineage"><h3>Story Lineage</h3><p>Trace a story’s documented versions.</p></a>' +
      '<a class="tile" href="#/compare"><h3>Comparison Room</h3><p>Examine what changed.</p></a>' +
      '<a class="tile" href="#/lens"><h3>Critical Lens</h3><p>Turn differences into research questions.</p></a>' +
      '<a class="tile" href="#/ledger"><h3>Context Ledger</h3><p>Record what is known and what remains uncertain.</p></a></section>' +
      '<p class="demo-note"><strong>Demo collection.</strong> ' + esc(c.note) + ' Replace <code>data.js</code> with a verified case study to use Afterlives for real research.</p>';
  }

  function layout() {
    var depth = {}, inc = {};
    D.edges.forEach(function (e) { (inc[e.to] = inc[e.to] || []).push(e.from); });
    function d(id) {
      if (depth[id] !== undefined) return depth[id];
      depth[id] = 0; // guards against cycles
      var ins = inc[id] || [];
      depth[id] = ins.length ? Math.max.apply(null, ins.map(d)) + 1 : 0;
      return depth[id];
    }
    D.versions.forEach(function (v) { d(v.id); });
    var maxD = Math.max.apply(null, Object.keys(depth).map(function (k) { return depth[k]; }).concat([1]));
    var cols = {}; D.versions.forEach(function (v) { (cols[depth[v.id]] = cols[depth[v.id]] || []).push(v.id); });
    var W = 900, nw = 170, pos = {};
    Object.keys(cols).forEach(function (dd) {
      var ids = cols[dd];
      ids.forEach(function (id, i) {
        pos[id] = { x: 30 + dd * ((W - 60 - nw) / maxD), cy: ids.length === 1 ? 210 : 140 + i * (140 / (ids.length - 1)), d: +dd };
      });
    });
    return pos;
  }

  function viewLineage() {
    var pos = layout(), nw = 170, nh = 84;
    var edges = D.edges.map(function (e, i) {
      var a = pos[e.from], b = pos[e.to], x1 = a.x + nw, y1 = a.cy, x2 = b.x, y2 = b.cy, path, lx, ly;
      if (b.d - a.d > 1) {
        path = 'M' + x1 + ',' + y1 + ' C' + (x1 + 70) + ',' + (y1 - 140) + ' ' + (x2 - 70) + ',' + (y2 - 140) + ' ' + x2 + ',' + y2;
        lx = (x1 + x2) / 2; ly = (y1 + y2) / 2 - 108;
      } else {
        var mx = x1 + (x2 - x1) / 2;
        path = 'M' + x1 + ',' + y1 + ' C' + mx + ',' + y1 + ' ' + mx + ',' + y2 + ' ' + x2 + ',' + y2;
        lx = mx; ly = (y1 + y2) / 2 - 12;
      }
      var cls = relCls(e.type), marker = cls === 'e-doc' ? 'arrDoc' : cls === 'e-stated' ? 'arrStated' : 'arrTheme';
      return '<g class="edge ' + cls + (S.edge === i ? ' sel' : '') + '">' +
        '<path class="line" d="' + path + '" marker-end="url(#' + marker + ')"/>' +
        '<path class="hit" d="' + path + '" data-edge="' + i + '"><title>' + esc(e.type) + '</title></path>' +
        '<text x="' + lx + '" y="' + ly + '">' + esc(e.type) + '</text></g>';
    }).join('');
    var nodes = D.versions.map(function (v) {
      var p = pos[v.id];
      return '<g class="node' + (S.edge === null && S.node === v.id ? ' sel' : '') + '" data-node="' + v.id + '" tabindex="0" role="button" aria-label="' + esc(v.short) + '">' +
        '<rect x="' + p.x + '" y="' + (p.cy - nh / 2) + '" width="' + nw + '" height="' + nh + '" rx="10"/>' +
        '<text class="n-title" x="' + (p.x + 14) + '" y="' + (p.cy - 4) + '">' + esc(v.short) + '</text>' +
        '<text class="n-sub" x="' + (p.x + 14) + '" y="' + (p.cy + 18) + '">' + esc(v.year) + '</text></g>';
    }).join('');
    var svg = '<svg viewBox="0 0 900 340" role="group" aria-label="Story lineage tree"><defs>' +
      '<marker id="arrDoc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#7A2E3A"/></marker>' +
      '<marker id="arrStated" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#2E7D7A"/></marker>' +
      '<marker id="arrTheme" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#8A8578"/></marker></defs>' +
      edges + nodes + '</svg>';
    var conn = '<ul class="conn">' + D.edges.map(function (e, i) {
      return '<li data-edge="' + i + '" class="' + (S.edge === i ? 'sel' : '') + '"><div class="rel">' + pill(relCls(e.type), e.type) + '<span>' + vs(e.from) + ' → ' + vs(e.to) + '</span></div>' + esc(e.evidence) + '</li>';
    }).join('') + '</ul>';
    var side;
    if (S.edge !== null && D.edges[S.edge]) {
      var e = D.edges[S.edge];
      side = '<p class="eyebrow">Connection</p><h2>' + vs(e.from) + ' → ' + vs(e.to) + '</h2><p>' + pill(relCls(e.type), e.type) + '</p>' +
        '<h3>Evidence</h3><p>' + esc(e.evidence) + '</p>' +
        '<p class="note-small">A connection is labeled by its evidence. Similarity alone does not establish that one work influenced another.</p>' +
        '<a class="btn small" href="#/compare" data-compare="' + e.from + '|' + e.to + '">Compare these versions</a>';
    } else {
      var v = V[S.node];
      side = '<p class="eyebrow">Version</p><h2>' + esc(v.title) + '</h2><p>' + esc(v.summary) + '</p>' +
        '<dl class="meta"><dt>Medium</dt><dd>' + esc(v.medium) + '</dd><dt>Date</dt><dd>' + esc(v.year) + '</dd><dt>Language</dt><dd>' + esc(v.lang) + '</dd></dl>' +
        '<a class="btn small ghost" href="#/ledger" data-ledger="' + v.id + '">Open in Context Ledger</a>';
    }
    return '<div class="page-head"><p class="eyebrow">Feature 1</p><h1>The Story Lineage</h1><p>Trace a story’s documented versions. Select a version or a connection to see what is known about it.</p></div>' +
      '<div class="grid2"><section class="card" aria-label="Lineage tree">' + svg +
      '<div class="legend"><span><i class="swatch doc"></i>documented adaptation</span><span><i class="swatch stated"></i>stated inspiration</span><span><i class="swatch theme"></i>thematic parallel</span></div>' + conn + '</section>' +
      '<aside class="card" aria-live="polite">' + side + '</aside></div>';
  }

  function viewCompare() {
    var A = S.A, B = S.B;
    var opts = function (sel) { return D.versions.map(function (v) { return '<option value="' + v.id + '"' + (v.id === sel ? ' selected' : '') + '>' + esc(v.short) + '</option>'; }).join(''); };
    var head = '<div class="page-head"><p class="eyebrow">Feature 2</p><h1>The Comparison Room</h1><p>Examine what changed. Pick two versions and read their passages side by side. Highlights are only potential differences: words that do not appear in the other passage.</p></div>' +
      '<div class="controls"><div><label for="selA">Version A</label><select id="selA">' + opts(A) + '</select></div>' +
      '<div><label for="selB">Version B</label><select id="selB">' + opts(B) + '</select></div>' +
      '<label class="check"><input type="checkbox" id="diff"' + (S.diff ? ' checked' : '') + '> Highlight potential differences</label></div>';
    if (A === B) return head + '<p class="empty">Choose two different versions to compare.</p>';
    var e = edgeBetween(A, B);
    var rel = e
      ? '<div class="relbox">' + pill(relCls(e.type), e.type) + ' <strong>' + vs(e.from) + ' → ' + vs(e.to) + '.</strong> ' + esc(e.evidence) + '</div>'
      : '<div class="relbox">No documented connection is recorded between these versions. Resemblance alone does not show influence.</div>';
    var rows = D.topics.map(function (t) {
      var ta = D.passages[A][t.id], tb = D.passages[B][t.id], key = pairKey(A, B) + '|' + t.id;
      var ha = S.diff ? highlight(ta, contentSet(tb)) : esc(ta), hb = S.diff ? highlight(tb, contentSet(ta)) : esc(tb);
      return '<section class="topic"><h2>' + esc(t.label) + '</h2><div class="cols2">' +
        '<div class="passage"><div class="who"><span>' + vs(A) + '</span><span>' + esc(V[A].year) + '</span></div><p>' + ha + '</p></div>' +
        '<div class="passage"><div class="who"><span>' + vs(B) + '</span><span>' + esc(V[B].year) + '</span></div><p>' + hb + '</p></div></div>' +
        '<div class="annot"><label for="ann-' + t.id + '">Your annotation: what changed, and what might explain it? Keep what you observe separate from what you suppose.</label>' +
        '<textarea id="ann-' + t.id + '" data-ann="' + esc(key) + '">' + esc(S.ann[key] || '') + '</textarea></div></section>';
    }).join('');
    return head + rel + rows;
  }

  function lensCard(s) {
    var st = S.lens[s.id] || {}, status = st.status || '';
    var passages = s.passages.map(function (p) {
      return '<blockquote><cite>' + vs(p.v) + ' · ' + esc(TOPIC[p.t].label) + '</cite>' + esc(D.passages[p.v][p.t]) + '</blockquote>';
    }).join('');
    var qbox = status === 'revised'
      ? '<label for="q-' + s.id + '">Your revised question</label><textarea id="q-' + s.id + '" data-lens-text="' + s.id + '">' + esc(st.text != null ? st.text : s.question) + '</textarea>'
      : '<p class="q">' + esc(s.question) + '</p>';
    return '<article class="sugg ' + status + '"><div class="tagrow">' + pill('ai', 'AI suggestion · prepared demo') +
      '<span>' + vs(s.pair[0]) + ' → ' + vs(s.pair[1]) + ' · ' + esc(TOPIC[s.topic].label) + '</span>' + (status ? pill(status, status === 'accepted' ? 'Accepted as question' : status === 'revised' ? 'Revised' : 'Rejected') : '') + '</div>' +
      '<h3>What the text shows</h3><p>' + esc(s.observation) + '</p>' +
      '<h3>A possible question</h3>' + qbox +
      '<details><summary>Linked passages (' + s.passages.length + ')</summary>' + passages + '</details>' +
      '<div class="actions"><button class="btn small teal" data-act="accepted" data-id="' + s.id + '">Accept as question</button>' +
      '<button class="btn small gold" data-act="revised" data-id="' + s.id + '">Revise</button>' +
      '<button class="btn small gray" data-act="rejected" data-id="' + s.id + '">Reject</button>' +
      (status ? '<button class="btn small ghost" data-act="" data-id="' + s.id + '">Reset</button>' : '') + '</div>' +
      '<label for="c-' + s.id + '">Add a competing interpretation</label>' +
      '<textarea id="c-' + s.id + '" data-comp="' + s.id + '" placeholder="What else could explain this change?">' + esc(st.competing || '') + '</textarea></article>';
  }

  function viewLens() {
    var pairs = []; D.suggestions.forEach(function (s) { var k = s.pair.join('|'); if (pairs.indexOf(k) < 0) pairs.push(k); });
    var opts = '<option value="all">All version pairs</option>' + pairs.map(function (k) {
      var p = k.split('|'); return '<option value="' + k + '"' + (S.pair === k ? ' selected' : '') + '>' + esc(V[p[0]].short) + ' → ' + esc(V[p[1]].short) + '</option>';
    }).join('');
    var list = D.suggestions.filter(function (s) { return S.pair === 'all' || s.pair.join('|') === S.pair; }).map(lensCard).join('');
    return '<div class="page-head"><p class="eyebrow">Feature 3</p><h1>The Critical Lens</h1><p>Turn differences into research questions. Each suggestion points to the passages that prompted it. You decide what becomes a question: accept it, revise it, reject it, or add a competing interpretation.</p></div>' +
      '<p class="demo-note" style="margin-top:0;margin-bottom:1.25rem">These suggestions are prepared examples for the demo collection, not live model output. Always check them against the linked passages.</p>' +
      '<div class="controls"><div><label for="pair">Show suggestions for</label><select id="pair">' + opts + '</select></div></div>' + list;
  }

  function viewLedger() {
    var rows = D.ledger[S.ledger].filter(function (r) { return S.filter === 'all' || r.status === S.filter; });
    var tabs = '<div class="tabs" role="group" aria-label="Version">' + D.versions.map(function (v) {
      return '<button class="tab" data-ledger-tab="' + v.id + '" aria-pressed="' + (v.id === S.ledger) + '">' + esc(v.short) + '</button>';
    }).join('') + '</div>';
    var chips = '<div class="tabs" role="group" aria-label="Filter by status"><button class="tab" data-filter="all" aria-pressed="' + (S.filter === 'all') + '">All</button>' +
      Object.keys(STATUS).map(function (k) { return '<button class="tab" data-filter="' + k + '" aria-pressed="' + (S.filter === k) + '">' + STATUS[k] + '</button>'; }).join('') + '</div>';
    var body = rows.length ? rows.map(function (r) {
      return '<tr><td>' + esc(r.field) + '</td><td>' + esc(r.value) + '</td><td>' + pill(r.status, STATUS[r.status]) + '</td></tr>';
    }).join('') : '<tr><td colspan="3">No entries with this status.</td></tr>';
    return '<div class="page-head"><p class="eyebrow">Feature 4</p><h1>The Context Ledger</h1><p>Record what is known and what remains uncertain. Verified facts, interpretations, missing information, and AI-generated suggestions are kept apart, so plausible speculation is never presented as established literary history.</p></div>' +
      tabs + '<div class="card" style="margin-bottom:1rem"><dl class="meta" style="margin:0"><dt>Version</dt><dd>' + esc(V[S.ledger].title) + '</dd><dt>Medium</dt><dd>' + esc(V[S.ledger].medium) + '</dd></dl></div>' + chips +
      '<div class="scroll"><table><thead><tr><th>Field</th><th>Entry</th><th>Status</th></tr></thead><tbody>' + body + '</tbody></table></div>';
  }

  function notesData() {
    var qs = D.suggestions.filter(function (s) { var l = S.lens[s.id]; return l && (l.status === 'accepted' || l.status === 'revised'); });
    var comps = D.suggestions.filter(function (s) { var l = S.lens[s.id]; return l && l.competing && l.competing.trim(); });
    var anns = Object.keys(S.ann).filter(function (k) { return S.ann[k] && S.ann[k].trim(); }).map(function (k) {
      var p = k.split('|'); return { a: p[0], b: p[1], topic: p[2], text: S.ann[k] };
    }).filter(function (a) { return V[a.a] && V[a.b] && TOPIC[a.topic]; });
    return { qs: qs, comps: comps, anns: anns };
  }
  function qText(s) { var l = S.lens[s.id]; return l && l.status === 'revised' && l.text != null ? l.text : s.question; }

  function viewNotes() {
    var n = notesData(), none = !n.qs.length && !n.comps.length && !n.anns.length;
    var q = n.qs.length ? '<ul class="nlist">' + n.qs.map(function (s) {
      return '<li><span class="lbl" style="margin-top:0">' + vs(s.pair[0]) + ' → ' + vs(s.pair[1]) + ' · ' + esc(TOPIC[s.topic].label) + '</span>' +
        '<span class="lbl">Observed in the text</span>' + esc(s.observation) + '<span class="lbl">My research question</span><em>' + esc(qText(s)) + '</em></li>';
    }).join('') + '</ul>' : '<p class="empty">No questions yet. Accept or revise a suggestion in the Critical Lens.</p>';
    var c = n.comps.length ? '<ul class="nlist">' + n.comps.map(function (s) {
      return '<li><span class="lbl" style="margin-top:0">' + esc(TOPIC[s.topic].label) + ' · ' + vs(s.pair[0]) + ' → ' + vs(s.pair[1]) + '</span>' + esc(S.lens[s.id].competing) + '</li>';
    }).join('') + '</ul>' : '<p class="empty">No competing interpretations yet.</p>';
    var a = n.anns.length ? '<ul class="nlist">' + n.anns.map(function (x) {
      return '<li><span class="lbl" style="margin-top:0">' + vs(x.a) + ' / ' + vs(x.b) + ' · ' + esc(TOPIC[x.topic].label) + '</span>' + esc(x.text).replace(/\n/g, '<br>') + '</li>';
    }).join('') + '</ul>' : '<p class="empty">No annotations yet. Write them in the Comparison Room.</p>';
    return '<div class="page-head"><p class="eyebrow">Research notes</p><h1>Evidence and interpretations</h1><p>Everything you have saved in this browser. Observations come from the text; questions and interpretations are yours.</p></div>' +
      '<div class="actions"><button class="btn" data-export' + (none ? ' disabled' : '') + '>Download as Markdown</button><button class="btn ghost" data-clear' + (none ? ' disabled' : '') + '>Clear all notes</button></div>' +
      '<h2>Research questions</h2>' + q + '<h2 style="margin-top:1.5rem">Competing interpretations</h2>' + c + '<h2 style="margin-top:1.5rem">Annotations</h2>' + a;
  }

  function exportMarkdown() {
    var n = notesData(), out = ['# Afterlives research notes', '', '_Collection: ' + D.collection.title + ' (' + D.work.title + ')_', ''];
    out.push('## Research questions', '');
    n.qs.forEach(function (s) {
      out.push('- **' + V[s.pair[0]].short + ' → ' + V[s.pair[1]].short + ' · ' + TOPIC[s.topic].label + '**', '  - Observed in the text: ' + s.observation, '  - My research question: ' + qText(s));
    });
    out.push('', '## Competing interpretations', '');
    n.comps.forEach(function (s) { out.push('- **' + TOPIC[s.topic].label + ' · ' + V[s.pair[0]].short + ' → ' + V[s.pair[1]].short + ':** ' + S.lens[s.id].competing); });
    out.push('', '## Annotations', '');
    n.anns.forEach(function (x) { out.push('- **' + V[x.a].short + ' / ' + V[x.b].short + ' · ' + TOPIC[x.topic].label + ':** ' + x.text.replace(/\n+/g, ' ')); });
    var blob = new Blob([out.join('\n') + '\n'], { type: 'text/markdown' });
    var url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = 'afterlives-notes.md'; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 500);
  }

  /* ---------- router + events ---------- */
  var ROUTES = { home: viewHome, lineage: viewLineage, compare: viewCompare, lens: viewLens, ledger: viewLedger, notes: viewNotes };
  var TITLES = { home: 'Home', lineage: 'Story Lineage', compare: 'Comparison Room', lens: 'Critical Lens', ledger: 'Context Ledger', notes: 'Research Notes' };
  function route() { var r = (location.hash.match(/^#\/(\w+)/) || [])[1]; return ROUTES[r] ? r : 'home'; }
  function render(keepScroll) {
    var y = window.scrollY, r = route();
    $('#app').innerHTML = ROUTES[r]();
    document.title = (r === 'home' ? '' : TITLES[r] + ' · ') + 'Afterlives';
    Array.prototype.forEach.call(document.querySelectorAll('#nav a'), function (a) {
      if (a.getAttribute('data-route') === r) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    window.scrollTo(0, keepScroll ? y : 0);
  }
  window.addEventListener('hashchange', function () { render(false); });

  document.addEventListener('click', function (ev) {
    var t = ev.target, el;
    if ((el = t.closest('[data-node]'))) { S.node = el.getAttribute('data-node'); S.edge = null; render(true); return; }
    if ((el = t.closest('[data-edge]'))) { S.edge = +el.getAttribute('data-edge'); render(true); return; }
    if ((el = t.closest('[data-compare]'))) { var p = el.getAttribute('data-compare').split('|'); S.A = p[0]; S.B = p[1]; return; }
    if ((el = t.closest('[data-ledger]'))) { S.ledger = el.getAttribute('data-ledger'); return; }
    if ((el = t.closest('[data-ledger-tab]'))) { S.ledger = el.getAttribute('data-ledger-tab'); render(true); return; }
    if ((el = t.closest('[data-filter]'))) { S.filter = el.getAttribute('data-filter'); render(true); return; }
    if ((el = t.closest('[data-act]'))) {
      var id = el.getAttribute('data-id'), act = el.getAttribute('data-act'), cur = S.lens[id] || {};
      if (!act) delete S.lens[id]; else S.lens[id] = { status: act, text: cur.text, competing: cur.competing };
      store.set('lens', S.lens); render(true); return;
    }
    if (t.closest('[data-export]')) { exportMarkdown(); return; }
    if (t.closest('[data-clear]')) {
      if (confirm('Clear all saved notes, questions, and annotations from this browser?')) { S.ann = {}; S.lens = {}; store.set('ann', S.ann); store.set('lens', S.lens); render(true); }
    }
  });
  document.addEventListener('keydown', function (ev) {
    if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.matches && ev.target.matches('[data-node]')) { ev.preventDefault(); S.node = ev.target.getAttribute('data-node'); S.edge = null; render(true); var n = $('[data-node="' + S.node + '"]'); if (n) n.focus(); }
  });
  document.addEventListener('change', function (ev) {
    var t = ev.target;
    if (t.id === 'selA') { S.A = t.value; render(true); }
    else if (t.id === 'selB') { S.B = t.value; render(true); }
    else if (t.id === 'diff') { S.diff = t.checked; render(true); }
    else if (t.id === 'pair') { S.pair = t.value; render(true); }
  });
  document.addEventListener('input', function (ev) {
    var t = ev.target, k;
    if ((k = t.getAttribute && t.getAttribute('data-ann'))) { S.ann[k] = t.value; store.set('ann', S.ann); }
    else if ((k = t.getAttribute && t.getAttribute('data-lens-text'))) { S.lens[k] = Object.assign({}, S.lens[k], { text: t.value }); store.set('lens', S.lens); }
    else if ((k = t.getAttribute && t.getAttribute('data-comp'))) { S.lens[k] = Object.assign({}, S.lens[k], { competing: t.value }); store.set('lens', S.lens); }
  });

  render(false);
})();
