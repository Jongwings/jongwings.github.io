document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("appointment-form");
  const iframe = document.getElementById("formTarget");

  if (!form || !iframe) return;

  form.addEventListener("submit", (e) => {
    // simple validation
    const name  = document.querySelector("#name")?.value.trim();
    const phone = document.querySelector("#phone")?.value.trim();
    const date  = document.querySelector("#date")?.value.trim();
    const time  = document.querySelector('input[name="time"]')?.value.trim();

    if (!name || !phone || !date || !time) {
      e.preventDefault();
      alert("⚠️ Please fill Name, Phone, Date and Time.");
      return false;
    }

    // copy values into hidden fields with the names the backend expects
    document.getElementById("preferred_date_hidden").value = date;
    document.getElementById("preferred_time_hidden").value = time;
    document.getElementById("notes_hidden").value = document.getElementById("message")?.value || "";

    // allow the browser to submit the form directly to Apps Script (no CORS)
    return true;
  });

  // when Apps Script responds, the iframe loads -> show success UI
  iframe.addEventListener("load", () => {
    alert("✅ Thanks! We’ll confirm on WhatsApp shortly.");
    form.reset();
    const modal = document.getElementById("appointmentModal");
    if (modal) modal.style.display = "none";
  });
});
