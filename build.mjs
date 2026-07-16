// Builds the hosted legal pages from the source Markdown.
//   node build.mjs
// Produces index.html, privacy.html, terms.html.
// Dependency-free — handles the small Markdown subset these docs use
// (h1/h2, hr, **bold**, bullet lists, tables, paragraphs, email autolink).
import fs from 'node:fs';

const esc = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const inline = (s) =>
  esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(
      /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
      '<a href="mailto:$1">$1</a>',
    );

function renderTable(rows) {
  const cells = (r) =>
    r.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
  const head = cells(rows[0]);
  const body = rows.slice(2).map(cells); // rows[1] is the |---| separator
  return (
    '<div class="table-wrap"><table><thead><tr>' +
    head.map((c) => `<th>${inline(c)}</th>`).join('') +
    '</tr></thead><tbody>' +
    body
      .map((r) => '<tr>' + r.map((c) => `<td>${inline(c)}</td>`).join('') + '</tr>')
      .join('') +
    '</tbody></table></div>'
  );
}

function mdToHtml(md) {
  const lines = md.split('\n');
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '') { i++; continue; }
    if (/^#\s+/.test(line)) { out.push(`<h1>${inline(line.replace(/^#\s+/, ''))}</h1>`); i++; continue; }
    if (/^##\s+/.test(line)) { out.push(`<h2>${inline(line.replace(/^##\s+/, ''))}</h2>`); i++; continue; }
    if (/^---+$/.test(line.trim())) { out.push('<hr>'); i++; continue; }
    if (/^\|/.test(line)) {
      const rows = [];
      while (i < lines.length && /^\|/.test(lines[i])) { rows.push(lines[i]); i++; }
      out.push(renderTable(rows));
      continue;
    }
    if (/^-\s+/.test(line)) {
      const items = [];
      while (i < lines.length) {
        const l = lines[i];
        if (/^-\s+/.test(l)) { items.push(l.replace(/^-\s+/, '')); i++; }
        else if (/^\s+\S/.test(l)) { items[items.length - 1] += ' ' + l.trim(); i++; } // wrapped line
        else break;
      }
      out.push('<ul>' + items.map((it) => `<li>${inline(it)}</li>`).join('') + '</ul>');
      continue;
    }
    const para = [line];
    i++;
    while (i < lines.length && lines[i].trim() !== '' && !/^(#{1,2}\s|---+$|\||-\s)/.test(lines[i])) {
      para.push(lines[i]); i++;
    }
    out.push(`<p>${inline(para.join(' '))}</p>`);
  }
  return out.join('\n');
}

const page = (title, active, body) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} — MeSize</title>
<meta name="robots" content="index, follow">
<style>
:root { --accent:#3B82F6; --ink:#1a1c1e; --muted:#5b6470; --bg:#f6f8fb; --card:#ffffff; --border:#e6eaf0; }
@media (prefers-color-scheme: dark){
  :root { --accent:#62A5FD; --ink:#e8eaed; --muted:#9aa4b2; --bg:#0f1216; --card:#161a20; --border:#252b33; }
}
* { box-sizing:border-box; }
body { margin:0; background:var(--bg); color:var(--ink);
  font:16px/1.65 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  -webkit-font-smoothing:antialiased; }
.wrap { max-width:760px; margin:0 auto; padding:24px 20px 72px; }
header.site { display:flex; align-items:center; gap:10px; padding:6px 0 18px; }
.brand { display:flex; align-items:center; gap:10px; font-weight:800; font-size:18px; text-decoration:none; color:var(--ink); }
.logo { width:28px; height:28px; border-radius:8px; background:var(--accent); display:inline-block; }
nav { margin-left:auto; display:flex; gap:14px; flex-wrap:wrap; }
nav a { color:var(--muted); text-decoration:none; font-size:14px; font-weight:600; }
nav a.active, nav a:hover { color:var(--accent); }
main { background:var(--card); border:1px solid var(--border); border-radius:16px; padding:28px 30px; }
h1 { font-size:28px; line-height:1.25; margin:.2em 0 .4em; }
h2 { font-size:19px; margin:1.6em 0 .5em; padding-top:.2em; }
p { margin:.7em 0; color:var(--ink); }
ul { margin:.6em 0 1em; padding-left:1.25em; }
li { margin:.35em 0; }
strong { font-weight:700; }
a { color:var(--accent); }
hr { border:none; border-top:1px solid var(--border); margin:1.8em 0; }
.table-wrap { overflow-x:auto; }
table { border-collapse:collapse; width:100%; margin:1em 0; font-size:14.5px; }
th,td { border:1px solid var(--border); padding:9px 12px; text-align:left; vertical-align:top; }
th { background:rgba(59,130,246,.08); font-weight:700; }
footer { margin-top:26px; color:var(--muted); font-size:13px; text-align:center; }
@media (max-width:560px){ main{ padding:20px 18px; } h1{ font-size:24px; } }
</style>
</head>
<body>
<div class="wrap">
<header class="site">
  <a class="brand" href="./index.html"><span class="logo"></span>MeSize</a>
  <nav>
    <a href="./index.html"${active === 'home' ? ' class="active"' : ''}>Home</a>
    <a href="./privacy.html"${active === 'privacy' ? ' class="active"' : ''}>Privacy</a>
    <a href="./terms.html"${active === 'terms' ? ' class="active"' : ''}>Terms</a>
  </nav>
</header>
<main>
${body}
</main>
<footer>© ${new Date().getFullYear()} MeSize · <a href="mailto:verbytskyi.nazar@gmail.com">verbytskyi.nazar@gmail.com</a></footer>
</div>
</body>
</html>
`;

const privacy = mdToHtml(fs.readFileSync('privacy-policy.md', 'utf8'));
const terms = mdToHtml(fs.readFileSync('terms-of-service.md', 'utf8'));

const indexBody = `<h1>MeSize — Legal</h1>
<p>MeSize helps you save and organize your own clothing and shoe sizes, body measurements, and a personal catalog of the items you own. These are the app's legal documents.</p>
<ul>
<li><a href="./privacy.html">Privacy Policy</a></li>
<li><a href="./terms.html">Terms of Service</a></li>
</ul>
<p>Questions? Contact <a href="mailto:verbytskyi.nazar@gmail.com">verbytskyi.nazar@gmail.com</a>.</p>`;

fs.writeFileSync('index.html', page('Legal', 'home', indexBody));
fs.writeFileSync('privacy.html', page('Privacy Policy', 'privacy', privacy));
fs.writeFileSync('terms.html', page('Terms of Service', 'terms', terms));
console.log('Built index.html, privacy.html, terms.html');
