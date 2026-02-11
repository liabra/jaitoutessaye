#!/usr/bin/env node

/**
 * MIGRATION SCRIPT
 * Convertit vos articles HTML existants en Markdown
 * 
 * Usage: node scripts/migrate-existing-posts.js
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Configuration
const CONFIG = {
    sourceDir: './posts',           // Dossier de vos articles HTML actuels
    targetDir: './content/posts',   // Dossier de destination (Markdown)
    backupDir: './posts-backup'     // Sauvegarde de sécurité
};

/**
 * Extraire les métadonnées d'un article HTML
 */
function extractMetadata($) {
    const metadata = {
        title: '',
        date: '',
        category: '',
        excerpt: '',
        tags: [],
        author: 'Marie',
        reading_time: 5
    };

    // Titre
    const title = $('.post-title').first().text().trim();
    metadata.title = title;

    // Date
    const dateAttr = $('time').attr('datetime');
    if (dateAttr) {
        metadata.date = new Date(dateAttr).toISOString();
    } else {
        metadata.date = new Date().toISOString();
    }

    // Catégorie
    const category = $('.category').first().text().trim();
    metadata.category = category || 'Autre';

    // Excerpt
    const excerpt = $('.post-subtitle').first().text().trim();
    metadata.excerpt = excerpt || title;

    // Tags
    const tags = [];
    $('.tag').each(function() {
        const tag = $(this).text().trim();
        if (tag) tags.push(tag);
    });
    metadata.tags = tags;

    // Temps de lecture
    const readingTime = $('.reading-time').first().text();
    const match = readingTime.match(/(\d+)/);
    if (match) {
        metadata.reading_time = parseInt(match[1]);
    }

    return metadata;
}

/**
 * Convertir HTML en Markdown (basique)
 */
function htmlToMarkdown($, content) {
    let markdown = '';

    content.find('section.content-section').each(function() {
        const section = $(this);

        // Titres
        section.find('h2').each(function() {
            markdown += `\n## ${$(this).text().trim()}\n\n`;
        });

        section.find('h3').each(function() {
            markdown += `\n### ${$(this).text().trim()}\n\n`;
        });

        section.find('h4').each(function() {
            markdown += `\n#### ${$(this).text().trim()}\n\n`;
        });

        // Paragraphes
        section.find('p').each(function() {
            const text = $(this).text().trim();
            if (text && !$(this).parent().is('li')) {
                markdown += `${text}\n\n`;
            }
        });

        // Listes
        section.find('ul').each(function() {
            $(this).find('li').each(function() {
                markdown += `- ${$(this).text().trim()}\n`;
            });
            markdown += '\n';
        });

        section.find('ol').each(function() {
            let index = 1;
            $(this).find('li').each(function() {
                markdown += `${index}. ${$(this).text().trim()}\n`;
                index++;
            });
            markdown += '\n';
        });

        // Code blocks
        section.find('pre code').each(function() {
            const code = $(this).text().trim();
            markdown += `\`\`\`\n${code}\n\`\`\`\n\n`;
        });

        // Inline code
        section.find('code').not('pre code').each(function() {
            const code = $(this).text().trim();
            // Note: Cette conversion est simplifiée
            // En production, utilisez un vrai convertisseur HTML→MD
        });
    });

    return markdown;
}

/**
 * Créer le frontmatter YAML
 */
function createFrontmatter(metadata) {
    const tags = metadata.tags.map(tag => `  - ${tag}`).join('\n');
    
    return `---
title: "${metadata.title}"
date: ${metadata.date}
slug: "${metadata.slug}"
category: "${metadata.category}"
excerpt: "${metadata.excerpt}"
tags:
${tags}
reading_time: ${metadata.reading_time}
author: "${metadata.author}"
type: "${metadata.type}"
---

`;
}

/**
 * Déterminer le type (pile/face) depuis le chemin
 */
function determineType(filePath) {
    if (filePath.includes('maternite') || filePath.includes('pile')) {
        return 'pile';
    }
    if (filePath.includes('tech') || filePath.includes('face')) {
        return 'face';
    }
    return 'pile'; // Par défaut
}

/**
 * Créer le slug depuis le nom de fichier
 */
function createSlugFromFilename(filename) {
    return filename
        .replace(/\.html$/, '')
        .replace(/^\d{4}-\d{2}-\d{2}-/, '') // Retirer la date si présente
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

/**
 * Migrer un article HTML vers Markdown
 */
function migrateArticle(htmlPath) {
    console.log(`📄 Migration de: ${htmlPath}`);

    try {
        // Lire le HTML
        const html = fs.readFileSync(htmlPath, 'utf-8');
        const $ = cheerio.load(html);

        // Extraire les métadonnées
        const metadata = extractMetadata($);
        
        // Déterminer le type
        metadata.type = determineType(htmlPath);
        
        // Créer le slug
        const filename = path.basename(htmlPath);
        metadata.slug = createSlugFromFilename(filename);

        // Convertir le contenu en Markdown
        const content = $('.post-content');
        const markdown = htmlToMarkdown($, content);

        // Créer le frontmatter
        const frontmatter = createFrontmatter(metadata);

        // Assembler le fichier final
        const finalMarkdown = frontmatter + markdown;

        // Déterminer le dossier de destination
        const subfolder = metadata.type === 'face' ? 'tech' : 'maternite';
        const targetDir = path.join(CONFIG.targetDir, subfolder);

        // Créer le dossier si nécessaire
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        // Créer le nom du fichier
        const date = new Date(metadata.date);
        const dateStr = date.toISOString().split('T')[0];
        const mdFilename = `${dateStr}-${metadata.slug}.md`;
        const targetPath = path.join(targetDir, mdFilename);

        // Sauvegarder
        fs.writeFileSync(targetPath, finalMarkdown, 'utf-8');
        console.log(`   ✅ Créé: ${targetPath}\n`);

        return {
            success: true,
            source: htmlPath,
            target: targetPath
        };

    } catch (error) {
        console.error(`   ❌ Erreur: ${error.message}\n`);
        return {
            success: false,
            source: htmlPath,
            error: error.message
        };
    }
}

/**
 * Migrer tous les articles
 */
function migrateAll() {
    console.log('🚀 Début de la migration des articles existants\n');

    // Créer une sauvegarde
    console.log('💾 Création d\'une sauvegarde...');
    if (!fs.existsSync(CONFIG.backupDir)) {
        fs.mkdirSync(CONFIG.backupDir, { recursive: true });
    }
    
    // Copier les articles actuels
    const copyRecursive = (src, dest) => {
        if (fs.statSync(src).isDirectory()) {
            if (!fs.existsSync(dest)) {
                fs.mkdirSync(dest, { recursive: true });
            }
            fs.readdirSync(src).forEach(file => {
                copyRecursive(path.join(src, file), path.join(dest, file));
            });
        } else {
            fs.copyFileSync(src, dest);
        }
    };

    if (fs.existsSync(CONFIG.sourceDir)) {
        copyRecursive(CONFIG.sourceDir, CONFIG.backupDir);
        console.log(`   ✅ Sauvegarde créée dans ${CONFIG.backupDir}\n`);
    }

    // Récupérer tous les fichiers HTML
    const getAllHtmlFiles = (dir, fileList = []) => {
        if (!fs.existsSync(dir)) return fileList;
        
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            const filePath = path.join(dir, file);
            if (fs.statSync(filePath).isDirectory()) {
                getAllHtmlFiles(filePath, fileList);
            } else if (path.extname(file) === '.html') {
                fileList.push(filePath);
            }
        });
        return fileList;
    };

    const htmlFiles = getAllHtmlFiles(CONFIG.sourceDir);

    if (htmlFiles.length === 0) {
        console.log('⚠️  Aucun article HTML trouvé dans', CONFIG.sourceDir);
        return;
    }

    console.log(`📚 ${htmlFiles.length} article(s) à migrer\n`);

    // Migrer chaque article
    const results = htmlFiles.map(migrateArticle);

    // Résumé
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log('═══════════════════════════════════════');
    console.log('📊 RÉSUMÉ DE LA MIGRATION');
    console.log('═══════════════════════════════════════');
    console.log(`✅ Réussis: ${successful}`);
    console.log(`❌ Échoués: ${failed}`);
    console.log(`📁 Total: ${htmlFiles.length}`);
    console.log('═══════════════════════════════════════\n');

    if (failed > 0) {
        console.log('⚠️  Erreurs détectées:');
        results.filter(r => !r.success).forEach(r => {
            console.log(`   - ${r.source}: ${r.error}`);
        });
        console.log('');
    }

    console.log('📝 PROCHAINES ÉTAPES:');
    console.log('1. Vérifiez les fichiers générés dans', CONFIG.targetDir);
    console.log('2. Relisez les articles (la conversion HTML→MD peut être imparfaite)');
    console.log('3. Ajustez manuellement si nécessaire');
    console.log('4. Lancez `npm run build` pour générer les HTML');
    console.log('5. Vérifiez que tout fonctionne');
    console.log('6. Si OK, vous pouvez supprimer', CONFIG.backupDir);
    console.log('\n✨ Migration terminée!\n');
}

// Installer cheerio si nécessaire
try {
    require.resolve('cheerio');
} catch {
    console.log('⚠️  cheerio n\'est pas installé.');
    console.log('Installez-le avec: npm install cheerio');
    process.exit(1);
}

// Exécuter la migration
if (require.main === module) {
    migrateAll();
}

module.exports = { migrateArticle, migrateAll };
