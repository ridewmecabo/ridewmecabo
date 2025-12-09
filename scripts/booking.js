// =======================
// RIDE W ME - BOOKING JS
// =======================

// CONFIG
const WHATSAPP_NUMBER = "526242426741"; // sin +, ya con lada
const SERVICE_PRICES = {
  "Airport Transfer": "$80 USD",
  "One Way": "$100 USD",
  "Round Trip": "$160 USD",
  "Open Service (per hour)": "$50 USD / hr"
};

// Inicializar EmailJS
(function () {
  emailjs.init("Ed5Qh2Qk81A6fHcRR"); // tu public key
})();

// =======================
// POPULAR LOCATIONS
// =======================
const POPULAR_LOCATIONS = [
  "Los Cabos International Airport (SJD)",
  "Cabo San Lucas Marina",
  "Cabo San Lucas Downtown",
  "San José del Cabo Downtown",
  "Medano Beach",
  "Sunset Monalisa",
  "Flora Farms",
  "Acre Restaurant",
  "Edith's",
  "El Farallon",
  "Jazz on the Rocks at Sunset Point",
  "Montage Los Cabos",
  "Cabo del Sol",
  "The Cape, a Thompson Hotel",
  "Chileno Bay",
  "Palmilla",
  "Puerto Paraíso Mall",
  "Luxury Avenue Mall",
  "Waldorf Astoria Pedregal",
  "Grand Velas Los Cabos",
  "Four Seasons Costa Palmas"
];

function fillDatalist(id) {
  const dl = document.getElementById(id);
  if (!dl) return;
  dl.innerHTML = "";
  POPULAR_LOCATIONS.forEach(loc => {
    const opt = document.createElement("option");
    opt.value = loc;
    dl.appendChild(opt);
  });
}

fillDatalist("pickupList");
fillDatalist("destinationList");

// =======================
// ELEMENTOS FORM
// =======================
const bookingForm = document.getElementById("bookingForm");
const serviceTypeEl = document.getElementById("serviceType");
const selectedServiceNameEl = document.getElementById("selectedServiceName");
const selectedServicePriceEl = document.getElementById("selectedServicePrice");

const returnDateWrapper = document.getElementById("returnDateWrapper");
const returnTimeWrapper = document.getElementById("returnTimeWrapper");
const hoursWrapper = document.getElementById("hoursWrapper");

const unavailableListEl = document.getElementById("unavailableList");

// =======================
// FECHAS OCUPADAS (localStorage)
// =======================
function getDisabledDates() {
  const saved = JSON.parse(localStorage.getItem("reservations")) || [];
  const dates = new Set();
  saved.forEach(r => {
    if (r.date) dates.add(r.date);
    if (r.returnDate) dates.add(r.returnDate);
  });
  return Array.from(dates);
}

const disabledDates = getDisabledDates();

function renderUnavailableList() {
  if (!unavailableListEl) return;
  if (disabledDates.length === 0) {
    unavailableListEl.textContent = "All dates currently available.";
    return;
  }
  unavailableListEl.innerHTML = "";
  disabledDates.forEach(d => {
    const p = document.createElement("div");
    p.textContent = d;
    unavailableListEl.appendChild(p);
  });
}

renderUnavailableList();

// =======================
// UI SEGÚN TIPO DE SERVICIO
// =======================
function updateServiceUI() {
  const sv = serviceTypeEl.value;

  // Texto y precio
  if (sv) {
    selectedServiceNameEl.textContent = sv;
    selectedServicePriceEl.textContent = SERVICE_PRICES[sv] || "Price on request";
  } else {
    selectedServiceNameEl.textContent = "None selected";
    selectedServicePriceEl.textContent = "—";
  }

  // Mostrar / ocultar campos
  if (sv === "Round Trip") {
    returnDateWrapper.style.display = "block";
    returnTimeWrapper.style.display = "block";
    hoursWrapper.style.display = "none";
  } else if (sv === "Open Service (per hour)") {
    hoursWrapper.style.display = "block";
    returnDateWrapper.style.display = "none";
    returnTimeWrapper.style.display = "none";
  } else {
    returnDateWrapper.style.display = "none";
    returnTimeWrapper.style.display = "none";
    hoursWrapper.style.display = "none";
  }
}

serviceTypeEl.addEventListener("change", updateServiceUI);

// Preseleccionar servicio desde la URL (?service=Round%20Trip)
const urlParams = new URLSearchParams(window.location.search);
const selectedService = urlParams.get("service");
if (selectedService) {
  serviceTypeEl.value = selectedService;
}
updateServiceUI();

// =======================
// ALERTA BONITA (reusa .custom-alert del main.css)
// =======================
function showAlert(message, isError = false) {
  const existing = document.querySelector(".custom-alert");
  if (existing) {
    existing.classList.remove("error", "show");
    existing.textContent = message;
    if (isError) existing.classList.add("error");
    setTimeout(() => existing.classList.add("show"), 50);
    setTimeout(() => {
      existing.classList.remove("show");
      setTimeout(() => existing.remove(), 400);
    }, 4000);
    return;
  }

  const a = document.createElement("div");
  a.className = "custom-alert" + (isError ? " error" : "");
  a.textContent = message;
  document.body.appendChild(a);

  setTimeout(() => a.classList.add("show"), 50);
  setTimeout(() => {
    a.classList.remove("show");
    setTimeout(() => a.remove(), 400);
  }, 4000);
}

// =======================
// SUBMIT DEL FORMULARIO
// =======================
bookingForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const email = document.getElementById("email").value.trim();
  const serviceType = serviceTypeEl.value;
  const passengers = document.getElementById("passengers").value;

  const pickup = document.getElementById("pickupPreset").value.trim();
  const destination = document.getElementById("destinationPreset").value.trim();

  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;
  const returnDate = document.getElementById("returnDate").value;
  const returnTime = document.getElementById("returnTime").value;
  const hours = document.getElementById("hours").value;
  const notes = document.getElementById("notes").value.trim();

  if (!name || !phone || !email || !serviceType || !date || !time || !pickup || !destination) {
    showAlert("Please complete all required fields.", true);
    return;
  }

  if (serviceType === "Round Trip" && (!returnDate || !returnTime)) {
    showAlert("Please select both return date and time for Round Trip.", true);
    return;
  }

  const reservation = {
    name,
    phone,
    email,
    serviceType,
    passengers,
    date,
    time,
    pickup,
    destination,
    returnDate: serviceType === "Round Trip" ? returnDate : "",
    returnTime: serviceType === "Round Trip" ? returnTime : "",
    hours: serviceType === "Open Service (per hour)" ? hours : "",
    notes
  };

  // Guardar en localStorage para admin & fechas ocupadas
  let saved = JSON.parse(localStorage.getItem("reservations")) || [];
  saved.push(reservation);
  localStorage.setItem("reservations", JSON.stringify(saved));

  // =======================
  // ENVÍO POR EMAILJS
  // =======================
  emailjs
    .send("service_8zcytcr", "template_7tkwggo", {
      ...reservation,
      to_email: "ridewmecabo@gmail.com" // 👉 este va al campo {{to_email}} del template
    })
    .then(() => {
      // WhatsApp
      sendWhatsApp(reservation);
      showAlert("✅ Reservation sent successfully!");
      bookingForm.reset();
      updateServiceUI();
    })
    .catch((err) => {
      console.error("Email send error:", err);
      showAlert("❌ Error sending your reservation. Try again.", true);
    });
});

// =======================
// WHATSAPP
// =======================
function sendWhatsApp(r) {
  let msg =
    `New Reservation - Ride W Me Cabo%0A%0A` +
    `Name: ${r.name}%0A` +
    `Phone: ${r.phone}%0A` +
    `Email: ${r.email}%0A` +
    `Service: ${r.serviceType}%0A` +
    `Passengers: ${r.passengers}%0A` +
    `Pickup: ${r.pickup}%0A` +
    `Destination: ${r.destination}%0A` +
    `Date: ${r.date} at ${r.time}%0A`;

  if (r.returnDate && r.returnTime) {
    msg += `Return: ${r.returnDate} at ${r.returnTime}%0A`;
  }
  if (r.hours) {
    msg += `Hours: ${r.hours}%0A`;
  }
  if (r.notes) {
    msg += `%0ANotes: ${r.notes}%0A`;
  }

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
  window.open(url, "_blank");
}
