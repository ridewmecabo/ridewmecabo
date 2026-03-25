/* ============================================================
   BOOKING.JS – Ride W Me Cabo (FIXED & SECURE WITH AUTO-SELECT)
============================================================ */

// ================= EMAILJS =================
emailjs.init("Ed5Qh2Qk81A6fHcRR");

// ================= WHATSAPP =================
const WHATSAPP = "526241598793";

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
const depositDisplay = document.getElementById('depositAmount'); 

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
  "Nobu Hotel Los Cabos","Hard Rock Hotel Los Cabos","Waldorf Astoria Pedregal",
  "Garza Blanca Resort","Grand Velas Los Cabos","Esperanza Auberge",
  "One&Only Palmilla","Montage Los Cabos","The Cape, a Thompson Hotel",
  "Riu Palace","Riu Santa Fe","Breathless Cabo","Secrets Puerto Los Cabos",
  "Hyatt Ziva","Le Blanc Spa Resort","Pueblo Bonito Sunset","Pueblo Bonito Rose",
  "Pueblo Bonito Blanco","Solaz Resort","Hilton Los Cabos","Marquis Los Cabos",
  "Grand Fiesta Americana","Dreams Los Cabos","Barceló Gran Faro",
  "Marina Fiesta Resort","Cabo Azul Resort","Sheraton Grand Los Cabos",
  "Chileno Bay Resort","Las Ventanas al Paraíso",
  "Edith’s","The Office on the Beach","Sunset Monalisa","Lorenzillo’s",
  "Rosa Negra","Funky Geisha","Taboo Cabo","Mamazzita","Animalón",
  "El Farallon","Acre Restaurant","Flora Farms","Jazmin’s Restaurant",
  "Tacos Gardenias","La Lupita Tacos","Carbón Cabrón",
  "Mango Deck","SUR Beach House","OMNIA Los Cabos","Blue Marlin Ibiza",
  "Veleros Beach Club",
  "Cabo San Lucas Downtown","San José del Cabo Downtown","El Arco",
  "Marina Cabo San Lucas","Puerto Paraíso Mall","Luxury Avenue",
  "Medano Beach","Palmilla Golf","Diamante Golf","Costco CSL",
  "Fresko CSL","Walmart San Lucas","Home Depot CSL",
  "Los Cabos International Airport (SJD)",
  "FBO Private Terminal (SJD Private Jets)",
  "Airbnb (Custom)","Private Villa (Custom)","H+ Hospital"
];

// ================= AUTOCOMPLETE =================
function setupAutocomplete(input, dropdown) {
  if (!input || !dropdown) return;
  
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

  if (info && info.oneWay && tripTypeEl.value === "roundtrip") {
    if (returnDateWrapper) returnDateWrapper.style.display = "block";
    if (returnTimeWrapper) returnTimeWrapper.style.display = "block";
  } else {
    if (returnDateWrapper) returnDateWrapper.style.display = "none";
    if (returnTimeWrapper) returnTimeWrapper.style.display = "none";
    if (returnDateEl) returnDateEl.value = "";
    if (returnTimeEl) returnTimeEl.value = "";
  }
}

tripTypeEl?.addEventListener("change", () => {
  toggleReturnFields();
  updateServiceUI(); 
});

hoursEl?.addEventListener("change", () => {
  updateServiceUI();
});

// ================= UI UPDATE =================
function updateServiceUI() {
  const info = SERVICES[serviceTypeEl.value];
  const pricing = calculatePrice(); 

  if (!info) {
    uiName.textContent = "Select a service";
    uiPrice.textContent = "—";
    if (depositDisplay) depositDisplay.textContent = "$0.00 USD";
    if (hoursWrapper) hoursWrapper.style.display = "none";
    toggleReturnFields();
    return;
  }

  uiName.textContent = info.label;
  if (hoursWrapper) hoursWrapper.style.display = "none";

  if (depositDisplay && pricing.total > 0) {
      let deposit = (pricing.total * 0.20).toFixed(2);
      depositDisplay.textContent = `$${deposit} USD`;
  }

  if (info.oneWay) {
    uiPrice.innerHTML = `
      <strong>One Way:</strong> $${info.oneWay} USD<br>
      <strong>Round Trip:</strong> $${info.roundTrip} USD
    `;
    toggleReturnFields();
    return;
  }

  if (info.extraHour) {
    uiPrice.innerHTML = `
      <strong>Base:</strong> $${info.base} USD<br>
      <strong>Extra Hour:</strong> $${info.extraHour} USD
    `;
    if (hoursWrapper) hoursWrapper.style.display = "block";
    if (returnDateWrapper) returnDateWrapper.style.display = "none";
    if (returnTimeWrapper) returnTimeWrapper.style.display = "none";
    if (returnDateEl) returnDateEl.value = "";
    if (returnTimeEl) returnTimeEl.value = "";
    return;
  }

  uiPrice.innerHTML = `<strong>Price:</strong> $${info.base} USD`;
  if (returnDateWrapper) returnDateWrapper.style.display = "none";
  if (returnTimeWrapper) returnTimeWrapper.style.display = "none";
  if (returnDateEl) returnDateEl.value = "";
  if (returnTimeEl) returnTimeEl.value = "";
}

serviceTypeEl?.addEventListener("change", () => {
  updateServiceUI();
});

// ================= AUTO-SELECT SERVICE FROM URL =================
document.addEventListener("DOMContentLoaded", () => {
  // 1. Leemos la URL
  const params = new URLSearchParams(window.location.search);
  const serviceToSelect = params.get('service');

  // 2. Si venimos de services.html con un servicio seleccionado
  if (serviceToSelect && serviceTypeEl) {
    serviceTypeEl.value = serviceToSelect;
    
    // Forzamos la actualización de la UI
    updateServiceUI();
  } else {
    // 3. Comportamiento por defecto (si entran directo a booking.html)
    if (tripTypeEl) tripTypeEl.value = "oneway";
    updateServiceUI();
  }
});

// ================= PRICE CALC =================
function calculatePrice() {
  const sv = serviceTypeEl.value;
  const info = SERVICES[sv];
  if (!info) return { total: 0, tripTypeText: "—", basePrice: 0, extraHoursTotal: 0, roundTripPrice: 0, extraHours: 0 };

  let total = 0, basePrice = 0, extraHoursTotal = 0, roundTripPrice = 0, extraHours = 0;
  let tripTypeText = "";

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
    }
    return { total, tripTypeText, basePrice, extraHoursTotal, roundTripPrice, extraHours };
  }

  if (info.extraHour) {
    extraHours = Number(hoursEl.value || 0);
    basePrice = info.base;
    extraHoursTotal = extraHours * info.extraHour;
    total = basePrice + extraHoursTotal;
    tripTypeText = "Open Service";
    return { total, tripTypeText, basePrice, extraHoursTotal, roundTripPrice, extraHours };
  }

  basePrice = info.base;
  total = info.base;
  tripTypeText = "Tour";
  return { total, tripTypeText, basePrice, extraHoursTotal, roundTripPrice, extraHours };
}

// ================= SEND EMAIL & WHATSAPP =================
function sendEmail(payload) {
  return emailjs.send("service_8zcytcr", "template_7tkwggo", payload);
}

function sendWhatsApp(res) {
  let msg = `🚗 *Ride W Me Cabo – Reservation Confirmed*\n\nHi ${res.name} 👋\n\n*Service:* ${res.service_label}\n*Trip Type:* ${res.trip_type}\n*Passengers:* ${res.passengers}\n\n*Pickup:* ${res.pickup}\n*Destination:* ${res.destination}\n\n*Departure:* ${res.date} at ${res.time}\n`;
  if (res.return_date) msg += `*Return:* ${res.return_date} at ${res.return_time}\n`;
  if (res.extra_hours && Number(res.extra_hours) > 0) msg += `*Extra Hours:* ${res.extra_hours}\n`;
  msg += `\n💵 *Payment Summary*\nTotal Service Price: $${res.total_price} USD\n*Deposit Paid (20%):* $${res.deposit_paid} USD\n*Balance Due:* $${res.balance_due} USD\n\nThank you for choosing *Ride W Me Cabo* ✨`;
  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank");
}

function saveReservation(data) {
  const existing = JSON.parse(localStorage.getItem("reservations")) || [];
  existing.push({ ...data, created_at: new Date().toISOString() });
  localStorage.setItem("reservations", JSON.stringify(existing));
}

// ================= PAYPAL & SUBMIT =================
document.getElementById("bookingForm").addEventListener("submit", (e) => { e.preventDefault(); });

if (typeof paypal !== 'undefined') {
    paypal.Buttons({
        onClick: function(data, actions) {
            const form = document.getElementById("bookingForm");
            if (!form.checkValidity()) {
                form.reportValidity();
                return actions.reject();
            }

            const phoneVal = document.getElementById("phone").value.replace(/\D/g, '');
            const info = SERVICES[serviceTypeEl.value];

            if (phoneVal.length < 10) {
                alert("⚠️ Por favor, ingresa un número de teléfono válido (mínimo 10 dígitos).");
                document.getElementById("phone").focus();
                return actions.reject(); 
            }

            if (info.oneWay && tripTypeEl.value === "roundtrip") {
                if (!returnDateEl.value || !returnTimeEl.value) {
                    alert("Please select return date and time for Round Trip.");
                    return actions.reject();
                }
            }
            return actions.resolve();
        },

        createOrder: function(data, actions) {
            const pricing = calculatePrice();
            const deposit = (pricing.total * 0.20).toFixed(2);
            return actions.order.create({
                purchase_units: [{
                    amount: { value: deposit.toString() },
                    description: `20% Reservation Deposit - ${uiName.textContent}`
                }]
            });
        },

        onApprove: function(data, actions) {
            return actions.order.capture().then(function(details) {
                const pricing = calculatePrice();
                const depositPaid = (pricing.total * 0.20).toFixed(2);
                const balanceDue = (pricing.total - depositPaid).toFixed(2);
                
                alert('¡Pago exitoso! Procesando reservación para ' + details.payer.name.given_name);
                executeCompleteReservation(details.id, depositPaid, balanceDue, pricing);
            });
        },

        onError: function(err) {
            console.error('PayPal Error:', err);
            alert('Hubo un error con PayPal. Por favor, intenta de nuevo.');
        }
    }).render('#paypal-button-container');
} else {
    console.warn("PayPal SDK no cargó correctamente.");
}

function executeCompleteReservation(transactionId, depositPaid, balanceDue, pricing) {
    const info = SERVICES[serviceTypeEl.value];
    const payload = {
        name: document.getElementById("name").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        email: document.getElementById("email").value.trim(),
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
        deposit_paid: depositPaid,
        balance_due: balanceDue,
        paypal_transaction_id: transactionId,
        return_date_msg: (info.oneWay && tripTypeEl.value === "roundtrip") ? `• Return: ${returnDateEl.value} at ${returnTimeEl.value}` : "",
        extra_hours_msg: (info.extraHour && pricing.extraHours > 0) ? `• Extra Hours: ${pricing.extraHours}` : "",
        round_trip_price_msg: (info.oneWay && tripTypeEl.value === "roundtrip") ? `Round Trip Price: $${info.roundTrip} USD` : "",
        extra_hours_total_msg: (info.extraHour && pricing.extraHoursTotal > 0) ? `Extra Hours Total: $${pricing.extraHoursTotal} USD` : ""
    };

    sendEmail(payload).then(() => {
        saveReservation(payload);
        sendWhatsApp(payload);
        alert("Your reservation has been confirmed!");
        document.getElementById("bookingForm").reset();
        tripTypeEl.value = "oneway";
        updateServiceUI();
    }).catch((err) => {
        console.error(err);
        alert("Pago exitoso, pero falló el envío del correo de confirmación.");
    });
}
