// =======================
// RIDE W ME - BOOKING JS
// =======================

// CONFIG
const WHATSAPP_NUMBER = "526242426741"; 
const SERVICE_PRICES = {
  "Airport Transfer": "$80 USD",
  "One Way": "$100 USD",
  "Round Trip": "$160 USD",
  "Open Service (per hour)": "$50 USD / hr"
};

// EmailJS
(function () {
  emailjs.init("Ed5Qh2Qk81A6fHcRR");
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

// Fill datalists for autocomplete
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
// ELEMENTS
// =======================
const bookingForm = document.getElementById("bookingForm");
const serviceTypeEl = document.getElementById("serviceType");
const selectedServiceNameEl = document.getElementById("selectedServiceName");
const selectedServicePriceEl = document.getElementById("selectedServicePrice");

const returnDateWrapper = document.getElementById("returnDateWrapper");
const returnTimeWrapper = document.getElementById("returnTimeWrapper");
const hoursWrapper = document.getElementById("hoursWrapper");

const unavailableListEl = document.getElementById("unavailableList");

// ===========================
// DISABLED DATES RESTORE
// ===========================
function getDisabledDates() {
  const saved = JSON.parse(localStorage.getItem("reservations")) || [];
  const dates = new Set();

  saved.forEach(r => {
    if (r.date) dates.add(r.date);
    if (r.returnDate) dates.add(r.returnDate);
  });

  return Array.from(dates);
}

let disabledDates = getDisabledDates();

function renderUnavailableList() {
  if (disabledDates.length === 0) {
    unavailableListEl.textContent = "All dates currently available.";
    return;
  }

  unavailableListEl.innerHTML = "";
  disabledDates.forEach(d => {
    const item = document.createElement("div");
    item.textContent = d;
    unavailableListEl.appendChild(item);
  });
}

renderUnavailableList();

// Init datepickers
let datePicker = flatpickr("#date", {
  dateFormat: "Y-m-d",
  minDate: "today",
  disable: disabledDates
});

let returnDatePicker = flatpickr("#returnDate", {
  dateFormat: "Y-m-d",
  minDate: "today",
  disable: disabledDates
});

// =======================
// SERVICE UI LOGIC
// =======================
function updateServiceUI() {
  const sv = serviceTypeEl.value;

  if (sv) {
    selectedServiceNameEl.textContent = sv;
    selectedServicePriceEl.textContent = SERVICE_PRICES[sv] || "Price on request";
  } else {
    selectedServiceNameEl.textContent = "None selected";
    selectedServicePriceEl.textContent = "—";
  }

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

// Preload service from ?service=
const urlParams = new URLSearchParams(window.location.search);
const selectedService = urlParams.get("service");
if (selectedService) {
  serviceTypeEl.value = selectedService;
}
updateServiceUI();

// =======================
// ALERT SYSTEM
// =======================
function showAlert(message, isError = false) {
  const existing = document.querySelector(".custom-alert");
  if (existing) {
    existing.classList.remove("error", "show");
    existing.textContent = message;
    if (isError) existing.classList.add("error");
    setTimeout(() => existing.classList.add("show"), 60);
    setTimeout(() => {
      existing.classList.remove("show");
      setTimeout(() => existing.remove(), 400);
    }, 4000);
    return;
  }

  const alert = document.createElement("div");
  alert.className = "custom-alert" + (isError ? " error" : "");
  alert.textContent = message;
  document.body.appendChild(alert);

  setTimeout(() => alert.classList.add("show"), 50);
  setTimeout(() => {
    alert.classList.remove("show");
    setTimeout(() => alert.remove(), 400);
  }, 4000);
}

// =======================
// FORM SUBMIT
// =======================
bookingForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const reservation = {
    name: document.getElementById("name").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    email: document.getElementById("email").value.trim(),
    serviceType: serviceTypeEl.value,
    passengers: document.getElementById("passengers").value,
    pickup: document.getElementById("pickupPreset").value.trim(),
    destination: document.getElementById("destinationPreset").value.trim(),
    date: document.getElementById("date").value,
    time: document.getElementById("time").value,
    returnDate: document.getElementById("returnDate").value,
    returnTime: document.getElementById("returnTime").value,
    hours: document.getElementById("hours").value,
    notes: document.getElementById("notes").value.trim()
  };

  if (!reservation.name || !reservation.phone || !reservation.email ||
      !reservation.serviceType || !reservation.date || !reservation.time ||
      !reservation.pickup || !reservation.destination) {
    showAlert("Please complete all required fields.", true);
    return;
  }

  if (reservation.serviceType === "Round Trip" &&
      (!reservation.returnDate || !reservation.returnTime)) {
    showAlert("Please select both return date and time.", true);
    return;
  }

  // Save reservation
  let saved = JSON.parse(localStorage.getItem("reservations")) || [];
  saved.push(reservation);
  localStorage.setItem("reservations", JSON.stringify(saved));

  // Update disabled dates instantly
  disabledDates = getDisabledDates();
  datePicker.set("disable", disabledDates);
  returnDatePicker.set("disable", disabledDates);
  renderUnavailableList();

  // Send to EmailJS
  emailjs
    .send("service_8zcytcr", "template_7tkwggo", {
      ...reservation,
      to_email: "ridewmecabo@gmail.com"
    })
    .then(() => {
      sendWhatsApp(reservation);
      showAlert("✅ Reservation sent!");
      bookingForm.reset();
      updateServiceUI();
    })
    .catch(err => {
      console.error("EmailJS error:", err);
      showAlert("❌ Error sending reservation.", true);
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
  if (r.hours) msg += `Hours: ${r.hours}%0A`;
  if (r.notes) msg += `%0ANotes: ${r.notes}%0A`;

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
}
