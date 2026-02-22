const FORM_POST_URL = "https://docs.google.com/forms/d/e/REPLACE_WITH_YOUR_FORM_ID/formResponse";

// Replace these with your real Google Form entry IDs.
const FIELD_CODE = "entry.1111111111";
const FIELD_NICKNAME = "entry.2222222222";
const FIELD_EMAIL = "entry.3333333333";
const FIELD_HUMAN = "entry.4444444444";

const form = document.getElementById("entryForm");
const codeInput = document.getElementById("lotteryCode");
const nicknameInput = document.getElementById("nickname");
const emailInput = document.getElementById("email");
const humanInput = document.getElementById("humanCheck");
const sendBtn = document.getElementById("sendBtn");
const submitStatus = document.getElementById("submitStatus");

function getCodeFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("code") || "";
}

function validateHumanCheck(value) {
  return value.trim().toUpperCase() === "FLY";
}

async function postToGoogleForm(payload) {
  await fetch(FORM_POST_URL, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams(payload).toString()
  });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!validateHumanCheck(humanInput.value)) {
    submitStatus.textContent = "Human check failed. Please type FLY.";
    return;
  }

  const payload = {
    [FIELD_CODE]: codeInput.value.trim(),
    [FIELD_NICKNAME]: nicknameInput.value.trim(),
    [FIELD_EMAIL]: emailInput.value.trim(),
    [FIELD_HUMAN]: humanInput.value.trim()
  };

  sendBtn.disabled = true;
  submitStatus.textContent = "Submitting entry...";

  try {
    await postToGoogleForm(payload);
    submitStatus.textContent = "Entry submitted. Good luck!";
    form.reset();
    codeInput.value = getCodeFromUrl();
  } catch (_) {
    submitStatus.textContent = "Submission failed. Please try again.";
  } finally {
    sendBtn.disabled = false;
  }
});

codeInput.value = getCodeFromUrl();
