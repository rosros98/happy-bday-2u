// ================= PARAMS =================
const params = new URLSearchParams(window.location.search);

const name = params.get("name")?.trim() || "Bestie 💖";
let candleCount = parseInt(params.get("candles")) || 4;
candleCount = Math.min(Math.max(candleCount, 1), 30);

// ================= DOM =================
const mainTitle = document.getElementById("mainTitle");
const subTitle = document.getElementById("subTitle");
const cake = document.getElementById("cake");
const music = document.getElementById("birthdayMusic");

// ================= TEXT =================
mainTitle.textContent = `Happy Birthday, ${name}`;
subTitle.textContent = "Make a wish and blow candles 🎤";

// ================= COLORS =================
const colors = ["green-candle", "purple-candle", "blue-candle", "yellow-candle"];
const CAKE_VISUAL_WIDTH = 35;

// ================= CREATE CANDLES =================
function createCandles(count) {
    cake.innerHTML = "";
    const CANDLE_VISUAL_WIDTH = 2;
    const availableWidth = CAKE_VISUAL_WIDTH;
    const candlesPerRow = 5;
    const rowCount = Math.ceil(count / candlesPerRow);
    const shiftAmount = 4;

    for (let i = 0; i < count; i++) {
        const candle = document.createElement("div");
        candle.classList.add("candle");
        const colorClass = colors[Math.floor(Math.random() * colors.length)];
        candle.classList.add(colorClass);

        const row = Math.floor(i / candlesPerRow);
        const col = i % candlesPerRow;
        const totalCandlesInRow = Math.min(
            candlesPerRow,
            count - row * candlesPerRow
        );
        const rowSpacing = availableWidth / (totalCandlesInRow + 1);

        const leftBase = rowSpacing * (col + 1) - CANDLE_VISUAL_WIDTH / 2 + 5;
        const rowShift = row % 2 === 0 ? 0 : shiftAmount;

        candle.style.position = "absolute";
        candle.style.top = `${10 + row * 3}px`;
        candle.style.left = `${leftBase - rowShift + 4}px`;

        cake.appendChild(candle);
    }
}
createCandles(candleCount);

// ================= MICROPHONE =================
async function startMicDetection() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const ctx = new AudioContext();
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        const data = new Uint8Array(analyser.fftSize);
        let blown = false;

        function detect() {
        analyser.getByteTimeDomainData(data);

        let sum = 0;
        for (let i = 0; i < data.length; i++) {
            let v = (data[i] - 128) / 128;
            sum += v * v;
        }
        const volume = Math.sqrt(sum / data.length);

        console.log("Volume:", volume); // DEBUG

        if (volume > 0.15 && !blown) { // SOFFIO
            blown = true;
            blowOutCandles();
        }

        requestAnimationFrame(detect);
        }

        detect();
    } catch (e) {
        console.log("Mic denied 😭", e);
    }
}

// ================= BLOW OUT =================
function blowOutCandles() {
    const candles = document.querySelectorAll(".candle");

    candles.forEach((c, i) => {
        setTimeout(() => {
            c.classList.add("blown");

            // Smoke
            const smoke = document.createElement("div");
            smoke.className = "smoke";
            smoke.style.left = c.style.left;
            smoke.style.bottom = c.style.bottom;
            cake.appendChild(smoke);

            setTimeout(() => smoke.remove(), 2000);
        }, i * 100);
    });

    setTimeout(() => {
        subTitle.textContent = `Wishing you the happiest year ever 🎉`;
        confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 } });
    }, 1200);
    music.play();
}

// ================= SAVE IMAGE =================
document.getElementById("saveBtn").onclick = () => {
    const btn = document.getElementById("saveBtn");
    const cake = document.querySelector(".cake");

    btn.style.display = "none";

    html2canvas(document.body, {
        useCORS: true,
        backgroundColor: null,
        scale: 2
    }).then(canvas => {
        const link = document.createElement("a");
        link.download = "birthday.png";
        link.href = canvas.toDataURL();
        link.click();

        btn.style.display = "block";
    });
};

startMicDetection();
