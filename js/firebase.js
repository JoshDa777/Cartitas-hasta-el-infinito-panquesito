/* ============================================
   CARTAS HASTA EL INFINITO PANQUESITO
   Conexión con Firebase
   - Realtime Database: texto, chat, metadatos
   - Firebase Storage: archivos (fotos, videos, audios)
   - Sincronización en tiempo real
   ============================================ */

const FirebaseSync = (function() {
  let app = null;
  let db = null;
  let storage = null;
  let connected = false;
  let listeners = {};

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

  // Inicializar Firebase con la configuración
  function init(config) {
    try {
      if (app) {
        try { firebase.deleteApp(app); } catch(e) {}
      }

      app = firebase.initializeApp(config);
      db = firebase.database();
      storage = firebase.storage();
      connected = true;

      return { ok: true };
    } catch (e) {
      console.error('Error inicializando Firebase:', e);
      return { ok: false, error: e.message };
    }
  }

  function isConnected() {
    return connected;
  }

  function getMaxFileSize() {
    return MAX_FILE_SIZE;
  }

  // Verificar tamaño del archivo
  function validateFileSize(fileSize) {
    if (fileSize > MAX_FILE_SIZE) {
      return {
        ok: false,
        error: `El archivo es demasiado grande (${formatBytes(fileSize)}). Límite: 10 MB`
      };
    }
    return { ok: true };
  }

  function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Subir archivo a Firebase Storage
  async function uploadFile(file, postId) {
    if (!connected || !storage) {
      return { ok: false, error: 'Firebase no conectado' };
    }

    const validation = validateFileSize(file.size);
    if (!validation.ok) {
      return validation;
    }

    try {
      const storageRef = storage.ref(`archivos/${postId}/${file.name}`);
      const snapshot = await storageRef.put(file);
      const downloadUrl = await snapshot.ref.getDownloadURL();

      return { ok: true, downloadUrl, path: `archivos/${postId}/${file.name}` };
    } catch (e) {
      console.error('Error subiendo a Firebase Storage:', e);
      return { ok: false, error: e.message };
    }
  }

  // Obtener URL de descarga directa
  async function getDownloadUrl(fileUrl) {
    if (!connected || !storage) return null;

    try {
      if (fileUrl && fileUrl.startsWith('http')) return fileUrl;

      // Si es un path de Storage, obtener la URL
      if (fileUrl && fileUrl.startsWith('archivos/')) {
        const ref = storage.ref(fileUrl);
        return await ref.getDownloadURL();
      }

      return null;
    } catch (e) {
      console.error('Error obteniendo URL:', e);
      return null;
    }
  }

  // Descargar archivo desde Firebase Storage
  async function downloadFile(fileUrl) {
    if (!connected || !storage) {
      return { ok: false, error: 'Firebase no conectado' };
    }

    try {
      const url = await getDownloadUrl(fileUrl);
      if (!url) return { ok: false, error: 'No se pudo obtener la URL' };

      const resp = await fetch(url);
      if (resp.ok) {
        const blob = await resp.blob();
        return { ok: true, blob, url };
      }
      return { ok: false, error: `Error ${resp.status}` };
    } catch (e) {
      console.error('Error descargando de Storage:', e);
      return { ok: false, error: e.message };
    }
  }

  // ====== POSTS (Cartas, anécdotas, historias, archivos) ======

  // Guardar un post en Firebase
  async function savePost(post) {
    if (!connected || !db) return { ok: false, error: 'Firebase no conectado' };

    try {
      // Si tiene archivo, subirlo a Storage primero
      if (post.fileData && post.fileData.blob) {
        const uploadResult = await uploadFile(post.fileData.blob, post.id);
        if (uploadResult.ok) {
          post.fileUrl = uploadResult.downloadUrl;
          post.fileStoragePath = uploadResult.path;
          post.hasFile = true;
        } else {
          console.warn('No se pudo subir archivo a Storage:', uploadResult.error);
        }
      }

      // Limpiar el post antes de guardar (no guardar blobs)
      const postToSave = { ...post };
      delete postToSave.fileData;
      delete postToSave.fileBase64;

      // Guardar el post en la base de datos
      await db.ref(`posts/${post.id}`).set(postToSave);
      return { ok: true };
    } catch (e) {
      console.error('Error guardando post en Firebase:', e);
      return { ok: false, error: e.message };
    }
  }

  // Eliminar un post de Firebase (incluyendo archivo de Storage)
  async function deletePost(postId, fileStoragePath) {
    if (!connected || !db) return { ok: false, error: 'Firebase no conectado' };

    try {
      // Eliminar archivo de Storage si existe
      if (fileStoragePath && storage) {
        try {
          const ref = storage.ref(fileStoragePath);
          await ref.delete();
        } catch (e) {
          console.log('No se pudo eliminar el archivo de Storage:', e);
        }
      }

      // Eliminar el post de la base de datos
      await db.ref(`posts/${postId}`).remove();
      return { ok: true };
    } catch (e) {
      console.error('Error eliminando post de Firebase:', e);
      return { ok: false, error: e.message };
    }
  }

  // Cargar todos los posts desde Firebase
  async function loadPosts() {
    if (!connected || !db) return { ok: false, error: 'Firebase no conectado' };

    try {
      const snapshot = await db.ref('posts').once('value');
      const data = snapshot.val();
      const posts = data ? Object.values(data) : [];
      return { ok: true, posts };
    } catch (e) {
      console.error('Error cargando posts de Firebase:', e);
      return { ok: false, error: e.message };
    }
  }

  // Escuchar cambios en posts en tiempo real
  function listenPosts(callback) {
    if (!connected || !db) return;

    if (listeners.posts) {
      listeners.posts.off();
    }

    listeners.posts = db.ref('posts');
    listeners.posts.on('value', (snapshot) => {
      const data = snapshot.val();
      const posts = data ? Object.values(data) : [];
      callback(posts);
    });
  }

  // ====== CHAT ======

  // Guardar un mensaje de chat en Firebase
  async function saveChatMessage(msg) {
    if (!connected || !db) return { ok: false, error: 'Firebase no conectado' };

    try {
      await db.ref(`chat/${msg.id}`).set(msg);
      return { ok: true };
    } catch (e) {
      console.error('Error guardando mensaje en Firebase:', e);
      return { ok: false, error: e.message };
    }
  }

  // Cargar todos los mensajes de chat
  async function loadChat() {
    if (!connected || !db) return { ok: false, error: 'Firebase no conectado' };

    try {
      const snapshot = await db.ref('chat').orderByChild('date').once('value');
      const data = snapshot.val();
      const messages = data ? Object.values(data) : [];
      return { ok: true, messages };
    } catch (e) {
      console.error('Error cargando chat de Firebase:', e);
      return { ok: false, error: e.message };
    }
  }

  // Escuchar cambios en chat en tiempo real
  function listenChat(callback) {
    if (!connected || !db) return;

    if (listeners.chat) {
      listeners.chat.off();
    }

    listeners.chat = db.ref('chat').orderByChild('date');
    listeners.chat.on('value', (snapshot) => {
      const data = snapshot.val();
      const messages = data ? Object.values(data) : [];
      callback(messages);
    });
  }

  // ====== BORRAR TODOS LOS DATOS DE FIREBASE ======
  async function clearAllData() {
    if (!connected || !db) return { ok: false, error: 'Firebase no conectado' };

    try {
      await db.ref('posts').remove();
      await db.ref('chat').remove();

      // Intentar borrar archivos de Storage
      if (storage) {
        try {
          const storageRef = storage.ref('archivos');
          const listResult = await storageRef.listAll();
          for (const item of listResult.items) {
            await item.delete();
          }
        } catch (e) {
          console.log('No se pudieron borrar todos los archivos de Storage:', e);
        }
      }

      return { ok: true };
    } catch (e) {
      console.error('Error borrando datos de Firebase:', e);
      return { ok: false, error: e.message };
    }
  }

  // ====== DETENER LISTENERS ======
  function stopAllListeners() {
    Object.keys(listeners).forEach(key => {
      if (listeners[key]) {
        listeners[key].off();
        delete listeners[key];
      }
    });
  }

  return {
    init,
    isConnected,
    getMaxFileSize,
    validateFileSize,
    uploadFile,
    getDownloadUrl,
    downloadFile,
    savePost,
    deletePost,
    loadPosts,
    listenPosts,
    saveChatMessage,
    loadChat,
    listenChat,
    clearAllData,
    stopAllListeners
  };
})();

// Exponer globalmente
window.FirebaseSync = FirebaseSync;
