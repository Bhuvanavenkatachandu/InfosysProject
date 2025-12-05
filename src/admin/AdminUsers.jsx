import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyJWT } from "../utils/jwt";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = verifyJWT(token);
    if (!user || user.role !== "admin") return navigate("/login");

    setCurrentAdmin(user);
    const storedUsers = JSON.parse(localStorage.getItem("users")) || [];
    setUsers(storedUsers);
  }, [navigate]);

  const superAdminEmail = localStorage.getItem("superAdminEmail");

  const saveUsers = (updated) => {
    setUsers(updated);
    localStorage.setItem("users", JSON.stringify(updated));
  };

  const editUser = (index) => {
    const user = users[index];
    const newName = prompt("New name:", user.name);
    const newEmail = prompt("New email:", user.email);

    if (!newName || !newEmail) return;

    const updated = [...users];
    updated[index] = { ...user, name: newName, email: newEmail };
    saveUsers(updated);

    // If super admin changed their email, update reference
    if (user.email === superAdminEmail) {
      localStorage.setItem("superAdminEmail", newEmail);
    }
  };

  const removeUser = (index) => {
    const user = users[index];

    // Only super admin can delete another admin
    if (user.role === "admin") {
      if (!superAdminEmail || currentAdmin.email !== superAdminEmail) {
        alert("Only the first (super) admin can remove other admins.");
        return;
      }
      if (user.email === superAdminEmail) {
        alert("Super admin cannot delete themselves.");
        return;
      }
    }

    const updated = users.filter((_, i) => i !== index);
    saveUsers(updated);
  };

  const approveAdmin = (index) => {
    if (!superAdminEmail || currentAdmin.email !== superAdminEmail) {
      return alert("Only the first (super) admin can approve admin requests.");
    }

    const updated = [...users];
    if (updated[index].role === "pending-admin") {
      updated[index] = {
        ...updated[index],
        role: "admin",
        requestedAdmin: false,
      };
      saveUsers(updated);
      alert("User promoted to admin.");
    }
  };

  const revokeAdmin = (index) => {
    if (!superAdminEmail || currentAdmin.email !== superAdminEmail) {
      return alert("Only the first (super) admin can revoke admin access.");
    }

    const updated = [...users];
    const user = updated[index];

    if (user.email === superAdminEmail) {
      alert("Cannot revoke super admin.");
      return;
    }

    updated[index] = {
      ...user,
      role: "user",
      requestedAdmin: false,
    };
    saveUsers(updated);
    alert("Admin rights revoked. User is now a normal user.");
  };

  return (
    <div className="container">
      <h2>All Registered Users</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th><th>Email</th><th>Role</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, i) => (
            <tr key={i}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>
                {u.email === superAdminEmail
                  ? "Super Admin"
                  : u.role === "pending-admin"
                  ? "Pending Admin"
                  : u.role}
              </td>
              <td>
                <button
                  onClick={() => editUser(i)}
                  style={{ background: "orange", color: "white", marginRight: 6 }}
                >
                  Edit
                </button>

                <button
                  onClick={() => removeUser(i)}
                  style={{ background: "red", color: "white", marginRight: 6 }}
                >
                  Delete
                </button>

                {u.role === "pending-admin" && (
                  <button
                    onClick={() => approveAdmin(i)}
                    style={{ background: "green", color: "white", marginRight: 6 }}
                  >
                    Approve as Admin
                  </button>
                )}

                {u.role === "admin" && u.email !== superAdminEmail && (
                  <button
                    onClick={() => revokeAdmin(i)}
                    style={{ background: "#6b21a8", color: "white" }}
                  >
                    Revoke Admin
                  </button>
                )}
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan="4">No users yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUsers;
