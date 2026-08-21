import { useState } from "react";
import { logoutUser } from "./auth";
import {
  updatePatientProfile,
  getDoctors,
  getDoctorFreeSlots,
  bookAppointment,
  getPatientAppointments,
  setAppointmentStatus,
  rescheduleAppointment,
  deleteAppointment,
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

function ProfileTab({ user, onUserUpdate }) {
  const [phone, setPhone] = useState(user.phone || "");
  const [age, setAge] = useState(user.age || "");
  const [gender, setGender] = useState(user.gender || "");
  const [bloodGroup, setBloodGroup] = useState(user.bloodGroup || "");
  const [address, setAddress] = useState(user.address || "");
  const [message, setMessage] = useState({ type: "", text: "" });

  const handlePhoneChange = (e) => {
    setMessage({ type: "", text: "" });
    setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
  };

  const handleSave = () => {
    setMessage({ type: "", text: "" });
    if (phone.length !== 10) {
      setMessage({
        type: "error",
        text: "Phone number must be exactly 10 digits.",
      });
      return;
    }
    const updated = updatePatientProfile(user.id, {
      phone,
      age: age ? Number(age) : "",
      gender,
      bloodGroup,
      address,
    });
    onUserUpdate(updated);
    setMessage({ type: "success", text: "Profile saved." });
    setTimeout(() => setMessage({ type: "", text: "" }), 2000);
  };

  return (
    <div style={cardStyle}>
      <h2 style={{ marginTop: 0 }}>Profile</h2>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 200px" }}>
          <label style={{ fontWeight: "600" }}>Phone (10 digits)</label>
          <input
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={handlePhoneChange}
            placeholder="e.g. 5551234567"
            maxLength={10}
            style={inputStyle}
          />
        </div>
        <div style={{ flex: "1 1 120px" }}>
          <label style={{ fontWeight: "600" }}>Age</label>
          <input
            type="number"
            min="1"
            max="120"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div style={{ flex: "1 1 140px" }}>
          <label style={{ fontWeight: "600" }}>Gender</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            style={inputStyle}
          >
            <option value="">Select</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div style={{ flex: "1 1 140px" }}>
          <label style={{ fontWeight: "600" }}>Blood Group</label>
          <input
            type="text"
            value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
            placeholder="e.g. O+"
            style={inputStyle}
          />
        </div>
      </div>
      <label style={{ fontWeight: "600" }}>Address</label>
      <input
        type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="e.g. 123 Main St, Springfield"
        style={inputStyle}
      />
      <button onClick={handleSave} style={btnStyle}>
        Save Profile
      </button>
      {message.text && (
        <p
          style={{
            color: message.type === "error" ? "#d32f2f" : "#2e7d32",
            margin: "10px 0 0",
          }}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}

function BookTab({ user }) {
  const [doctors, setDoctors] = useState(() => getDoctors());
  const [selectedSlot, setSelectedSlot] = useState({});
  const [reason, setReason] = useState({});
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleBook = (doc) => {
    const slotId = selectedSlot[doc.id];
    if (!slotId) {
      setMessage({
        type: "error",
        text: `Please choose a time slot for Dr. ${doc.username}.`,
      });
      return;
    }
    const slot = getDoctorFreeSlots(doc.id).find((s) => s.id === slotId);
    if (!slot) {
      setMessage({
        type: "error",
        text: "That slot is no longer available. Please pick another.",
      });
      setDoctors(getDoctors());
      return;
    }
    try {
      bookAppointment({
        doctorId: doc.id,
        doctorName: doc.username,
        patientId: user.id,
        patientName: user.username,
        slotId,
        date: slot.date,
        time: slot.time,
        reason: reason[doc.id] || "General consultation",
      });
      setDoctors(getDoctors());
      setSelectedSlot({});
      setReason({});
      setMessage({
        type: "success",
        text: `Appointment booked with Dr. ${doc.username} on ${slot.date} at ${slot.time}.`,
      });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  return (
    <div>
      {message.text && (
        <p
          style={{
            color: message.type === "error" ? "#d32f2f" : "#2e7d32",
            margin: "0 0 16px",
          }}
        >
          {message.text}
        </p>
      )}
      {doctors.length === 0 ? (
        <div style={cardStyle}>
          <p>No doctors have signed up yet. Check back soon.</p>
        </div>
      ) : (
        doctors.map((doc) => {
          const slots = getDoctorFreeSlots(doc.id);
          return (
            <div key={doc.id} style={{ ...cardStyle, marginBottom: "16px" }}>
              <h2 style={{ marginTop: 0 }}>Dr. {doc.username}</h2>
              <p>
                <strong>{doc.specialization || "General Practitioner"}</strong>
              </p>
              {doc.availability && <p>Availability: {doc.availability}</p>}
              {slots.length === 0 ? (
                <p style={{ fontSize: "14px" }}>
                  No available slots right now.
                </p>
              ) : (
                <div>
                  <label style={{ fontWeight: "600" }}>Select a date and time</label>
                  <select
                    value={selectedSlot[doc.id] || ""}
                    onChange={(e) =>
                      setSelectedSlot({ ...selectedSlot, [doc.id]: e.target.value })
                    }
                    style={inputStyle}
                  >
                    <option value="">Choose a time slot...</option>
                    {slots.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.date} at {s.time}
                      </option>
                    ))}
                  </select>
                  <label style={{ fontWeight: "600" }}>Reason (optional)</label>
                  <input
                    type="text"
                    value={reason[doc.id] || ""}
                    onChange={(e) =>
                      setReason({ ...reason, [doc.id]: e.target.value })
                    }
                    placeholder="e.g. Chest pain checkup"
                    style={inputStyle}
                  />
                  <button onClick={() => handleBook(doc)} style={btnStyle}>
                    Book Appointment
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

function AppointmentRow({ appointment, onChanged }) {
  const [rescheduling, setRescheduling] = useState(false);
  const [slots, setSlots] = useState([]);
  const [error, setError] = useState("");

  const toggleReschedule = () => {
    setError("");
    if (rescheduling) {
      setRescheduling(false);
      return;
    }
    setSlots(getDoctorFreeSlots(appointment.doctorId));
    setRescheduling(true);
  };

  const handlePickSlot = (slot) => {
    try {
      rescheduleAppointment(appointment.id, slot.date, slot.time);
      setRescheduling(false);
      onChanged();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <li style={{ padding: "12px", borderBottom: "1px solid var(--border)" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <strong>Dr. {appointment.doctorName}</strong> — {appointment.date} at{" "}
          {appointment.time}
          <div style={{ fontSize: "14px", color: "var(--text)" }}>
            {appointment.reason}
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            onClick={toggleReschedule}
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
          <button
            onClick={() => {
              setAppointmentStatus(appointment.id, "cancelled");
              onChanged();
            }}
            style={ghostBtn("var(--border)")}
          >
            Cancel
          </button>
        </div>
      </div>
      {rescheduling && (
        <div
          style={{
            marginTop: "10px",
            padding: "10px",
            background: "var(--code-bg)",
            borderRadius: "8px",
          }}
        >
          <p style={{ margin: "0 0 8px", fontSize: "14px" }}>
            Pick a new slot from Dr. {appointment.doctorName}&apos;s availability:
          </p>
          {slots.length === 0 ? (
            <p style={{ fontSize: "14px", margin: 0 }}>
              No other free slots available right now.
            </p>
          ) : (
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {slots.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handlePickSlot(s)}
                  style={ghostBtn("var(--accent)")}
                >
                  {s.date} {s.time}
                </button>
              ))}
            </div>
          )}
          {error && (
            <p style={{ color: "#d32f2f", fontSize: "14px", margin: "8px 0 0" }}>
              {error}
            </p>
          )}
        </div>
      )}
    </li>
  );
}

function AppointmentsTab({ user }) {
  const [appointments, setAppointments] = useState(() =>
    getPatientAppointments(user.id).filter((a) => a.status === "upcoming")
  );

  const refresh = () =>
    setAppointments(
      getPatientAppointments(user.id).filter((a) => a.status === "upcoming")
    );

  return (
    <div style={cardStyle}>
      <h2 style={{ marginTop: 0 }}>My Appointments</h2>
      {appointments.length === 0 ? (
        <p>You have no upcoming appointments.</p>
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
    getPatientAppointments(user.id).filter((a) => a.status !== "upcoming")
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
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <span>
                Dr. {a.doctorName} — {a.date} at {a.time} ({a.reason})
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

function PatientDashboard({ user, onLogout, onUserUpdate }) {
  const [tab, setTab] = useState("book");

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
          <h1 style={{ fontSize: "32px", margin: 0 }}>Patient Dashboard</h1>
          <p style={{ color: "var(--text)", fontSize: "15px" }}>
            Welcome, {user.username} · {user.email}
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
        <button style={tabStyle(tab === "book")} onClick={() => setTab("book")}>
          Book Appointment
        </button>
        <button style={tabStyle(tab === "appointments")} onClick={() => setTab("appointments")}>
          My Appointments
        </button>
        <button style={tabStyle(tab === "history")} onClick={() => setTab("history")}>
          History
        </button>
      </div>

      {tab === "profile" && <ProfileTab user={user} onUserUpdate={onUserUpdate} />}
      {tab === "book" && <BookTab user={user} />}
      {tab === "appointments" && <AppointmentsTab user={user} />}
      {tab === "history" && <HistoryTab user={user} />}
    </div>
  );
}

export default PatientDashboard;