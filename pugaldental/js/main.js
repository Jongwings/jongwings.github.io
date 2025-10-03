// main.js — booking form UX + validation + double-submit guard
document.addEventListener("DOMContentLoaded", () => {
  const form   = document.getElementById("appointment-form");
  const iframe = document.getElementById("formTarget");
  const submit = document.getElementById("submitBtn");

  if (!form || !iframe || !submit) {
    console.warn("[booking] missing form/iframe/submit elements");
    return;
  }

  let isSubmitting = false;
  let fallbackTimer = null;

  function setSubmitting(state) {
    isSubmitting = state;
    // IMPORTANT: Only disable the submit button. Do NOT disable inputs,
    // because disabled inputs are NOT submitted by the browser.
    submit.disabled = state;
    submit.setAttribute("aria-disabled", String(state));
    const label = submit.dataset.label || submit.textContent || "Submit";
    if (!submit.dataset.label) submit.dataset.label = label;
    submit.textContent = state ? "Submitting…" : submit.dataset.label;
  }

  function val(sel) {
    const el = document.querySelector(sel);
    return el ? el.value.trim() : "";
  }
  function digitsOnly(s){ return String(s || "").replace(/[^\d]/g, ""); }

  function validate() {
    const name  = val("#name");
    const phone = digitsOnly(val("#phone"));
    const date  = val("#date");           // maps to name="preferred_date"
    const time  = val("#time");           // maps to name="preferred_time"

    if (!name || !phone || !date || !time) {
      alert("Please fill Name, Phone, Date and Time.");
      return false;
    }
    if (phone.length < 10) {
      alert("Please enter a valid phone number.");
      return false;
    }
    return true;
  }

  form.addEventListener("submit", (e) => {
    if (isSubmitting) {
      e.preventDefault();
      return;
    }
    if (!validate()) {
      e.preventDefault();
      return;
    }

    setSubmitting(true);

    // Safety net: if the iframe doesn't load (network hiccup), re-enable UI.
    if (fallbackTimer) clearTimeout(fallbackTimer);
    fallbackTimer = setTimeout(() => {
      setSubmitting(false);
      alert("We’re taking longer than expected. If you didn’t see a success message, please try again.");
    }, 20000);
    // Allow the native form POST to proceed (targeting the hidden iframe).
  });

  iframe.addEventListener("load", () => {
    if (fallbackTimer) clearTimeout(fallbackTimer);

    // Can't read cross-origin HTML reliably; just treat as success.
    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      const bodyText = doc?.body?.innerText;
      if (bodyText) console.log("[booking] backend response:", bodyText);
    } catch (_) {
      // cross-origin—ignore
    }

    alert("✅ Thanks! We’ll confirm on WhatsApp shortly.");
    try { form.reset(); } catch (_) {}
    setSubmitting(false);

    // If you're using a modal, close it.
    const modal = document.getElementById("appointmentModal");
    if (modal) modal.style.display = "none";
  });

  console.log("[booking] script ready");
});
