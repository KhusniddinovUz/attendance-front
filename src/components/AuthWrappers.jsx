import {useSelector} from "react-redux";
import {Navigate} from "react-router";

export const TeacherOnlyWrapper = ({children}) => {
  const isAdmin = useSelector(state => state.auth.user["is_staff"])
  if (isAdmin) {
    return <Navigate to="/dashboard" replace={true}/>
  }
  return children;
};

export const AdminOnlyWrapper = ({children}) => {
  const isAdmin = useSelector(state => state.auth.user["is_staff"])
  if (!isAdmin) {
    return <Navigate to="/" replace={true}/>
  }
  return children;
}

export const RequireAuthWrapper = ({children}) => {
  const isAuth = useSelector(state => state.auth.isLoggedIn);

  if (!isAuth) {
    return <Navigate to="/auth" replace={true}/>
  }
  return children;
};

export const RedirectIfAuthWrapper = ({children}) => {
  const isAuth = useSelector(state => state.auth.isLoggedIn);
  if (isAuth) {
    return <Navigate to="/" replace={true}/>
  }
  return children;
};
