import '../../styles/auth.css';
import logo from '../../assets/logo.png';
import {useState} from "react";
import clsx from "clsx";
import {useDispatch} from "react-redux";
import {login, register} from "../../store/authSlice";


const AuthPage = () => {
  const [loginName, setLoginName] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerUser, setRegisterUser] = useState({
    username: "", password: "", name: ""
  });
  const dispatch = useDispatch();
  const [mode, setMode] = useState(false);
  const [bulletActiveIndex, setBulletActiveIndex] = useState(1);
  const [imageActiveIndex, setImageActiveIndex] = useState(1);
  const [textGroupStyle, setTextGroupStyle] = useState({transform: "translateY(0)"})

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
  const loginHandler = () => {
    dispatch(login({
      username: loginName, password: loginPassword,
    })).then(res => {
      console.log(res);
    }).catch(err => {
      console.log(err);
    });
  };
  const registerHandler = () => {
    dispatch(register(registerUser)).then(res => {
      console.log(res);
    }).catch(err => {
      console.log(err);
    })
  };


  return (<div>
    <main className={clsx({"sign-up-mode": mode})}>
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
                  Ro'yxatdan o'tish
                </button>
              </div>

              <div className="actual-form">
                <div className="input-wrap">
                  <input
                      onChange={(e) => setLoginName(e.target.value)}
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
                        className="sign-btn">KIRISH
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
                <h6>Ro'yxatdan o'tganmisiz?</h6>
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
                        ...registerUser, name: e.target.value
                      })}
                      onFocus={inputFocusHandler}
                      onBlur={inputBlurHandler}
                      className="input-field"
                      type="text"
                      minLength="4"
                      autoComplete="off"
                      required
                  />
                  <label>Ism familiya</label>
                </div>

                <div className="input-wrap">
                  <input
                      onChange={(e) => setRegisterUser({
                        ...registerUser, username: e.target.value
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
                      minLength="4"
                      autoComplete="off"
                      required
                  />
                  <label>Parol</label>
                </div>
                <button onClick={registerHandler} type="button"
                        className="sign-btn">RO'YXATDAN O'TISH
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
  </div>);
};

export default AuthPage;
