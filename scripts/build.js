// BUKAPASARAN static SEO build for Cloudflare Pages (Node.js 20+)
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const DIST = path.join(ROOT, "dist");
const posts = JSON.parse(fs.readFileSync(path.join(ROOT, "content", "posts.json"), "utf8"));
const SITE = { name: "BUKAPASARAN", origin: "https://bukapasaran.org", description: "Informasi dan panduan BUKAPASARAN." };

function esc(s="") { return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function walk(dir, out=[]) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir,{withFileTypes:true})) {
    const f=path.join(dir,e.name); e.isDirectory()?walk(f,out):out.push(f);
  }
  return out;
}
fs.rmSync(DIST,{recursive:true,force:true});
fs.mkdirSync(DIST,{recursive:true});
// Preserve original homepage, robots, sitemap and all assets from the supplied website.
for (const f of walk(PUBLIC)) {
  const rel=path.relative(PUBLIC,f), dest=path.join(DIST,rel);
  fs.mkdirSync(path.dirname(dest),{recursive:true}); fs.copyFileSync(f,dest);
}
function template(title,desc,url,body,schema="") {
 return `<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="${esc(url)}"><meta property="og:type" content="article"><meta property="og:site_name" content="${SITE.name}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${esc(url)}">${schema?`<script type="application/ld+json">${schema}</script>`:""}</head><body>${body}</body></html>`;
}
const locs = new Set([SITE.origin+"/"]);
for (const p of posts) {
 if (!p.title || !p.slug || !/^[a-z0-9-]+$/.test(p.slug)) throw Error("Artikel/slug tidak valid: "+JSON.stringify(p));
 const url=`${SITE.origin}/${p.slug}/`; locs.add(url);
 const sections=(p.sections||[]).map(s=>`<section><h2>${esc(s.heading)}</h2>${(s.paragraphs||[]).map(t=>`<p>${esc(t)}</p>`).join("")}</section>`).join("");
 const body=`<main><article><h1>${esc(p.title)}</h1><p>${esc(p.category||"Panduan")} · ${esc(p.date||"")}</p>${sections}<p><a href="/">Kembali ke BUKAPASARAN</a></p></article></main>`;
 const schema=JSON.stringify({"@context":"https://schema.org","@type":"Article","headline":p.title,"description":p.description,"datePublished":p.date,"dateModified":p.date,"author":{"@type":"Organization","name":SITE.name},"mainEntityOfPage":url}).replace(/</g,"\\u003c");
 const out=path.join(DIST,p.slug,"index.html"); fs.mkdirSync(path.dirname(out),{recursive:true});
 fs.writeFileSync(out,template(`${p.title} | ${SITE.name}`,p.description,url,body,schema));
}
// Build sitemap from generated article URLs and any existing HTML files.
for (const f of walk(DIST)) if (f.endsWith(".html")) {
 const rel=path.relative(DIST,f).split(path.sep).join("/");
 if (rel==="index.html") continue;
 locs.add(rel.endsWith("/index.html")?`${SITE.origin}/${rel.slice(0,-10)}`:`${SITE.origin}/${rel}`);
}
const xml=s=>s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
fs.writeFileSync(path.join(DIST,"sitemap.xml"),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...locs].map(u=>`<url><loc>${xml(u)}</loc></url>`).join("\n")}\n</urlset>\n`);
const items=posts.map(p=>{const u=`${SITE.origin}/${p.slug}/`;return `<item><title>${xml(p.title)}</title><link>${xml(u)}</link><guid isPermaLink="true">${xml(u)}</guid><description>${xml(p.description)}</description><pubDate>${new Date(`${p.date}T00:00:00Z`).toUTCString()}</pubDate></item>`}).join("\n");
fs.writeFileSync(path.join(DIST,"feed.xml"),`<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>${SITE.name}</title><link>${SITE.origin}/</link><description>${xml(SITE.description)}</description><language>id</language>${items}</channel></rss>\n`);
fs.writeFileSync(path.join(DIST,"robots.txt"),`User-agent: *\nAllow: /\nSitemap: ${SITE.origin}/sitemap.xml\n`);
console.log(`Build selesai: ${posts.length} artikel. Homepage asli disalin tanpa perubahan.`);
