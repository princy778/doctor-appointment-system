const USERS_KEY = "dbs_users";
const SLOTS_KEY = "dbs_slots";
const APPOINTMENTS_KEY = "dbs_appointments";

function read(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function sanitizeUser(user) {
  const safe = { ...user };
  delete safe.passwordHash;
  return safe;
}

export function getUsers() {
  return read(USERS_KEY);
}

export function getDoctors() {
  return getUsers()
    .filter((u) => u.role === "doctor")
    .map(sanitizeUser);
}

export function updateDoctorProfile(userId, { name, specialization }) {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) throw new Error("User not found.");
  users[idx].username = name.trim() || users[idx].username;
  users[idx].specialization = specialization.trim() || "General Practitioner";
  write(USERS_KEY, users);
  return sanitizeUser(users[idx]);
}

export function updatePatientProfile(userId, info) {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) throw new Error("User not found.");
  users[idx].phone = info.phone?.trim();
  users[idx].age = info.age;
  users[idx].gender = info.gender;
  users[idx].bloodGroup = info.bloodGroup?.trim();
  users[idx].address = info.address?.trim();
  write(USERS_KEY, users);
  return sanitizeUser(users[idx]);
}

export function getDoctorSlots(doctorId) {
  return read(SLOTS_KEY)
    .filter((s) => s.doctorId === doctorId)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
}

export function getDoctorFreeSlots(doctorId) {
  return getDoctorSlots(doctorId).filter((s) => !s.bookedById);
}

export function addSlot(doctorId, date, time) {
  const slots = read(SLOTS_KEY);
  const exists = slots.find(
    (s) => s.doctorId === doctorId && s.date === date && s.time === time
  );
  if (exists) throw new Error("This date and time slot already exists.");
  const slot = {
    id: crypto.randomUUID(),
    doctorId,
    date,
    time,
    bookedById: null,
    appointmentId: null,
    createdAt: new Date().toISOString(),
  };
  slots.push(slot);
  write(SLOTS_KEY, slots);
  return slot;
}

export function removeSlot(slotId) {
  const slots = read(SLOTS_KEY);
  const slot = slots.find((s) => s.id === slotId);
  if (slot && slot.bookedById) throw new Error("Cannot remove a booked slot.");
  write(
    SLOTS_KEY,
    slots.filter((s) => s.id !== slotId)
  );
}

export function getAppointments(doctorId) {
  return read(APPOINTMENTS_KEY)
    .filter((a) => a.doctorId === doctorId)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
}

export function getPatientAppointments(patientId) {
  return read(APPOINTMENTS_KEY)
    .filter((a) => a.patientId === patientId)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
}

export function bookAppointment({
  doctorId,
  doctorName,
  patientId,
  patientName,
  slotId,
  date,
  time,
  reason,
}) {
  const slots = read(SLOTS_KEY);
  const slot = slots.find((s) => s.id === slotId);
  if (!slot) throw new Error("Slot not found.");
  if (slot.bookedById) throw new Error("This slot is already booked.");
  const appointment = {
    id: crypto.randomUUID(),
    doctorId,
    doctorName,
    patientId,
    patientName,
    slotId,
    date,
    time,
    reason: reason.trim() || "General consultation",
    status: "upcoming",
    createdAt: new Date().toISOString(),
  };
  slot.bookedById = patientId;
  slot.appointmentId = appointment.id;
  write(SLOTS_KEY, slots);
  const apps = read(APPOINTMENTS_KEY);
  apps.push(appointment);
  write(APPOINTMENTS_KEY, apps);
  return appointment;
}

export function deleteAppointment(appointmentId) {
  let slots = read(SLOTS_KEY);
  slots = slots.map((s) =>
    s.appointmentId === appointmentId
      ? { ...s, bookedById: null, appointmentId: null }
      : s
  );
  write(SLOTS_KEY, slots);
  write(
    APPOINTMENTS_KEY,
    read(APPOINTMENTS_KEY).filter((a) => a.id !== appointmentId)
  );
}

export function rescheduleAppointment(appointmentId, newDate, newTime) {
  const apps = read(APPOINTMENTS_KEY);
  const app = apps.find((a) => a.id === appointmentId);
  if (!app) throw new Error("Appointment not found.");
  const slots = read(SLOTS_KEY);
  const newSlot = slots.find(
    (s) =>
      s.doctorId === app.doctorId &&
      s.date === newDate &&
      s.time === newTime &&
      !s.bookedById
  );
  if (!newSlot) throw new Error("That date and time is not available.");
  const oldSlot = slots.find((s) => s.id === app.slotId);
  if (oldSlot) {
    oldSlot.bookedById = null;
    oldSlot.appointmentId = null;
  }
  newSlot.bookedById = app.patientId;
  newSlot.appointmentId = app.id;
  app.slotId = newSlot.id;
  app.date = newDate;
  app.time = newTime;
  app.updatedAt = new Date().toISOString();
  write(SLOTS_KEY, slots);
  write(APPOINTMENTS_KEY, apps);
  return app;
}

export function setAppointmentStatus(appointmentId, status) {
  const apps = read(APPOINTMENTS_KEY);
  const app = apps.find((a) => a.id === appointmentId);
  if (!app) throw new Error("Appointment not found.");
  app.status = status;
  write(APPOINTMENTS_KEY, apps);
  if (status === "cancelled") {
    const slots = read(SLOTS_KEY);
    const slot = slots.find((s) => s.id === app.slotId);
    if (slot) {
      slot.bookedById = null;
      slot.appointmentId = null;
    }
    write(SLOTS_KEY, slots);
  }
  return app;
}