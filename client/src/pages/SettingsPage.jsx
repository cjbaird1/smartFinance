import React, { useState } from "react";
import { NavLink, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { auth } from "../firebase";

const tabs = [
  { name: "Profile", path: "/settings/profile" },
  { name: "Subscription", path: "/settings/subscription" },
  { name: "Backtesting", path: "/settings/backtesting" },
  { name: "Spreads & Commissions", path: "/settings/spreads" },
];

function SettingsLayout() {
  const location = useLocation();
  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-1">Account Settings</h1>
      <div className="text-gray-400 mb-6">{auth.currentUser?.email || ""}</div>
      <div className="flex border-b border-gray-700 mb-8">
        {tabs.map(tab => (
          <NavLink
            key={tab.name}
            to={tab.path}
            className={({ isActive }) =>
              `px-6 py-3 -mb-px border-b-2 transition font-medium text-sm md:text-base ${
                isActive || location.pathname === tab.path
                  ? "border-blue-500 text-white"
                  : "border-transparent text-gray-400 hover:text-blue-400"
              }`
            }
            end
          >
            {tab.name}
          </NavLink>
        ))}
      </div>
      <div className="rounded-xl shadow-lg p-8 border border-gray-800" style={{ background: 'var(--bg-panel)' }}>
        <Routes>
          <Route path="profile" element={<ProfileSection />} />
          <Route path="subscription" element={<StubSection title="Subscription" />} />
          <Route path="backtesting" element={<StubSection title="Backtesting" />} />
          <Route path="spreads" element={<StubSection title="Spreads & Commissions" />} />
          <Route path="*" element={<Navigate to="profile" replace />} />
        </Routes>
      </div>
    </div>
  );
}

function ProfileSection() {
  const user = auth.currentUser;
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  // Save display name
  const handleSave = async () => {
    setSaving(true);
    setSaveMsg("");
    try {
      await user.updateProfile({ displayName });
      setSaveMsg("Saved!");
    } catch (e) {
      setSaveMsg("Error saving name.");
    }
    setSaving(false);
  };

  // Change password
  const handleChangePassword = async () => {
    setPwError("");
    setPwSuccess("");
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPwError("All fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("Passwords do not match.");
      return;
    }
    if (oldPassword === newPassword) {
      setPwError("Old and new password cannot be equal.");
      return;
    }
    // Firebase requires re-auth before password change
    try {
      const credential = window.firebase.auth.EmailAuthProvider.credential(
        user.email,
        oldPassword
      );
      await user.reauthenticateWithCredential(credential);
      await user.updatePassword(newPassword);
      setPwSuccess("Password changed successfully.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e) {
      setPwError(e.message || "Error changing password.");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
      <div className="flex items-center mb-6">
        {/* Avatar stub */}
        <div className="w-20 h-20 rounded-full bg-purple-500 flex items-center justify-center text-3xl font-bold text-white relative">
          {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
          <button className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-1 border-2 border-white text-white text-xs" title="Change avatar" disabled>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 20h14M12 4v16m8-8H4" /></svg>
          </button>
        </div>
        <div className="ml-8 flex-1">
          <label className="block text-sm text-gray-400 mb-1">Name</label>
          <input
            type="text"
            className="w-full px-4 py-2 rounded bg-black text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600 mb-2"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
          />
          <button
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition text-sm font-medium"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
          {saveMsg && <span className="ml-4 text-green-400 text-sm">{saveMsg}</span>}
        </div>
      </div>
      <hr className="my-8 border-gray-700" />
      <h3 className="text-lg font-semibold mb-2">Password & Security</h3>
      <div className="mb-2 text-gray-400 text-sm">Keep your account secure by regularly changing your password.</div>
      <div className="max-w-md">
        <label className="block text-sm text-gray-400 mb-1">Old password</label>
        <input
          type="password"
          className="w-full px-4 py-2 rounded bg-black text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600 mb-2"
          value={oldPassword}
          onChange={e => setOldPassword(e.target.value)}
        />
        <label className="block text-sm text-gray-400 mb-1">New password</label>
        <input
          type="password"
          className="w-full px-4 py-2 rounded bg-black text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600 mb-2"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
        />
        <label className="block text-sm text-gray-400 mb-1">Confirm password</label>
        <input
          type="password"
          className="w-full px-4 py-2 rounded bg-black text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600 mb-4"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
        />
        {pwError && <div className="text-red-500 text-sm mb-2">{pwError}</div>}
        {pwSuccess && <div className="text-green-400 text-sm mb-2">{pwSuccess}</div>}
        <button
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition text-sm font-medium"
          onClick={handleChangePassword}
          type="button"
        >
          Change password
        </button>
      </div>
    </div>
  );
}

function StubSection({ title }) {
  return <div className="text-gray-400 text-lg">{title} section coming soon.</div>;
}

export default SettingsLayout; 