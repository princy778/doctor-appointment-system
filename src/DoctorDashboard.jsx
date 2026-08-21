import { useState } from "react";
import { logoutUser } from "./auth";
import {
  updateDoctorProfile,
  getDoctorSlots,
  addSlot,
  removeSlot,
  getAppointments,
  deleteAppointment,
  rescheduleAppointment,
  setAppointmentStatus,
} from "./store";
import {
  cardStyle,
  inputStyle,
  btnStyle,
  tabStyle,
  tabRowStyle,
  pageStyle,
  logoutBtnStyle,
  ghostBtn,
} from "./styles";

const TIME_SLOTS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
];

function ProfileTab({ user, onUserUpdate }) {
  const [name, setName] = useState(user.username || "");
  const [specialization, setSpecialization] = useState(user.specialization || "");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const updated = updateDoctorProfile(user.id, { name, specialization });
    onUserUpdate(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={cardStyle}>
      <h2 style={{ marginTop: 0 }}>Profile</h2>
      <label style={{ fontWeight: "600" }}>Name</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        style={inputStyle}
      />
      <label style={{ fontWeight: "600" }}>Specialization</label>
      <input
        type="text"
        value={specialization}
        onChange={(e) => setSpecialization(e.target.value)}
        placeholder="e.g. Cardiologist, Dermatologist"
        style={inputStyle}
      />
      <button onClick={handleSave} style={btnStyle}>
        Save Profile
      </button>
      {saved && (
        <p style={{ color: "#2e7d32", margin: "10px 0 0" }}>Profile saved.</p>
      )}
    </div>
  );
}

function SlotsTab({ user }) {
  const [slots, setSlots] = useState(() => getDoctorSlots(user.id));
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  const refresh = () => setSlots(getDoctorSlots(user.id));

  const handleAdd = () => {
    setMessage({ type: "", text: "" });
    if (!date || !time) {
      setMessage({ type: "error", text: "Please pick a date and a time slot." });
      return;
    }
    try {
      addSlot(user.id, date, time);
      setDate("");
      setTime("");
      refresh();
      setMessage({ type: "success", text: "Slot added." });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  const handleRemove = (slotId) => {
    try {
      removeSlot(slotId);
      refresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  return (
    <div style={cardStyle}>
      <h2 style={{ marginTop: 0 }}>Set Available Time Slots</h2>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ ...inputStyle, width: "auto" }}
        />
        <select
          value={time}
          onChange={(e) => setTime(e.target.value)}
          style={{ ...inputStyle, width: "auto" }}
        >
          <option value="">Select time...</option>
          {TIME_SLOTS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <button onClick={handleAdd} style={btnStyle}>
          Add Slot
        </button>
      </div>
      {message.text && (
        <p
          style={{
            color: message.type === "error" ? "#d32f2f" : "#2e7d32",
            margin: "10px 0",
          }}
        >
          {message.text}
        </p>
      )}
      {slots.length === 0 ? (
        <p style={{ marginTop: "12px" }}>
          No slots yet. Add dates and times patients can book.
        </p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, marginTop: "12px" }}>
          {slots.map((s) => (
            <li
              key={s.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <span>
                {s.date} at {s.time}{" "}
                {s.bookedById ? (
                  <strong style={{ color: "#d32f2f" }}>— Booked</strong>
                ) : (
                  <span style={{ color: "#2e7d32" }}>— Free</span>
                )}
              </span>
              {!s.bookedById && (
                <button onClick={() => handleRemove(s.id)} style={ghostBtn("#d32f2f")}>
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AppointmentRow({ appointment, onChanged }) {
  const [rescheduling, setRescheduling] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [error, setError] = useState("");

  const handleReschedule = () => {
    setError("");
    if (!newDate || !newTime) {
      setError("Pick a new date and time.");
      return;
    }
    try {
      rescheduleAppointment(appointment.id, newDate, newTime);
      setRescheduling(false);
      onChanged();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleComplete = () => {
    setAppointmentStatus(appointment.id, "completed");
    onChanged();
  };

  return (
    <li
      style={{
        padding: "12px",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", flexWrap: "wrap" }}>
        <div>
          <strong>{appointment.patientName}</strong> — {appointment.date} at{" "}
          {appointment.time}
          <div style={{ fontSize: "14px", color: "var(--text)" }}>
            {appointment.reason}
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            onClick={handleComplete}
            style={ghostBtn("#2e7d32")}
          >
            Complete
          </button>
          <button
            onClick={() => setRescheduling(!rescheduling)}
            style={ghostBtn("var(--accent)")}
          >
            Reschedule
          </button>
          <button
            onClick={() => {
              deleteAppointment(appointment.id);
              onChanged();
            }}
            style={ghostBtn("#d32f2f")}
          >
            Delete
          </button>
        </div>
      </div>
      {rescheduling && (
        <div style={{ marginTop: "10px", padding: "10px", background: "var(--code-bg)", borderRadius: "8px" }}>
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            style={{ ...inputStyle, width: "auto" }}
          />
          <select
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            style={{ ...inputStyle, width: "auto" }}
          >
            <option value="">Select time...</option>
            {TIME_SLOTS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <button onClick={handleReschedule} style={btnStyle}>
            Confirm Reschedule
          </button>
          {error && (
            <p style={{ color: "#d32f2f", fontSize: "14px", margin: "8px 0 0" }}>{error}</p>
          )}
        </div>
      )}
    </li>
  );
}

function AppointmentsTab({ user }) {
  const [appointments, setAppointments] = useState(() =>
    getAppointments(user.id).filter((a) => a.status === "upcoming")
  );

  const refresh = () =>
    setAppointments(
      getAppointments(user.id).filter((a) => a.status === "upcoming")
    );

  return (
    <div style={cardStyle}>
      <h2 style={{ marginTop: 0 }}>Upcoming Appointments</h2>
      {appointments.length === 0 ? (
        <p>No upcoming appointments. Patients can book your free time slots.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {appointments.map((a) => (
            <AppointmentRow key={a.id} appointment={a} onChanged={refresh} />
          ))}
        </ul>
      )}
    </div>
  );
}

function HistoryTab({ user }) {
  const [history] = useState(() =>
    getAppointments(user.id).filter((a) => a.status !== "upcoming")
  );

  return (
    <div style={cardStyle}>
      <h2 style={{ marginTop: 0 }}>Appointment History</h2>
      {history.length === 0 ? (
        <p>No past appointments yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {history.map((a) => (
            <li
              key={a.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <span>
                {a.patientName} — {a.date} at {a.time} ({a.reason})
              </span>
              <strong
                style={{
                  color: a.status === "completed" ? "#2e7d32" : "#d32f2f",
                }}
              >
                {a.status}
              </strong>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function DoctorDashboard({ user, onLogout, onUserUpdate }) {
  const [tab, setTab] = useState("profile");

  const handleLogout = () => {
    logoutUser();
    onLogout();
  };

  return (
    <div style={pageStyle}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "32px", margin: 0 }}>Doctor Dashboard</h1>
          <p style={{ color: "var(--text)", fontSize: "15px" }}>
            Welcome, Dr. {user.username} · {user.email} ·{" "}
            {user.specialization || "No specialization set"}
          </p>
        </div>
        <button onClick={handleLogout} style={logoutBtnStyle}>
          Logout
        </button>
      </header>

      <div style={tabRowStyle}>
        <button style={tabStyle(tab === "profile")} onClick={() => setTab("profile")}>
          Profile
        </button>
        <button style={tabStyle(tab === "slots")} onClick={() => setTab("slots")}>
          Time Slots
        </button>
        <button style={tabStyle(tab === "appointments")} onClick={() => setTab("appointments")}>
          Appointments
        </button>
        <button style={tabStyle(tab === "history")} onClick={() => setTab("history")}>
          History
        </button>
      </div>

      {tab === "profile" && <ProfileTab user={user} onUserUpdate={onUserUpdate} />}
      {tab === "slots" && <SlotsTab user={user} />}
      {tab === "appointments" && <AppointmentsTab user={user} />}
      {tab === "history" && <HistoryTab user={user} />}
    </div>
  );
}

export default DoctorDashboard;