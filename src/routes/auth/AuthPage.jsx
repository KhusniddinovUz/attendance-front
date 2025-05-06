import '../../styles/auth.css';
import logo from '../../assets/logo.png';
import {useState} from "react";
import clsx from "clsx";
import {useDispatch, useSelector} from "react-redux";
import {login, adminLogin} from "../../store/authSlice";
import {toast, ToastContainer} from "react-toastify";
import {useNavigate} from "react-router";


const AuthPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector(state => state.auth.isLoading);
  const [loginName, setLoginName] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerUser, setRegisterUser] = useState({
    username: "", password: ""
  });
  const [mode, setMode] = useState(true);
  const [bulletActiveIndex, setBulletActiveIndex] = useState(1);
  const [imageActiveIndex, setImageActiveIndex] = useState(1);
  const [textGroupStyle, setTextGroupStyle] = useState({transform: "translateY(0)"})
  const loader = <div className="loader"></div>


  const inputFocusHandler = (e) => {
    e.target.classList.add("active");
  };
  const inputBlurHandler = (e) => {
    if (e.target.value !== "") return;
    e.target.classList.remove("active");
  };
  const toggleClickHandler = () => {
    if (mode === false) {
      setMode(true);
    } else {
      setMode(false);
    }
  };
  const moveSlider = (index) => {
    setImageActiveIndex(index);
    setBulletActiveIndex(parseInt(index));
    setTextGroupStyle({transform: `translateY(${-(index - 1) * 2.2}rem)`});
  };
  const loginHandler = async () => {
    let warningMsg = [];
    if (loginName === "") warningMsg.push("loginni");
    if (loginPassword === "") warningMsg.push("parolni");
    if (warningMsg.length > 0) {
      const last = warningMsg.pop();
      let prompt = warningMsg.length ? `${warningMsg.join(", ")} va ${last} kiriting` : `${last} kiriting`;
      prompt = prompt.charAt(0).toUpperCase() + prompt.slice(1);
      toast.warning(prompt, {
        style: {fontFamily: "Poppins"},
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    } else {
      try {
        await dispatch(login({
          username: loginName, password: loginPassword,
        })).unwrap();
      } catch (err) {
        toast.error(err["non_field_errors"][0], {
          style: {fontFamily: "Poppins"},
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
      }
    }

  };
  const registerHandler = async () => {
    let warningMsg = [];
    if (registerUser["username"] === "") warningMsg.push("loginni");
    if (registerUser["password"] === "") warningMsg.push("parolni");
    if (warningMsg.length > 0) {
      const last = warningMsg.pop();
      let prompt = warningMsg.length ? `${warningMsg.join(", ")} va ${last} kiriting` : `${last} kiriting`;
      prompt = prompt.charAt(0).toUpperCase() + prompt.slice(1);
      prompt = prompt.charAt(0).toUpperCase() + prompt.slice(1);
      toast.warning(prompt, {
        style: {fontFamily: "Poppins"},
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    } else if (registerUser["password"].length < 8) {
      toast.warning("Parol kamida 8ta simvol bo'lishi kerak", {
        style: {fontFamily: "Poppins"},
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    } else {
      try {
        await dispatch(adminLogin(registerUser)).unwrap();
        navigate("/dashboard");
      } catch (err) {
        toast.warning(err["non_field_errors"][0], {
          style: {fontFamily: "Poppins"},
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
      }
    }
  };


  return (<div>
    <main id="auth-main" className={clsx({"sign-up-mode": mode})}>
      <div className="box">
        <div className="inner-box">
          <div className="forms-wrap">
            <form action="index.html" autoComplete="off" className="sign-in-form">
              <div className="logo">
                <img src={logo} alt="easyclass"/>
                <h4>Namangan Pedagogik Mahorat Markazi</h4>
              </div>

              <div className="heading">
                <h2>Xush kelibsiz</h2>
                <button
                    type="button"
                    onClick={toggleClickHandler}
                    className="toggle">
                  Adminlar uchun kirish
                </button>
              </div>

              <div className="actual-form">
                <div className="input-wrap">
                  <input
                      onChange={(e) => setLoginName(e.target.value.trim())}
                      onFocus={inputFocusHandler}
                      onBlur={inputBlurHandler}
                      className="input-field"
                      type="text"
                      minLength="4"
                      autoComplete="off"
                      required
                  />
                  <label>Login</label>
                </div>

                <div className="input-wrap">
                  <input
                      onChange={(e) => setLoginPassword(e.target.value)}
                      onFocus={inputFocusHandler}
                      onBlur={inputBlurHandler}
                      className="input-field"
                      type="password"
                      minLength="4"
                      autoComplete="off"
                      required
                  />
                  <label>Parol</label>
                </div>
                <button type={"button"} onClick={loginHandler}
                        className="sign-btn">{loading ? loader : "KIRISH"}
                </button>
              </div>
            </form>

            <form action="index.html" autoComplete="off" className="sign-up-form">
              <div className="logo">
                <img src={logo} alt="easyclass"/>
                <h4>Namangan Pedagogik Mahorat Markazi</h4>
              </div>

              <div className="heading">
                <h2>Xush kelibsiz</h2>
                <h6>O'qituvchilar uchun</h6>
                <button
                    type="button"
                    onClick={toggleClickHandler}
                    className="toggle">Kirish
                </button>
              </div>

              <div className="actual-form">
                <div className="input-wrap">
                  <input
                      onChange={(e) => setRegisterUser({
                        ...registerUser, username: e.target.value.trim()
                      })}
                      onFocus={inputFocusHandler}
                      onBlur={inputBlurHandler}
                      className="input-field"
                      type="text"
                      minLength="4"
                      autoComplete="off"
                      required
                  />
                  <label>Login</label>
                </div>

                <div className="input-wrap">
                  <input
                      onChange={(e) => setRegisterUser({
                        ...registerUser, password: e.target.value
                      })}
                      onFocus={inputFocusHandler}
                      onBlur={inputBlurHandler}
                      className="input-field"
                      type="password"
                      minLength="8"
                      autoComplete="off"
                      required
                  />
                  <label>Parol</label>
                </div>
                <button onClick={registerHandler} type="button"
                        className="sign-btn">{loading ? loader : "KIRISH"}
                </button>
              </div>
            </form>
          </div>

          <div className="carousel">
            <div className="images-wrapper">
              {[1, 2, 3].map((item) => <img
                  src={logo}
                  key={item}
                  alt=""
                  className={clsx("image", `img-${item}`, {"show": imageActiveIndex === item})}
              />)}
            </div>

            <div className="text-slider">
              <div className="text-wrap">
                <div className="text-group" style={textGroupStyle}>
                  <h2>Darslarni nazorat qilish</h2>
                  <h2>O'quvchilarni kuzatib borish</h2>
                  <h2>Qulay jadvallar</h2>
                </div>
              </div>

              <div className="bullets">
                {[1, 2, 3].map((item) => <span
                    key={item}
                    onClick={() => moveSlider(item)}
                    className={clsx({"active": bulletActiveIndex === item})}
                />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    <ToastContainer/>
  </div>);
};

export default AuthPage;
