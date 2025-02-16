import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css"; // Import the separate CSS file

const API_URL = "http://localhost:5000/users";

function App() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(API_URL);
      setUsers(res.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await axios.put(`${API_URL}/${editingUser._id}`, { name, email });
      } else {
        await axios.post(API_URL, { name, email });
      }
      setName("");
      setEmail("");
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleEdit = (user) => {
    setName(user.name);
    setEmail(user.email);
    setEditingUser(user);
  };

  return (
    <div className="app-container">
      <div className="card">
        <h1>User Management</h1>
        <form onSubmit={handleSubmit} className="user-form">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">
            {editingUser ? "Update" : "Add"}
          </button>
        </form>
        <ul className="user-list">
          {users.map((user) => (
            <li key={user._id}>
              <span>
                {user.name} ({user.email})
              </span>
              <div className="button-group">
                <button onClick={() => handleEdit(user)} className="edit-btn">
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(user._id)}
                  className="delete-btn"
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

export default App;
