const params = new URLSearchParams(window.location.search);
const fileId = params.get("id");
const vk_oid = params.get('vk_oid');
const vk_id = params.get('vk_id');
const vk_hash = params.get('vk_hash');
const titleFromUrl = params.get("title");
const posterFromUrl = params.get("poster");
const categoryFromUrl = params.get("category");
const descriptionFromUrl = params.get("description");

const videoFrame = document.getElementById("videoFrame");
const playerContainer = document.getElementById("player-container"); // если используется для VK
const mediaTitle = document.getElementById("mediaTitle");
const mediaCategory = document.getElementById("mediaCategory");
const mediaPoster = document.getElementById("mediaPoster");
const mediaDescription = document.getElementById("mediaDescription");
const netStatus = document.getElementById("netStatus");
const pingResult = document.getElementById("pingResult");
const shareBtn = document.getElementById("shareBtn");
const shareLink = document.getElementById("shareLink");
const streamError = document.getElementById("streamError");
const pingChart = document.getElementById("pingChart");
const ctx = pingChart.getContext("2d");

let pingHistory = [];

async function fetchPlaylist() {
  try {
    const response = await fetch("PLGD-berlandbor-1.json");
    return await response.json();
  } catch (e) {
    console.warn('Ошибка загрузки плейлиста:', e);
    return null;
  }
}

async function initPlayer() {
  // --- VK видео ---
  if (vk_oid && vk_id && vk_hash) {
    const vk_url = `https://vk.com/video_ext.php?oid=${vk_oid}&id=${vk_id}&hash=${vk_hash}`;
    playerContainer.innerHTML = `
      <iframe src="${vk_url}" width="720" height="420" frameborder="0" allowfullscreen allow="autoplay; encrypted-media"></iframe>
    `;

    // Ищем в плейлисте по VK
    const playlist = await fetchPlaylist();
    let media = null;
    if (playlist) {
      media = playlist.find(item =>
        item.vk_oid === vk_oid && item.vk_id === vk_id && item.vk_hash === vk_hash
      );
    }
    if (media) {
      mediaTitle.textContent = media.title || "Без названия";
      mediaCategory.textContent = media.category || "Без категории";
      mediaPoster.src = media.poster || "https://vk.com/images/video_placeholder.png";
      mediaDescription.textContent = media.description || "";
    } else {
      // Если нет в плейлисте — использовать данные из URL (если они есть)
      mediaTitle.textContent = titleFromUrl || "VK-видео";
      mediaCategory.textContent = categoryFromUrl || "Без категории";
      mediaPoster.src = posterFromUrl || "https://vk.com/images/video_placeholder.png";
      mediaDescription.textContent = descriptionFromUrl || "";
    }
  }

  // --- Google Drive видео ---
  else if (fileId) {
    const url = `https://drive.google.com/file/d/${fileId}/preview`;
    if (playerContainer) {
      playerContainer.innerHTML = `<iframe id="videoFrame" src="${url}" width="720" height="420" frameborder="0" allowfullscreen></iframe>`;
    } else if (videoFrame) {
      videoFrame.src = url;
    }

    // Ищем в плейлисте по id
    const playlist = await fetchPlaylist();
    let media = null;
    if (playlist) {
      media = playlist.find(item => item.id === fileId);
    }
    if (media) {
      mediaTitle.textContent = media.title || "Без названия";
      mediaCategory.textContent = media.category || "Без категории";
      mediaPoster.src = media.poster || `https://drive.google.com/thumbnail?id=${media.id}`;
      mediaDescription.textContent = media.description || "";
    } else {
      // Если нет в плейлисте — использовать данные из URL (если они есть)
      mediaTitle.textContent = titleFromUrl || "Без названия";
      mediaCategory.textContent = categoryFromUrl || "Без категории";
      mediaPoster.src = posterFromUrl || `https://drive.google.com/thumbnail?id=${fileId}`;
      mediaDescription.textContent = descriptionFromUrl || "";
    }
  } else {
    document.body.innerHTML = "<p>❌ Ошибка: медиа не выбрано</p>";
    return;
  }

  // Кнопка "Поделиться"
  /*shareBtn.addEventListener("click", () => {
    const params = new URLSearchParams({
      title: mediaTitle.textContent || "Видео",
      id: fileId || "",
      poster: mediaPoster.src || "",
      category: mediaCategory.textContent || "",
      description: mediaDescription.textContent || ""
    });
    const fullLink = `${location.origin}${location.pathname}?${params.toString()}`;
    const posterLine = mediaPoster.src ? `Постер: ${mediaPoster.src}\n` : '';
    const shareText = `🎬 Смотри от Berlandbor: ${mediaTitle.textContent}\n${fullLink}\n${posterLine}`;
    navigator.clipboard.writeText(shareText).then(() => {
      shareLink.textContent = `Скопирована ссылка на: ${mediaTitle.textContent}. - Теперь можно поделиться!`;
    });
  });*/

shareBtn.addEventListener("click", () => {
  // В ссылке только id!
  const params = new URLSearchParams({
    id: fileId || ""
  });
  const fullLink = `${location.origin}${location.pathname}?${params.toString()}`;

  // В тексте для шаринга — всё, что нужно
  const title = mediaTitle.textContent || "Видео";
  const cat = mediaCategory.textContent || "";
  const desc = mediaDescription.textContent || "";
  const poster = mediaPoster.src || "";

  let shareText = `🎬 ${title}\n`;
  if (cat) shareText += `Категория: ${cat}\n`;
  if (desc) shareText += `${desc}\n`;
  if (poster) shareText += `Постер: ${poster}\n`;
  shareText += `Смотреть: ${fullLink}`;

  navigator.clipboard.writeText(shareText).then(() => {
    shareLink.textContent = `Скопирована ссылка на: ${title}. - Теперь можно поделиться!`;
  });
});

  // Пинг до Google
  async function pingGoogle() {
    const start = performance.now();
    try {
      await fetch("https://www.google.com/favicon.ico", { mode: "no-cors" });
      const latency = Math.round(performance.now() - start);
      pingResult.textContent = latency;
      netStatus.textContent = "🟢 Онлайн";

      pingHistory.push(latency);
      if (pingHistory.length > 50) pingHistory.shift();
      drawPingChart();
    } catch {
      netStatus.textContent = "🔴 Проблема с сетью";
      pingResult.textContent = "–";

      pingHistory.push(100);
      if (pingHistory.length > 50) pingHistory.shift();
      drawPingChart();
    }
  }

  function drawPingChart() {
    ctx.clearRect(0, 0, pingChart.width, pingChart.height);
    ctx.beginPath();
    pingHistory.forEach((val, i) => {
      const x = (i / pingHistory.length) * pingChart.width;
      const y = pingChart.height - Math.min(val, 200) / 2; // масштаб
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = "#00ff00";
    ctx.stroke();
  }

  // Проверка загрузки потока
  function monitorIframeLoad() {
    setTimeout(() => {
      try {
        const frame = document.getElementById("videoFrame");
        const doc = frame?.contentDocument || frame?.contentWindow?.document;
        const bodyText = doc?.body?.innerText || "";
        if (bodyText.toLowerCase().includes("exceeded") || bodyText.length < 30) {
          streamError.style.display = "block";
        }
      } catch (e) {
        // Браузер блокирует доступ к iframe с другого домена — игнорируем
        //console.warn("iframe cross-origin проверка невозможна:", e);
      }
    }, 7000);
  }

  setInterval(pingGoogle, 1000);
  pingGoogle();
  monitorIframeLoad();
}

// Стартуем!
initPlayer();