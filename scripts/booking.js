/* =====================================================
   RIDE W ME CABO — BOOKING SYSTEM (2025 UPDATED)
===================================================== */

emailjs.init("Ed5Qh2Qk81A6fHcRR"); // PUBLIC KEY

const WHATSAPP_NUMBER = "526242426741";

// Elements
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

/* =====================================================
   DESTINOS / AUTOCOMPLETE
===================================================== */

const DESTINOS = [
  // Resorts, restaurantes, clubs, zonas… (tu lista completa aquí)
  "Nobu Hotel Los Cabos",
  "Hard Rock Hotel Los Cabos",
  "Waldorf Astoria Pedregal",
  "Garza Blanca Resort",
  "Grand Velas Los Cabos",
  "Esperanza Auberge",
  "One&Only Palmilla",
  "Montage Los Cabos",
  "The Cape, a Thompson Hotel",
  "Riu Palace",
  "Riu Santa Fe",
  "Breathless Cabo",
  "Secrets Puerto Los Cabos",
  "Hyatt Ziva",
  "Le Blanc Spa Resort",
  "Pueblo Bonito Sunset",
  "Pueblo Bonito Rose",
  "Solaz Resort",
  "Marquis Los Cabos",
  "Grand Fiesta Americana",
  "Dreams Los Cabos",
  "Barcelo Gran Faro",
  "Marina Fiesta Resort",
  "Cabo Azul Resort",
  "Sheraton Grand Los Cabos",
  "Chileno Bay Resort",
  "Las Ventanas al Paraíso",
  "Vidanta Los Cabos",

  // Food
  "Edith’s",
  "Sunset Monalisa",
  "Acre Restaurant",
  "Flora Farms",
  "Lorenzillo’s",
  "The Office on the Beach",

  // Clubs
  "Mango Deck",
  "OMNIA Los Cabos",
  "SUR Beach House",

  // Zonas
  "Cabo San Lucas Downtown",
  "San José del Cabo Downtown",
  "Medano Beach",
  "El Arco",
  "Puerto Paraíso Mall",
  "Luxury Avenue",
  "Cabo del Sol Golf",
  "Diamante Golf",

  // Airport
  "Los Cabos International Airport (SJD)",
  "FBO Private Terminal",

  // Other
  "Private Villa",
  "Airbnb Custom",
  "H+ Hospital",
  "Cabo Adventures"
];

function setupAutocomplete(input, dropdown) {
  input.addEventListener("input", function () {
    dropdown.innerHTML = "";
    const text = this.value.toLowerCase();
    if (!text) return;

    DESTINOS.filter(d => d.toLowerCase().includes(text))
      .slice(0, 8)
      .forEach(match => {
        const item = document.createElement("div");
        item.className = "autocomplete-item";
        item.textContent = match;
        item.onclick = () => {
          input.value = match;
          dropdown.innerHTML = "";
        };
        dropdown.appendChild(item);
      });
  });
}

setupAutocomplete(pickupPreset, document.getElementById("pickupDropdown"));
setupAutocomplete(destinationPreset, document.getElementById("destinationDropdown"));

/* =====================================================
   PRECIOS
===================================================== */

const SERVICE_INFO = {
  zone1: { label: "Arrivals / Departures – Zone 1 (SJC → Palmilla)", oneWay: 75, roundTrip: 130 },
  zone2: { label: "Zone 2 — Puerto Los Cabos / El Encanto", oneWay: 85, roundTrip: 150 },
  zone3a: { label: "Zone 3 — Palmilla → Cabo del Sol", oneWay: 95, roundTrip: 170 },
  zone3b: { label: "Zone 3B — Punta Ballena / Solmar", oneWay: 105, roundTrip: 180 },
  zone5: { label: "Zone 5 — Pedregal / Diamante", oneWay: 110, roundTrip: 200 },

  city4: { label: "Open Service – 4 Hours", base: 140, extraHour: 20, duration: "4 Hours" },
  city6: { label: "Open Service – 6 Hours", base: 160, extraHour: 20, duration: "6 Hours" },

  migrino: { label: "Tour – Migriño", base: 350, duration: "4 to 8 Hours" },
  todosSantos: { label: "Tour – Todos Santos", base: 400, duration: "4 to 8 Hours" },
  barriles: { label: "Tour – La Ribera / Los Barriles", base: 400, duration: "4 to 8 Hours" },
  laPaz: { label: "Tour – La Paz", base: 600, duration: "4 to 8 Hours" }
};

/* =====================================================
   UPDATE SERVICE UI
===================================================== */

function updateServiceUI() {
  const sv = serviceTypeEl.value;
  const info = SERVICE_INFO[sv];

  if (!info) {
    selectedServiceNameEl.textContent = "Select a service";
    selectedServicePriceEl.innerHTML = "—";
    return;
  }

  selectedServiceNameEl.textContent = info.label;

  if (info.oneWay) {
    selectedServicePriceEl.innerHTML =
      `One Way: $${info.oneWay} USD<br>Round Trip: $${info.roundTrip} USD`;
  } else if (info.extraHour) {
    selectedServicePriceEl.innerHTML =
      `Base: $${info.base} USD (${info.duration})<br>Extra Hour: $${info.extraHour} USD`;
  } else {
    selectedServicePriceEl.innerHTML =
      `Price: $${info.base} USD<br>Duration: ${info.duration}`;
  }
}

serviceTypeEl.addEventListener("change", updateServiceUI);

/* =====================================================
   RESERVAR
===================================================== */

document.getElementById("bookingForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const sv = serviceTypeEl.value;
  const info = SERVICE_INFO[sv];

  const reservation = {
    name: name.value.trim(),
    phone: phone.value.trim(),
    email: email.value.trim(),
    passengers: passengersEl.value,
    pickup: pickupPreset.value,
    destination: destinationPreset.value,
    date: date.value,
    time: time.value,
    notes: notes.value,
    service_label: info.label,
    one_way: info.oneWay || "",
    round_trip: info.roundTrip || "",
    base: info.base || "",
    extra_hour: info.extraHour || "",
    duration: info.duration || ""
  };

  // Save local
  const saved = JSON.parse(localStorage.getItem("reservations")) || [];
  saved.push(reservation);
  localStorage.setItem("reservations", JSON.stringify(saved));

  // Email for YOU
  emailjs.send("service_8zcytcr", "template_7tkwggo", reservation);

  // Auto-reply for CLIENT
  emailjs.send("service_8zcytcr", "template_autoreply", reservation);

  sendWhatsApp(reservation);

  alert("Reservation sent!");
  bookingForm.reset();
  updateServiceUI();
});

/* =====================================================
   WHATSAPP MESSAGE
===================================================== */

function sendWhatsApp(r) {
  let msg =
`New Reservation%0A%0A
Name: ${r.name}%0A
Phone: ${r.phone}%0A
Pickup: ${r.pickup}%0A
Destination: ${r.destination}%0A
Date: ${r.date} - ${r.time}%0A%0A
Service: ${r.service_label}%0A`;

  if (r.one_way) msg += `One Way: $${r.one_way} USD%0A`;
  if (r.round_trip) msg += `Round Trip: $${r.round_trip} USD%0A`;
  if (r.base) msg += `Base: $${r.base} USD%0A`;
  if (r.extra_hour) msg += `Extra Hour: $${r.extra_hour} USD%0A`;
  if (r.duration) msg += `Duration: ${r.duration}%0A`;

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
}
