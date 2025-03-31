"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function CrudPage() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("http://localhost:5000/protected", { credentials: "include" })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Not authenticated");
      })
      .then((data) => {
        setUser(data.user);
        setIsAuthenticated(true);
      })
      .catch(() => setIsAuthenticated(false));

    fetch("http://localhost:5000/api/items", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setItems(data))
      .catch((err) => console.error("Error fetching items:", err));
  }, [isAuthenticated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:5000/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
      credentials: "include",
    });
    if (!res.ok) return alert("Failed to save item");
    const newItem = await res.json();
    setItems([...items, newItem]);
    setName("");
  };

  const handleEdit = (id, name) => {
    setEditingId(id);
    setEditingName(name);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingName) return alert("Name cannot be empty.");
    try {
      const res = await fetch(`http://localhost:5000/api/items/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingName }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update item");
      const updatedItem = await res.json();
      setItems(items.map((item) => (item._id === updatedItem._id ? updatedItem : item)));
      setEditingId(null);
      setEditingName("");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/items/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete item");
      setItems(items.filter((item) => item._id !== id));
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLogout = async () => {
    const res = await fetch("http://localhost:5000/logout", {
      method: "POST",
      credentials: "include",
    });
    if (res.ok) {
      setIsAuthenticated(false);
      alert("Logged out successfully!");
      router.replace("/login"); 
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-400 p-6">
      <div className="max-w-2xl w-full bg-white shadow-xl rounded-lg p-6 relative">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }} 
          className="text-3xl font-bold text-center text-gray-800 mb-6"
        >
          CRUD Items
        </motion.h1>

        {!isAuthenticated ? (
          <motion.button
            onClick={() => router.push("/login")}
            className="bg-green-500 text-white px-5 py-2 rounded-lg hover:bg-green-600 w-full transition-all"
            whileHover={{ scale: 1.05 }}
          >
            Login
          </motion.button>
        ) : (
          <motion.div className="flex justify-between items-center mb-4">
            <p className="text-lg font-semibold">Welcome, {user?.username}</p>
            <motion.button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all"
              whileHover={{ scale: 1.05 }}
            >
              Logout
            </motion.button>
          </motion.div>
        )}

        {isAuthenticated && (
          <motion.form 
            onSubmit={editingId ? handleUpdate : handleSubmit} 
            className="flex gap-3 mb-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <input
              type="text"
              value={editingId ? editingName : name}
              onChange={(e) => (editingId ? setEditingName(e.target.value) : setName(e.target.value))}
              placeholder="Enter item name"
              required
              className="flex-grow p-2 border rounded-lg focus:ring focus:ring-blue-300 transition-all"
            />
            <motion.button
              type="submit"
              className={`px-4 py-2 rounded-lg text-white ${editingId ? "bg-yellow-500 hover:bg-yellow-600" : "bg-blue-500 hover:bg-blue-600"} transition-all`}
              whileHover={{ scale: 1.05 }}
            >
              {editingId ? "Update" : "Add"}
            </motion.button>
          </motion.form>
        )}

        <ul className="space-y-3">
          <AnimatePresence>
            {items.length > 0 ? (
              items.map((item) => (
                <motion.li 
                  key={item._id} 
                  className="flex justify-between items-center p-3 bg-gray-100 rounded-lg shadow-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="text-lg font-medium">{item.name}</span>
                  <div className="flex gap-2">
                    <motion.button
                      onClick={() => handleEdit(item._id, item.name)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition-all"
                      whileHover={{ scale: 1.1 }}
                    >
                      ✏️ Edit
                    </motion.button>
                    <motion.button
                      onClick={() => handleDelete(item._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-all"
                      whileHover={{ scale: 1.1 }}
                    >
                      ❌ Delete
                    </motion.button>
                  </div>
                </motion.li>
              ))
            ) : (
              <p className="text-center text-gray-500">No items found.</p>
            )}
          </AnimatePresence>
        </ul>
      </div>
    </div>
  );
}
