# 💖 Cartas hasta el Infinito Panquesito 💙

Nuestro rincón de recuerdos hecho para Julieth y Joshua. Un repositorio de nuestra vida juntos, donde podremos guardar cartas, anécdotas, historias y cualquier tipo de archivo hasta que creamos hasta el punto de llegar a adultos o tener hijos para ver el pasado de nuestra vida juntos.

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
- **1-5 elementos en un día** → se muestra un **punto verde**
- **Más de 5** → el cuadro de esa fecha se **pinta de verde**
- Haz clic en cualquier día para ver sus recuerdos

### 💬 Chat
- Sección de chat para hablar entre nosotros dos
- Mensajes en tiempo real (via Firebase)
- Notificaciones al recibir mensajes nuevos

### 🔔 Notificaciones
- Activa las notificaciones del navegador para saber cuando el otro subió algo o te escribió
- Recibirás notificaciones automáticas

### 🔥 Sincronización en tiempo real (Firebase)
- Cartas, anécdotas y chat se sincronizan al instante entre dispositivos
- Cuando Julieth sube algo, Joshua lo ve al instante (y viceversa)

### 📤 Límite de archivos
- Máximo **2 MB por archivo**
- Límite diario total: **2 MB** (entre Julieth y Joshua)
- El límite se reinicia cada día a la medianoche
- Al superar el límite, se muestra un mensaje con cuánto queda disponible

### 🗑️ Borrar datos
- En Ajustes → Borrar Datos, puedes eliminar todo lo guardado localmente
- La página se recargará automáticamente

## 🎨 Diseño
- Estilo **pixel art** en toda la página
- Mezcla de tonos **rosas** 💗 y **azules** 💙
- Corazones pixelados y ambiente romántico

## 🚀 Cómo usarlo

### Opción 1: Local (sin conexión)
1. Descarga los archivos de este repositorio
2. Abre `index.html` en tu navegador
3. Ingresa la contraseña `020426`
4. ¡Empieza a subir recuerdos!

### Opción 2: Con GitHub Pages (recomendado)
1. El repositorio ya está en GitHub: [github.com/tuusuario/cartas-hasta-el-infinito-panquesito](https://github.com)
2. Activa GitHub Pages: **Settings → Pages → main branch → Save**
3. Tu página estará disponible en `https://TU_USUARIO.github.io/cartas-hasta-el-infinito-panquesito/`
4. **Firebase ya viene preconfigurado** en `info/datos.json`
5. Abre la página en celular y computadora → todo se sincroniza automáticamente

### ⚙️ Configuración pre-instalada
Este repositorio ya viene configurado con las credenciales de Firebase. Al abrir la página, todo se conecta automáticamente.

Si necesitas cambiar algo (opcional):
- **Firebase**: [firebase.google.com](https://firebase.google.com) → Realtime Database con reglas `{ "rules": { ".read": true, ".write": true } }`
- **Firebase Storage**: Activado automáticamente para archivos

## 📁 Estructura del proyecto

```
├── index.html          # Página principal
├── css/
│   └── style.css       # Estilos pixel art (rosas y azules)
├── js/
│   ├── storage.js      # Almacenamiento (localStorage, IndexedDB)
│   ├── firebase.js     # Conexión con Firebase Realtime Database
│   └── app.js          # Lógica principal de la aplicación
├── info/
├── manifest.json       # Configuración PWA (instalable como app)
├── sw.js               # Service Worker (modo offline)
└── README.md           # Este archivo
```

## 📊 ¿Cómo se guardan los datos?

```
┌─────────────────────────────────────────────────┐
│  FIREBASE REALTIME DATABASE (texto en vivo)      │
│  - 💬 Chat (tiempo real)                         │
│  - 💌 Cartas, anécdotas, historias               │
│  - 📋 Metadatos de archivos                      │
│  - Sincronización instantánea entre dispositivos  │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  FIREBASE STORAGE (archivos hasta 2MB)           │
│  - 🖼️ Fotos, 🎬 videos, 🎵 audios                │
│  - 2 MB límite por archivo                        │
│  - 2 MB límite diario total                       │
│  - Todo dentro de Firebase                       │
│  - Sincronizado con Realtime Database            │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  LOCAL (cada dispositivo)                          │
│  - localStorage: cartas, chat, metadatos         │
│  - IndexedDB: archivos descargados (cache)       │
│  - GitHub Pages: solo aloja la página web         │
└─────────────────────────────────────────────────┘
```

## 💾 Almacenamiento de datos

- **Firebase Realtime Database**: cartas, anécdotas, historias y chat (tiempo real)
- **Firebase Storage**: fotos, videos, audios (hasta 2MB cada uno)
- **localStorage**: copia local de respaldo
- **IndexedDB**: cache de archivos descargados

## 🌟 Consejos para que dure toda la vida

1. **Haz copias de seguridad** mensuales: Exporta datos en Ajustes → Datos → Exportar
2. **Usa Firebase Storage** para fotos/videos: hasta 2MB por archivo y 2MB por día
3. **Firebase** para texto: 1 GB es suficiente para 500,000 cartas
4. **Instala como app** en el celular: funciona como una app nativa
5. **GitHub Pages** es gratis para siempre: aloja solo la página web

---

## ❤️ Hecho con amor

Este es nuestro espacio para guardar cada momento, cada carta, cada anécdota y cada historia de nuestro amor.

**Cartas hasta el Infinito Panquesito** 💕

*"Para que cuando seamos grandes o tengamos hijos, podamos mirar atrás y ver todo lo que vivimos juntos."*
