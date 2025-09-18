 document.addEventListener("DOMContentLoaded", () => {
   const appointmentForm = document.querySelector("#appointment-form");
  
   if (appointmentForm) {
     appointmentForm.addEventListener("submit", async (e) => {
       e.preventDefault();
  
        // Collect form data
       const name = document.querySelector("#name").value.trim();
       const phone = document.querySelector("#phone").value.trim();
       const email = document.querySelector("#email").value.trim();
       const date = document.querySelector("#date").value.trim();
       const message = document.querySelector("#message").value.trim();
  
        // Simple validation
       if (!name || !phone || !date) {
         alert("⚠️ Please fill in Name, Phone, and Date.");
         return;
       }
  
        try {
          const response = await fetch("/api/book-appointment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, phone, email, date, message }),
          });
  
          const result = await response.json();
  
          if (result.success) {
            alert("✅ Appointment booked successfully!");
            appointmentForm.reset();
          } else {
            alert(`❌ Failed to book appointment: ${result.error}`);
          }
        } catch (err) {
          console.error("Error sending appointment request:", err);
          alert("❌ Something went wrong. Please try again later.");
        }
      });
    }
  });  
  