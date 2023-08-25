import { NavLink, Route, Routes, useNavigate } from "react-router-dom";

import { FactFictionView } from "./FactFiction/FactFictionView";
import { UsersView } from "./Users/UsersView";

export const AdminView = () => {
  const navigate = useNavigate();
  return (
    <>
      <button onClick={() => navigate("/")}>Back to Home</button>
      <h1>Admin View</h1>
      <NavLink to="users">Users</NavLink>
      <NavLink to="factfiction">Facts and Fictions</NavLink>

      <Routes>
        <Route path="/users" element={<UsersView />} />
        <Route path="/factfiction" element={<FactFictionView />} />
      </Routes>
    </>
  );
};
