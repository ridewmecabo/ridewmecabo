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

/* =====================================================
   TODAS LAS LOCACIONES — HOTELS, RESTAURANTS, CLUBS, ETC.
===================================================== */
const DESTINOS = [
  // 📌 HOTELS / RESORTS
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
  "Breathless Cabo San Lucas",
  "Secrets Puerto Los Cabos",
  "Hyatt Ziva",
  "Le Blanc Spa Resort",
  "Pueblo Bonito Sunset",
  "Pueblo Bonito Rose",
  "Pueblo Bonito Blanco",
  "Solaz Resort",
  "Hilton Los Cabos",
  "Marquis Los Cabos",
  "Grand Fiesta Americana",
  "Dreams Los Cabos",
  "Barcelo Gran Faro",
  "Marina Fiesta Resort",
  "Cabo Azul Resort",
  "Sheraton Grand Los Cabos",
  "CostaBaja Resort (La Paz)",
  "Chileno Bay Resort",
  "Las Ventanas al Paraíso",
  "Vidanta Los Cabos",

  // 🍽 RESTAURANTES
  "Edith’s",
  "The Office on the Beach",
  "Sunset Monalisa",
  "Lorenzillo’s",
  "Rosa Negra",
  "Funky Geisha",
  "Taboo Cabo",
  "Mamazzita Cabo",
  "Animalón",
  "El Farallon",
  "Acre Restaurant",
  "Flora Farms",
  "Jazmin’s Restaurant",
  "Tacos Gardenias",
  "La Lupita Tacos",
  "Carbón Cabrón",

  // 🎉 BEACH CLUBS
  "Mango Deck",
  "SUR Beach House",
  "OMNIA Los Cabos",
  "Blue Marlin Ibiza",
  "Veleros Beach Club",

  // 🎯 ZONAS / LANDMARKS
  "Cabo San Lucas Downtown",
  "San José del Cabo Downtown",
  "El Arco",
  "Marina Cabo San Lucas",
  "Puerto Paraíso Mall",
  "Luxury Avenue",
  "Medano Beach",
  "La Marina SJC",
  "Cabo del Sol Golf",
  "Palmilla Golf",
  "Diamante Golf",
  "Costco CSL",
  "Fresko CSL",
  "Walmart San Lucas",
  "Home Depot CSL",
  "Puerto Los Cabos Marina",
  "Zacatitos",
  "East Cape",

  // ✈️ Airport
  "Los Cabos International Airport (SJD)",
  "FBO Private Terminal (SJD Private Jets)",
  "FBO Private CSL, Cabo San Lucas",

  // 🏠 Otros
  "Airbnb (Custom)",
  "Private Villa (Custom)",
  "H+ Hospital",
  "Cabo Adventures"
];

/* =====================================================
   AUTOCOMPLETADO — SUGERENCIAS TIPO UBER (LOCAL)
===================================================== */
function setupAutocomplete(input, dropdown) {
  input.addEventListener("input", function () {
    const query = this.value.trim().toLowerCase();
    dropdown.innerHTML = "";

    if (!query) return;

    const results = DESTINOS.filter(loc =>
      loc.toLowerCase().includes(query)
    ).slice(0, 8);

    results.forEach(loc => {
      const div = document.createElement("div");
      div.className = "autocomplete-item";
      div.textContent = loc;

      div.onclick = () => {
        input.value = loc;
        dropdown.innerHTML = "";
      };

      dropdown.appendChild(div);
    });
  });

  // Ocultar cuando se hace clic fuera
  document.addEventListener("click", e => {
    if (!dropdown.contains(e.target) && !input.contains(e.target)) {
      dropdown.innerHTML = "";
    }
  });
}

setupAutocomplete(pickupPreset, document.getElementById("pickupDropdown"));
setupAutocomplete(destinationPreset, document.getElementById("destinationDropdown"));

/* =====================================================
   PRECIOS
===================================================== */
const SERVICE_PRICES = {
  // ARRIVALS / DEPARTURES
  SJCtoPalmilla: "$75.00 USD (One Way) — $130.00 USD (Round Trip)",
  zone2: "$85.00 USD (One Way) — $150.00 USD (Round Trip)",
  zone3a: "$95.00 USD (One Way) — $170.00 USD (Round Trip)",
  zone3b: "$105.00 USD (One Way) — $180.00 USD (Round Trip)",
  zone5: "$110.00 USD (One Way) — $200.00 USD (Round Trip)",

  // CITY OPEN
  city4: "$140.00 USD — 4 Hours (+$20 extra hour)",
  city6: "$160.00 USD — 6 Hours (+$20 extra hour)",

  // ACTIVITIES / DINNER TOURS
  migrino: "$350.00 USD — 4 to 8 hours",
  todosSantos: "$400.00 USD — 4 to 8 hours",
  barriles: "$400.00 USD — 4 to 8 hours",
  laPaz: "$600.00 USD — 4 to 8 hours"
};




/* =====================================================
   UI según tipo de servicio
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

  returnDateWrapper.style.display = sv === "Round Trip" ? "block" : "none";
  returnTimeWrapper.style.display = sv === "Round Trip" ? "block" : "none";
  hoursWrapper.style.display = sv === "Open Service (per hour)" ? "block" : "none";
}

serviceTypeEl.addEventListener("change", updateServiceUI);

/* =====================================================
   Fechas ocupadas (localStorage)
===================================================== */
function getDisabledDates() {
  const saved = JSON.parse(localStorage.getItem("reservations")) || [];
  return saved.flatMap(r => [r.date, r.returnDate]).filter(Boolean);
}

function renderUnavailableList() {
  const list = getDisabledDates();
  unavailableListEl.innerHTML = list.length ? "" : "All dates available.";

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
}
updateServiceUI();

/* =====================================================
   Enviar Formulario
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

  if (!reservation.name || !reservation.phone || !reservation.email || !reservation.serviceType) {
    alert("Please complete all required fields.");
    return;
  }

  // Email principal
  emailjs.send("service_8zcytcr", "template_7tkwggo", reservation)
    .then(() => {
      // Auto-reply
      emailjs.send("service_8zcytcr", "template_autoreply", {
        to_email: reservation.email,
        name: reservation.name,
        date: reservation.date,
        time: reservation.time,
         
        service: reservation.serviceType,
        price: SERVICE_PRICES[reservation.serviceType]
      });

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
   WhatsApp
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
