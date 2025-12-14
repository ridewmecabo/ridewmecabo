/* ============================================================
   BOOKING.JS – Ride W Me Cabo
   Versión elegante, estable y sincronizada
============================================================ */

// EmailJS
emailjs.init("Ed5Qh2Qk81A6fHcRR");

// WhatsApp number
const WHATSAPP = "526242426741";

// Inputs
const serviceTypeEl = document.getElementById("serviceType");
const passengersEl = document.getElementById("passengers");
const pickupEl = document.getElementById("pickupPreset");
const destinationEl = document.getElementById("destinationPreset");
const dateEl = document.getElementById("date");
const timeEl = document.getElementById("time");
const returnDateEl = document.getElementById("returnDate");
const returnTimeEl = document.getElementById("returnTime");
const hoursEl = document.getElementById("hours");
const notesEl = document.getElementById("notes");

// Wrappers (to show/hide)
const returnDateWrapper = document.getElementById("returnDateWrapper");
const returnTimeWrapper = document.getElementById("returnTimeWrapper");
const hoursWrapper = document.getElementById("hoursWrapper");

// Service summary UI
const uiName = document.getElementById("selectedServiceName");
const uiPrice = document.getElementById("selectedServicePrice");

/* ============================================================
   SERVICE DEFINITIONS (PRICES)
============================================================ */
const SERVICES = {
  zone1: { label: "Zone 1 – SJC to Palmilla", oneWay: 75, roundTrip: 130 },
  zone2: { label: "Zone 2 – Puerto Los Cabos / El Encanto", oneWay: 85, roundTrip: 150 },
  zone3a: { label: "Zone 3 – Palmilla to Cabo del Sol", oneWay: 95, roundTrip: 170 },
  zone3b: { label: "Zone 3B – Punta Ballena / Solmar", oneWay: 105, roundTrip: 180 },
  zone5: { label: "Zone 5 – Pedregal / Diamante", oneWay: 110, roundTrip: 200 },

  city4: { label: "Open Service – 4 Hours", base: 140, extraHour: 20 },
  city6: { label: "Open Service – 6 Hours", base: 160, extraHour: 20 },

  migrino: { label: "Tour – Migriño", base: 350 },
  todosSantos: { label: "Tour – Todos Santos", base: 400 },
  barriles: { label: "Tour – La Ribera / Los Barriles", base: 400 },
  laPaz: { label: "Tour – La Paz", base: 600 }
};

/* ============================================================
   DESTINOS PARA AUTOCOMPLETADO
============================================================ */
const DESTINOS = [
  // HOTELS
  "Nobu Hotel Los Cabos","Hard Rock Hotel Los Cabos","Waldorf Astoria Pedregal",
  "Garza Blanca Resort","Grand Velas Los Cabos","Esperanza Auberge",
  "One&Only Palmilla","Montage Los Cabos","The Cape, a Thompson Hotel",
  "Riu Palace","Riu Santa Fe","Breathless Cabo","Secrets Puerto Los Cabos",
  "Hyatt Ziva","Le Blanc Spa Resort","Pueblo Bonito Sunset","Pueblo Bonito Rose",
  "Pueblo Bonito Blanco","Solaz Resort","Hilton Los Cabos","Marquis Los Cabos",
  "Grand Fiesta Americana","Dreams Los Cabos","Barceló Gran Faro",
  "Marina Fiesta Resort","Cabo Azul Resort","Sheraton Grand Los Cabos",
  "Chileno Bay Resort","Las Ventanas al Paraíso",

  // RESTAURANTS
  "Edith’s","The Office on the Beach","Sunset Monalisa","Lorenzillo’s",
  "Rosa Negra","Funky Geisha","Taboo Cabo","Mamazzita","Animalón",
  "El Farallon","Acre Restaurant","Flora Farms","Jazmin’s Restaurant",
  "Tacos Gardenias","La Lupita Tacos","Carbón Cabrón",

  // BEACH CLUBS
  "Mango Deck","SUR Beach House","OMNIA Los Cabos","Blue Marlin Ibiza",
  "Veleros Beach Club",

  // LANDMARKS
  "Cabo San Lucas Downtown","San José del Cabo Downtown","El Arco",
  "Marina Cabo San Lucas","Puerto Paraíso Mall","Luxury Avenue",
  "Medano Beach","Palmilla Golf","Diamante Golf","Costco CSL",
  "Fresko CSL","Walmart San Lucas","Home Depot CSL",

  // AIRPORT / PRIVATE
  "Los Cabos International Airport (SJD)",
  "FBO Private Terminal (SJD Private Jets)",

  // CUSTOM
  "Airbnb (Custom)","Private Villa (Custom)","H+ Hospital"
];

/* ============================================================
   AUTOCOMPLETADO – TIPO UBER
============================================================ */
function setupAutocomplete(input, dropdown) {
  
  input.addEventListener("input", function () {
    const text = this.value.toLowerCase().trim();
    dropdown.innerHTML = "";

    if (!text) return;

    const results = DESTINOS.filter(d => d.toLowerCase().includes(text)).slice(0, 7);

    results.forEach(item => {
      const div = document.createElement("div");
      div.className = "autocomplete-item";
      div.textContent = item;

      div.onclick = () => {
        input.value = item;
        dropdown.innerHTML = "";
      };

      dropdown.appendChild(div);
    });
  });

  document.addEventListener("click", e => {
    if (!dropdown.contains(e.target) && !input.contains(e.target)) {
      dropdown.innerHTML = "";
    }
  });
}

// ACTIVATE AUTOCOMPLETE
setupAutocomplete(pickupEl, document.getElementById("pickupDropdown"));
setupAutocomplete(destinationEl, document.getElementById("destinationDropdown"));


/* ============================================================
   UPDATE UI WHEN SERVICE CHANGES
============================================================ */
function updateServiceUI() {
  const sv = serviceTypeEl.value;
  const info = SERVICES[sv];

  if (!info) {
    uiName.textContent = "Select a service";
    uiPrice.textContent = "—";
    return;
  }

  uiName.textContent = info.label;

  // Show price summary
  if (info.oneWay) {
    uiPrice.innerHTML = `
      <strong>One Way:</strong> $${info.oneWay} USD<br>
      <strong>Round Trip:</strong> $${info.roundTrip} USD
    `;
    returnDateWrapper.style.display = "none";
    returnTimeWrapper.style.display = "none";
    hoursWrapper.style.display = "none";
  }

  else if (info.extraHour) {
    uiPrice.innerHTML = `
      <strong>Base:</strong> $${info.base} USD<br>
      <strong>Extra Hour:</strong> $${info.extraHour} USD
    `;
    returnDateWrapper.style.display = "none";
    returnTimeWrapper.style.display = "none";
    hoursWrapper.style.display = "block";
  }

  else {
    uiPrice.innerHTML = `
      <strong>Price:</strong> $${info.base} USD
    `;
    returnDateWrapper.style.display = "none";
    returnTimeWrapper.style.display = "none";
    hoursWrapper.style.display = "none";
  }
}

serviceTypeEl.addEventListener("change", updateServiceUI);

/* ============================================================
   TOTAL PRICE CALCULATION
============================================================ */
function calculatePrice() {
  const sv = serviceTypeEl.value;
  const info = SERVICES[sv];

  if (!info) return { total: 0 };

  let total = 0;
  let tripType = "One Way";

  if (info.oneWay) {
    if (returnDateEl.value) {
      total = info.roundTrip;
      tripType = "Round Trip";
    } else {
      total = info.oneWay;
    }
  }

  else if (info.extraHour) {
    const hrs = Number(hoursEl.value || 0);
    total = info.base + (hrs * info.extraHour);
  }

  else {
    total = info.base;
  }

  return { total, tripType };
}

/* ============================================================
   EMAILJS – SEND TO CLIENT + TO YOU
============================================================ */
function sendEmail(res) {
  const templateData = {
    name: res.name,
    phone: res.phone,
    email: res.email,
    service_label: res.service_label,
    trip_type: res.trip_type,
    passengers: res.passengers,
    pickup: res.pickup,
    destination: res.destination,
    date: res.date,
    time: res.time,
    return_date: res.return_date,
    return_time: res.return_time,
    extra_hours: res.extra_hours,
    base_price: res.base_price,
    round_trip_price: res.round_trip_price,
    extra_hours_total: res.extra_hours_total,
    total_price: res.total_price,
    notes: res.notes
  };

  return emailjs.send("service_8zcytcr", "template_7tkwggo", templateData);
}

/* ============================================================
   WHATSAPP – CLEAN, SIMPLE, ELEGANT
============================================================ */
function sendWhatsApp(res) {
  let msg =
    `🚗 *Ride W Me Cabo – New Reservation*\n\n` +
    `Hi ${res.name}, your reservation is confirmed!\n\n` +
    `• Service: ${res.service_label}\n` +
    `• Trip Type: ${res.trip_type}\n` +
    `• Passengers: ${res.passengers}\n\n` +
    `• Pickup: ${res.pickup}\n` +
    `• Destination: ${res.destination}\n\n` +
    `• Departure: ${res.date} at ${res.time}\n`;

  if (res.return_date)
    msg += `• Return: ${res.return_date} at ${res.return_time}\n`;

  if (res.extra_hours)
    msg += `• Extra Hours: ${res.extra_hours}\n`;

  msg += `\n💵 Total: $${res.total_price} USD\n`;

  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`);
}

/* ============================================================
   FORM SUBMIT
============================================================ */
document.getElementById("bookingForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const sv = serviceTypeEl.value;
  const info = SERVICES[sv];
  const pricing = calculatePrice();

  const reservation = {
    name: document.getElementById("name").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    email: document.getElementById("email").value.trim(),
    passengers: passengersEl.value,
    pickup: pickupEl.value.trim(),
    destination: destinationEl.value.trim(),
    date: dateEl.value,
    time: timeEl.value,
    return_date: returnDateEl.value,
    return_time: returnTimeEl.value,
    extra_hours: hoursEl.value,
    notes: notesEl.value.trim(),

    service_label: info.label,
    trip_type: pricing.tripType,
    base_price: info.base || info.oneWay,
    round_trip_price: info.roundTrip || "",
    extra_hours_total: info.extraHour ? (Number(hoursEl.value || 0) * info.extraHour) : "",
    total_price: pricing.total
  };

  sendEmail(reservation)
    .then(() => {
      sendWhatsApp(reservation);
      alert("Your reservation has been sent successfully!");
      document.getElementById("bookingForm").reset();
      updateServiceUI();
    })
    .catch(err => {
      console.error(err);
      alert("Error sending reservation. Please try again.");
    });
});
