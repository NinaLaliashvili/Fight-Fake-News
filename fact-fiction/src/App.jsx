import "./App.css";
import {
  NavLink,
  Route,
  Routes,
  useLocation,
  Navigate,
} from "react-router-dom";
import HomeComponent from "./Components/Home/HomeComponent";
import QuizComponent from "./Components/Quiz/QuizComponent";
import ResultComponent from "./Components/Results/ResultsComponent";
import LeaderboardComponent from "./Components/Leaderboard/LeaderboardComponent";
import SubmitFactComponent from "./Components/SubmitFact/SubmitFactComponent";

function App() {
  return (
    <div className="App">
      <NavLink to="/"></NavLink>
      <NavLink to="quiz"></NavLink>
      <NavLink to="results"></NavLink>
      <NavLink to="leaderboard"></NavLink>
      <NavLink to="submit-fact"></NavLink>
      <div className="routes">
        <Routes>
          <Route path="/" element={<HomeComponent />}></Route>
          <Route path="quiz" element={<QuizComponent />}></Route>
          <Route path="results" element={<ResultComponent />}></Route>
          <Route path="leaderboard" element={<LeaderboardComponent />}></Route>
          <Route path="submit-fact" element={<SubmitFactComponent />}></Route>
        </Routes>
      </div>
    </div>
  );
}

export default App;
