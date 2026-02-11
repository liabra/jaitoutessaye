/**
 * PWA REGISTRATION & INSTALL PROMPT
 * J'ai tout essayé
 */

// ============================================
// SERVICE WORKER REGISTRATION
// ============================================

if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('✅ Service Worker enregistré:', registration.scope);

            // Vérifier les mises à jour
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                console.log('🔄 Nouvelle version du Service Worker détectée');

                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        showUpdateNotification();
                    }
                });
            });
        } catch (error) {
            console.error('❌ Erreur d\'enregistrement du Service Worker:', error);
        }
    });
}

// ============================================
// INSTALL PROMPT
// ============================================

let deferredPrompt;
const installPrompt = document.getElementById('installPrompt');
const btnInstall = document.getElementById('btnInstall');
const btnDismiss = document.getElementById('btnDismiss');

// Capturer l'événement beforeinstallprompt
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Vérifier si l'utilisateur a déjà refusé
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const lastDismissed = localStorage.getItem('pwa-install-dismissed-date');
    
    // Réafficher le prompt après 7 jours
    const shouldShow = !dismissed || (lastDismissed && Date.now() - parseInt(lastDismissed) > 7 * 24 * 60 * 60 * 1000);
    
    if (shouldShow && installPrompt) {
        installPrompt.removeAttribute('hidden');
    }
});

// Bouton d'installation
if (btnInstall) {
    btnInstall.addEventListener('click', async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        console.log(`Installation PWA: ${outcome}`);
        
        if (outcome === 'accepted') {
            localStorage.removeItem('pwa-install-dismissed');
            localStorage.removeItem('pwa-install-dismissed-date');
        }
        
        deferredPrompt = null;
        if (installPrompt) {
            installPrompt.setAttribute('hidden', '');
        }
    });
}

// Bouton "Plus tard"
if (btnDismiss) {
    btnDismiss.addEventListener('click', () => {
        localStorage.setItem('pwa-install-dismissed', 'true');
        localStorage.setItem('pwa-install-dismissed-date', Date.now().toString());
        
        if (installPrompt) {
            installPrompt.setAttribute('hidden', '');
        }
    });
}

// Détecter l'installation réussie
window.addEventListener('appinstalled', () => {
    console.log('✅ PWA installée avec succès');
    
    // Tracker l'événement (analytics privacy-first)
    if (window.plausible) {
        window.plausible('PWA Install');
    }
    
    // Afficher un message de confirmation
    showSuccessNotification('🎉 Application installée ! Vous pouvez maintenant lire hors ligne.');
});

// ============================================
// UPDATE NOTIFICATION
// ============================================

function showUpdateNotification() {
    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.innerHTML = `
        <p>🔄 <strong>Nouvelle version disponible !</strong></p>
        <button class="btn-update">Mettre à jour</button>
        <button class="btn-cancel">Plus tard</button>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        border: 2px solid var(--face-accent);
        animation: slideIn 0.4s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    notification.querySelector('.btn-update').addEventListener('click', () => {
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
        }
        window.location.reload();
    });
    
    notification.querySelector('.btn-cancel').addEventListener('click', () => {
        notification.remove();
    });
}

function showSuccessNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: var(--face-accent);
        color: var(--face-primary);
        padding: 1rem 1.5rem;
        border-radius: 8px;
        font-family: 'IBM Plex Mono', monospace;
        font-size: 0.9rem;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        box-shadow: 0 4px 20px rgba(0, 255, 198, 0.3);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// ============================================
// OFFLINE CACHE PRELOADING
// ============================================

// Précharger les articles les plus consultés
function precachePopularContent() {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        const popularUrls = [
            '/posts/allaiter-teletravail.html',
            '/posts/cododo-routine.html',
            '/posts/blog-pwa-offline.html',
            '/posts/vscode-setup-maman.html'
        ];
        
        navigator.serviceWorker.controller.postMessage({
            type: 'CACHE_URLS',
            urls: popularUrls
        });
    }
}

// Exécuter le précaching après 3 secondes (pour ne pas impacter le chargement initial)
setTimeout(precachePopularContent, 3000);

// ============================================
// NETWORK STATUS INDICATOR
// ============================================

function updateNetworkStatus() {
    const isOnline = navigator.onLine;
    const indicator = document.createElement('div');
    indicator.id = 'network-status';
    
    if (!isOnline) {
        indicator.textContent = '📱 Mode hors ligne';
        indicator.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: var(--face-accent-2);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-family: 'IBM Plex Mono', monospace;
            font-size: 0.8rem;
            z-index: 10000;
            animation: pulse 2s ease-in-out infinite;
        `;
        document.body.appendChild(indicator);
    } else {
        const existingIndicator = document.getElementById('network-status');
        if (existingIndicator) {
            existingIndicator.remove();
        }
    }
}

window.addEventListener('online', updateNetworkStatus);
window.addEventListener('offline', updateNetworkStatus);
window.addEventListener('load', updateNetworkStatus);

// ============================================
// PUSH NOTIFICATIONS (optionnel)
// ============================================

async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        console.log('Les notifications ne sont pas supportées');
        return;
    }
    
    if (Notification.permission === 'granted') {
        await subscribeToPushNotifications();
    } else if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            await subscribeToPushNotifications();
        }
    }
}

async function subscribeToPushNotifications() {
    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(
                // Remplacer par votre clé publique VAPID
                'YOUR_PUBLIC_VAPID_KEY'
            )
        });
        
        console.log('Souscription aux notifications:', subscription);
        
        // Envoyer la souscription au serveur
        // await fetch('/api/subscribe', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(subscription)
        // });
    } catch (error) {
        console.error('Erreur de souscription aux notifications:', error);
    }
}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

// ============================================
// ANALYTICS OFFLINE QUEUE
// ============================================

class OfflineAnalyticsQueue {
    constructor() {
        this.queue = this.loadQueue();
        this.init();
    }
    
    init() {
        window.addEventListener('online', () => this.flush());
    }
    
    track(event, data = {}) {
        const entry = {
            event,
            data,
            timestamp: Date.now()
        };
        
        if (navigator.onLine) {
            this.sendEvent(entry);
        } else {
            this.queue.push(entry);
            this.saveQueue();
        }
    }
    
    async flush() {
        if (this.queue.length === 0) return;
        
        const queueCopy = [...this.queue];
        this.queue = [];
        this.saveQueue();
        
        for (const entry of queueCopy) {
            await this.sendEvent(entry);
        }
    }
    
    async sendEvent(entry) {
        // Implémentation privacy-first analytics
        console.log('Analytics event:', entry);
    }
    
    loadQueue() {
        try {
            return JSON.parse(localStorage.getItem('analytics-queue') || '[]');
        } catch {
            return [];
        }
    }
    
    saveQueue() {
        localStorage.setItem('analytics-queue', JSON.stringify(this.queue));
    }
}

const analyticsQueue = new OfflineAnalyticsQueue();

// Export pour utilisation dans d'autres scripts
window.offlineAnalytics = analyticsQueue;

console.log('✅ PWA initialisée - Lecture hors ligne activée');
