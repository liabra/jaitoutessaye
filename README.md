# J'ai tout essayé 💝💻

> Blog maternité authentique & vibe coding - PWA offline-first, 100% vie privée

![License](https://img.shields.io/badge/license-MIT-pink)
![PWA](https://img.shields.io/badge/PWA-Ready-00FFC6)
![Privacy](https://img.shields.io/badge/Privacy-First-FF006E)

---

## 🌸 Concept

**J'ai tout essayé** est un blog dual-identity qui fusionne deux univers :

### Côté Pile 🌸 - Maternité Authentique
- Allaitement & sommeil (cododo, nuits découpées)
- Éducation positive (Montessori, motricité libre)
- Alimentation (DME, recettes simples)
- Santé naturelle (huiles essentielles, homéopathie)

### Côté Face 💻 - Vibe Coding & Culture Tech
- Développement web & PWA
- Setup télétravail avec bébé
- Gaming casual (JRPGs, culture japonaise)
- Outils et scripts d'automatisation

---

## ✨ Caractéristiques Techniques

### Architecture
- **Site statique** : HTML/CSS/JS pur, ultra-rapide
- **PWA offline-first** : Consultable sans réseau (transports, zones blanches)
- **Zero cookies tiers** : Respect total de la vie privée
- **Service Worker** : Cache intelligent et synchronisation

### Design
- **Esthétique "Wabi-Sabi Digital"** : Fusion de douceur organique et énergie code
- **Typographie contrastée** :
  - Serif élégante (`Cormorant Garamond`) pour la maternité
  - Monospace pixelisée (`IBM Plex Mono`) pour le tech
  - Sans-serif japonaise (`Zen Kaku Gothic New`) pour le corps
- **Palette dual** :
  - Pile : Rose poudré, terracotta, pastels
  - Face : Bleu nuit, néon cyan, magenta

### Fonctionnalités
- ✅ Installation PWA en un clic
- ✅ Lecture hors ligne complète
- ✅ Thème clair/sombre
- ✅ Animations fluides (scroll, hover, transitions)
- ✅ Système de commentaires respectueux vie privée
- ✅ Préchargement intelligent des articles populaires
- ✅ Easter eggs (Konami Code)

---

## 📁 Structure du Projet

```
jai-tout-essaye/
├── index.html              # Page d'accueil (dashboard hybride)
├── manifest.json           # Configuration PWA
├── sw.js                   # Service Worker (cache offline)
├── offline.html            # Page affichée hors connexion
│
├── css/
│   └── main.css            # Styles principaux (CSS Variables)
│
├── js/
│   ├── main.js             # Interactivité générale
│   └── pwa.js              # Enregistrement PWA & install prompt
│
├── pages/
│   ├── maternite.html      # Section "Le Labo des Mamans"
│   ├── coding.html         # Section "Vibe Coding"
│   ├── astuces.html        # Petites Astuces Express
│   ├── communaute.html     # Espace communautaire
│   └── soutien.html        # Dons & contributions
│
├── _posts/
│   ├── maternite/          # Articles maternité
│   └── tech/               # Articles tech/coding
│
└── images/
    ├── icon-*.png          # Icônes PWA (72px à 512px)
    └── screenshots/        # Captures d'écran
```

---

## 🚀 Installation & Déploiement

### Prérequis
- Serveur web statique (Nginx, Apache, ou CDN)
- Certificat SSL (obligatoire pour PWA)

### Option 1 : Hébergement Netlify/Vercel
```bash
# Cloner le repo
git clone https://github.com/username/jai-tout-essaye.git
cd jai-tout-essaye

# Déployer (suivre les instructions de la plateforme)
netlify deploy --prod
# ou
vercel --prod
```

### Option 2 : Serveur perso
```bash
# Nginx configuration
server {
    listen 443 ssl http2;
    server_name jaitoutessaye.fr;
    
    root /var/www/jai-tout-essaye;
    index index.html;
    
    # Cache headers pour PWA
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Service Worker sans cache
    location /sw.js {
        add_header Cache-Control "no-cache";
    }
    
    # Manifest
    location /manifest.json {
        add_header Cache-Control "no-cache";
    }
}
```

### Option 3 : GitHub Pages
```bash
# Dans le repo, activer GitHub Pages
# Settings > Pages > Source: main branch
```

---

## 🎨 Personnalisation

### Couleurs
Modifier les variables CSS dans `css/main.css` :
```css
:root {
    --pile-primary: #FFE5EC;     /* Rose maternité */
    --face-accent: #00FFC6;      /* Néon tech */
    /* ... */
}
```

### Typographie
Changer les polices dans `index.html` :
```html
<link href="https://fonts.googleapis.com/css2?family=VotrePolice&display=swap" rel="stylesheet">
```

### Articles
Créer un nouveau post dans `_posts/maternite/` ou `_posts/tech/` :
```html
<!-- article-template.html -->
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Titre de l'article</title>
    <link rel="stylesheet" href="/css/main.css">
</head>
<body>
    <article class="post">
        <h1>Titre</h1>
        <time>Date</time>
        <div class="content">
            <!-- Contenu Markdown ou HTML -->
        </div>
    </article>
</body>
</html>
```

---

## 🔒 Vie Privée & Sécurité

### Engagement Zero Tracking
- ❌ Pas de Google Analytics
- ❌ Pas de Facebook Pixel
- ❌ Pas de cookies tiers
- ✅ Analytics respectueux (Plausible, Fathom, Simple Analytics)

### Commentaires Privacy-First
Options recommandées :
- **Isso** : Auto-hébergé, open-source
- **Commento** : Léger, respectueux
- **Staticman** : Commentaires en fichiers statiques (GitHub)

### Service Worker
Cache uniquement les ressources nécessaires :
```javascript
const STATIC_CACHE = [
    '/',
    '/css/main.css',
    '/js/main.js',
    // ...
];
```

---

## 📱 PWA Features

### Installation
L'app peut être installée sur :
- ✅ Android (Chrome, Edge, Samsung Internet)
- ✅ iOS (Safari 11.3+)
- ✅ Desktop (Chrome, Edge)

### Offline
Contenu disponible hors ligne :
- Page d'accueil
- Tous les articles mis en cache
- CSS, JS, images
- Polices (Google Fonts en cache)

### Raccourcis
Accès rapide via raccourcis d'app :
- Le Labo des Mamans
- Vibe Coding
- Petites Astuces

---

## 🛠️ Développement

### Structure CSS
```css
/* Variables globales */
:root { /* ... */ }

/* Reset & Base */
* { /* ... */ }

/* Components */
.header { /* ... */ }
.nav { /* ... */ }
.article-card { /* ... */ }

/* Utilities */
.sr-only { /* ... */ }
```

### JavaScript Modules
```javascript
// main.js
class ThemeManager { /* ... */ }
class ScrollAnimations { /* ... */ }

// pwa.js
navigator.serviceWorker.register('/sw.js');
```

### Tests
```bash
# Tester en local
python -m http.server 8000
# ou
npx serve .

# Ouvrir http://localhost:8000
```

### Lighthouse Audit
```bash
lighthouse https://jaitoutessaye.fr \
    --view \
    --output=html \
    --output-path=./lighthouse-report.html
```

**Objectifs** :
- Performance : 95+
- Accessibilité : 100
- Best Practices : 100
- SEO : 100
- PWA : ✅

---

## 🎯 Roadmap

### v1.0 (MVP) ✅
- [x] Site statique responsive
- [x] PWA offline-first
- [x] Design dual-identity
- [x] Service Worker
- [x] Manifest

### v1.1
- [ ] Système de commentaires (Isso)
- [ ] RSS Feed
- [ ] Newsletter (Buttondown)
- [ ] Search (Algolia/Fuse.js)

### v1.2
- [ ] Dark mode avancé
- [ ] Mode lecture
- [ ] Partage social (sans trackers)
- [ ] Bookmarks locaux

### v2.0
- [ ] SSG avec Hugo/Jekyll
- [ ] CMS headless (Netlify CMS)
- [ ] i18n (anglais)
- [ ] Communauté (forum)

---

## 🤝 Contribution

### Comment contribuer ?
1. Fork le projet
2. Créer une branche (`git checkout -b feature/ma-fonctionnalite`)
3. Commit (`git commit -m 'Ajout de ma fonctionnalité'`)
4. Push (`git push origin feature/ma-fonctionnalite`)
5. Ouvrir une Pull Request

### Guidelines
- Respecter la vie privée (pas de tracking)
- Code accessible (WCAG AA minimum)
- Performance (Lighthouse 90+)
- Mobile-first

---

## 💝 Soutenir le Projet

### Pourquoi ?
Ce blog est 100% gratuit, sans pub, et respectueux de votre vie privée. 
Si vous appréciez le contenu, vous pouvez soutenir le projet :

- ☕ [Buy me a coffee](https://buymeacoffee.com/username)
- 💳 [Ko-fi](https://ko-fi.com/username)
- 🎁 [Tipeee](https://tipeee.com/username)

### Autres façons d'aider
- ⭐ Star le repo GitHub
- 🐦 Partager sur les réseaux
- 💬 Laisser un commentaire
- 📝 Proposer des articles invités

---

## 📄 Licence

MIT License - Libre d'utilisation, modification et distribution.

Voir [LICENSE](LICENSE) pour les détails complets.

---

## 👩‍💻 Autrice

**[Votre Nom]** - Développeuse Full-Stack & Maman

- 🌐 Site : [jaitoutessaye.fr](https://jaitoutessaye.fr)
- 💼 LinkedIn : [linkedin.com/in/username](https://linkedin.com/in/username)
- 🐙 GitHub : [@username](https://github.com/username)
- 🐦 Twitter : [@username](https://twitter.com/username)

---

## 🙏 Remerciements

- Communauté des mamans codeuses 💝
- Open Source contributors
- Vous, qui lisez ce README ✨

---

<div align="center">

**Fait avec ❤️ et beaucoup de café ☕**

*Parce qu'on peut être maman ET développeuse*

🌸 **Maternité** × 💻 **Code** 🌸

</div>
