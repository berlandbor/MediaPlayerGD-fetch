const params = new URLSearchParams(window.location.search);
const fileId = params.get("id");


//const params = new URLSearchParams(location.search);
const title = params.get("title");
//const id = params.get("id");
const poster = params.get("poster");
const category = params.get("category");
const description = params.get("description");

const videoFrame = document.getElementById("videoFrame");
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

if (!fileId) {
  document.body.innerHTML = "<p>❌ Ошибка: медиа не выбрано</p>";
} else {
  const url = `https://drive.google.com/file/d/${fileId}/preview`;
  videoFrame.src = url;

  // Получаем данные из localStorage
  const playlistRaw = localStorage.getItem("gdrive_playlist");
  if (playlistRaw) {
    try {
      const playlist = JSON.parse(playlistRaw);
      const media = playlist.find(item => item.id === fileId);

      if (media) {
        mediaTitle.textContent = media.title || "Без названия";
        mediaCategory.textContent = media.category || "Без категории";
        mediaPoster.src = media.poster || `https://drive.google.com/thumbnail?id=${media.id}`;
        mediaDescription.textContent = media.description || "";
      } else {
        mediaTitle.textContent = "Медиа не найдено в базе";
      }
    } catch (e) {
      console.warn("Ошибка чтения localStorage:", e);
    }
  }

/*function getQueryParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

const vk_oid = getQueryParam('vk_oid');
const vk_id = getQueryParam('vk_id');
const vk_hash = getQueryParam('vk_hash');
const fileId = getQueryParam('id'); // Google Drive ID

// Элементы для инфоблока
const mediaTitle = document.getElementById('mediaTitle');
const mediaCategory = document.getElementById('mediaCategory');
const mediaPoster = document.getElementById('mediaPoster');
const mediaDescription = document.getElementById('mediaDescription');
const playerContainer = document.getElementById('player-container');

// --- VK видео ---
if (vk_oid && vk_id && vk_hash) {
  const vk_url = `https://vk.com/video_ext.php?oid=${vk_oid}&id=${vk_id}&hash=${vk_hash}`;
  playerContainer.innerHTML = `
    <iframe src="${vk_url}" width="720" height="420" frameborder="0" allowfullscreen allow="autoplay; encrypted-media"></iframe>
  `;

  // Попытка найти и отобразить доп. инфу из плейлиста
  const playlistRaw = localStorage.getItem("gdrive_playlist");
  if (playlistRaw) {
    try {
      const playlist = JSON.parse(playlistRaw);
      // Найти по vk_oid/vk_id/vk_hash
      const media = playlist.find(item => 
        item.vk_oid === vk_oid && item.vk_id === vk_id && item.vk_hash === vk_hash
      );
      if (media) {
        mediaTitle.textContent = media.title || "Без названия";
        mediaCategory.textContent = media.category || "Без категории";
        mediaPoster.src = media.poster || "https://vk.com/images/video_placeholder.png";
        mediaDescription.textContent = media.description || "";
      } else {
        mediaTitle.textContent = "VK-видео не найдено в базе";
      }
    } catch (e) {
      console.warn("Ошибка чтения localStorage:", e);
    }
  }
}
// --- Google Drive видео ---
else if (fileId) {
  const url = `https://drive.google.com/file/d/${fileId}/preview`;
  playerContainer.innerHTML = `<iframe src="${url}" width="720" height="420" frameborder="0" allowfullscreen></iframe>`;

  // Получаем данные из localStorage
  const playlistRaw = localStorage.getItem("gdrive_playlist");
  if (playlistRaw) {
    try {
      const playlist = JSON.parse(playlistRaw);
      const media = playlist.find(item => item.id === fileId);

      if (media) {
        mediaTitle.textContent = media.title || "Без названия";
        mediaCategory.textContent = media.category || "Без категории";
        mediaPoster.src = media.poster || `https://drive.google.com/thumbnail?id=${media.id}`;
        mediaDescription.textContent = media.description || "";
      } else {
        mediaTitle.textContent = "Медиа не найдено в базе";
      }
    } catch (e) {
      console.warn("Ошибка чтения localStorage:", e);
    }
  }
} else {
  document.body.innerHTML = "<p>❌ Ошибка: медиа не выбрано</p>";
}*/

  
/* // Кнопка "Поделиться"
const fullLink = `${location.origin}${location.pathname}?id=${fileId}`;
shareBtn.addEventListener("click", () => {
  // Получаем название видео (если оно есть)
  const title = mediaTitle.textContent || "Видео";
  // Формируем текст для копирования
  const shareText = `🎬 Смотри от Berlandbor: ${title}\n${fullLink}`;
  navigator.clipboard.writeText(shareText).then(() => {
    shareLink.textContent = `Скопирована ссылка на: ${title}, теперь можно поделится!`;
  });
});*/

const fullLink = `${location.origin}${location.pathname}?id=${fileId}`;

/*shareBtn.addEventListener("click", () => {
  const params = new URLSearchParams({
    title: mediaTitle.textContent || "Видео",
    id: fileId,
    poster: mediaPoster.src || "",
    category: mediaCategory.textContent || "",
    description: mediaDescription.textContent || ""
  });
  const fullLink = `${location.origin}${location.pathname}?${params.toString()}`;
  const shareText = `🎬 Смотри от Berlandbor: ${mediaTitle.textContent}\n${fullLink}`;
  navigator.clipboard.writeText(shareText).then(() => {
    shareLink.textContent = `Скопирована ссылка на: ${mediaTitle.textContent}. - Теперь можно поделиться!`;
  });
});*/

shareBtn.addEventListener("click", () => {
  const params = new URLSearchParams({
    title: mediaTitle.textContent || "Видео",
    id: fileId,
    poster: mediaPoster.src || "",
    category: mediaCategory.textContent || "",
    description: /*mediaDescription.textContent ||*/ "😀"
  });
  const fullLink = `${location.origin}${location.pathname}?${params.toString()}`;

  // Добавляем постер в текст
  const posterLine = mediaPoster.src ? `Постер: ${mediaPoster.src}\n` : '';

  const shareText = `🎬 Смотри от Berlandbor: ${mediaTitle.textContent}\n${fullLink}\n${posterLine}`;
  navigator.clipboard.writeText(shareText).then(() => {
    shareLink.textContent = `Скопирована ссылка на: ${mediaTitle.textContent}. - Теперь можно поделиться!`;
  });
});

/*shareBtn.onclick = function() {
  // Формируем только нужные параметры в ссылке
  const params = new URLSearchParams({
    title: mediaTitle.textContent || "Видео",
    poster: mediaPoster.src || "",
    category: mediaCategory.textContent || ""
  });
  const fullLink = `${location.origin}${location.pathname}?${params.toString()}`;

  // Формируем текст для шаринга (описание можно добавить только сюда)
  let text = '';
  const title = mediaTitle.textContent || '';
  const cat = mediaCategory.textContent || '';
  const desc = mediaDescription.textContent || '';
  const poster = mediaPoster.src || '';

  if (title) text += `🎬 ${title}\n`;
  if (cat) text += `Категория: ${cat}\n`;
  if (desc) text += `${desc}\n`;
  if (poster) text += `Постер: ${poster}\n`;
  text += `Смотреть: ${fullLink}`;

  // Web Share API для смартфонов
  if (navigator.share) {
    navigator.share({
      title: title,
      text: text,
      url: fullLink
    }).catch(() => {});
  } else { // Для десктопа — копируем в буфер обмена
    navigator.clipboard.writeText(text).then(() => {
      alert('Ссылка и данные скопированы! Можно вставить в мессенджер.');
    });
  }
};*/



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
        const doc = videoFrame.contentDocument || videoFrame.contentWindow?.document;
        const bodyText = doc?.body?.innerText || "";
        if (bodyText.toLowerCase().includes("exceeded") || bodyText.length < 30) {
          streamError.style.display = "block";
        }
      } catch (e) {
        // Браузер блокирует доступ к iframe с другого домена — игнорируем
        console.warn("iframe cross-origin проверка невозможна:", e);
      }
    }, 7000);
  }

  // Запуск
  setInterval(pingGoogle, 1000);
  pingGoogle();
  monitorIframeLoad();
}
