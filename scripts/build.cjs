#!/usr/bin/env node

/**
 * BUILD SCRIPT - Génération des articles HTML depuis Markdown
 * J'ai tout essayé - Intégration Decap CMS
 * 
 * Ce script :
 * 1. Lit tous les fichiers .md dans content/posts/
 * 2. Parse le frontmatter YAML
 * 3. Convertit le markdown en HTML
 * 4. Utilise le template existant (_templates/post.html)
 * 5. Génère les fichiers HTML dans posts/
 * 6. Met à jour la liste d'articles dans index.html
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const marked = require('marked');
const Handlebars = require('handlebars');

// Configuration
const CONFIG = {
    contentDir: './content/posts',
    outputDir: './posts',
    templatePath: './_templates/post.html',
    indexPath: './index.html',
    postsPlaceholder: '<!--POSTS-->'
};

// Helper pour formater les dates
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('fr-FR', options);
}

// Helper pour créer le slug de l'URL
function createSlug(filename) {
    return filename.replace(/\.md$/, '.html');
}

// Configuration de marked pour le Markdown
marked.setOptions({
    gfm: true,
    breaks: true,
    smartLists: true,
    smartypants: true
});

// Enregistrer les helpers Handlebars
Handlebars.registerHelper('each', function(context, options) {
    let ret = '';
    if (context && context.length > 0) {
        for(let i = 0; i < context.length; i++) {
            ret += options.fn(context[i]);
        }
    }
    return ret;
});

Handlebars.registerHelper('if', function(conditional, options) {
    if(conditional) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

// Lire et compiler le template
function loadTemplate() {
    const templateContent = fs.readFileSync(CONFIG.templatePath, 'utf-8');
    return Handlebars.compile(templateContent);
}

// Lire tous les fichiers markdown
function getAllMarkdownFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            getAllMarkdownFiles(filePath, fileList);
        } else if (path.extname(file) === '.md') {
            fileList.push(filePath);
        }
    });
    
    return fileList;
}

// Parser un fichier markdown
function parseMarkdownFile(filePath) {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);
    
    // Convertir le markdown en HTML
    const htmlContent = marked.parse(content);
    
    // Déterminer le type (pile/face) basé sur le dossier
    const relativeDir = path.relative(CONFIG.contentDir, path.dirname(filePath));
    const type = relativeDir.includes('tech') ? 'face' : 'pile';
    
    return {
        frontmatter: {
            ...data,
            type: data.type || type,
            formatted_date: formatDate(data.date),
            reading_time: data.reading_time || 5,
            author: data.author || 'Marie'
        },
        content: htmlContent,
        filename: path.basename(filePath),
        relativePath: relativeDir
    };
}

// Générer le HTML d'un article
function generateArticleHTML(template, articleData) {
    return template({
        ...articleData.frontmatter,
        content: articleData.content
    });
}

// Sauvegarder l'article HTML
function saveArticleHTML(articleData, html) {
    const outputPath = path.join(
        CONFIG.outputDir,
        articleData.relativePath,
        createSlug(articleData.filename)
    );
    
    // Créer le dossier si nécessaire
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, html, 'utf-8');
    console.log(`✅ Généré: ${outputPath}`);
    
    return outputPath;
}

// Générer la carte d'article pour index.html
function generateArticleCard(articleData, outputPath) {
    const { frontmatter } = articleData;
    const url = outputPath.replace(/^\./, '');
    const cardClass = frontmatter.type === 'face' ? 'face-card' : 'pile-card';
    const categoryClass = frontmatter.type === 'face' ? 'terminal' : '';
    const linkClass = frontmatter.type === 'face' ? 'terminal-link' : '';
    const linkText = frontmatter.type === 'face' ? '$ cat article.md' : 'Lire la suite';
    
    const tags = frontmatter.tags || [];
    const tagHTML = tags.map(tag => {
        const tagClass = frontmatter.type === 'face' ? 'tech' : '';
        return `<span class="tag ${tagClass}">${tag}</span>`;
    }).join('\n                    ');
    
    return `
                <article class="article-card ${cardClass}">
                    <div class="card-meta">
                        <span class="category ${categoryClass}">${frontmatter.category}</span>
                        <time datetime="${frontmatter.date}">${frontmatter.formatted_date}</time>
                    </div>
                    <h4 class="card-title">${frontmatter.title}</h4>
                    <p class="card-excerpt">
                        ${frontmatter.excerpt}
                    </p>
                    <div class="card-tags">
                        ${tagHTML}
                    </div>
                    <a href="${url}" class="read-more ${linkClass}">${linkText}</a>
                </article>`;
}

// Mettre à jour index.html avec la liste des articles
function updateIndexHTML(articles) {
    let indexContent = fs.readFileSync(CONFIG.indexPath, 'utf-8');
    
    // Séparer les articles par type
    const pileArticles = articles.filter(a => a.articleData.frontmatter.type === 'pile');
    const faceArticles = articles.filter(a => a.articleData.frontmatter.type === 'face');
    
    // Trier par date (plus récent en premier)
    const sortByDate = (a, b) => new Date(b.articleData.frontmatter.date) - new Date(a.articleData.frontmatter.date);
    pileArticles.sort(sortByDate);
    faceArticles.sort(sortByDate);
    
    // Générer le HTML des cartes
    const pileCardsHTML = pileArticles.slice(0, 4).map(a => 
        generateArticleCard(a.articleData, a.outputPath)
    ).join('\n');
    
    const faceCardsHTML = faceArticles.slice(0, 4).map(a => 
        generateArticleCard(a.articleData, a.outputPath)
    ).join('\n');
    
    // Remplacer les placeholders
    indexContent = indexContent.replace(
        /<!-- PILE_POSTS_START -->[\s\S]*?<!-- PILE_POSTS_END -->/,
        `<!-- PILE_POSTS_START -->\n${pileCardsHTML}\n            <!-- PILE_POSTS_END -->`
    );
    
    indexContent = indexContent.replace(
        /<!-- FACE_POSTS_START -->[\s\S]*?<!-- FACE_POSTS_END -->/,
        `<!-- FACE_POSTS_START -->\n${faceCardsHTML}\n            <!-- FACE_POSTS_END -->`
    );
    
    fs.writeFileSync(CONFIG.indexPath, indexContent, 'utf-8');
    console.log(`✅ index.html mis à jour avec ${articles.length} articles`);
}

// MAIN - Processus de build
async function build() {
    console.log('🚀 Début du build des articles...\n');
    
    try {
        // 1. Charger le template
        console.log('📄 Chargement du template...');
        const template = loadTemplate();
        
        // 2. Récupérer tous les fichiers markdown
        console.log('🔍 Recherche des fichiers markdown...');
        const markdownFiles = getAllMarkdownFiles(CONFIG.contentDir);
        console.log(`   Trouvé ${markdownFiles.length} fichier(s)\n`);
        
        // 3. Générer les articles HTML
        console.log('⚙️  Génération des articles HTML...');
        const articles = [];
        
        for (const filePath of markdownFiles) {
            const articleData = parseMarkdownFile(filePath);
            const html = generateArticleHTML(template, articleData);
            const outputPath = saveArticleHTML(articleData, html);
            
            articles.push({ articleData, outputPath });
        }
        
        console.log('');
        
        // 4. Mettre à jour index.html
        console.log('📝 Mise à jour de index.html...');
        updateIndexHTML(articles);
        
        console.log('\n✨ Build terminé avec succès!');
        console.log(`   ${articles.length} article(s) généré(s)`);
        
    } catch (error) {
        console.error('❌ Erreur lors du build:', error);
        process.exit(1);
    }
}

const fs = require("fs");
const path = require("path");

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function copyFile(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

try {
  // 🔥 Decap cherche /config.yml (racine)
  copyFile("config.yml", "dist/config.yml");

  // 🔥 Decap admin
  copyFile("admin/index.html", "dist/admin/index.html");
  copyFile("admin/config.yml", "dist/admin/config.yml");

  console.log("✅ CMS files copied to dist/");
} catch (e) {
  console.error("❌ Failed to copy CMS files to dist:", e);
}


// Exécuter le build
if (require.main === module) {
    build();
}

module.exports = { build };
