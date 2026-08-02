# 💖 Cartas hasta el Infinito Panquesito 💙

Nuestro rincón de recuerdos hecho para Julieth y Joshua. Un repositorio de nuestra vida juntos, donde podremos guardar cartas, anécdotas, historias y cualquier tipo de archivo hasta que crezcamos y lleguemos a ser adultos o tener hijos, para así ver el pasado de nuestra vida juntos.
    
## 🔐 Acceso

- **Contraseña:** `020426`
- Al entrar te preguntará: **¿Eres Julieth o Joshua?**
- Así sabremos quién subió cada cosa

## ✨ Funcionalidades

### 📖 Historias / Cartas / Anécdotas
- Escribe cartas, anécdotas o historias del día directamente en la página
- Sube cualquier tipo de archivo: imágenes, audio, video, texto, ejecutables, código, etc.
- Los archivos que no se puedan abrir en el navegador aparecerán como **IRRECONOCIBLE**
- Todos los archivos tienen opción de **descarga**
- Cada publicación muestra la **fecha de subida** y **quién la subió**

### 📅 Calendario
- Los recuerdos se organizan en un calendario
- **1-5 archivos/escrituras en un día** → se muestra un **punto verde**
- **Más de 5** → el cuadro de esa fecha se **pinta de verde**
- Haz clic en cualquier día para ver sus recuerdos

### 💬 Chat
- Sección de chat para hablar entre nosotros dos
- Notificaciones al recibir mensajes nuevos

### 🔔 Notificaciones
- Activa las notificaciones del navegador para saber cuando el otro subió algo o envió un mensaje
- Recibirás notificaciones automáticas

### 📡 Sincronización con GitHub
- Conecta con tu repositorio de GitHub para que Julieth y Joshua puedan ver lo mismo desde sus dispositivos
- Los datos se sincronizan automáticamente cada 5 minutos

### 💾 Respaldo
- Exporta todos los recuerdos (incluyendo archivos) como respaldo
- Importa respaldos cuando sea necesario

## 🎨 Diseño
- Estilo **pixel art** en toda la página
- Mezcla de tonos **rosas** 💗 y **azules** 💙
- Orientaciones en el espacio con corazones pixelados y ambiente romántico

## 🚀 Cómo usarlo

### Opción 1: Local (sin GitHub)
1. Descarga los archivos de este repositorio
2. Abre `index.html` en tu navegador
3. Ingresa la contraseña `020426`
4. ¡Empieza a subir recuerdos!

### Opción 2: Con GitHub Pages
1. Sube este proyecto a un repositorio de GitHub
2. Ve a **Settings → Pages**
3. Selecciona la rama `main` y guarda
4. Tu página estará disponible en `https://TU_USUARIO.github.io/NOMBRE_REPO/`
5. Ambos pueden acceder desde cualquier dispositivo

### Opción 3: Sincronización entre dispositivos
1. Crea un repositorio **privado** en GitHub
2. Genera un **Token Personal** (PAT) en GitHub:
   - Ve a **Settings → Developer settings → Personal access tokens → Tokens (classic)**
   - Da clic en **Generate new token**
   - Selecciona los permisos: `repo`
   - Copia el token generado (solo se muestra una vez)
3. En la página, ve a **⚙️ Ajustes → Sincronización con GitHub**
4. Ingresa tu usuario de GitHub, el nombre del repositorio y el token
5. Haz clic en **Guardar Configuración**

## 📁 Estructura del proyecto

```
├── index.html          # Página principal
├── css/
│   └── style.css       # Estilos pixel art (rosas y azules)
├── js/
│   ├── storage.js      # Almacenamiento (localStorage, IndexedDB, GitHub)
│   └── app.js          # Lógica principal de la aplicación
├── manifest.json       # Configuración PWA (instalable)
├── sw.js               # Service Worker (modo offline)
└── README.md           # Este archivo
```

## 💾 Almacenamiento de datos

- **localStorage**: guarda metadatos, cartas, anécdotas, historias y mensajes del chat
- **IndexedDB**: guarda los archivos subidos (imágenes, videos, audio, etc.)
- **GitHub**: sincroniza todos los datos entre dispositivos

## ❤️ Hecho con amor

Este es nuestro espacio para guardar cada momento, cada carta, cada anécdota y cada historia de nuestro amor.

**Cartas hasta el Infinito Panquesito** 💕

*"Para que cuando seamos grandes o tengamos hijos, podamos mirar atrás y ver todo lo que vivimos juntos."*
</content>
<task_progress>
- [x] Crear estructura del proyecto (HTML, CSS, JS)
- [x] Implementar pantalla de login con contraseña
- [x] Implementar selección de usuario (Julieth/Joshua)
- [x] Implementar subida de archivos (todos los formatos)
- [x] Implementar escritura manual de cartas/anécdotas
- [x] Implementar calendario con puntos verdes
- [x] Implementar sección de chat
- [x] Implementar notificaciones del navegador
- [x] Implementar sincronización con GitHub
- [x] Estilo pixel art con tonos rosas y azules
- [x] Crear README con instrucciones
- [ ] Crear PWA manifest y service worker
</task_progress>

<write_to_file>
<path>manifest.json</path>
<content>
{
  "name": "Cartas hasta el Infinito Panquesito",
  "short_name": "Panquesito",
  "description": "Nuestro rincón de recuerdos: cartas, anécdotas, historias y archivos de nuestra vida juntos",
  "start_url": "./index.html",
  "display": "standalone",
  "background_color": "#12121f",
  "theme_color": "#e91e63",
  "orientation": "any",
  "icons": [
    {
      "src": "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23e91e63'/><text x='50' y='70' font-size='60' text-anchor='middle'>💖</text></svg>",
      "sizes": "192x192",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    },
    {
      "src": "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%232196f3'/><text x='50' y='70' font-size='60' text-anchor='middle'>💙</text></svg>",
      "sizes": "512x512",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    }
  ]
}
</content>
<task_progress>
- [x] Crear estructura del proyecto (HTML, CSS, JS)
- [x] Implementar pantalla de login con contraseña
- [x] Implementar selección de usuario (Julieth/Joshua)
- [x] Implementar subida de archivos (todos los formatos)
- [x] Implementar escritura manual de cartas/anécdotas
- [x] Implementar calendario con puntos verdes
- [x] Implementar sección de chat
- [x] Implementar notificaciones del navegador
- [x] Implementar sincronización con GitHub
- [x] Estilo pixel art con tonos rosas y azules
- [x] Crear README con instrucciones
- [ ] Crear PWA manifest y service worker
</task_progress>

<write_to_file>
<path>sw.js</path>
<content>
/* ============================================
   CARTAS HASTA EL INFINITO PANQUESITO
   Service Worker - Modo offline y caché
   ============================================ */

const CACHE_NAME = 'panquesito-cache-v1';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/storage.js',
  './js/app.js',
  './manifest.json'
];

// Instalación: cachear archivos principales
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activación: limpiar cachés antiguos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch: estrategia cache-first con red como respaldo
self.addEventListener('fetch', (event) => {
  // Solo manejar solicitudes GET
  if (event.request.method !== 'GET') return;

  // No cachear solicitudes a GitHub API
  if (event.request.url.includes('api.github.com')) return;

  event.respondWith(
    caches.match(event.request)
      .then((cached) => {
        if (cached) return cached;

        return fetch(event.request)
          .then((response) => {
            // Cachear solo respuestas exitosas
            if (response.ok && response.type === 'basic') {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, clone);
              });
            }
            return response;
          })
          .catch(() => {
            // Si falla la red, intentar devolver el index.html
            if (event.request.mode === 'navigate') {
              return caches.match('./index.html');
            }
          });
      })
  );
});

// Manejar notificaciones push
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.body || 'Nuevo recuerdo en Cartas hasta el Infinito Panquesito',
    icon: data.icon || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">💖</text></svg>',
    badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">💖</text></svg>',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || './index.html'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || '💖 Panquesito', options)
  );
});

// Manejar clic en notificación
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) {
            client.focus();
            return;
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url || './index.html');
        }
      })
  );
});