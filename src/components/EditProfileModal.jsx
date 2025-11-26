import { useState, useEffect } from "react";
import { postJSON, uploadFile } from "/utils/api";

export default function EditProfileModal({ isOpen, onClose, user, onSave }) {
  const defaultAvatar = "http://localhost/educonnect-backend/uploads/default-profile.png";

  const [fullName, setFullName] = useState(user?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(
    user?.avatar_url ? `http://localhost/educonnect-backend/${user.avatar_url}` : defaultAvatar
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setFullName(user?.full_name || "");
    setEmail(user?.email || "");
    setPreview(user?.avatar_url ? `http://localhost/educonnect-backend/${user.avatar_url}` : defaultAvatar);
  }, [user]);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      let res;

      if (avatar) {
        // File upload
        const formData = new FormData();
        if (fullName.trim()) formData.append("full_name", fullName.trim());
        if (email.trim()) formData.append("email", email.trim());
        if (password.trim()) formData.append("password", password.trim());
        formData.append("profile_image", avatar);

        res = await uploadFile("update_profile.php", formData);
      } else {
        // JSON request
        const payload = {};
        if (fullName.trim()) payload.full_name = fullName.trim();
        if (email.trim()) payload.email = email.trim();
        if (password.trim()) payload.password = password.trim();

        res = await postJSON("update_profile.php", payload);
      }

      if (res.success) {
        const updatedUser = {
          ...user,
          full_name: res.user.full_name || fullName,
          email: res.user.email || email,
          avatar_url: res.user.avatar_url || user.avatar_url,
        };
        onSave(updatedUser);

        setMessage("✅ Profile updated successfully!");
        setPassword("");
        setAvatar(null);
        setTimeout(() => onClose(), 1200);
      } else {
        setMessage(`⚠️ ${res.message || "Update failed."}`);
      }
    } catch (err) {
      console.error("Update error:", err);
      setMessage("⚠️ Network or server error. Make sure your backend is running and CORS is enabled.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

      <div className="relative bg-white rounded-xl shadow-lg w-full max-w-md p-6 z-10">
        <h2 className="text-xl font-semibold text-blue-700 mb-4">Edit Profile</h2>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center">
            <img
              src={preview}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border border-gray-300 mb-2"
            />
            <label className="text-sm text-blue-600 cursor-pointer hover:underline">
              Change Photo
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border rounded-md px-3 py-2 focus:ring focus:ring-blue-200 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-md px-3 py-2 focus:ring focus:ring-blue-200 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password (optional)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border rounded-md px-3 py-2 focus:ring focus:ring-blue-200 outline-none"
            />
          </div>

          {message && (
            <p className={`text-sm text-center ${message.startsWith("✅") ? "text-green-600" : "text-red-500"}`}>
              {message}
            </p>
          )}

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
