import { createHash, timingSafeEqual } from 'node:crypto';

const EMAIL = 'craig.fredrickson@spiralinglight.com';
const DOCUMENTS = [
  ['prospectus', 'Prospectus', 'The project, its readers, and its place in the conversation.'],
  ['sample-chapters', 'Sample chapters', 'Selected chapters for editorial consideration.'],
];
const HEADERS = {
  'Cache-Control': 'private, no-store, max-age=0',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; img-src data:; base-uri 'none'; frame-ancestors 'none'; form-action 'none'",
};
const CSS = `
:root{color-scheme:light;--ink:#17333b;--muted:#586867;--paper:#f8f6f0;--gold:#9b733e;--line:#d9ded5}
*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.7 system-ui,-apple-system,sans-serif}
a{color:inherit}a:focus-visible{outline:3px solid var(--gold);outline-offset:5px}.wrap{width:min(1000px,calc(100% - 48px));margin:auto}
header{border-bottom:1px solid var(--line)}header .wrap{display:flex;justify-content:space-between;align-items:center;gap:24px;padding:25px 0}
.brand{text-decoration:none;font:26px/1.2 Georgia,serif}.brand small{display:block;font:9px/1.8 system-ui,sans-serif;letter-spacing:.22em;text-transform:uppercase;color:var(--muted);margin-top:6px}
.badge{border:1px solid #bcc8bf;padding:5px 12px;font-size:11px;letter-spacing:.09em;text-transform:uppercase;white-space:nowrap}
main{padding:64px 0 48px}.eyebrow{font-size:11px;letter-spacing:.17em;text-transform:uppercase;color:var(--gold);font-weight:650;margin:0 0 18px}
.intro{display:grid;grid-template-columns:1fr 180px;gap:48px;align-items:center}h1,h2,h3{font-family:Georgia,serif;font-weight:400;line-height:1.15;margin:0}
h1{font-size:clamp(38px,6vw,62px);letter-spacing:-.035em;overflow-wrap:anywhere}.subtitle{font:italic 23px/1.5 Georgia,serif;color:var(--muted);margin:20px 0 0}.author{margin:24px 0 0;font-size:14px}
.sheets{height:215px;background:#e9e4d7;border-left:6px solid #d1c3aa;box-shadow:8px 8px 0 #ddd8cd,16px 16px 0 #eeebe3;padding:25px;display:flex;flex-direction:column;justify-content:space-between;transform:rotate(4deg)}
.sheets b{font:54px/1 Georgia,serif;color:var(--gold)}.sheets span{font-size:10px;letter-spacing:.13em;text-transform:uppercase;line-height:1.7}.description{max-width:720px;color:var(--muted);margin:34px 0 0;font-size:17px;white-space:pre-line}
.materials{margin-top:48px;border-top:1px solid var(--line);padding-top:30px}.section-heading{display:flex;align-items:baseline;justify-content:space-between;gap:20px}h2{font-size:28px}.note{font-size:13px;color:var(--muted)}
.cards{display:grid;grid-template-columns:1fr 1fr;gap:22px;margin-top:22px}.card{background:#fffefa;border:1px solid var(--line);padding:27px;display:flex;flex-direction:column;align-items:flex-start}.number{color:var(--gold);font:18px Georgia,serif;margin-bottom:25px}h3{font-size:25px}.card p{color:var(--muted);font-size:14px;margin:13px 0 22px}.card .status,.button{margin-top:auto}.status{font-size:13px;color:var(--muted);background:#edf0e8;padding:8px 12px}.button{display:inline-block;background:var(--ink);color:#fff;text-decoration:none;padding:12px 17px;font-size:14px}.button:hover{background:#2c4c50}
.contact{margin-top:34px;padding:25px 28px;background:#edf0e8;display:flex;justify-content:space-between;align-items:center;gap:24px}.contact p{margin:0;font-size:14px;color:var(--muted)}.contact a{font-size:14px;text-underline-offset:5px;white-space:nowrap}.notice{margin-top:28px;color:var(--muted);font-size:13px;max-width:760px}
footer{border-top:1px solid var(--line);padding:22px 0 30px;color:var(--muted);font-size:12px}.error{max-width:650px;padding:60px 0 100px}.error p{color:var(--muted);margin:25px 0}
@media(max-width:620px){header .wrap{align-items:flex-start}.brand{font-size:22px}.badge{font-size:9px;padding:4px 8px}.wrap{width:calc(100% - 36px)}main{padding-top:38px}.intro{grid-template-columns:1fr}.sheets{display:none}.subtitle{font-size:21px}.cards{grid-template-columns:1fr}.section-heading{display:block}.section-heading .note{margin-top:8px}.contact{display:block;padding:22px}.contact a{display:inline-block;margin-top:14px}.card{padding:24px}.materials{margin-top:34px}}
`;

function escape(value = '') {
  return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
function shell(title, body) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><meta name="referrer" content="no-referrer"><title>${escape(title)} | Habura Research</title><style>${CSS}</style></head><body><header><div class="wrap"><a class="brand" href="https://www.haburaresearch.org/">Habura Research<small>Scripture · Company · Formation</small></a><span class="badge">By invitation</span></div></header><main class="wrap">${body}</main><footer><div class="wrap">© ${new Date().getUTCFullYear()} Craig R. Fredrickson · For editorial consideration</div></footer></body></html>`;
}
function html(request, title, body, status = 200) {
  return new Response(request.method === 'HEAD' ? null : shell(title, body), {
    status, headers: {...HEADERS, 'Content-Type':'text/html; charset=utf-8'},
  });
}
function unavailable(request, document = false) {
  const title = document ? 'Document not available' : 'An invitation is needed';
  const message = document
    ? 'This document is not available yet. Please return to your invitation page or contact Craig for the current materials.'
    : 'Please use the complete link or QR code Craig shared with you. If you need a new invitation, get in touch.';
  return html(request, title, `<section class="error"><p class="eyebrow">Habura Research</p><h1>${title}</h1><p>${message}</p><a class="button" href="mailto:${EMAIL}">Contact Craig</a></section>`, 404);
}
function matches(token, hash) {
  if (!/^[A-Za-z0-9_-]{32}$/.test(token) || !/^[a-f0-9]{64}$/.test(hash || '')) return false;
  return timingSafeEqual(createHash('sha256').update(token).digest(), Buffer.from(hash, 'hex'));
}
function validDocument(book, document) {
  return document && typeof document.pathname === 'string'
    && new RegExp(`^conference/${book.id}/[a-zA-Z0-9_-]+\\.pdf$`).test(document.pathname)
    && /^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,150}\.pdf$/i.test(document.filename || '');
}

/** Private bearer invitations. Never log requests, tokens, configuration, or blob URLs. */
export async function handleInvitation(request, {configuration, getBlob}) {
  if (!['GET', 'HEAD'].includes(request.method)) {
    return new Response('Method not allowed', {status:405, headers:{...HEADERS, Allow:'GET, HEAD'}});
  }
  try {
    if (!configuration) throw new Error('configuration missing');
    const books = JSON.parse(configuration);
    if (!Array.isArray(books)) throw new Error('configuration invalid');
    const url = new URL(request.url);
    // Support both the original URL and Vercel's rewritten query parameters.
    const path = url.pathname.match(/^\/invitation\/([A-Za-z0-9_-]{32})(?:\/(prospectus|sample-chapters))?\/?$/);
    if (url.searchParams.getAll('token').length > 1 || url.searchParams.getAll('document').length > 1) return unavailable(request);
    const token = path?.[1] || url.searchParams.get('token') || '';
    const documentId = path?.[2] || url.searchParams.get('document');
    const book = books.find(item => item.enabled === true && matches(token, item.tokenHash));
    if (!book || !/^[a-z0-9-]+$/.test(book.id || '') || (book.expiresAt && !(Date.parse(book.expiresAt) > Date.now()))) return unavailable(request);

    if (documentId) {
      if (!DOCUMENTS.some(([id]) => id === documentId)) return unavailable(request, true);
      const doc = book.documents?.[documentId];
      if (!validDocument(book, doc)) return unavailable(request, true);
      const blob = await getBlob(doc.pathname, {access:'private', useCache:false});
      if (blob?.statusCode !== 200) return unavailable(request, true);
      if (request.method === 'HEAD') await blob.stream.cancel();
      return new Response(request.method === 'HEAD' ? null : blob.stream, {
        headers: {...HEADERS, 'Content-Type':'application/pdf',
          'Content-Disposition':`attachment; filename="${doc.filename}"`},
      });
    }

    const title = book.title || 'A new book project';
    const hasFiles = DOCUMENTS.some(([id]) => validDocument(book, book.documents?.[id]));
    const cards = DOCUMENTS.map(([id, label, description], index) => {
      const doc = book.documents?.[id];
      const ready = validDocument(book, doc);
      return `<article class="card"><span class="number">0${index+1}</span><h3>${label}</h3><p>${description}</p>${ready
        ? `<a class="button" href="/invitation/${token}/${id}/">Download ${label.toLowerCase()} <span aria-label="PDF file">(PDF)</span></a>`
        : '<span class="status">In preparation</span>'}</article>`;
    }).join('');
    const contactSubject = encodeURIComponent(`Book inquiry: ${title}`);
    const body = `<section class="intro"><div><p class="eyebrow">A book project · Craig R. Fredrickson</p><h1>${escape(title)}</h1>${book.subtitle ? `<p class="subtitle">${escape(book.subtitle)}</p>` : ''}<p class="author">Prepared for our publishing conversation.</p></div><div class="sheets" aria-hidden="true"><b>H</b><span>Habura Research<br>Editorial materials</span></div></section>${book.description ? `<p class="description">${escape(book.description)}</p>` : ''}<section class="materials" aria-labelledby="materials-title"><div class="section-heading"><h2 id="materials-title">For your consideration</h2><p class="note">${hasFiles ? 'Select a document below.' : 'Materials are being prepared.'}</p></div><div class="cards">${cards}</div></section><section class="contact"><p>Thank you for taking a look.<br>I would welcome a conversation about this project.</p><a href="mailto:${EMAIL}?subject=${contactSubject}">Contact Craig →</a></section><p class="notice">Shared privately for editorial consideration. Please keep this invitation and its materials within your editorial team.${hasFiles ? '' : ' Please return to this same page for the prospectus and sample chapters when they are available.'}</p>`;
    return html(request, title, body);
  } catch {
    console.error('Conference invitation request could not be completed.');
    return html(request, 'Please try again', '<section class="error"><h1>Please try again shortly.</h1><p>The materials are temporarily unavailable. You can also contact Craig directly.</p><a class="button" href="mailto:'+EMAIL+'">Contact Craig</a></section>', 503);
  }
}
