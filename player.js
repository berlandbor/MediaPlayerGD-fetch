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

shareBtn.addEventListener("click", () => {
  const params = new URLSearchParams({
    title: mediaTitle.textContent || "Видео",
    id: fileId,
    poster: posterUrl,
    category: categoryValue,
    description: descriptionValue
  });
  const fullLink = `${location.origin}${location.pathname}?${params.toString()}`;
  const shareText = `🎬 Смотри от Berlandbor: ${mediaTitle.textContent}\n${fullLink}`;
  navigator.clipboard.writeText(shareText).then(() => {
    shareLink.textContent = `Скопирована ссылка на: ${mediaTitle.textContent}. - Теперь можно поделиться!`;
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
