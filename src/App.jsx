import './App.css'
import HomePage from "./routes/home/HomePage.jsx";
import AuthPage from "./routes/auth/AuthPage.jsx";
import AttendancePage from "./routes/attendance/AttendancePage.jsx";
import AdminDashboard from "./routes/dashboard/adminDashboard.jsx";
import {Routes, Route} from "react-router";
import {
  AdminOnlyWrapper, RedirectIfAuthWrapper, RequireAuthWrapper, TeacherOnlyWrapper
} from "./components/AuthWrappers";

const App = () => {
  return (<Routes>
    <Route index path="/"
           element={
             <RequireAuthWrapper>
               <TeacherOnlyWrapper>
                 <HomePage/>
               </TeacherOnlyWrapper>
             </RequireAuthWrapper>}
    />
    <Route path="dashboard"
           element={
             <RequireAuthWrapper>
               <AdminOnlyWrapper>
                 <AdminDashboard/>
               </AdminOnlyWrapper>
             </RequireAuthWrapper>}
    />
    <Route path="auth"
           element={
             <RedirectIfAuthWrapper>
               <AuthPage/>
             </RedirectIfAuthWrapper>}
    />
    <Route path="attendance/:group_name/:date/:para"
           element={
             <RequireAuthWrapper>
               <AttendancePage/>
             </RequireAuthWrapper>}
    />
  </Routes>);
}

export default App;
