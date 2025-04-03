"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CrudPage() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/items", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch items");
      }

      const data = await res.json();
      setItems(data);
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return alert("Item name is required.");

    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `http://localhost:5000/api/items/${editingId}`
      : "http://localhost:5000/api/items";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Failed to ${editingId ? "update" : "create"} item`);
      }

      fetchItems();
      resetForm();
    } catch (err) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setDescription("");
  };

  const handleDelete = async (id) => {
    console.log("Attempting to delete ID:", id);

    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/items/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      console.log("Delete Response:", data);

      if (!res.ok) {
        console.error("❌ Server Response Error:", data);
        throw new Error(data.error || "Failed to delete item");
      }

      fetchItems();
    } catch (err) {
      console.error("Delete Error:", err.message);
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:5000/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Logout failed");
      setTimeout(() => router.push("/login"), 500);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="max-w-xl w-full bg-white shadow-lg rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Item Manager</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition duration-200"
          >
            Logout
          </button>
        </div>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="mb-4">
          <input
            type="text"
            placeholder="Item Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded mb-2"
            required
          />
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded mb-2"
          />
          <button
            type="submit"
            className={`w-full py-2 rounded mt-2 ${
              editingId ? "bg-yellow-500 hover:bg-yellow-600" : "bg-blue-500 hover:bg-blue-600"
            } text-white transition duration-200`}
          >
            {editingId ? "Update" : "Add"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 rounded mt-2 transition duration-200"
            >
              Cancel
            </button>
          )}
        </form>

        {loading && <p className="text-center text-gray-500">Loading...</p>}

        <ul>
          {items.map((item) => (
            <li key={item._id} className="flex justify-between items-center bg-gray-200 p-3 rounded mb-2">
              <div>
                <p className="text-lg font-semibold">{item.name}</p>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingId(item._id);
                    setName(item.name);
                    setDescription(item.description || "");
                  }}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded transition duration-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition duration-200"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
