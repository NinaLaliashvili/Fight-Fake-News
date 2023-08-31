import { NavLink, Route, Routes } from "react-router-dom";

import { FactFictionView } from "./FactFiction/FactFictionView";
import { UsersView } from "./Users/UsersView";
import { LeaderboardAdmin } from "./Leaderboard/LeaderboardAdmin";
import "./index.css";

export const AdminView = () => {
  return (
    <div className="admin-container">
      
      <h1>Admin View</h1>
      <div className="admin-nav-buttons">
      <NavLink to="users" className="admin-navlink">
        Users
      </NavLink>
      <NavLink to="factfiction" className="admin-navlink">
        Facts and Fictions
      </NavLink>
      <NavLink to="leaderboardadmin" className="admin-navlink">
        Leaderboard
      </NavLink>
      </div>
    

      <Routes>
        <Route path="/users" element={<UsersView />} />
        <Route path="/factfiction" element={<FactFictionView />} />
        <Route path="/leaderboardadmin" element={<LeaderboardAdmin />} />
      </Routes>
    </div>
  );
};
