#!/usr/bin/env node

/**
 * BUILD SCRIPT - Génération des articles et pages HTML depuis Markdown
 * J'ai tout essayé
 */

const fs   = require('fs');
const path = require('path');
const matter    = require('gray-matter');
const { marked } = require('marked');
const Handlebars = require('handlebars');

const CONFIG = {
    contentDir:   './content/posts',
    outputDir:    './posts',
    pagesDir:     './pages',
    templatePath: './_templates/post.html',
    indexPath:    './index.html',
};

// ─── HELPERS ────────────────────────────────────────────────

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatDateShort(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

marked.setOptions({ gfm: true, breaks: true });

Handlebars.registerHelper('each', (ctx, opts) => {
    let ret = '';
    if (ctx && ctx.length > 0) ctx.forEach(i => { ret += opts.fn(i); });
    return ret;
});
Handlebars.registerHelper('if', (cond, opts) => cond ? opts.fn(this) : opts.inverse(this));

// ─── FILE UTILS ─────────────────────────────────────────────

function ensureDir(p) {
    fs.mkdirSync(p, { recursive: true });
}

function getAllMarkdownFiles(dir, list = []) {
    if (!fs.existsSync(dir)) return list;
    fs.readdirSync(dir).forEach(file => {
        const fp = path.join(dir, file);
        if (fs.statSync(fp).isDirectory()) getAllMarkdownFiles(fp, list);
        else if (path.extname(file) === '.md') list.push(fp);
    });
    return list;
}

// ─── ARTICLE BUILD ──────────────────────────────────────────

function parseMarkdownFile(filePath) {
    const { data, content } = matter(fs.readFileSync(filePath, 'utf-8'));
    const relativeDir = path.relative(CONFIG.contentDir, path.dirname(filePath));
    const type = data.type || (relativeDir.includes('tech') ? 'face' : 'pile');
    return {
        frontmatter: {
            ...data,
            type,
            formatted_date: formatDate(data.date),
            reading_time: data.reading_time || 5,
            author: data.author || 'Marie',
        },
        content: marked.parse(content),
        filename: path.basename(filePath),
        relativePath: relativeDir,
    };
}

function saveArticleHTML(template, articleData) {
    const outputPath = path.join(
        CONFIG.outputDir,
        articleData.relativePath,
        articleData.filename.replace(/\.md$/, '.html')
    );
    ensureDir(path.dirname(outputPath));
    fs.writeFileSync(outputPath, template({ ...articleData.frontmatter, content: articleData.content }), 'utf-8');
    console.log(`  ✅ ${outputPath}`);
    // Return as absolute URL
    return '/' + outputPath.replace(/^\.?\/?/, '');
}

function generateArticleCard(articleData, url) {
    const fm = articleData.frontmatter;
    const isface  = fm.type === 'face';
    const tags    = (fm.tags || []).map(t => `<span class="tag${isface ? ' tech' : ''}">${t}</span>`).join('\n');
    const linkTxt = isface ? '$ cat article.md' : 'Lire la suite';
    return `
                <article class="article-card ${isface ? 'face-card' : 'pile-card'}">
                    <div class="card-meta">
                        <span class="category${isface ? ' terminal' : ''}">${fm.category || ''}</span>
                        <time datetime="${fm.date}">${formatDateShort(fm.date)}</time>
                    </div>
                    <h4 class="card-title">${fm.title}</h4>
                    <p class="card-excerpt">${fm.excerpt || ''}</p>
                    <div class="card-tags">${tags}</div>
                    <a href="${url}" class="read-more${isface ? ' terminal-link' : ''}">${linkTxt}</a>
                </article>`;
}

function updateIndexHTML(articles) {
    let html = fs.readFileSync(CONFIG.indexPath, 'utf-8');

    const pile = articles.filter(a => a.articleData.frontmatter.type !== 'face')
        .sort((a, b) => new Date(b.articleData.frontmatter.date) - new Date(a.articleData.frontmatter.date));
    const face = articles.filter(a => a.articleData.frontmatter.type === 'face')
        .sort((a, b) => new Date(b.articleData.frontmatter.date) - new Date(a.articleData.frontmatter.date));

    html = html.replace(
        /<!-- PILE_POSTS_START -->[\s\S]*?<!-- PILE_POSTS_END -->/,
        `<!-- PILE_POSTS_START -->\n${pile.slice(0, 4).map(a => generateArticleCard(a.articleData, a.url)).join('\n')}\n            <!-- PILE_POSTS_END -->`
    );
    html = html.replace(
        /<!-- FACE_POSTS_START -->[\s\S]*?<!-- FACE_POSTS_END -->/,
        `<!-- FACE_POSTS_START -->\n${face.slice(0, 4).map(a => generateArticleCard(a.articleData, a.url)).join('\n')}\n            <!-- FACE_POSTS_END -->`
    );

    fs.writeFileSync(CONFIG.indexPath, html, 'utf-8');
    console.log(`  ✅ index.html mis à jour (${articles.length} articles)`);
}

// ─── PAGE LAYOUT ────────────────────────────────────────────

function pageLayout({ title, description, main, theme = '' }) {
    return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${description}">
    <title>${title} — J'ai tout essayé</title>
    <link rel="manifest" href="/manifest.json">
    <meta name="theme-color" content="#FFE5EC">
    <link rel="apple-touch-icon" href="/images/icon-192.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=IBM+Plex+Mono:wght@400;500;600&family=Zen+Kaku+Gothic+New:wght@300;400;500&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/css/main.css">
</head>
<body class="${theme}">
    <header class="site-header">
        <nav class="nav-container">
            <div class="logo-wrapper">
                <h1 class="site-title">
                    <a href="/" style="text-decoration:none;color:inherit">
                        <span class="title-pile">J'ai tout</span>
                        <span class="title-face">essayé</span>
                    </a>
                </h1>
                <p class="site-tagline">Maternité <span class="separator">×</span> Code</p>
            </div>
            <div class="nav-links">
                <a href="/#maternite" class="nav-link pile">Le Labo des Mamans</a>
                <a href="/#coding" class="nav-link face">Vibe Coding</a>
                <a href="/pages/astuces.html" class="nav-link">Petites Astuces</a>
                <a href="/pages/communaute.html" class="nav-link">Communauté</a>
            </div>
            <button class="theme-toggle" aria-label="Basculer le thème"><span class="toggle-icon">◐</span></button>
        </nav>
    </header>

    <main class="main-content" style="max-width:1100px;margin:0 auto;padding:3rem 1.5rem">
        ${main}
    </main>

    <footer class="site-footer">
        <div class="footer-content">
            <div class="values-badges">
                <div class="badge">
                    <span class="badge-icon">🔒</span>
                    <div class="badge-text"><strong>Vie Privée</strong><p>Zéro cookie tiers • Architecture statique</p></div>
                </div>
                <div class="badge">
                    <span class="badge-icon">📱</span>
                    <div class="badge-text"><strong>100% Hors Ligne</strong><p>PWA • Lecture sans réseau</p></div>
                </div>
                <div class="badge">
                    <span class="badge-icon">💝</span>
                    <div class="badge-text"><strong>Communautaire</strong><p>Soutien libre • Échange entre mamans</p></div>
                </div>
            </div>
            <div class="footer-nav">
                <div class="footer-col">
                    <h4>Maternité</h4>
                    <ul>
                        <li><a href="/pages/maternite.html">Tous les articles</a></li>
                        <li><a href="/pages/astuces.html">Petites astuces</a></li>
                    </ul>
                </div>
                <div class="footer-col">
                    <h4>Tech & Code</h4>
                    <ul>
                        <li><a href="/pages/coding.html">Tous les tutos</a></li>
                    </ul>
                </div>
                <div class="footer-col">
                    <h4>Communauté</h4>
                    <ul>
                        <li><a href="/pages/communaute.html">Rejoindre</a></li>
                        <li><a href="/pages/mentions.html">Mentions légales</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-credits">
                <p>Créé avec ❤️ par une maman dev</p>
                <p class="small">Site statique • Aucun tracking • PWA offline-first • Hébergement écologique</p>
            </div>
        </div>
    </footer>

    <script src="/js/main.js"></script>
    <script src="/js/pwa.js"></script>
</body>
</html>`;
}

// ─── LIST PAGES ─────────────────────────────────────────────

function buildMaterniteListPage(articles) {
    const pile = articles
        .filter(a => a.articleData.frontmatter.type !== 'face')
        .sort((a, b) => new Date(b.articleData.frontmatter.date) - new Date(a.articleData.frontmatter.date));

    const cards = pile.length
        ? `<div class="articles-grid pile-grid">${pile.map(a => generateArticleCard(a.articleData, a.url)).join('\n')}</div>`
        : '<p style="color:#888;text-align:center;padding:3rem">Aucun article pour l\u2019instant \u2014 revenez bient\u00f4t\u00a0!</p>';

    const html = pageLayout({
        title: '🌸 Le Labo des Mamans',
        description: 'Tous les articles maternité : allaitement, sommeil, DME, Montessori, santé naturelle.',
        main: `
        <div class="section-header" style="margin-bottom:2rem">
            <h2 class="section-title"><span class="icon">🌸</span> Le Labo des Mamans</h2>
            <p style="color:#888;margin-top:.5rem">${pile.length} article${pile.length !== 1 ? 's' : ''}</p>
        </div>
        ${cards}`,
        theme: 'pile-theme',
    });

    ensureDir(CONFIG.pagesDir);
    fs.writeFileSync(path.join(CONFIG.pagesDir, 'maternite.html'), html, 'utf-8');
    console.log(`  ✅ pages/maternite.html`);
}

function buildCodingListPage(articles) {
    const face = articles
        .filter(a => a.articleData.frontmatter.type === 'face')
        .sort((a, b) => new Date(b.articleData.frontmatter.date) - new Date(a.articleData.frontmatter.date));

    const cards = face.length
        ? `<div class="articles-grid face-grid">${face.map(a => generateArticleCard(a.articleData, a.url)).join('\n')}</div>`
        : '<p style="color:#888;text-align:center;padding:3rem">Aucun tuto pour l\u2019instant \u2014 revenez bient\u00f4t\u00a0!</p>';

    const html = pageLayout({
        title: '💻 Vibe Coding',
        description: 'Tous les articles tech & code : PWA, dev tools, gaming, tutoriels, culture japonaise.',
        main: `
        <div class="section-header" style="margin-bottom:2rem">
            <h2 class="section-title"><span class="icon">💻</span> Vibe Coding</h2>
            <p style="color:#888;margin-top:.5rem">${face.length} article${face.length !== 1 ? 's' : ''}</p>
        </div>
        ${cards}`,
        theme: 'face-theme',
    });

    ensureDir(CONFIG.pagesDir);
    fs.writeFileSync(path.join(CONFIG.pagesDir, 'coding.html'), html, 'utf-8');
    console.log(`  ✅ pages/coding.html`);
}

function buildAstucesPage() {
    const astucesDir = path.join(CONFIG.contentDir, 'astuces');
    const files = getAllMarkdownFiles(astucesDir);
    const astuces = files
        .map(f => {
            const { data, content } = matter(fs.readFileSync(f, 'utf-8'));
            return { title: data.title || '', order: data.order || 99, body: content.trim() };
        })
        .sort((a, b) => a.order - b.order);

    const cards = astuces.length
        ? `<div class="tips-carousel" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1.25rem">
            ${astuces.map(a => `
            <div class="tip-card">
                <h5 class="tip-title">${a.title}</h5>
                <p>${a.body}</p>
            </div>`).join('\n')}
        </div>`
        : '<p style="color:#888;text-align:center;padding:3rem">Aucune astuce pour l\u2019instant \u2014 revenez bient\u00f4t\u00a0!</p>';

    const html = pageLayout({
        title: '✨ Petites Astuces',
        description: 'Toutes les petites astuces naturelles : allaitement, sommeil, santé de bébé.',
        main: `
        <div class="section-header" style="margin-bottom:2rem">
            <h2 class="section-title"><span class="icon">✨</span> Petites Astuces Express</h2>
            <p style="color:#888;margin-top:.5rem">${astuces.length} astuce${astuces.length !== 1 ? 's' : ''}</p>
        </div>
        ${cards}`,
    });

    ensureDir(CONFIG.pagesDir);
    fs.writeFileSync(path.join(CONFIG.pagesDir, 'astuces.html'), html, 'utf-8');
    console.log(`  ✅ pages/astuces.html (${astuces.length} astuces)`);
}

// ─── CLEANUP ORPHANS ────────────────────────────────────────

function cleanOrphanedHTML(validUrls) {
    if (!fs.existsSync(CONFIG.outputDir)) return;
    // Normalize to relative paths without leading ./ or /
    const validPaths = new Set(validUrls.map(u => u.replace(/^\//, '')));

    function scanDir(dir) {
        fs.readdirSync(dir).forEach(file => {
            const fp = path.join(dir, file);
            if (fs.statSync(fp).isDirectory()) {
                scanDir(fp);
            } else if (fp.endsWith('.html')) {
                const rel = fp.replace(/\\/g, '/').replace(/^\.\//, '');
                if (!validPaths.has(rel)) {
                    fs.unlinkSync(fp);
                    console.log(`  🗑  Supprimé (orphelin): ${fp}`);
                }
            }
        });
    }
    scanDir(CONFIG.outputDir);
}

// ─── MAIN BUILD ─────────────────────────────────────────────

async function build() {
    console.log('🚀 Build en cours…\n');
    try {
        console.log('📄 Chargement du template article…');
        const template = Handlebars.compile(fs.readFileSync(CONFIG.templatePath, 'utf-8'));

        console.log('\n⚙️  Génération des articles HTML…');
        const mdFiles  = getAllMarkdownFiles(path.join(CONFIG.contentDir, 'maternite'))
            .concat(getAllMarkdownFiles(path.join(CONFIG.contentDir, 'tech')));

        const articles = [];
        for (const fp of mdFiles) {
            const articleData = parseMarkdownFile(fp);
            const url         = saveArticleHTML(template, articleData);
            articles.push({ articleData, url });
        }

        console.log('\n📝 Mise à jour index.html…');
        updateIndexHTML(articles);

        console.log('\n🗑  Nettoyage des articles orphelins…');
        cleanOrphanedHTML(articles.map(a => a.url));

        console.log('\n📂 Génération des pages de liste…');
        buildMaterniteListPage(articles);
        buildCodingListPage(articles);
        buildAstucesPage();

        console.log(`\n✨ Build terminé — ${articles.length} article(s) + 3 pages de liste`);
    } catch (err) {
        console.error('❌ Erreur build:', err);
        process.exit(1);
    }
}

if (require.main === module) build();
module.exports = { build };
