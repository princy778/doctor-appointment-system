import { useState } from "react";
import Login from "./Login";
import Signup from "./signup";
import DoctorDashboard from "./DoctorDashboard";
import PatientDashboard from "./PatientDashboard";
import { getCurrentUser, logoutUser } from "./auth";

function App() {
  const [user, setUser] = useState(getCurrentUser);
  const [page, setPage] = useState("login");

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setPage("login");
  };

  if (user) {
    return user.role === "doctor" ? (
      <DoctorDashboard user={user} onLogout={handleLogout} onUserUpdate={setUser} />
    ) : (
      <PatientDashboard user={user} onLogout={handleLogout} onUserUpdate={setUser} />
    );
  }

  if (page === "signup") {
    return <Signup onSignup={setUser} onSwitch={() => setPage("login")} />;
  }

  return <Login onLogin={setUser} onSwitch={() => setPage("signup")} />;
}

export default App;