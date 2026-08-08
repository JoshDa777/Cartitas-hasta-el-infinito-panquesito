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
- Mensajes sincronizados via GitHub API

### 🔔 Notificaciones
- Activa las notificaciones del navegador para saber cuando el otro subió algo o te escribió
- Recibirás notificaciones automáticas al detectar cambios (cada 30 segundos)

### 🐙 GitHub (Base de datos)
- Todo (cartas, anécdotas, chat y archivos) se guarda en `info/datos.json` del repositorio
- **Sin límite de almacenamiento** (GitHub permite repositorios ilimitados)
- **100% gratis** (no necesitas pagar Firebase Storage)
- Los archivos se guardan como base64 dentro del JSON

### 📤 Límite de archivos
- Máximo **2 MB por archivo**
- Límite diario total: **2 MB** (entre Julieth y Joshua)
- El límite se reinicia cada día a la medianoche

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
1. El repositorio ya está en GitHub
2. Activa GitHub Pages: **Settings → Pages → main branch → Save**
3. Tu página estará disponible en `https://JoshDa777.github.io/cartas-hasta-el-infinito-panquesito/`
4. Tu token de GitHub ya viene preconfigurado en `info/datos.json`
5. Abre la página en celular y computadora → todo se sincroniza

### ⚙️ Configuración pre-instalada
Este repositorio ya viene configurado con las credenciales de GitHub. Al abrir la página, todo se conecta automáticamente.

## 📁 Estructura del proyecto

```
├── index.html          # Página principal
├── css/
│   └── style.css       # Estilos pixel art (rosas y azules)
├── js/
│   ├── storage.js      # Almacenamiento (localStorage, IndexedDB)
│   ├── github.js       # Conexión con GitHub API (base de datos)
│   └── app.js          # Lógica principal de la aplicación
├── info/
│   └── datos.json      # ⚙️ Base de datos (posts, chat, archivos base64)
├── manifest.json       # Configuración PWA (instalable como app)
├── sw.js               # Service Worker (modo offline)
└── README.md           # Este archivo
```

## 📊 ¿Cómo se guardan los datos?

```
┌─────────────────────────────────────────────────┐
│  GITHUB API (base de datos)                      │
│  - info/datos.json en el repositorio             │
│  - 💬 Chat                                       │
│  - 💌 Cartas, anécdotas, historias               │
│  - 📁 Archivos (como base64)                     │
│  - Sin límite de almacenamiento                  │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  LOCAL (cada dispositivo)                        │
│  - localStorage: cartas, chat, metadatos         │
│  - IndexedDB: archivos descargados (cache)       │
│  - GitHub Pages: solo aloja la página web         │
└─────────────────────────────────────────────────┘
```

## 💾 Almacenamiento de datos

- **GitHub API**: todo se guarda en `info/datos.json` del repositorio (ilimitado y gratis)
- **localStorage**: copia local de respaldo en cada dispositivo
- **IndexedDB**: cache de archivos descargados

## 🌟 Consejos para que dure toda la vida

1. **Haz copias de seguridad** periódicas: Exporta datos en Ajustes → Datos → Exportar
2. **GitHub** tiene almacenamiento ilimitado: guarda todo sin preocuparte
3. **Instala como app** en el celular: funciona como una app nativa
4. **GitHub Pages** es gratis para siempre
5. **Límite de 2 MB por día** asegura que la página siempre funcione bien

---

## ❤️ Hecho con amor

Este es nuestro espacio para guardar cada momento, cada carta, cada anécdota y cada historia de nuestro amor.

**Cartas hasta el Infinito Panquesito** 💕

*"Para que cuando seamos grandes o tengamos hijos, podamos mirar atrás y ver todo lo que vivimos juntos."*