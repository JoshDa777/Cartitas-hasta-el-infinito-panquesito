/* ============================================
   CARTAS HASTA EL INFINITO PANQUESITO
   Sistema de Almacenamiento
   - localStorage para todos los datos
   - Lectura desde GitHub Pages (sin token)
   - Exportar/Importar para compartir
   ============================================ */

const Storage = (function() {
  const DB_NAME = 'cartas-infinito-panquesito';
  const DB_VERSION = 1;
  const STORE_NAME = 'files';
  const DATA_KEY = 'panquesito_data';
  const PASSWORD = '020426';

  let db = null;

  // ====== INDEXEDDB (para archivos) ======
  function openDB() {
    return new Promise((resolve, reject) => {
      if (db) {
        resolve(db);
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        db = request.result;
        resolve(db);
      };

      request.onupgradeneeded = (event) => {
        const database = event.target.result;
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          database.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }

  async function saveFileToDB(id, blob, name, type) {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      store.put({ id, blob, name, type });
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async function getFileFromDB(id) {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function deleteFileFromDB(id) {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      store.delete(id);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // ====== DATOS PRINCIPALES (localStorage) ======
  function getDefaultData() {
    return {
      version: 1,
      posts: [],
      chat: [],
      config: {
        firebase: {
          apiKey: '',
          authDomain: '',
          databaseURL: '',
          projectId: '',
          storageBucket: ''
        },
        notifications: false
      }
    };
  }

  function loadData() {
    try {
      const raw = localStorage.getItem(DATA_KEY);
      if (!raw) return getDefaultData();
      const data = JSON.parse(raw);
      return { ...getDefaultData(), ...data };
    } catch (e) {
      console.error('Error cargando datos:', e);
      return getDefaultData();
    }
  }

  function saveData(data) {
    try {
      localStorage.setItem(DATA_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Error guardando datos:', e);
      return false;
    }
  }

  // ====== OPERACIONES CON POSTS ======
  async function addPost(post) {
    const data = loadData();
    data.posts.push(post);
    saveData(data);

    // Si tiene archivo, guardarlo en IndexedDB
    if (post.fileData) {
      const { blob, name, type } = post.fileData;
      await saveFileToDB(post.id, blob, name, type);
      // No guardar el blob en localStorage
      delete post.fileData;
      saveData(data);
    }

    return post;
  }

  function getPosts() {
    const data = loadData();
    return data.posts;
  }

  async function deletePost(id) {
    const data = loadData();
    data.posts = data.posts.filter(p => p.id !== id);
    saveData(data);
    await deleteFileFromDB(id);
    return true;
  }

  // ====== OPERACIONES CON CHAT ======
  function addChatMessage(message) {
    const data = loadData();
    data.chat.push(message);
    saveData(data);
    return message;
  }

  function getChatMessages() {
    const data = loadData();
    return data.chat;
  }

  // ====== CONFIGURACIÓN ======
  function getConfig() {
    const data = loadData();
    return data.config;
  }

  function saveConfig(config) {
    const data = loadData();
    data.config = { ...data.config, ...config };
    saveData(data);
    return data.config;
  }

  // ====== EXPORTAR / IMPORTAR ======
  async function exportData() {
    const data = loadData();

    // Exportar también archivos de IndexedDB si existen
    const exportedPosts = [];
    for (const post of data.posts) {
      if (post.hasFile) {
        try {
          const fileData = await getFileFromDB(post.id);
          if (fileData) {
            exportedPosts.push({
              ...post,
              fileBase64: await blobToBase64(fileData.blob)
            });
            continue;
          }
        } catch (e) {
          console.error('Error exportando archivo:', e);
        }
      }
      exportedPosts.push(post);
    }

    const exportObj = {
      ...data,
      posts: exportedPosts,
      exportedAt: new Date().toISOString()
    };

    return JSON.stringify(exportObj, null, 2);
  }

  async function importData(json) {
    try {
      const imported = JSON.parse(json);
      if (!imported.posts) throw new Error('Datos inválidos');

      // Limpiar datos actuales
      const data = loadData();
      data.posts = [];
      data.chat = imported.chat || [];
      data.config = imported.config || data.config;

      // Importar posts con archivos
      for (const post of imported.posts) {
        if (post.fileBase64) {
          const blob = base64ToBlob(post.fileBase64, post.fileType || 'application/octet-stream');
          await saveFileToDB(post.id, blob, post.fileName || 'archivo', post.fileType || 'application/octet-stream');
          const { fileBase64, ...postData } = post;
          data.posts.push(postData);
        } else {
          data.posts.push(post);
        }
      }

      saveData(data);
      return true;
    } catch (e) {
      console.error('Error importando datos:', e);
      return false;
    }
  }

  // ====== LECTURA DESDE GITHUB PAGES (SIN TOKEN) ======
  // Lee info/datos.json desde la URL de GitHub Pages
  async function loadFromGithubPages() {
    const config = getConfig();
    const baseUrl = config.githubPagesUrl;

    if (!baseUrl) {
      return { ok: false, error: 'Configura la URL de GitHub Pages en Ajustes' };
    }

    try {
      // Intentar leer info/datos.json desde GitHub Pages
      const url = `${baseUrl.replace(/\/$/, '')}/info/datos.json`;
      const resp = await fetch(url, { cache: 'no-store' });

      if (resp.ok) {
        const remoteData = await resp.json();

        // Fusionar con datos locales (evitar duplicados)
        const localData = loadData();
        const allPosts = [...remoteData.posts, ...localData.posts];
        const mergedPosts = [];
        const seen = new Set();

        for (const post of allPosts) {
          if (!seen.has(post.id)) {
            seen.add(post.id);
            mergedPosts.push(post);
          }
        }

        const allChat = [...remoteData.chat, ...localData.chat];
        const mergedChat = [];
        const seenChat = new Set();

        for (const msg of allChat) {
          if (!seenChat.has(msg.id)) {
            seenChat.add(msg.id);
            mergedChat.push(msg);
          }
        }

        const merged = {
          ...remoteData,
          posts: mergedPosts,
          chat: mergedChat,
          config: localData.config
        };

        saveData(merged);
        return { ok: true, data: merged };
      } else if (resp.status === 404) {
        return { ok: false, error: 'info/datos.json no encontrado en GitHub Pages' };
      } else {
        return { ok: false, error: `Error al leer datos (código ${resp.status})` };
      }
    } catch (e) {
      console.error('Error leyendo desde GitHub Pages:', e);
      return { ok: false, error: 'No se pudo conectar con GitHub Pages' };
    }
  }

  // ====== UTILIDADES ======
  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  }

  function base64ToBlob(base64, type) {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type });
  }

  function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function formatDateTime(date) {
    const d = new Date(date);
    return d.toLocaleString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function formatTime(date) {
    const d = new Date(date);
    return d.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // ====== NOTIFICACIONES ======
  function notify(title, body, icon) {
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    const config = getConfig();
    if (!config.notifications) return;

    try {
      const notification = new Notification(title, {
        body,
        icon: icon || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">💖</text></svg>'
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      setTimeout(() => notification.close(), 10000);
    } catch (e) {
      console.error('Error creando notificación:', e);
    }
  }

  // ====== CLASIFICAR ARCHIVOS ======
  function getFileCategory(file) {
    const name = file.name.toLowerCase();
    const ext = name.split('.').pop();
    const type = file.type;

    // Imágenes
    if (type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg', 'ico'].includes(ext)) {
      return { tipo: 'imagen', emoji: '🖼️' };
    }
    // Audio
    if (type.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac'].includes(ext)) {
      return { tipo: 'audio', emoji: '🎵' };
    }
    // Video
    if (type.startsWith('video/') || ['mp4', 'webm', 'avi', 'mov', 'mkv'].includes(ext)) {
      return { tipo: 'video', emoji: '🎬' };
    }
    // Texto
    if (type.startsWith('text/') || ['txt', 'md', 'json', 'xml', 'html', 'css', 'js', 'py', 'java', 'c', 'cpp', 'ts', 'csv', 'log'].includes(ext)) {
      return { tipo: 'texto', emoji: '📄' };
    }
    // PDF
    if (type === 'application/pdf' || ext === 'pdf') {
      return { tipo: 'pdf', emoji: '📕' };
    }
    // Word
    if (['doc', 'docx'].includes(ext)) {
      return { tipo: 'word', emoji: '📘' };
    }
    // Excel
    if (type.includes('excel') || type.includes('spreadsheet') || ['xls', 'xlsx', 'csv'].includes(ext)) {
      return { tipo: 'excel', emoji: '📗' };
    }
    // PowerPoint
    if (type.includes('powerpoint') || type.includes('presentation') || ['ppt', 'pptx'].includes(ext)) {
      return { tipo: 'powerpoint', emoji: '📙' };
    }
    // Código
    if (['js', 'ts', 'py', 'java', 'c', 'cpp', 'html', 'css', 'json', 'xml', 'sh', 'bat', 'rb', 'go', 'rust', 'rs'].includes(ext)) {
      return { tipo: 'codigo', emoji: '💻' };
    }
    // Ejecutables
    if (['exe', 'msi', 'apk', 'bat', 'cmd', 'sh', 'app', 'dmg'].includes(ext)) {
      return { tipo: 'ejecutable', emoji: '🚀' };
    }
    // Comprimidos
    if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext)) {
      return { tipo: 'comprimido', emoji: '📦' };
    }
    // Base de datos
    if (['db', 'sqlite', 'sql', 'mdb', 'accdb'].includes(ext)) {
      return { tipo: 'database', emoji: '🗄️' };
    }
    // No reconocido
    return { tipo: 'irreconocible', emoji: '❓' };
  }

  // Determinar si la extensión es reconocible para muestra en navegador
  function canPreview(category) {
    return ['imagen', 'audio', 'video', 'texto', 'pdf', 'codigo'].includes(category);
  }

  return {
    PASSWORD,
    addPost,
    getPosts,
    deletePost,
    addChatMessage,
    getChatMessages,
    getConfig,
    saveConfig,
    exportData,
    importData,
    loadFromGithubPages,
    notify,
    getFileFromDB,
    saveFileToDB,
    getFileCategory,
    canPreview,
    formatDate,
    formatDateTime,
    formatTime
  };
})();

// Exponer globalmente
window.Storage = Storage;