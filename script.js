const playlistContainer = document.getElementById("playlist");
const clearDbBtn = document.getElementById("clearDbBtn");
const categoryFilter = document.getElementById("categoryFilter");

const STORAGE_KEY = "gdrive_playlist";
let currentPlaylist = [];

window.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved) {
    try {
      currentPlaylist = JSON.parse(saved);
      updateFilterOptions(currentPlaylist);
      renderPlaylist(currentPlaylist);
    } catch (e) {
      console.warn("Ошибка чтения localStorage:", e);
    }
  } else {
    // Автозагрузка через fetch
    fetch("PLGD-berlandbor-1.json")
      .then(res => res.json())
      .then(data => {
        currentPlaylist = data;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        updateFilterOptions(data);
        renderPlaylist(data);
      })
      .catch(err => {
        console.error("Ошибка загрузки плейлиста:", err);
        playlistContainer.innerHTML = "<p>❌ Не удалось загрузить плейлист.</p>";
      });
  }
});

clearDbBtn.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  currentPlaylist = [];
  playlistContainer.innerHTML = "<p>📭 Плейлист очищен.</p>";
  categoryFilter.innerHTML = `<option value="all">Все категории</option>`;
});

categoryFilter.addEventListener("change", () => {
  const selected = categoryFilter.value;
  if (selected === "all") {
    renderPlaylist(currentPlaylist);
  } else {
    const filtered = currentPlaylist.filter(item => item.category === selected);
    renderPlaylist(filtered);
  }
});

/*function renderPlaylist(items) {
  playlistContainer.innerHTML = "";
  items.forEach(item => {
    const { title, id, poster, category } = item;
    const imageSrc = poster || `https://drive.google.com/thumbnail?id=${id}`;

    const tile = document.createElement("div");
    tile.className = "tile";
    tile.innerHTML = `
      <img src="${imageSrc}" />
      <div class="tile-title">${title}</div>
      <div class="tile-category">📁 ${category || "Без категории"}</div>
    `;
    tile.addEventListener("click", () => {
      window.open(`player.html?id=${id}`, "_blank");
    });
    playlistContainer.appendChild(tile);
  });
}*/

function renderPlaylist(items) {
  playlistContainer.innerHTML = "";
  items.forEach(item => {
    const { title, id, poster, category, url } = item;
    const imageSrc = poster || `https://drive.google.com/thumbnail?id=${id}`;

    const tile = document.createElement("div");
    tile.className = "tile";
    tile.innerHTML = `
      <img src="${imageSrc}" />
      <div class="tile-title">${title}</div>
      <div class="tile-category">📁 ${category || "Без категории"}</div>
    `;

    tile.addEventListener("click", () => {
      if (url) {
        openPlayerModal(title, url, poster); // Новая функция, см. ниже
      } else {
        window.open(`player.html?id=${id}`, "_blank");
      }
    });
    playlistContainer.appendChild(tile);
  });
}

function updateFilterOptions(items) {
  const categories = Array.from(new Set(items.map(i => i.category).filter(Boolean)));
  categoryFilter.innerHTML = `<option value="all">Все категории</option>`;
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);
  });
}

const reloadPlaylistBtn = document.getElementById("reloadPlaylistBtn");
reloadPlaylistBtn.addEventListener("click", () => {
  fetch("PLGD-berlandbor-1.json")
    .then(res => res.json())
    .then(data => {
      currentPlaylist = data;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      updateFilterOptions(data);
      renderPlaylist(data);
    })
    .catch(err => {
      console.error("Ошибка загрузки плейлиста:", err);
      playlistContainer.innerHTML = "<p>❌ Не удалось загрузить плейлист.</p>";
    });
});

// Получаем элементы
const aboutBtn = document.getElementById("aboutBtn");
const aboutModal = document.getElementById("aboutModal");
const closeModal = document.getElementById("closeModal");

// Открытие модального окна
aboutBtn.addEventListener("click", () => {
  aboutModal.style.display = "block";
});

// Закрытие по крестику
closeModal.addEventListener("click", () => {
  aboutModal.style.display = "none";
});

// Закрытие при клике вне модального окна
window.addEventListener("click", (e) => {
  if (e.target === aboutModal) {
    aboutModal.style.display = "none";
  }
});

function openPlayerModal(title, url, poster) {
  // Создаем/показываем модальное окно
  let modal = document.getElementById('streamModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'streamModal';
    modal.style = 'position:fixed;left:0;top:0;width:100vw;height:100vh;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:10000;';
    modal.innerHTML = `
      <div style="background:#222;padding:24px;border-radius:12px;max-width:90vw;max-height:90vh;">
        <div id="modalPlayerTitle" style="color:#fff;font-size:1.2em;margin-bottom:12px;"></div>
        <div id="modalPlayerDiag" style="color:#eee;font-size:0.98em;margin-bottom:8px;"></div>
        <div id="modalPlayerContent"></div>
        <button id="closeStreamModal" style="display:block;margin:18px auto 0;">Закрыть</button>
      </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('closeStreamModal').onclick = () => modal.style.display = 'none';
  }
  document.getElementById('modalPlayerTitle').textContent = title;

  // Диагностика
  let diagDiv = document.getElementById('modalPlayerDiag');
  const updateDiag = (txt) => diagDiv && (diagDiv.innerHTML = txt);

  // Определяем тип (видео/аудио)
  let media;
  let isAudio = url.match(/\.(mp3|ogg|wav|aacp?)($|\?)/i);
  if (isAudio) {
    media = `<audio id="diagMedia" src="${url}" controls autoplay style="width:100%;max-width:520px;background:#000;" ${poster ? `poster="${poster}"` : ''}></audio>`;
  } else {
    media = `<video id="diagMedia" src="${url}" controls autoplay style="width:100%;max-width:720px;" poster="${poster||''}"></video>`;
    if (url.endsWith('.m3u8')) {
      media += `
        <div style="color:#fff;font-size:0.95em;margin-top:8px;">
          <b>Внимание:</b> Если поток не играет, попробуйте открыть в мобильном Chrome или Safari. Для полной поддержки .m3u8 используйте hls.js.
        </div>
      `;
    }
  }
  document.getElementById('modalPlayerContent').innerHTML = media;
  modal.style.display = 'flex';

  // Диагностика
  setTimeout(() => {
    const player = document.getElementById('diagMedia');
    if (!player) return;

    let lastBuffered = 0;
    let lastTime = 0;
    let errorLog = [];

    function diagUpdate() {
      let status = '';
      // Cтатус
      if (player.readyState < 2) status += "⚪️ Ожидание данных<br>";
      else if (player.paused) status += "⏸ Пауза<br>";
      else if (player.ended) status += "🏁 Конец<br>";
      else status += "🟢 Играет<br>";

      // Буферизация
      if (player.buffered.length) {
        let bufEnd = player.buffered.end(player.buffered.length - 1);
        let lag = (bufEnd - player.currentTime).toFixed(2);
        status += `Буфер: ${lag} сек<br>`;
      }

      // Bitrate (приблизительно, если доступно)
      if (player.webkitVideoDecodedByteCount || player.mozDecodedFrames) {
        status += `Bitrate: экспериментально<br>`;
      }

      // Ошибки
      if (errorLog.length) {
        status += `<span style="color:#f77">Ошибки:<br>${errorLog.join('<br>')}</span>`;
      }
      updateDiag(status);
    }

    // События
    player.addEventListener('playing', diagUpdate);
    player.addEventListener('pause', diagUpdate);
    player.addEventListener('waiting', () => { errorLog.push('Буферизация/задержка'); diagUpdate(); });
    player.addEventListener('stalled', () => { errorLog.push('Поток застопорился (stalled)'); diagUpdate(); });
    player.addEventListener('error', () => {
      let err = player.error;
      let errMsg = err ? `Код ошибки: ${err.code}` : "Неизвестная ошибка";
      errorLog.push('Ошибка воспроизведения: ' + errMsg);
      diagUpdate();
    });
    player.addEventListener('ended', diagUpdate);
    player.addEventListener('timeupdate', diagUpdate);
    player.addEventListener('progress', diagUpdate);

    diagUpdate();

    // Для живых стримов можно периодически опрашивать latency, если есть метка времени (расширенно)
    // Здесь реализована базовая диагностика

  }, 100);
}