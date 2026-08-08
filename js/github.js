/* ============================================
   CARTAS HASTA EL INFINITO PANQUESITO
   Módulo de GitHub API (base de datos)
   - Lee y escribe info/datos.json en el repositorio
   - Almacena posts, chat y archivos (base64)
   - Sin límite de almacenamiento
   ============================================ */

const GitHubDB = (function() {
  let config = null;
  let connected = false;
  let lastData = null;
  let listeners = {};

  const DATA_PATH = 'info/datos.json';
  const API_BASE = 'https://api.github.com';

  // Inicializar con configuración
  function init(cfg) {
    try {
      config = {
        owner: cfg.owner || '',
        repo: cfg.repo || '',
        token: cfg.token || ''
      };

      if (!config.owner || !config.repo || !config.token) {
        connected = false;
        return { ok: false, error: 'Faltan datos de configuración (owner, repo, token)' };
      }

      connected = true;
      return { ok: true };
    } catch (e) {
      console.error('Error inicializando GitHub:', e);
      return { ok: false, error: e.message };
    }
  }

  function isConnected() {
    return connected;
  }

  function getConfig() {
    return config;
  }

  // Obtener headers de autenticación
  function getHeaders() {
    return {
      'Authorization': `Bearer ${config.token}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    };
  }

  // Obtener el SHA actual del archivo (necesario para actualizar)
  async function getFileSha() {
    try {
      const resp = await fetch(`${API_BASE}/repos/${config.owner}/${config.repo}/contents/${DATA_PATH}`, {
        headers: getHeaders()
      });

      if (resp.ok) {
        const data = await resp.json();
        return data.sha;
      }
      return null;
    } catch (e) {
      console.error('Error obteniendo SHA:', e);
      return null;
    }
  }

  // Cargar datos desde el repositorio
  async function loadData() {
    if (!connected) return { ok: false, error: 'GitHub no conectado' };

    try {
      const resp = await fetch(`${API_BASE}/repos/${config.owner}/${config.repo}/contents/${DATA_PATH}`, {
        headers: getHeaders()
      });

      if (resp.ok) {
        const data = await resp.json();
        // El contenido viene en base64
        const content = atob(data.content.replace(/\n/g, ''));
        const parsed = JSON.parse(content);
        lastData = parsed;
        return { ok: true, data: parsed };
      } else if (resp.status === 404) {
        // El archivo no existe, crear uno vacío
        const emptyData = {
          version: 1,
          posts: [],
          chat: [],
          config: {
            notifications: true
          }
        };
        lastData = emptyData;
        return { ok: true, data: emptyData };
      } else {
        const err = await resp.json();
        return { ok: false, error: err.message || `Error ${resp.status}` };
      }
    } catch (e) {
      console.error('Error cargando datos:', e);
      return { ok: false, error: e.message };
    }
  }

  // Guardar datos en el repositorio
  async function saveData(data) {
    if (!connected) return { ok: false, error: 'GitHub no conectado' };

    try {
      // Obtener SHA actual
      const sha = await getFileSha();

      // Convertir a JSON y luego a base64
      const json = JSON.stringify(data, null, 2);
      const base64 = btoa(unescape(encodeURIComponent(json)));

      const body = {
        message: `💖 Actualización: ${new Date().toLocaleString()}`,
        content: base64
      };

      if (sha) {
        body.sha = sha;
      }

      const resp = await fetch(`${API_BASE}/repos/${config.owner}/${config.repo}/contents/${DATA_PATH}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(body)
      });

      if (resp.ok) {
        lastData = data;
        return { ok: true };
      } else {
        const err = await resp.json();
        return { ok: false, error: err.message || `Error ${resp.status}` };
      }
    } catch (e) {
      console.error('Error guardando datos:', e);
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

  // ====== LISTENERS (polling) ======

  // Escuchar cambios (polling cada X segundos)
  function startListening(callback, intervalMs = 30000) {
    if (listeners.timer) {
      clearInterval(listeners.timer);
    }

    listeners.callback = callback;
    listeners.timer = setInterval(async () => {
      const result = await loadData();
      if (result.ok && listeners.callback) {
        listeners.callback(result.data);
      }
    }, intervalMs);

    return listeners.timer;
  }

  function stopListening() {
    if (listeners.timer) {
      clearInterval(listeners.timer);
      listeners.timer = null;
    }
  }

  // ====== UTILIDADES ======

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
    // Si viene con prefijo data:image/png;base64,...
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

  // Obtener URL de un archivo del repositorio (para archivos grandes)
  async function getFileUrl(path) {
    try {
      const resp = await fetch(`${API_BASE}/repos/${config.owner}/${config.repo}/contents/${path}`, {
        headers: getHeaders()
      });
      if (resp.ok) {
        const data = await resp.json();
        return data.download_url;
      }
      return null;
    } catch (e) {
      console.error('Error obteniendo URL:', e);
      return null;
    }
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
    startListening,
    stopListening,
    fileToBase64,
    base64ToBlob,
    getFileUrl
  };
})();

// Exponer globalmente
window.GitHubDB = GitHubDB;