export const cardStyle = {
  background: "var(--bg)",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  border: "1px solid var(--border)",
  textAlign: "left",
};

export const inputStyle = {
  width: "100%",
  padding: "10px",
  margin: "6px 0 12px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  boxSizing: "border-box",
  fontSize: "15px",
};

export const btnStyle = {
  padding: "8px 14px",
  borderRadius: "8px",
  border: "none",
  background: "var(--accent)",
  color: "#fff",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "600",
};

export const primaryBtn = (fullWidth) => ({
  ...btnStyle,
  width: fullWidth ? "100%" : "auto",
  padding: fullWidth ? "12px" : "8px 14px",
  fontSize: fullWidth ? "16px" : "14px",
});

export const ghostBtn = (color) => ({
  padding: "6px 12px",
  borderRadius: "8px",
  border: `1px solid ${color}`,
  color,
  background: "transparent",
  cursor: "pointer",
});

export const tabStyle = (active) => ({
  padding: "10px 18px",
  borderRadius: "8px",
  cursor: "pointer",
  border: active ? "2px solid var(--accent)" : "1px solid var(--border)",
  background: active ? "var(--accent-bg)" : "transparent",
  fontWeight: "600",
  color: "var(--text-h)",
});

export const labelStyle = { textAlign: "left", display: "block", fontWeight: "600" };

export const formCardStyle = {
  background: "var(--bg)",
  padding: "30px",
  width: "360px",
  borderRadius: "12px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
  textAlign: "left",
};

export const pageStyle = {
  padding: "40px 16px",
  maxWidth: "860px",
  margin: "0 auto",
};

export const logoutBtnStyle = {
  padding: "10px 18px",
  borderRadius: "8px",
  border: "1px solid var(--border)",
  background: "transparent",
  cursor: "pointer",
  color: "var(--text-h)",
};

export const tabRowStyle = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  marginBottom: "20px",
};