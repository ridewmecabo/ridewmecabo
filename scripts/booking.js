/* =====================================================
   booking.js — Logic for Ride W Me Cabo Booking System
   ===================================================== */

emailjs.init("Ed5Qh2Qk81A6fHcRR"); // Tu PUBLIC KEY

// Número de WhatsApp
const WHATSAPP_NUMBER = "526242426741";

// Elementos
const serviceTypeEl = document.getElementById("serviceType");
const passengersEl = document.getElementById("passengers");
const pickupPreset = document.getElementById("pickupPreset");
const destinationPreset = document.getElementById("destinationPreset");
const returnDateWrapper = document.getElementById("returnDateWrapper");
const returnTimeWrapper = document.getElementById("returnTimeWrapper");
const hoursWrapper = document.getElementById("hoursWrapper");
const unavailableListEl = document.getElementById("unavailableList");

const selectedServiceNameEl = document.getElementById("selectedServiceName");
const selectedServicePriceEl = document.getElementById("selectedServicePrice");

// Lista de destinos (hoteles, restaurantes, clubs, áreas)
const DESTINOS = [
  "Los Cabos International Airport (SJD)",
  "Cabo San Lucas Marina",
  "San José del Cabo Downtown",
  "Cabo San Lucas Downtown",
  "Medano Beach",
  "The Cape, a Thompson Hotel",
  "Solaz Luxury Resort",
  "Montage Los Cabos",
  "Waldorf Astoria Pedregal",
  "Grand Velas Los Cabos",
  "La Marina Inn",
  "Chileno Bay Resort",
  "Esperanza Auberge Resorts",
  "RIU Palace",
  "RIU Santa Fe",
  "RIU Baja California",
  "Hard Rock Hotel Los Cabos",
  "Nobu Hotel",
  "Pueblo Bonito Sunset",
  "Pueblo Bonito Rose",
  "Acre Restaurant",
  "Flora Farms",
  "Sunset Monalisa",
  "Jazz on the Rocks",
  "El Farallon",
  "Edith’s",
  "Cabo del Sol",
  "Diamante",
  "Viceroy Los Cabos",
  "Secrets Puerto Los Cabos",
  "Hyatt Ziva",
  "Hilton Los Cabos",
  "One&Only Palmilla",
  "El Merkado",
  "Fresko Cerro Colorado",
  "Walmart",
  "Costco",
  "San José Art District",
  "Hotel Tesoro",
  "Hotel Marina Fiesta",
  "Cabo Adventures",
  "Santa Maria Bay",
  "Las Ventanas al Paraíso",
  "Cerritos Beach",
  "Todos Santos Downtown"
];

// Cargar destinos para autocompletado
function cargarDestinos() {
  const pickupList = document.getElementById("pickupList");
  const destinationList = document.getElementById("destinationList");

  DESTINOS.forEach(d => {
    let op1 = document.createElement("option");
    op1.value = d;
    pickupList.appendChild(op1);

    let op2 = document.createElement("option");
    op2.value = d;
    destinationList.appendChild(op2);
  });
}

cargarDestinos();

/* =====================================================
   PRECIOS por servicio
===================================================== */
const SERVICE_PRICES = {
  "Airport Transfer": "$80 USD",
  "One Way": "$100 USD",
  "Round Trip": "$160 USD",
  "Open Service (per hour)": "$50 USD / hr"
};

/* =====================================================
   Actualizar interfaz según servicio seleccionado
===================================================== */
function updateServiceUI() {
  const sv = serviceTypeEl.value;

  if (!sv) {
    selectedServiceNameEl.textContent = "None selected";
    selectedServicePriceEl.textContent = "—";
  } else {
    selectedServiceNameEl.textContent = sv;
    selectedServicePriceEl.textContent = SERVICE_PRICES[sv] || "Price on request";
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

/* =====================================================
   Fechas no disponibles (localStorage)
===================================================== */
function getDisabledDates() {
  const saved = JSON.parse(localStorage.getItem("reservations")) || [];
  const dates = new Set();
  saved.forEach(r => {
    if (r.date) dates.add(r.date);
    if (r.returnDate) dates.add(r.returnDate);
  });
  return Array.from(dates);
}

function renderUnavailableList() {
  const list = getDisabledDates();
  unavailableListEl.innerHTML = "";
  if (list.length === 0) {
    unavailableListEl.textContent = "All dates available.";
    return;
  }
  list.forEach(d => {
    let div = document.createElement("div");
    div.textContent = d;
    unavailableListEl.appendChild(div);
  });
}

renderUnavailableList();

/* =====================================================
   Preseleccionar servicio desde ?service=
===================================================== */
const urlParams = new URLSearchParams(window.location.search);
const selectedService = urlParams.get("service");
if (selectedService) {
  serviceTypeEl.value = selectedService;
  updateServiceUI();
}

/* =====================================================
   ENVIAR FORMULARIO
===================================================== */
document.getElementById("bookingForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const reservation = {
    name: document.getElementById("name").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    email: document.getElementById("email").value.trim(),
    serviceType: serviceTypeEl.value,
    passengers: passengersEl.value,
    date: document.getElementById("date").value,
    time: document.getElementById("time").value,
    pickup: pickupPreset.value.trim(),
    destination: destinationPreset.value.trim(),
    returnDate: document.getElementById("returnDate").value,
    returnTime: document.getElementById("returnTime").value,
    hours: document.getElementById("hours").value,
    notes: document.getElementById("notes").value.trim()
  };

  // Validación
  if (!reservation.name || !reservation.phone || !reservation.email || !reservation.serviceType || !reservation.date || !reservation.time) {
    alert("Please complete required fields.");
    return;
  }

  // Guardar fecha ocupada
  let saved = JSON.parse(localStorage.getItem("reservations")) || [];
  saved.push(reservation);
  localStorage.setItem("reservations", JSON.stringify(saved));

  renderUnavailableList();

  // Enviar correo (a ti)
  emailjs.send("service_8zcytcr", "template_7tkwggo", reservation)
    .then(() => {
      // Auto-reply al cliente
      emailjs.send("service_8zcytcr", "template_autoreply", {
        to_email: reservation.email,
        name: reservation.name,
        service: reservation.serviceType,
        date: reservation.date,
        time: reservation.time
      });

      // Enviar WhatsApp
      sendWhatsApp(reservation);

      alert("Reservation sent successfully!");
      document.getElementById("bookingForm").reset();
      updateServiceUI();
    })
    .catch(err => {
      console.error(err);
      alert("Error sending reservation. Try again.");
    });
});

/* =====================================================
   WhatsApp Message
===================================================== */
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

  if (r.returnDate) msg += `Return: ${r.returnDate} at ${r.returnTime}%0A`;
  if (r.hours) msg += `Hours: ${r.hours}%0A`;
  if (r.notes) msg += `%0ANotes: ${r.notes}%0A`;

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
}
