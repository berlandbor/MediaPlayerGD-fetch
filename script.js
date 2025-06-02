const playlistContainer = document.getElementById("playlist");
const clearDbBtn = document.getElementById("clearDbBtn");
const categoryFilter = document.getElementById("categoryFilter");
const reloadPlaylistBtn = document.getElementById("reloadPlaylistBtn");

let currentPlaylist = [];

// Загрузка и отрисовка плейлиста
function loadAndRenderPlaylist() {
  fetch("PLGD-berlandbor-1.json")
    .then(res => res.json())
    .then(data => {
      currentPlaylist = data;
      updateFilterOptions(data);
      renderPlaylist(data);
    })
    .catch(err => {
      console.error("Ошибка загрузки плейлиста:", err);
      playlistContainer.innerHTML = "<p>❌ Не удалось загрузить плейлист.</p>";
    });
}

window.addEventListener("DOMContentLoaded", loadAndRenderPlaylist);

clearDbBtn.addEventListener("click", () => {
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

reloadPlaylistBtn.addEventListener("click", loadAndRenderPlaylist);

function renderPlaylist(items) {
  playlistContainer.innerHTML = "";
  items.forEach(item => {
    const { title, id, poster, category, vk_oid, vk_id, vk_hash } = item;
    let imageSrc = poster;
    if (!imageSrc) {
      if (id) imageSrc = `https://drive.google.com/thumbnail?id=${id}`;
      else if (vk_oid && vk_id && vk_hash) imageSrc = 'https://vk.com/images/video_placeholder.png';
      else imageSrc = '';
    }

    const tile = document.createElement("div");
    tile.className = "tile";
    tile.innerHTML = `
      <img src="${imageSrc}" />
      <div class="tile-title">${title}</div>
      <div class="tile-category">📁 ${category || "Без категории"}</div>
      ${vk_oid && vk_id && vk_hash ? `<div class="tile-vk">VK</div>` : ""}
    `;

    tile.addEventListener("click", () => {
      if (vk_oid && vk_id && vk_hash) {
        // Открываем VK-видео через параметры
        const vkParams = `vk_oid=${encodeURIComponent(vk_oid)}&vk_id=${encodeURIComponent(vk_id)}&vk_hash=${encodeURIComponent(vk_hash)}`;
        window.open(`player.html?${vkParams}`, "_blank");
      } else if (id) {
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

// --- Модальные окна (about) ---
const aboutBtn = document.getElementById("aboutBtn");
const aboutModal = document.getElementById("aboutModal");
const closeModal = document.getElementById("closeModal");

aboutBtn.addEventListener("click", () => {
  aboutModal.style.display = "block";
});
closeModal.addEventListener("click", () => {
  aboutModal.style.display = "none";
});
window.addEventListener("click", (e) => {
  if (e.target === aboutModal) {
    aboutModal.style.display = "none";
  }
});

// --- Модальный плеер (если используется) ---
function openPlayerModal(title, url, poster) {
  let modal = document.getElementById('streamModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'streamModal';
    modal.style = 'position:fixed;left:0;top:0;width:100vw;height:100vh;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:10000;';
    modal.innerHTML = `
      <div style="background:#222;padding:24px;border-radius:12px;max-width:90vw;max-height:90vh;">
        <button id="closeStreamModal" style="display:block;margin:18px auto 0;">❎</button>
        <div id="modalPlayerTitle" style="color:#fff;font-size:1.2em;margin-bottom:12px;"></div>
        <div id="modalPlayerDiag" style="color:#eee;font-size:0.98em;margin-bottom:8px;"></div>
        <div id="modalPlayerContent"></div>
      </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('closeStreamModal').onclick = () => {
      const player = document.getElementById('diagMedia');
      if (player) {
        player.pause();
        player.src = "";
        player.load();
      }
      modal.style.display = 'none';
    }
  }
  document.getElementById('modalPlayerTitle').textContent = title;

  // Определяем тип (видео/аудио)
  let isAudio = url.match(/\.(mp3|ogg|wav|aacp?)($|\?)/i);
  let media;
  if (isAudio) {
    media = `<audio id="diagMedia" src="${url}" controls autoplay style="width:100%;max-width:520px;background:#000;"></audio>`;
  } else {
    media = `<video id="diagMedia" src="${url}" controls autoplay style="width:100%;max-width:720px;" poster="${poster||''}"></video>`;
    if (url.endsWith('.m3u8')) {
      media += `<div style="color:#fff;font-size:0.95em;margin-top:8px;">
        <b>Внимание:</b> Если поток не играет, попробуйте открыть в мобильном Chrome или Safari. Для полной поддержки .m3u8 используйте hls.js.
      </div>`;
    }
  }
  document.getElementById('modalPlayerContent').innerHTML = media;
  modal.style.display = 'flex';

  // --- Диагностика ---
  setTimeout(() => {
    const player = document.getElementById('diagMedia');
    const diagDiv = document.getElementById('modalPlayerDiag');
    if (!player || !diagDiv) return;

    function updateDiag() {
      let status = '';
      if (player.readyState < 2) status += "Ожидание данных<br>";
      else if (player.paused) status += "Пауза<br>";
      else if (player.ended) status += "Конец<br>";
      else status += "Играет<br>";

      // Буферизация
      if (player.buffered && player.buffered.length) {
        try {
          let bufEnd = player.buffered.end(player.buffered.length - 1);
          let lag = (bufEnd - player.currentTime).toFixed(2);
          status += `Буфер: ${lag} сек<br>`;
        } catch(e){}
      }
      // Ошибки
      if (player.error) {
        status += `<span style="color:#f77">Ошибка: ${player.error.code}</span><br>`;
      }
      diagDiv.innerHTML = status;
    }

    player.addEventListener('playing', updateDiag);
    player.addEventListener('pause', updateDiag);
    player.addEventListener('waiting', updateDiag);
    player.addEventListener('stalled', updateDiag);
    player.addEventListener('error', updateDiag);
    player.addEventListener('ended', updateDiag);
    player.addEventListener('timeupdate', updateDiag);
    player.addEventListener('progress', updateDiag);

    updateDiag();
  }, 100);
}