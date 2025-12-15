/* ============================================================
   BOOKING.JS – Ride W Me Cabo (FINAL & STABLE)
============================================================ */

// ================= EMAILJS =================
emailjs.init("Ed5Qh2Qk81A6fHcRR");

// ================= WHATSAPP =================
const WHATSAPP = "526242426741";

// ================= ELEMENTS =================
const tripTypeEl = document.getElementById("tripType");
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

// Wrappers
const returnDateWrapper = document.getElementById("returnDateWrapper");
const returnTimeWrapper = document.getElementById("returnTimeWrapper");
const hoursWrapper = document.getElementById("hoursWrapper");

// UI Summary
const uiName = document.getElementById("selectedServiceName");
const uiPrice = document.getElementById("selectedServicePrice");



// ================= SERVICES =================
const SERVICES = {
  zone1: { label: "Arrivals / Departures – Zone 1 (SJD ↔ Palmilla)", oneWay: 75, roundTrip: 130 },
  zone2: { label: "Arrivals / Departures – Zone 2 (Puerto Los Cabos / El Encanto)", oneWay: 85, roundTrip: 150 },
  zone3a:{ label: "Arrivals / Departures – Zone 3 (Palmilla ↔ Cabo del Sol)", oneWay: 95, roundTrip: 170 },
  zone3b:{ label: "Arrivals / Departures – Zone 3 (Punta Ballena / Solmar)", oneWay: 105, roundTrip: 180 },
  zone5: { label: "Arrivals / Departures – Zone 5 (Pedregal / Diamante)", oneWay: 110, roundTrip: 200 },

  city4: { label: "Open Service – 4 Hours", base: 140, extraHour: 20 },
  city6: { label: "Open Service – 6 Hours", base: 160, extraHour: 20 },

  migrino: { label: "Activities / Dinner Tour – Migriño", base: 350 },
  todosSantos: { label: "Activities / Dinner Tour – Todos Santos", base: 400 },
  barriles: { label: "Activities / Dinner Tour – La Ribera / Los Barriles", base: 400 },
  laPaz: { label: "Activities / Dinner Tour – La Paz", base: 600 }
};

// ================= DESTINOS (AUTOCOMPLETE) =================
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

// ================= AUTOCOMPLETE =================
function setupAutocomplete(input, dropdown) {
  input.addEventListener("input", () => {
    const q = input.value.toLowerCase().trim();
    dropdown.innerHTML = "";
    if (!q) return;

    DESTINOS
      .filter(d => d.toLowerCase().includes(q))
      .slice(0, 7)
      .forEach(place => {
        const div = document.createElement("div");
        div.className = "autocomplete-item";
        div.textContent = place;
        div.onclick = () => {
          input.value = place;
          dropdown.innerHTML = "";
        };
        dropdown.appendChild(div);
      });
  });

  // Close dropdown when clicking outside input OR dropdown
  document.addEventListener("click", (e) => {
    if (!input.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.innerHTML = "";
    }
  });
}

setupAutocomplete(pickupEl, document.getElementById("pickupDropdown"));
setupAutocomplete(destinationEl, document.getElementById("destinationDropdown"));

// ================= TRIP TYPE (SHOW/HIDE RETURN) =================
function toggleReturnFields() {
  const sv = serviceTypeEl.value;
  const info = SERVICES[sv];

  // Solo aplica retorno para airport transfers (zones)
  if (info && info.oneWay && tripTypeEl.value === "roundtrip") {
    returnDateWrapper.style.display = "block";
    returnTimeWrapper.style.display = "block";
  } else {
    returnDateWrapper.style.display = "none";
    returnTimeWrapper.style.display = "none";
    returnDateEl.value = "";
    returnTimeEl.value = "";
  }
}

tripTypeEl.addEventListener("change", () => {
  toggleReturnFields();
  updateServiceUI(); // actualiza summary
});

// ================= UI UPDATE =================
function updateServiceUI() {
  const info = SERVICES[serviceTypeEl.value];

  if (!info) {
    uiName.textContent = "Select a service";
    uiPrice.textContent = "—";
    hoursWrapper.style.display = "none";
    toggleReturnFields();
    return;
  }

  uiName.textContent = info.label;

  // Default wrappers
  hoursWrapper.style.display = "none";

  // Airport transfers (zones)
  if (info.oneWay) {
    uiPrice.innerHTML = `
      <strong>One Way:</strong> $${info.oneWay} USD<br>
      <strong>Round Trip:</strong> $${info.roundTrip} USD
    `;
    toggleReturnFields();
    return;
  }

  // Open service
  if (info.extraHour) {
    uiPrice.innerHTML = `
      <strong>Base:</strong> $${info.base} USD<br>
      <strong>Extra Hour:</strong> $${info.extraHour} USD
    `;
    hoursWrapper.style.display = "block";
    // No return fields for open services
    returnDateWrapper.style.display = "none";
    returnTimeWrapper.style.display = "none";
    returnDateEl.value = "";
    returnTimeEl.value = "";
    return;
  }

  // Tours
  uiPrice.innerHTML = `<strong>Price:</strong> $${info.base} USD`;
  // No return fields for tours
  returnDateWrapper.style.display = "none";
  returnTimeWrapper.style.display = "none";
  returnDateEl.value = "";
  returnTimeEl.value = "";
}

serviceTypeEl.addEventListener("change", () => {
  updateServiceUI();
});

// Default
if (tripTypeEl) tripTypeEl.value = "oneway";
updateServiceUI();

// ================= PRICE CALC =================
function calculatePrice() {
  const sv = serviceTypeEl.value;
  const info = SERVICES[sv];
  if (!info) return { total: 0, tripTypeText: "—", basePrice: 0, extraHoursTotal: 0, roundTripPrice: 0, extraHours: 0 };

  let total = 0;
  let basePrice = 0;
  let extraHoursTotal = 0;
  let tripTypeText = "";
  let roundTripPrice = 0;
  let extraHours = 0;

  // Airport transfers
  if (info.oneWay) {
    if (tripTypeEl.value === "roundtrip") {
      basePrice = info.roundTrip;
      total = info.roundTrip;
      tripTypeText = "Round Trip";
      roundTripPrice = info.roundTrip;
    } else {
      basePrice = info.oneWay;
      total = info.oneWay;
      tripTypeText = "One Way";
      roundTripPrice = 0;
    }
    return { total, tripTypeText, basePrice, extraHoursTotal, roundTripPrice, extraHours };
  }

  // Open service
  if (info.extraHour) {
    extraHours = Number(hoursEl.value || 0);
    basePrice = info.base;
    extraHoursTotal = extraHours * info.extraHour;
    total = basePrice + extraHoursTotal;
    tripTypeText = "Open Service";
    return { total, tripTypeText, basePrice, extraHoursTotal, roundTripPrice, extraHours };
  }

  // Tours
  basePrice = info.base;
  total = info.base;
  tripTypeText = "Tour";
  return { total, tripTypeText, basePrice, extraHoursTotal, roundTripPrice, extraHours };
}

// ================= SEND EMAIL =================
function sendEmail(payload) {
  return emailjs.send("service_8zcytcr", "template_7tkwggo", payload);
}

// ================= WHATSAPP =================
function sendWhatsApp(res) {
  let msg =
    `🚗 *Ride W Me Cabo – Reservation Confirmed*\n\n` +
    `Hi ${res.name} 👋\n\n` +
    `*Service:* ${res.service_label}\n` +
    `*Trip Type:* ${res.trip_type}\n` +
    `*Passengers:* ${res.passengers}\n\n` +
    `*Pickup:* ${res.pickup}\n` +
    `*Destination:* ${res.destination}\n\n` +
    `*Departure:* ${res.date} at ${res.time}\n`;

  if (res.return_date) msg += `*Return:* ${res.return_date} at ${res.return_time}\n`;
  if (res.extra_hours && Number(res.extra_hours) > 0) msg += `*Extra Hours:* ${res.extra_hours}\n`;

  msg += `\n💵 *Payment Summary*\n`;
  msg += `Base Price: $${res.base_price} USD\n`;
  if (res.round_trip_price_msg) msg += `Round Trip Price: $${res.base_price} USD\n`;
  if (res.extra_hours_total && Number(res.extra_hours_total) > 0) {
    msg += `Extra Hours Total: $${res.extra_hours_total} USD\n`;
  }
  msg += `Total: $${res.total_price} USD\n\n`;
  msg += `Thank you for choosing *Ride W Me Cabo* ✨`;

  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank");
}

function saveReservation(data) {
  const existing = JSON.parse(localStorage.getItem("reservations")) || [];
  existing.push({
    ...data,
    created_at: new Date().toISOString()
  });
  localStorage.setItem("reservations", JSON.stringify(existing));
}


// ================= SUBMIT =================
document.getElementById("bookingForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const info = SERVICES[serviceTypeEl.value];
  if (!info) {
    alert("Please select a service.");
    return;
  }

  const pricing = calculatePrice();

  // Basic validations
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const email = document.getElementById("email").value.trim();

  if (!name || !phone || !email || !passengersEl.value || !pickupEl.value.trim() || !destinationEl.value.trim() || !dateEl.value || !timeEl.value) {
    alert("Please complete all required fields.");
    return;
  }

  // If roundtrip selected for zones -> require return fields
  if (info.oneWay && tripTypeEl.value === "roundtrip") {
    if (!returnDateEl.value || !returnTimeEl.value) {
      alert("Please select return date and time for Round Trip.");
      return;
    }
  }

  // ✅ MENSAJES LISTOS PARA TU TEMPLATE (tal cual lo tienes)
  const returnDateMsg =
    (info.oneWay && tripTypeEl.value === "roundtrip")
      ? `• Return: ${returnDateEl.value} at ${returnTimeEl.value}`
      : "";

  const extraHoursMsg =
    (info.extraHour && pricing.extraHours > 0)
      ? `• Extra Hours: ${pricing.extraHours}`
      : "";

  const roundTripPriceMsg =
    (info.oneWay && tripTypeEl.value === "roundtrip")
      ? `Round Trip Price: $${info.roundTrip} USD`
      : "";

  const extraHoursTotalMsg =
    (info.extraHour && pricing.extraHoursTotal > 0)
      ? `Extra Hours Total: $${pricing.extraHoursTotal} USD`
      : "";

  const payload = {
    name,
    phone,
    email,

    service_label: info.label,
    trip_type: pricing.tripTypeText,

    passengers: passengersEl.value,
    pickup: pickupEl.value.trim(),
    destination: destinationEl.value.trim(),

    date: dateEl.value,
    time: timeEl.value,

    return_date: (info.oneWay && tripTypeEl.value === "roundtrip") ? returnDateEl.value : "",
    return_time: (info.oneWay && tripTypeEl.value === "roundtrip") ? returnTimeEl.value : "",

    extra_hours: info.extraHour ? (hoursEl.value || "") : "",
    notes: notesEl.value.trim(),

    base_price: pricing.basePrice,
    total_price: pricing.total,

    // ✅ Estos son los que tu template imprime:
    return_date_msg: returnDateMsg,
    extra_hours_msg: extraHoursMsg,
    round_trip_price_msg: roundTripPriceMsg,
    extra_hours_total_msg: extraHoursTotalMsg
  };

 sendEmail(payload)
  .then(() => {

    // ✅ GUARDAR RESERVA
    saveReservation(payload);

    // 📲 WhatsApp
    sendWhatsApp(payload);

    alert("Your reservation has been sent successfully!");
    document.getElementById("bookingForm").reset();
    tripTypeEl.value = "oneway";
    updateServiceUI();
  })
    .catch((err) => {
      console.error(err);
      alert("Error sending reservation. Please try again.");
    });
});
