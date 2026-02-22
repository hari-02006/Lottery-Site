const COOLDOWN_MS = 5 * 60 * 1000;
const AD_MIN_VIEW_MS = 15 * 1000;
const LAST_CODE_TIME_KEY = "lottery_last_code_at";
const LAST_CODE_VALUE_KEY = "lottery_last_code_value";

// Replace these before launch.
const ADSTERRA_CLICK_URL = "https://example.com/your-adsterra-direct-link";
const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/REPLACE_WITH_YOUR_FORM_ID/viewform";

const getCodeBtn = document.getElementById("getCodeBtn");
const copyBtn = document.getElementById("copyBtn");
const submitBtn = document.getElementById("submitBtn");
const cooldownText = document.getElementById("cooldownText");
const codeValue = document.getElementById("codeValue");

let currentCode = null;
let adGateActive = false;
let adGateUnlockAt = 0;

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

function getRemainingMs() {
  const lastMs = Number(localStorage.getItem(LAST_CODE_TIME_KEY) || 0);
  if (!lastMs) return 0;
  const elapsed = Date.now() - lastMs;
  return Math.max(0, COOLDOWN_MS - elapsed);
}

function formatCountdown(ms) {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function updateCooldownUi() {
  if (adGateActive) {
    const msLeft = Math.max(0, adGateUnlockAt - Date.now());
    if (msLeft > 0) {
      getCodeBtn.disabled = true;
      cooldownText.textContent = `Ad step in progress. Code will appear in ${formatCountdown(msLeft)}.`;
      return;
    }
  }

  const remaining = getRemainingMs();
  if (remaining > 0) {
    getCodeBtn.disabled = true;
    cooldownText.textContent = `Please wait ${formatCountdown(remaining)} before getting a new code.`;
  } else {
    getCodeBtn.disabled = false;
    cooldownText.textContent = "You can generate a code now.";
  }
}

function openClickAd() {
  // Must run only in direct response to user click.
  window.open(ADSTERRA_CLICK_URL, "_blank", "noopener,noreferrer");
}

function finishAdGateAndGenerateCode() {
  adGateActive = false;
  adGateUnlockAt = 0;

  currentCode = generateLotteryCode("FLY", 4);
  localStorage.setItem(LAST_CODE_TIME_KEY, String(Date.now()));
  localStorage.setItem(LAST_CODE_VALUE_KEY, currentCode);

  codeValue.textContent = currentCode;
  copyBtn.disabled = false;
  submitBtn.disabled = false;
  updateCooldownUi();
}

function onGetCodeClick() {
  if (getRemainingMs() > 0) return;
  if (adGateActive) return;

  openClickAd();

  adGateActive = true;
  adGateUnlockAt = Date.now() + AD_MIN_VIEW_MS;
  copyBtn.disabled = true;
  submitBtn.disabled = true;
  codeValue.textContent = "-";
  cooldownText.textContent = `Ad opened in a new tab. Return here. Code will appear in ${formatCountdown(AD_MIN_VIEW_MS)}.`;
  getCodeBtn.disabled = true;

  setTimeout(() => {
    if (!adGateActive) return;
    finishAdGateAndGenerateCode();
  }, AD_MIN_VIEW_MS);
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
  window.open(GOOGLE_FORM_URL, "_blank", "noopener,noreferrer");
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
