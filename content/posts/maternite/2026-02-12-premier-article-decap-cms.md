---
title: "Mon premier article avec Decap CMS"
date: "2026-02-12"
category: "Organisation"
excerpt: "Découvrez comment j'ai intégré Decap CMS à mon blog sans toucher au design existant. Une solution parfaite pour gérer mes articles facilement."
cover: "/images/posts/decap-cms-cover.jpg"
tags: ["CMS", "Workflow", "Productivité", "Decap CMS"]
reading_time: 7
author: "Lia"
type: "pile"
---

## 🎉 Enfin un CMS qui respecte mon design !

Après avoir cherché pendant des semaines la solution parfaite pour gérer mes articles, j'ai trouvé : **Decap CMS** (ex Netlify CMS).

### Pourquoi j'avais besoin d'un CMS ?

Écrire des articles directement en HTML, c'était :
- ⏰ **Chronophage** : copier-coller le template à chaque fois
- 🐛 **Source d'erreurs** : oublier de fermer une balise
- 📱 **Pas mobile-friendly** : impossible d'écrire depuis mon téléphone

### Ce que je cherchais

1. **Préserver mon design** : Zéro modification du CSS/HTML existant
2. **Workflow éditorial** : Brouillons, révisions, publication
3. **Interface intuitive** : Markdown + preview
4. **Sécurité** : OAuth GitHub, pas de base de données
5. **Gratuit** : Open-source et sans frais cachés

## ✨ Decap CMS : la solution parfaite

### L'installation

L'intégration a pris moins d'une heure :

```bash
# 1. Créer la structure
mkdir -p admin content/posts/{maternite,tech}

# 2. Configurer Decap CMS
# admin/config.yml + admin/index.html

# 3. Script de build
node scripts/build.js
```

### Le workflow en pratique

1. **J'écris** dans l'interface `/admin`
2. **Je prévisualise** en temps réel
3. **Je publie** (commit GitHub automatique)
4. **Railway rebuild** et déploie automatiquement

### Les avantages au quotidien

#### ✍️ Écriture facilitée

Je peux maintenant :
- Écrire depuis n'importe quel appareil
- Utiliser le Markdown (bien plus rapide que HTML)
- Avoir une preview en direct
- Organiser mes brouillons

#### 🎨 Design préservé

Le CMS génère du HTML en utilisant **exactement** mon template existant :
- Mêmes classes CSS
- Même structure DOM
- Mêmes scripts JS
- Même esthétique

#### 🚀 Workflow professionnel

```
Brouillon → Révision → Publication
```

Fini les articles publiés par erreur avec des fautes !

## 💻 Détails techniques

### Architecture

```
content/posts/maternite/*.md  →  [Build Script]  →  posts/maternite/*.html
                                        ↓
                                  index.html (updated)
```

### Le build script

Le script `build.js` :
1. Parse le frontmatter YAML
2. Convertit le Markdown en HTML
3. Injecte dans le template
4. Met à jour `index.html`

### Configuration GitHub OAuth

```yaml
backend:
  name: github
  repo: liabra/jaitoutessaye
  branch: main
  base_url: https://oauth-worker.workers.dev
```

## 🎯 Résultat

### Avant Decap CMS

- ⏱️ **30 min** pour créer un article
- 🐛 **Erreurs HTML** fréquentes
- 📱 **Pas de mobile**
- 😰 **Stress** à chaque publication

### Après Decap CMS

- ⏱️ **10 min** pour créer un article
- ✅ **Zéro erreur** (Markdown + validation)
- 📱 **Écriture mobile** possible
- 😌 **Workflow serein**

## 🌸 Pour conclure

Decap CMS a transformé ma façon de bloguer. Je peux maintenant :

- Me concentrer sur l'**écriture**
- Publier depuis mon **téléphone**
- Gérer un **workflow professionnel**
- Garder mon **design intact**

Si vous avez un blog statique et que vous hésitez à ajouter un CMS, **foncez** ! C'est exactement ce qu'il vous faut.

---

**Prochaine étape** : Intégrer un système de commentaires privacy-first (Isso ou Commento).

*Avez-vous déjà utilisé Decap CMS ? Partagez votre expérience en commentaire !*