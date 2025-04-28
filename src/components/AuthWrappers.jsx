import {useSelector} from "react-redux";
import {Navigate} from "react-router";

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
