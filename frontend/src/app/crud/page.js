"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CrudPage() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // ✅ Fetch items on component mount
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/items", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch items");
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error("Error fetching items:", err);
    }
    setLoading(false);
  };

  // ✅ Handle form submission (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return alert("Item name is required.");

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `http://localhost:5000/api/items/${editingId}` : "http://localhost:5000/api/items";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
        credentials: "include",
      });

      if (!res.ok) throw new Error(`Failed to ${editingId ? "update" : "create"} item`);
      fetchItems();
      setEditingId(null);
      setName("");
      setDescription("");
    } catch (err) {
      console.error("Error saving item:", err);
    }
  };

  // ✅ Handle delete action
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/items/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to delete item");
      fetchItems();
    } catch (err) {
      console.error("Error deleting item:", err);
    }
  };

  // ✅ Handle logout
  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:5000/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Logout failed");
      router.push("/login"); // Redirect to login page after logout
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="max-w-xl w-full bg-white shadow-lg rounded-lg p-6">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Item Manager</h1>
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">
            Logout
          </button>
        </div>

        {/* Form */}
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
          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded">
            {editingId ? "Update" : "Add"}
          </button>
        </form>

        {/* Loading Indicator */}
        {loading && <p className="text-center text-gray-500">Loading...</p>}

        {/* Item List */}
        <ul>
          {items.map((item) => (
            <li key={item._id} className="flex justify-between items-center bg-gray-200 p-3 rounded mb-2">
              <div>
                <p className="text-lg font-semibold">{item.name}</p>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditingId(item._id); setName(item.name); setDescription(item.description || ""); }} className="bg-yellow-500 text-white px-3 py-1 rounded">
                  Edit
                </button>
                <button onClick={() => handleDelete(item._id)} className="bg-red-500 text-white px-3 py-1 rounded">
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
