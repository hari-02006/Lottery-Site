const COOLDOWN_MS = 2 * 60 * 1000;
const LAST_CODE_VALUE_KEY = "lottery_last_code_value";

// Replace these before launch.
const ADSTERRA_CLICK_URL = "https://flaskledgeheadquarters.com/pemp37f65r?key=acd9f67ad8086ce5c86f6a8dcffed6c2";
const SUBMIT_PAGE_URL = "submit.html";

const getCodeBtn = document.getElementById("getCodeBtn");
const copyBtn = document.getElementById("copyBtn");
const submitBtn = document.getElementById("submitBtn");
const cooldownText = document.getElementById("cooldownText");
const codeValue = document.getElementById("codeValue");

let currentCode = null;
let generationActive = false;
let generationUnlockAt = 0;

function randomFromCharset(charset) {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return charset[array[0] % charset.length];
}

function generateLotteryCode(prefix, length) {
  const charset = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let token = "";
  for (let i = 0; i < length; i += 1) {
    token += randomFromCharset(charset);
  }
  return `${prefix}-${token}`;
}

function formatCountdown(ms) {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function updateCooldownUi() {
  if (generationActive) {
    const msLeft = Math.max(0, generationUnlockAt - Date.now());
    if (msLeft > 0) {
      getCodeBtn.disabled = false;
      cooldownText.textContent = `Timer running. Your code will appear in ${formatCountdown(msLeft)}.`;
      return;
    }
    finishTimerAndGenerateCode();
    return;
  }

  getCodeBtn.disabled = false;
  cooldownText.textContent = "Click Get Lottery Code to start a 2-minute timer.";
}

function openClickAd() {
  // Must run only in direct response to user click.
  window.open(ADSTERRA_CLICK_URL, "_blank", "noopener,noreferrer");
}

function finishTimerAndGenerateCode() {
  generationActive = false;
  generationUnlockAt = 0;

  currentCode = generateLotteryCode("FLY", 4);
  localStorage.setItem(LAST_CODE_VALUE_KEY, currentCode);

  codeValue.textContent = currentCode;
  copyBtn.disabled = false;
  submitBtn.disabled = false;
  getCodeBtn.disabled = false;
  cooldownText.textContent = "Code generated. Click Get Lottery Code for the next 2-minute timer.";
}

function onGetCodeClick() {
  if (generationActive) {
    const msLeft = Math.max(0, generationUnlockAt - Date.now());
    cooldownText.textContent = `Timer already running. Code will appear in ${formatCountdown(msLeft)}.`;
    return;
  }

  openClickAd();

  generationActive = true;
  generationUnlockAt = Date.now() + COOLDOWN_MS;
  copyBtn.disabled = true;
  submitBtn.disabled = true;
  codeValue.textContent = "-";
  cooldownText.textContent = `Ad opened in a new tab. 2-minute timer started. Code will appear in ${formatCountdown(COOLDOWN_MS)}.`;
  getCodeBtn.disabled = false;
}

async function onCopyClick() {
  if (!currentCode) return;
  try {
    await navigator.clipboard.writeText(currentCode);
    copyBtn.textContent = "Copied";
    setTimeout(() => {
      copyBtn.textContent = "Copy Code";
    }, 1200);
  } catch (_) {
    // Clipboard may fail in some browsers/contexts.
  }
}

function onSubmitClick() {
  if (!currentCode) return;
  const submitUrl = `${SUBMIT_PAGE_URL}?code=${encodeURIComponent(currentCode)}`;
  window.open(submitUrl, "_blank", "noopener,noreferrer");
}

getCodeBtn.addEventListener("click", onGetCodeClick);
copyBtn.addEventListener("click", onCopyClick);
submitBtn.addEventListener("click", onSubmitClick);

const persistedCode = localStorage.getItem(LAST_CODE_VALUE_KEY);
if (persistedCode) {
  currentCode = persistedCode;
  codeValue.textContent = persistedCode;
  copyBtn.disabled = false;
  submitBtn.disabled = false;
}

updateCooldownUi();
setInterval(updateCooldownUi, 1000);
