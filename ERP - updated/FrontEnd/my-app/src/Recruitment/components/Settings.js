import React, { useContext } from "react";
import "../styles/Settings.css";
import { DarkModeContext } from "../Assets/DarkModeContext"; // Import context

const Settings = () => {
  const { darkMode, setDarkMode } = useContext(DarkModeContext);

  return (
    <div className="settings-container">
      <h1>Settings</h1>
      <p>Manage your account and application settings here.</p>

      <div className="settings-section">
        <h3>Account Settings</h3>
        <label>
          Username: <input type="text" placeholder="Change username" />
        </label>
        <label>
          Email: <input type="email" placeholder="Change email" />
        </label>
        <label>
          Password: <input type="password" placeholder="New password" />
        </label>
        <button>Save Changes</button>
      </div>

      <div className="settings-section">
        <h3>Application Preferences</h3>
        <label>
          <input
            type="checkbox"
            checked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
          />{" "}
          Enable Dark Mode
        </label>
        <button onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "Disable" : "Enable"} Dark Mode
        </button>
      </div>
    </div>
  );
};

export default Settings;
