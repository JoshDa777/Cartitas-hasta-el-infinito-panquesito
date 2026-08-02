/* ============================================
   CARTAS HASTA EL INFINITO PANQUESITO
   Lógica principal de la aplicación
   ============================================ */

(function() {
  'use strict';

  // ====== ESTADO ======
  const state = {
    currentUser: null,
    currentFilter: 'all',
    currentView: 'home',
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear(),
    selectedDate: null,
    selectedFile: null,
    syncInterval: null,
    lastSync: null
  };

  // ====== DOM REFERENCIAS ======
  const $ = (id) => document.getElementById(id);

  const loginScreen = $('login-screen');
  const app = $('app');
  const passwordInput = $('password-input');
  const loginBtn = $('login-btn');
  const loginError = $('login-error');

  const userModal = $('user-modal');
  const userBadge = $('user-badge');

  const navButtons = document.querySelectorAll('.nav-btn');
  const views = document.querySelectorAll('.view');

  const postsContainer = $('posts-container');
  const filterButtons = document.querySelectorAll('.filter-btn');

  const calendarGrid = $('calendar-grid');
  const calendarMonth = $('calendar-month');
  const calendarPosts = $('calendar-posts');
  const prevMonthBtn = $('prev-month');
  const nextMonthBtn = $('next-month');

  const chatContainer = $('chat-container');
  const chatInput = $('chat-input');
  const chatSend = $('chat-send');

  const dropZone = $('drop-zone');
  const fileInput = $('file-input');
  const filePickerBtn = $('file-picker-btn');
  const fileInfo = $('file-info');
  const fileNameDisplay = $('file-name-display');
  const fileSizeDisplay = $('file-size-display');
  const fileTitle = $('file-title');
  const fileCategory = $('file-category');
  const fileSubmit = $('file-submit');

  const uploadTabs = document.querySelectorAll('.upload-tab');
  const uploadTabContents = document.querySelectorAll('.upload-tab-content');

  const writeTitle = $('write-title');
  const writeCategory = $('write-category');
  const writeContent = $('write-content');
  const writeSubmit = $('write-submit');

  const githubOwner = $('github-owner');
  const githubRepo = $('github-repo');
  const githubToken = $('github-token');
  const githubSave = $('github-save');
  const githubStatus = $('github-status');

  const notifPermission = $('notif-permission');
  const notifStatus = $('notif-status');

  const exportBtn = $('export-data');
  const importBtn = $('import-data');
  const importFile = $('import-file');
  const logoutBtn = $('logout-btn');

  const syncStatus = $('sync-status');
  const toast = $('toast');

  // ====== TOAST ======
  function showToast(message, duration = 3000) {
    toast.textContent = message;
    toast.classList.remove('hidden');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.add('hidden');
    }, duration);
  }

  // ====== LOGIN ======
  function handleLogin() {
    const password = passwordInput.value.trim();
    if (password === Storage.PASSWORD) {
      loginScreen.classList.add('hidden');
      app.classList.remove('hidden');
      loginError.classList.add('hidden');
      passwordInput.value = '';
      checkUserSelection();
      initApp();
    } else {
      loginError.classList.remove('hidden');
      passwordInput.value = '';
      passwordInput.focus();
      showToast('❌ Contraseña incorrecta', 2000);
    }
  }

  loginBtn.addEventListener('click', handleLogin);
  passwordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleLogin();
  });

  // ====== SELECCIÓN DE USUARIO ======
  function checkUserSelection() {
    const storedUser = localStorage.getItem('panquesito_user');
    if (storedUser && (storedUser === 'julieth' || storedUser === 'joshua')) {
      selectUser(storedUser);
    } else {
      userModal.classList.remove('hidden');
    }
  }

  window.selectUser = function(user) {
    state.currentUser = user;
    localStorage.setItem('panquesito_user', user);
    userModal.classList.add('hidden');

    userBadge.textContent = user === 'julieth' ? '👩 JULIETH' : '👨 JOSHUA';
    userBadge.classList.remove('julieth', 'joshua');
    userBadge.classList.add(user);

    showToast(`¡Hola ${user === 'julieth' ? 'Julieth' : 'Joshua'}! 💖`);
  };

  // ====== NAVEGACIÓN ======
  function switchView(viewName) {
    state.currentView = viewName;

    navButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewName);
    });

    views.forEach(view => {
      view.classList.toggle('active', view.id === `view-${viewName}`);
    });

    // Acciones al cambiar de vista
    if (viewName === 'home') {
      renderPosts();
    } else if (viewName === 'calendar') {
      renderCalendar();
    } else if (viewName === 'chat') {
      renderChat();
    } else if (viewName === 'settings') {
      loadSettings();
    }
  }

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });

  // ====== RENDER POSTS ======
  function renderPosts() {
    const posts = Storage.getPosts();
    const filtered = state.currentFilter === 'all'
      ? posts
      : posts.filter(p => p.category === state.currentFilter);

    // Ordenar por fecha descendente
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (filtered.length === 0) {
      postsContainer.innerHTML = `
        <div class="empty-state">
          <span class="empty-emoji">💌</span>
          <p>¡Aún no hay nada por aquí!</p>
          <p>Sube tu primer recuerdo para empezar nuestra historia 💕</p>
        </div>
      `;
      return;
    }

    postsContainer.innerHTML = filtered.map(post => createPostCard(post)).join('');

    // Adjuntar eventos de descarga y vista
    filtered.forEach(post => {
      const downloadBtn = document.querySelector(`[data-download="${post.id}"]`);
      if (downloadBtn) {
        downloadBtn.addEventListener('click', () => downloadFile(post.id));
      }

      const viewBtn = document.querySelector(`[data-view-file="${post.id}"]`);
      if (viewBtn) {
        viewBtn.addEventListener('click', () => viewFile(post.id));
      }

      const deleteBtn = document.querySelector(`[data-delete="${post.id}"]`);
      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
          if (confirm(`¿Eliminar "${post.title || post.fileName}"? Esta acción no se puede deshacer.`)) {
            Storage.deletePost(post.id).then(() => {
              showToast('🗑️ Recuerdo eliminado');
              renderPosts();
              renderCalendar();
            });
          }
        });
      }
    });
  }

  function createPostCard(post) {
    const userClass = post.user === 'julieth' ? 'julieth' : 'joshua';
    const borderClass = post.user === 'julieth' ? 'pink-border' : 'blue-border';
    const categoryEmoji = getCategoryEmoji(post.category);
    const userName = post.user === 'julieth' ? '👩 Julieth' : '👨 Joshua';
    const dateStr = Storage.formatDateTime(post.date);
    const categoryName = getCategoryName(post.category);

    let contentHTML = '';

    if (post.type === 'text') {
      contentHTML = `<div class="post-content">${escapeHTML(post.content)}</div>`;
    } else if (post.type === 'file') {
      const fileInfo = Storage.getFileCategory({ name: post.fileName, type: post.fileType });
      const previewClass = Storage.canPreview(fileInfo.tipo) ? '' : ' irreconocible';
      const typeLabel = fileInfo.tipo === 'irreconocible' ? 'IRRECONOCIBLE' : fileInfo.tipo.toUpperCase();

      contentHTML = `
        <div class="file-preview">
          <div class="file-icon">${fileInfo.emoji}</div>
          <div class="file-type-text${previewClass}">${typeLabel}</div>
          <p class="post-content" style="text-align:center;padding:0;">${escapeHTML(post.fileName)}</p>
        </div>
      `;
    }

    const actionsHTML = post.type === 'file' ? `
      <div class="post-actions">
        <button class="pixel-btn pixel-btn-blue" data-view-file="${post.id}">👁️ Ver</button>
        <button class="pixel-btn pixel-btn-pink" data-download="${post.id}">⬇️ Descargar</button>
        <button class="pixel-btn pixel-btn-dark" data-delete="${post.id}">🗑️</button>
      </div>
    ` : `
      <div class="post-actions">
        <button class="pixel-btn pixel-btn-dark" data-delete="${post.id}">🗑️ Eliminar</button>
      </div>
    `;

    return `
      <div class="post-card ${borderClass}" data-post-id="${post.id}">
        <div class="post-header">
          <span class="post-category ${post.category}">${categoryEmoji} ${categoryName}</span>
          <span class="post-user ${userClass}">${userName}</span>
        </div>
        ${post.title ? `<h3 class="post-title">${escapeHTML(post.title)}</h3>` : ''}
        <p class="post-date">📅 ${dateStr}</p>
        ${contentHTML}
        ${actionsHTML}
      </div>
    `;
  }

  function getCategoryEmoji(category) {
    const emojis = {
      'carta': '💌',
      'anecdota': '😄',
      'historia': '📖',
      'archivo': '📁'
    };
    return emojis[category] || '📁';
  }

  function getCategoryName(category) {
    const names = {
      'carta': 'Carta',
      'anecdota': 'Anécdota',
      'historia': 'Historia',
      'archivo': 'Archivo'
    };
    return names[category] || 'Archivo';
  }

  function escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ====== FILTROS ======
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.currentFilter = btn.dataset.filter;
      renderPosts();
    });
  });

  // ====== CALENDARIO ======
  function renderCalendar() {
    const posts = Storage.getPosts();
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    calendarMonth.textContent = `${monthNames[state.currentMonth]} ${state.currentYear}`;

    // Agrupar posts por día
    const postsByDay = {};
    posts.forEach(post => {
      const date = new Date(post.date);
      if (date.getMonth() === state.currentMonth && date.getFullYear() === state.currentYear) {
        const day = date.getDate();
        if (!postsByDay[day]) postsByDay[day] = [];
        postsByDay[day].push(post);
      }
    });

    // Construir calendario
    const firstDay = new Date(state.currentYear, state.currentMonth, 1);
    const startDay = firstDay.getDay(); // 0 = domingo
    const daysInMonth = new Date(state.currentYear, state.currentMonth + 1, 0).getDate();
    const today = new Date();

    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    let html = dayNames.map(name => `<div class="calendar-day-name"><span>${name}</span></div>`).join('');

    // Celdas vacías al inicio
    for (let i = 0; i < startDay; i++) {
      html += `<div class="calendar-day empty"></div>`;
    }

    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const dayPosts = postsByDay[day] || [];
      const count = dayPosts.length;
      let classes = 'calendar-day';
      let dotHTML = '';

      if (count > 0) {
        if (count > 5) {
          classes += ' has-many';
        } else {
          classes += ' has-items';
          dotHTML = `<span class="day-dot"></span>`;
        }
      }

      // Día actual
      if (day === today.getDate() && state.currentMonth === today.getMonth() && state.currentYear === today.getFullYear()) {
        classes += ' today';
      }

      // Día seleccionado
      if (state.selectedDate === `${state.currentYear}-${state.currentMonth}-${day}`) {
        classes += ' selected';
      }

      html += `
        <div class="${classes}" data-day="${day}" data-date="${state.currentYear}-${state.currentMonth}-${day}">
          ${day}
          ${dotHTML}
        </div>
      `;
    }

    calendarGrid.innerHTML = html;

    // Eventos click en días
    calendarGrid.querySelectorAll('.calendar-day:not(.empty)').forEach(dayEl => {
      dayEl.addEventListener('click', () => {
        const day = dayEl.dataset.day;
        const date = dayEl.dataset.date;

        // Toggle selección
        if (state.selectedDate === date) {
          state.selectedDate = null;
          calendarPosts.innerHTML = `<p class="calendar-hint">Haz clic en un día para ver sus recuerdos ✨</p>`;
        } else {
          state.selectedDate = date;
          renderCalendar();
          showPostsForDay(day);
        }
      });
    });

    // Mostrar posts del día seleccionado si existe
    if (state.selectedDate) {
      const day = parseInt(state.selectedDate.split('-')[2]);
      showPostsForDay(day);
    }
  }

  function showPostsForDay(day) {
    const posts = Storage.getPosts();
    const dayPosts = posts.filter(post => {
      const date = new Date(post.date);
      return date.getDate() === day &&
             date.getMonth() === state.currentMonth &&
             date.getFullYear() === state.currentYear;
    });

    dayPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (dayPosts.length === 0) {
      calendarPosts.innerHTML = `<p class="calendar-hint">No hay recuerdos este día ✨</p>`;
      return;
    }

    const listHTML = dayPosts.map(post => {
      const userName = post.user === 'julieth' ? '👩 Julieth' : '👨 Joshua';
      const categoryEmoji = getCategoryEmoji(post.category);
      const title = post.title || post.fileName || 'Sin título';
      return `
        <div class="calendar-post">
          <div class="calendar-post-info">
            <span class="calendar-post-type">${categoryEmoji}</span>
            <span class="calendar-post-title">${escapeHTML(title)}</span>
            <span class="calendar-post-user">${userName}</span>
          </div>
          <button class="calendar-post-btn" data-calendar-id="${post.id}">Ver</button>
        </div>
      `;
    }).join('');

    calendarPosts.innerHTML = `<div class="calendar-posts-list">${listHTML}</div>`;

    // Eventos para ver posts
    calendarPosts.querySelectorAll('.calendar-post-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const postId = btn.dataset.calendarId;
        // Cambiar a vista home y resaltar el post
        switchView('home');
        const postCard = document.querySelector(`[data-post-id="${postId}"]`);
        if (postCard) {
          postCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          postCard.style.borderColor = '#ff9800';
        } else {
          // Filtrar para mostrar solo ese post
          state.currentFilter = 'all';
          filterButtons.forEach(b => b.classList.remove('active'));
          filterButtons[0].classList.add('active');
          renderPosts();
          showToast('Buscando recuerdo...');
        }
      });
    });
  }

  prevMonthBtn.addEventListener('click', () => {
    state.currentMonth--;
    if (state.currentMonth < 0) {
      state.currentMonth = 11;
      state.currentYear--;
    }
    state.selectedDate = null;
    renderCalendar();
  });

  nextMonthBtn.addEventListener('click', () => {
    state.currentMonth++;
    if (state.currentMonth > 11) {
      state.currentMonth = 0;
      state.currentYear++;
    }
    state.selectedDate = null;
    renderCalendar();
  });

  // ====== CHAT ======
  function renderChat() {
    const messages = Storage.getChatMessages();
    messages.sort((a, b) => new Date(a.date) - new Date(b.date));

    if (messages.length === 0) {
      chatContainer.innerHTML = `
        <div class="empty-state" style="box-shadow:none;border:none;">
          <span class="empty-emoji">💬</span>
          <p>¡Empieza la conversación!</p>
          <p>Escríbele a tu amor un mensajito 💕</p>
        </div>
      `;
      return;
    }

    chatContainer.innerHTML = messages.map(msg => {
      const userClass = msg.user === 'julieth' ? 'julieth' : 'joshua';
      const userName = msg.user === 'julieth' ? '👩 JULIETH' : '👨 JOSHUA';
      const time = Storage.formatTime(msg.date);
      return `
        <div class="chat-message ${userClass}">
          <p class="chat-user">${userName}</p>
          <p class="chat-text">${escapeHTML(msg.message)}</p>
          <span class="chat-time">${time}</span>
        </div>
      `;
    }).join('');

    // Scroll al final
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  function sendChatMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    if (!state.currentUser) {
      showToast('⚠️ Primero selecciona quién eres');
      return;
    }

    const msg = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      user: state.currentUser,
      message,
      date: new Date().toISOString()
    };

    Storage.addChatMessage(msg);

    // Notificar al otro usuario
    const otherUser = state.currentUser === 'julieth' ? 'Joshua' : 'Julieth';
    Storage.notify(`💬 Mensaje de ${state.currentUser === 'julieth' ? 'Julieth' : 'Joshua'}`, message, '💬');

    chatInput.value = '';
    renderChat();
    syncToGithub(true);
  }

  chatSend.addEventListener('click', sendChatMessage);
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendChatMessage();
  });

  // ====== SUBIR ARCHIVO ======
  dropZone.addEventListener('click', () => fileInput.click());
  filePickerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput.click();
  });

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragging');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragging');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragging');
    const file = e.dataTransfer.files[0];
    if (file) selectFile(file);
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) selectFile(file);
  });

  function selectFile(file) {
    state.selectedFile = file;
    fileNameDisplay.textContent = file.name;
    fileSizeDisplay.textContent = formatFileSize(file.size);
    fileInfo.classList.remove('hidden');
    fileSubmit.disabled = false;
    showToast(`📁 Archivo seleccionado: ${file.name}`);
  }

  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async function submitFile() {
    if (!state.selectedFile) return;
    if (!state.currentUser) {
      showToast('⚠️ Primero selecciona quién eres');
      return;
    }

    const file = state.selectedFile;
    const cat = Storage.getFileCategory(file);
    const title = fileTitle.value.trim() || file.name.split('.')[0];
    const category = fileCategory.value;

    const post = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      type: 'file',
      title,
      category,
      content: '',
      hasFile: true,
      fileName: file.name,
      fileType: file.type || 'application/octet-stream',
      fileSize: file.size,
      fileKind: cat.tipo,
      user: state.currentUser,
      date: new Date().toISOString(),
      fileData: {
        blob: file,
        name: file.name,
        type: file.type || 'application/octet-stream'
      }
    };

    fileSubmit.disabled = true;
    fileSubmit.textContent = 'Subiendo...';

    try {
      await Storage.addPost(post);
      showToast('✅ ¡Recuerdo guardado! 💖');

      // Notificar al otro usuario
      Storage.notify(
        `${state.currentUser === 'julieth' ? 'Julieth' : 'Joshua'} subió: ${title}`,
        `Nuevo ${getCategoryName(category)} agregado`,
        '📁'
      );

      // Resetear formulario
      state.selectedFile = null;
      fileInput.value = '';
      fileInfo.classList.add('hidden');
      fileTitle.value = '';
      fileNameDisplay.textContent = '';
      fileSizeDisplay.textContent = '';
      fileSubmit.textContent = 'Subir Archivo';
      fileSubmit.disabled = true;

      renderPosts();
      syncToGithub(true);
    } catch (error) {
      console.error('Error subiendo archivo:', error);
      showToast('❌ Error al subir el archivo');
      fileSubmit.textContent = 'Subir Archivo';
      fileSubmit.disabled = false;
    }
  }

  fileSubmit.addEventListener('click', submitFile);

  // ====== ESCRIBIR CARTA / ANÉCDOTA ======
  async function submitWrite() {
    const title = writeTitle.value.trim();
    const content = writeContent.value.trim();
    const category = writeCategory.value;

    if (!title) {
      showToast('⚠️ Escribe un título');
      return;
    }
    if (!content) {
      showToast('⚠️ Escribe el contenido');
      return;
    }
    if (!state.currentUser) {
      showToast('⚠️ Primero selecciona quién eres');
      return;
    }

    const post = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      type: 'text',
      title,
      category,
      content,
      hasFile: false,
      user: state.currentUser,
      date: new Date().toISOString()
    };

    writeSubmit.disabled = true;
    writeSubmit.textContent = 'Publicando...';

    try {
      await Storage.addPost(post);
      showToast('✅ ¡Escrito publicado! 💖');

      // Notificar al otro usuario
      Storage.notify(
        `${state.currentUser === 'julieth' ? 'Julieth' : 'Joshua'} publicó: ${title}`,
        content.substring(0, 100) + (content.length > 100 ? '...' : ''),
        getCategoryEmoji(category)
      );

      // Resetear formulario
      writeTitle.value = '';
      writeContent.value = '';
      writeSubmit.textContent = 'Publicar';
      writeSubmit.disabled = false;

      switchView('home');
      syncToGithub(true);
    } catch (error) {
      console.error('Error publicando:', error);
      showToast('❌ Error al publicar');
      writeSubmit.textContent = 'Publicar';
      writeSubmit.disabled = false;
    }
  }

  writeSubmit.addEventListener('click', submitWrite);

  // ====== PESTAÑAS DE SUBIDA ======
  uploadTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      uploadTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      uploadTabContents.forEach(content => {
        content.classList.toggle('active', content.id === `upload-${tab.dataset.tab}-tab`);
      });
    });
  });

  // ====== DESCARGAR / VER ARCHIVO ======
  async function downloadFile(postId) {
    const posts = Storage.getPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    try {
      const fileData = await Storage.getFileFromDB(postId);
      if (!fileData) {
        showToast('❌ Archivo no encontrado');
        return;
      }

      const url = URL.createObjectURL(fileData.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = post.fileName || 'archivo';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      showToast('⬇️ Descargando archivo...');
    } catch (e) {
      console.error('Error descargando:', e);
      showToast('❌ Error al descargar');
    }
  }

  async function viewFile(postId) {
    const posts = Storage.getPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    try {
      const fileData = await Storage.getFileFromDB(postId);
      if (!fileData) {
        showToast('❌ Archivo no encontrado');
        return;
      }

      const fileCategory = Storage.getFileCategory({ name: post.fileName, type: post.fileType });

      // Crear ventana modal para ver el archivo
      const modal = document.createElement('div');
      modal.className = 'modal';
      modal.id = 'viewer-modal';

      const url = URL.createObjectURL(fileData.blob);
      let viewerHTML = '';

      switch (fileCategory.tipo) {
        case 'imagen':
          viewerHTML = `<img src="${url}" alt="${escapeHTML(post.fileName)}">`;
          break;
        case 'audio':
          viewerHTML = `<audio controls src="${url}"></audio>`;
          break;
        case 'video':
          viewerHTML = `<video controls src="${url}"></video>`;
          break;
        case 'texto':
        case 'codigo':
          await fileData.blob.text().then(text => {
            viewerHTML = `<pre class="viewer-text">${escapeHTML(text)}</pre>`;
          });
          break;
        case 'pdf':
          viewerHTML = `<iframe src="${url}"></iframe>`;
          break;
        default:
          viewerHTML = `
            <div class="viewer-unreconocible">
              <span class="file-icon">❓</span>
              <p>Archivo no reconocible en el navegador</p>
              <p class="viewer-filename">${escapeHTML(post.fileName)}</p>
              <button class="pixel-btn pixel-btn-pink" id="viewer-download">⬇️ Descargar</button>
            </div>
          `;
      }

      modal.innerHTML = `
        <div class="modal-content viewer-modal-content">
          <div class="viewer-header">
            <h3 class="viewer-title">${escapeHTML(post.title || post.fileName)}</h3>
            <button class="viewer-close" id="viewer-close">✖</button>
          </div>
          <div class="viewer-body">
            ${viewerHTML}
          </div>
          <div class="viewer-footer">
            <button class="pixel-btn pixel-btn-blue" id="viewer-download-footer">⬇️ Descargar</button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      // Eventos del modal
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeViewer();
      });

      modal.querySelectorAll('#viewer-close').forEach(btn => {
        btn.addEventListener('click', closeViewer);
      });

      modal.querySelectorAll('#viewer-download, #viewer-download-footer').forEach(btn => {
        btn.addEventListener('click', () => downloadFile(postId));
      });

      // Descargar directamente si no se puede previsualizar
      if (!Storage.canPreview(fileCategory.tipo)) {
        // Ya se muestra el botón de descarga
      }

      function closeViewer() {
        modal.remove();
        URL.revokeObjectURL(url);
      }

      // Cerrar con tecla ESC
      const escHandler = (e) => {
        if (e.key === 'Escape') {
          closeViewer();
          document.removeEventListener('keydown', escHandler);
        }
      };
      document.addEventListener('keydown', escHandler);

    } catch (e) {
      console.error('Error viendo archivo:', e);
      showToast('❌ Error al ver el archivo');
    }
  }

  // ====== SINCRONIZACIÓN ======
  async function syncToGithub(showmessage = false) {
    const config = Storage.getConfig();
    if (!config.github.owner || !config.github.repo || !config.github.token) {
      return;
    }

    syncStatus.textContent = '🔄';
    syncStatus.classList.add('syncing');

    const result = await Storage.syncWithGithub();

    syncStatus.classList.remove('syncing');

    if (result.ok) {
      syncStatus.textContent = '✅';
      state.lastSync = new Date();
      if (showmessage) {
        showToast('📡 Sincronizado con GitHub');
      }
    } else {
      syncStatus.textContent = '⚠️';
      if (showmessage) {
        showToast(`⚠️ ${result.error}`);
      }
    }
  }

  syncStatus.addEventListener('click', () => syncToGithub(true));

  // ====== CONFIGURACIÓN ======
  function loadSettings() {
    const config = Storage.getConfig();
    githubOwner.value = config.github.owner || '';
    githubRepo.value = config.github.repo || '';
    githubToken.value = config.github.token || '';

    // Estado de notificaciones
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        notifStatus.textContent = '✅ Notificaciones activadas';
      } else if (Notification.permission === 'denied') {
        notifStatus.textContent = '❌ Notificaciones bloqueadas en el navegador';
      } else {
        notifStatus.textContent = 'ℹ️ Notificaciones no configuradas aún';
      }
    } else {
      notifStatus.textContent = '⚠️ Tu navegador no soporta notificaciones';
    }
  }

  githubSave.addEventListener('click', async () => {
    const config = {
      github: {
        owner: githubOwner.value.trim(),
        repo: githubRepo.value.trim(),
        token: githubToken.value.trim()
      }
    };

    if (!config.github.owner || !config.github.repo || !config.github.token) {
      showToast('⚠️ Completa todos los campos de GitHub');
      return;
    }

    githubSave.disabled = true;
    githubSave.textContent = 'Guardando...';

    Storage.saveConfig(config);

    // Probar conexión
    const result = await Storage.syncWithGithub();

    githubSave.disabled = false;
    githubSave.textContent = 'Guardar Configuración';

    if (result.ok) {
      githubStatus.textContent = '✅ ¡Conectado a GitHub correctamente!';
      showToast('✅ GitHub conectado');
    } else {
      githubStatus.textContent = `❌ Error: ${result.error}`;
      showToast('❌ Error al conectar GitHub');
    }
  });

  // ====== NOTIFICACIONES ======
  notifPermission.addEventListener('click', async () => {
    if (!('Notification' in window)) {
      notifStatus.textContent = '⚠️ Tu navegador no soporta notificaciones';
      return;
    }

    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      const config = Storage.getConfig();
      config.notifications = true;
      Storage.saveConfig({ notifications: true, ...config });
      notifStatus.textContent = '✅ Notificaciones activadas';
      showToast('🔔 ¡Notificaciones activadas!');
      Storage.notify('🔔 Notificaciones activadas', 'Recibirás notificaciones cuando suban algo nuevo');
    } else {
      notifStatus.textContent = '❌ Notificaciones bloqueadas';
      showToast('❌ Notificaciones bloqueadas');
    }
  });

  // ====== EXPORTAR / IMPORTAR ======
  exportBtn.addEventListener('click', async () => {
    try {
      const json = await Storage.exportData();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `panquesito-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast('💾 Datos exportados');
    } catch (e) {
      console.error('Error exportando:', e);
      showToast('❌ Error al exportar');
    }
  });

  importBtn.addEventListener('click', () => importFile.click());

  importFile.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const success = await Storage.importData(reader.result);
      if (success) {
        showToast('✅ Datos importados correctamente');
        renderPosts();
        renderCalendar();
        renderChat();
      } else {
        showToast('❌ Error al importar datos');
      }
    };
    reader.readAsText(file);
    importFile.value = '';
  });

  // ====== CERRAR SESIÓN ======
  logoutBtn.addEventListener('click', () => {
    if (confirm('¿Cerrar sesión?')) {
      state.currentUser = null;
      localStorage.removeItem('panquesito_user');
      app.classList.add('hidden');
      loginScreen.classList.remove('hidden');
      userBadge.textContent = '';
      userBadge.classList.remove('julieth', 'joshua');
      showToast('👋 Sesión cerrada');
    }
  });

  // ====== INICIALIZACIÓN ======
  async function initApp() {
    renderPosts();
    renderCalendar();
    renderChat();
    loadSettings();

    // Configurar sincronización automática cada 5 minutos
    if (state.syncInterval) {
      clearInterval(state.syncInterval);
    }
    state.syncInterval = setInterval(() => syncToGithub(false), 5 * 60 * 1000);

    // Sincronizar al inicio
    syncToGithub(false);

    // Comprobar mensajes nuevos cada 30 segundos (para notificaciones)
    setInterval(() => {
      checkForNewMessages();
    }, 30000);
  }

  // ====== DETECCIÓN DE NUEVOS MENSAJES ======
  let lastCheckCount = 0;

  function checkForNewMessages() {
    const messages = Storage.getChatMessages();
    if (lastCheckCount === 0) {
      lastCheckCount = messages.length;
      return;
    }

    if (messages.length > lastCheckCount) {
      const newMsg = messages[messages.length - 1];
      if (newMsg.user !== state.currentUser) {
        Storage.notify(
          `💬 Nuevo mensaje de ${newMsg.user === 'julieth' ? 'Julieth' : 'Joshua'}`,
          newMsg.message,
          '💬'
        );
        showToast(`💬 Nuevo mensaje de ${newMsg.user === 'julieth' ? 'Julieth' : 'Joshua'}`);
      }
    }
    lastCheckCount = messages.length;
  }

})();