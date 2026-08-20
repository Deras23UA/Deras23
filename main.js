// 1. Налаштування (вставте свій API-ключ та ID каналу)
const YOUTUBE_API_KEY = "AIzaSyAuM6Mq_i7ZWcVpEvlanJczC4-iAM0TAq8"; // Ваш API Key з Google Cloud
const CHANNEL_ID = "UCXUG1bS14G8a3Vy_GkhlG9Q";           // Ваш ID каналу (починається з UC)

async function fetchSubscribers() {
    const subsElem = document.getElementById("subs-count");
    if (!subsElem) return;

    // Спочатку показуємо значення за замовчуванням, щоб не висіло "Завантаження..."
    subsElem.innerText = channelData.subscribers;

    if (!CHANNEL_ID || CHANNEL_ID === "UCXUG1bS14G8a3Vy_GkhlG9Q") return;

    // 1. Отримання через офіційний YouTube API (якщо є ключ)
    if (YOUTUBE_API_KEY) {
        try {
            const response = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${CHANNEL_ID}&key=${YOUTUBE_API_KEY}`);
            const data = await response.json();
            if (data.items && data.items.length > 0) {
                const count = parseInt(data.items[0].statistics.subscriberCount);
                subsElem.innerText = count.toLocaleString();
                return;
            }
        } catch (e) {
            console.warn("Помилка YouTube API, пробуємо безкоштовні джерела...", e);
        }
    }

    // 2. Отримання через безкоштовні Invidious API
    const invidiousApis = [
        `https://inv.nadeko.net/api/v1/channels/${CHANNEL_ID}`,
        `https://vid.puffyan.us/api/v1/channels/${CHANNEL_ID}`,
        `https://invidious.nerdvpn.de/api/v1/channels/${CHANNEL_ID}`
    ];

    for (const apiUrl of invidiousApis) {
        try {
            const res = await fetch(apiUrl);
            if (res.ok) {
                const data = await res.json();
                if (data.subCount !== undefined) {
                    subsElem.innerText = data.subCount.toLocaleString();
                    return;
                }
            }
        } catch (e) {
            continue;
        }
    }

    // 3. Резервний парсинг через AllOrigins proxy
    try {
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://www.youtube.com/channel/${CHANNEL_ID}`)}`;
        const response = await fetch(proxyUrl);
        const data = await response.json();
        if (data.contents) {
            const match = data.contents.match(/"subscriberCountText":\{"accessibility":\{"accessibilityData":\{"label":"([^"]+)"/);
            if (match && match[1]) {
                subsElem.innerText = match[1];
                return;
            }
            const matchSimple = data.contents.match(/"subscriberCountText":\{"simpleText":"([^"]+)"/);
            if (matchSimple && matchSimple[1]) {
                subsElem.innerText = matchSimple[1];
                return;
            }
        }
    } catch (e) {
        console.error("Помилка завантаження підписників через проксі:", e);
    }
}
// main.js — додаткові утиліти
// Основна логіка знаходиться в index.html
console.log("%c✨ Deras Official Site loaded", "color: #00d4ff; font-weight: bold; font-size: 14px;");