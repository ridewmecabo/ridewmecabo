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

(function () {
  emailjs.init("Ed5Qh2Qk81A6fHcRR");
})();

// =======================
// LOCATIONS (Uber Style)
// =======================

const LOCATIONS = [
  // AIRPORTS
  { name: "Los Cabos International Airport (SJD)", type: "airport" },

  // MARINAS / TOWNS
  { name: "Cabo San Lucas Marina", type: "marina" },
  { name: "Cabo San Lucas Downtown", type: "town" },
  { name: "San José del Cabo Downtown", type: "town" },
  { name: "Medano Beach", type: "beach" },

  // RESTAURANTS POPULARES
  { name: "Sunset Monalisa", type: "restaurant" },
  { name: "Flora Farms", type: "restaurant" },
  { name: "Acre Restaurant", type: "restaurant" },
  { name: "Edith's", type: "restaurant" },
  { name: "El Farallon", type: "restaurant" },
  { name: "Jazz on the Rocks at Sunset Point", type: "restaurant" },
  { name: "RosaNegra Cabo", type: "restaurant" },
  { name: "Taboo Cabo", type: "restaurant" },
  { name: "Manta (The Cape Hotel)", type: "restaurant" },
  { name: "Nobu Restaurant Cabo", type: "restaurant" },

  // HOTELS
  { name: "Montage Los Cabos", type: "hotel" },
  { name: "Waldorf Astoria Pedregal", type: "hotel" },
  { name: "Hard Rock Hotel Los Cabos", type: "hotel" },
  { name: "Nobu Hotel Los Cabos", type: "hotel" },
  { name: "One&Only Palmilla", type: "hotel" },
  { name: "Grand Velas Los Cabos", type: "hotel" },
  { name: "Secrets Puerto Los Cabos", type: "hotel" },
  { name: "Hyatt Ziva Los Cabos", type: "hotel" },
  { name: "Hilton Los Cabos", type: "hotel" },
  { name: "Chileno Bay Resort", type: "hotel" },
  { name: "The Cape, a Thompson Hotel", type: "hotel" },
  { name: "Pueblo Bonito Sunset Beach", type: "hotel" },
  { name: "Riu Palace Cabo San Lucas", type: "hotel" },

  // BEACH CLUBS
  { name: "Mango Deck", type: "club" },
  { name: "The Office on the Beach", type: "club" },
  { name: "Cachet Beach Club", type: "club" },

  // PLACES / MALLS
  { name: "Puerto Paraíso Mall", type: "mall" },
  { name: "Luxury Avenue Mall", type: "mall" },
  { name: "Cabo del Sol", type: "resort" },
  { name: "Chileno Bay", type: "beach" },
];

// ICONS for autocomplete
const ICONS = {
  airport: "✈️",
  hotel: "🏨",
  restaurant: "🍽️",
  town: "🏙️",
  marina: "⛵",
  mall: "🛍️",
  club: "🎉",
  beach: "🏖️",
  resort: "🌅",
  default: "📍"
};

// =======================
// UBER STYLE AUTOCOMPLETE
// =======================

function setupAutocomplete(inputId, dropdownId) {
  const input = document.getElementById(inputId);
  const dropdown = document.getElementById(dropdownId);

  input.addEventListener("input", () => {
    const val = input.value.toLowerCase();
    dropdown.innerHTML = "";

    if (val.length < 1) {
      dropdown.style.display = "none";
      return;
    }

    const matches = LOCATIONS.filter(loc => loc.name.toLowerCase().includes(val));

    matches.forEach(loc => {
      const div = document.createElement("div");
      div.className = "autocomplete-item";
      div.innerHTML = `${ICONS[loc.type] || ICONS.default} ${loc.name}`;
      div.onclick = () => {
        input.value = loc.name;
        dropdown.style.display = "none";
      };
      dropdown.appendChild(div);
    });

    dropdown.style.display = matches.length ? "block" : "none";
  });

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target) && e.target !== input) {
      dropdown.style.display = "none";
    }
  });
}

setupAutocomplete("pickupPreset", "pickupDropdown");
setupAutocomplete("destinationPreset", "destinationDropdown");

// =======================
// SERVICE UI (Round Trip etc.)
// =======================

function updateServiceUI() {
  const sv = serviceTypeEl.value;

  selectedServiceNameEl.textContent = sv || "None selected";
  selectedServicePriceEl.textContent = SERVICE_PRICES[sv] || "—";

  if (sv === "Round Trip") {
    returnDateWrapper.style.display = "block";
    returnTimeWrapper.style.display = "block";
    hoursWrapper.style.display = "none";
  } 
  else if (sv === "Open Service (per hour)") {
    hoursWrapper.style.display = "block";
    returnDateWrapper.style.display = "none";
    returnTimeWrapper.style.display = "none";
  }
  else { 
    returnDateWrapper.style.display = "none";
    returnTimeWrapper.style.display = "none";
    hoursWrapper.style.display = "none";
  }
}

serviceTypeEl.addEventListener("change", updateServiceUI);
updateServiceUI();

// =======================
// FECHAS OCUPADAS (RESTORED)
// =======================

// Retrieve disabled dates
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

// Render blocked dates
function renderUnavailableList() {
  if (disabledDates.length === 0) {
    unavailableListEl.textContent = "All dates available.";
    return;
  }

  unavailableListEl.innerHTML = "";
  disabledDates.forEach(d => {
    const div = document.createElement("div");
    div.textContent = d;
    unavailableListEl.appendChild(div);
  });
}

renderUnavailableList();

// Flatpickr
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
// FORM SUBMIT
// =======================

bookingForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const reservation = {
    name: name.value.trim(),
    phone: phone.value.trim(),
    email: email.value.trim(),
    serviceType: serviceTypeEl.value,
    passengers: passengers.value.trim(),
    pickup: pickupPreset.value.trim(),
    destination: destinationPreset.value.trim(),
    date: date.value,
    time: time.value,
    returnDate: returnDate.value,
    returnTime: returnTime.value,
    hours: hours.value,
    notes: notes.value
  };

  if (!reservation.name || !reservation.phone || !reservation.email ||
      !reservation.serviceType || !reservation.pickup || !reservation.destination ||
      !reservation.date || !reservation.time) {
    showAlert("Please complete all required fields.", true);
    return;
  }

  if (reservation.serviceType === "Round Trip" &&
      (!reservation.returnDate || !reservation.returnTime)) {
    showAlert("Please enter return date and time.", true);
    return;
  }

  // Save reservation
  let saved = JSON.parse(localStorage.getItem("reservations")) || [];
  saved.push(reservation);
  localStorage.setItem("reservations", JSON.stringify(saved));

  // Update disabled dates
  disabledDates = getDisabledDates();
  datePicker.set("disable", disabledDates);
  returnDatePicker.set("disable", disabledDates);
  renderUnavailableList();

  // Send email
  emailjs.send("service_8zcytcr", "template_7tkwggo", {
      ...reservation,
      to_email: "ridewmecabo@gmail.com"
    })
    .then(() => {
      sendWhatsApp(reservation);
      showAlert("Your reservation has been sent!");
      bookingForm.reset();
      updateServiceUI();
    })
    .catch(() => {
      showAlert("Error sending reservation.", true);
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

  if (r.returnDate && r.returnTime)
    msg += `Return: ${r.returnDate} at ${r.returnTime}%0A`;

  if (r.hours)
    msg += `Hours: ${r.hours}%0A`;

  if (r.notes)
    msg += `%0ANotes: ${r.notes}%0A`;

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
}
