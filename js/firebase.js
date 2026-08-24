/* ============================================
   CARTAS HASTA EL INFINITO PANQUESITO
   Módulo de Firebase Realtime Database
   - Misma interfaz que GitHubDB (híbrido)
   - Almacena posts, chat y archivos (base64)
   - Funciona en paralelo con GitHub
   ============================================ */

const FirebaseDB = (function() {
  let connected = false;
  let dbRef = null;

  // Configuración de Firebase (proyecto)
  const FIREBASE_CONFIG = {
    apiKey: "AIzaSyBF3Cld6bh-hrEPBdfUXjZtvzHSzxUn5Bs",
    authDomain: "cartas-hasta-el-panquesito.firebaseapp.com",
    databaseURL: "https://cartas-hasta-el-panquesito-default-rtdb.firebaseio.com",
    projectId: "cartas-hasta-el-panquesito",
    storageBucket: "cartas-hasta-el-panquesito.firebasestorage.app",
    messagingSenderId: "623469480721",
    appId: "1:623469480721:web:93d68df694b5a14d7e5ab0"
  };

  // Inicializar con configuración (acepta parametros pero usa la config fija)
  function init(cfg) {
    try {
      if (typeof firebase === 'undefined' || typeof firebase.database !== 'function') {
        connected = false;
        return { ok: false, error: 'Firebase SDK no cargado' };
      }

      // Inicializar app solo una vez
      if (!firebase.apps.length) {
        firebase.initializeApp(cfg && cfg.extra ? cfg.extra : FIREBASE_CONFIG);
      }

      dbRef = firebase.database().ref('datos');
      connected = true;
      return { ok: true };
    } catch (e) {
      connected = false;
      console.error('Error inicializando Firebase:', e);
      return { ok: false, error: e.message };
    }
  }

  function isConnected() {
    return connected;
  }

  function getConfig() {
    return FIREBASE_CONFIG;
  }

  // Cargar datos desde Firebase
  async function loadData() {
    if (!connected) return { ok: false, error: 'Firebase no conectado' };

    try {
      const snapshot = await dbRef.once('value');
      const data = snapshot.val();

      if (!data) {
        // No hay datos aún, devolver vacío
        const emptyData = {
          version: 1,
          posts: [],
          chat: [],
          config: {
            notifications: true
          }
        };
        return { ok: true, data: emptyData };
      }

      return { ok: true, data };
    } catch (e) {
      console.error('Error cargando datos de Firebase:', e);
      return { ok: false, error: e.message };
    }
  }

  // Guardar datos completos en Firebase
  async function saveData(data) {
    if (!connected) return { ok: false, error: 'Firebase no conectado' };

    try {
      await dbRef.set(data);
      return { ok: true };
    } catch (e) {
      console.error('Error guardando datos en Firebase:', e);
      return { ok: false, error: e.message };
    }
  }

  // ====== OPERACIONES CON POSTS ======

  // Agregar un post
  async function addPost(post) {
    const result = await loadData();
    if (!result.ok) return result;

    const data = result.data;
    if (!data.posts) data.posts = [];
    data.posts.push(post);

    return await saveData(data);
  }

  // Eliminar un post
  async function deletePost(postId) {
    const result = await loadData();
    if (!result.ok) return result;

    const data = result.data;
    data.posts = (data.posts || []).filter(p => p.id !== postId);

    return await saveData(data);
  }

  // ====== OPERACIONES CON CHAT ======

  // Agregar mensaje de chat
  async function addChatMessage(msg) {
    const result = await loadData();
    if (!result.ok) return result;

    const data = result.data;
    if (!data.chat) data.chat = [];
    data.chat.push(msg);

    return await saveData(data);
  }

  // ====== UTILIDADES (misma interfaz que GitHubDB) ======

  // Convertir archivo a base64
  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Convertir base64 a blob
  function base64ToBlob(base64, mimeType) {
    const parts = base64.split(',');
    const dataPart = parts.length > 1 ? parts[1] : parts[0];
    const mime = mimeType || (parts.length > 1 ? parts[0].match(/data:(.*?);/)[1] : 'application/octet-stream');

    const byteCharacters = atob(dataPart);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mime });
  }

  return {
    init,
    isConnected,
    getConfig,
    loadData,
    saveData,
    addPost,
    deletePost,
    addChatMessage,
    fileToBase64,
    base64ToBlob
  };
})();

// Exponer globalmente
window.FirebaseDB = FirebaseDB;
