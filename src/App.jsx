import './App.css'
import HomePage from "./routes/home/HomePage.jsx";
import AuthPage from "./routes/auth/AuthPage.jsx";
import AttendancePage from "./routes/attendance/AttendancePage.jsx";
import AdminDashboard from "./routes/dashboard/adminDashboard.jsx";
import {Routes, Route} from "react-router";
import {RedirectIfAuthWrapper, RequireAuthWrapper} from "./components/AuthWrappers";

const App = () => {
  return (<Routes>
    <Route index path="/"
           element={<RequireAuthWrapper><HomePage/></RequireAuthWrapper>}/>
    <Route path="dashboard"
           element={<RequireAuthWrapper><AdminDashboard/></RequireAuthWrapper>}/>
    <Route path="auth"
           element={<RedirectIfAuthWrapper><AuthPage/></RedirectIfAuthWrapper>}/>
    <Route path="attendance/:group_name/:date/:para"
           element={<RequireAuthWrapper><AttendancePage/></RequireAuthWrapper>}/>
  </Routes>);
}

export default App;
