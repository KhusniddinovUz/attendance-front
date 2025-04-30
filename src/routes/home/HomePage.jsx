import '../../styles/home.css';
import {useEffect, useState} from "react";
import {useSelector, useDispatch} from "react-redux";
import {getGroups, createLesson} from "../../store/groupSlice.js";
import {updateUserInfo} from "../../store/authSlice.js"
import QRCode from "react-qr-code";
import axios from "axios";
import {url} from "../../data/api.js";
import {toast, ToastContainer} from "react-toastify";
import {logout} from "../../store/authSlice";
import {useNavigate} from "react-router";

const HomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const subjects = useSelector(state => state.auth.user["subjects"]);
  const [showQRCode, setShowQRCode] = useState(false);
  const loading = useSelector(state => state.group.isLoading);
  const groups = useSelector(state => state.group.groups);
  const [lesson, setLesson] = useState({
    name: "notchosen", group_name: "notchosen", date: "", para: "notchosen",
  });
  const token = useSelector(state => state.auth.token);
  const username = useSelector(state => state.auth.user["name"]);
  const [attendanceList, setAttendanceList] = useState([]);
  const loader = <div className="loader"></div>


  useEffect(() => {
    const updateUserInfoHandler = async () => {
      try {
        dispatch(updateUserInfo(token));
      } catch (error) {
        console.error('Error fetching user info:', error.response ? error.response.data : error.message);
      }
    }
    const getGroupsHandler = async () => {
      try {
        dispatch(getGroups(token));
      } catch (error) {
        console.error('Error fetching groups:', error.response ? error.response.data : error.message);
      }
    };
    getGroupsHandler();
    updateUserInfoHandler()
  }, [dispatch, token]);

  useEffect(() => {
    const now = new Date();
    setLesson(prevState => ({
      ...prevState,
      date: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
    }))
  }, [lesson["group_name"]]);

  const generateButtonHandler = async () => {
    let missing = [];
    if (lesson["name"] === "notchosen") missing.push("fan nomini")
    if (lesson["group_name"] === "notchosen") missing.push("guruhni")
    if (lesson["para"] === "notchosen") missing.push("parani")
    if (missing.length > 0) {
      const last = missing.pop();
      let prompt = missing.length ? `${missing.join(", ")} va ${last} tanlang` : `${last} tanlang`;
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
      const resp = await dispatch(createLesson({lesson: lesson, token: token})).unwrap();
      setAttendanceList(resp);
      setShowQRCode(true);
    }
  };

  const studentAttendanceHandler = async (student, lesson_name, status) => {
    axios.put(`${url}/api/attendance/update/`, {
      lesson_name: lesson_name, student_name: student, status: status,
    }).catch(err => {
      console.log(err);
    })
  };

  const logoutHandler = () => {
    dispatch(logout());
    navigate("/auth");
  }

  return (<div id="homepage">
    <nav id="home-navbar">
      <div id="qrcode-form">
        <div className="select-wrap">
          <select
              defaultValue=""
              onChange={e => {
                setLesson(prevState => ({
                  ...prevState, name: e.target.value
                }));
                setShowQRCode(false);
              }}>
            <option value="" disabled={true} hidden>Fanni tanlash</option>
            {subjects && subjects.split(",").map(subject => <option value={subject}
                                                                    key={subject}>{subject}</option>)}
          </select>
          <svg xmlns="http://www.w3.org/2000/svg" height="32" width="20"
               viewBox="0 0 320 512">
            <path fill="#374151"
                  d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8L32 192c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z"/>
          </svg>
        </div>
        <div className="select-wrap">
          <select
              defaultValue=""
              onChange={e => {
                setLesson(prevState => ({
                  ...prevState, group_name: e.target.value
                }));
                setShowQRCode(false);
              }}>
            <option value="" disabled={true} hidden>Guruhni tanlash</option>
            {groups.map(group => <option value={group.id}
                                         key={group.id}>{group.name}</option>)}
          </select>
          <svg xmlns="http://www.w3.org/2000/svg" height="32" width="20"
               viewBox="0 0 320 512">
            <path fill="#374151"
                  d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8L32 192c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z"/>
          </svg>
        </div>
        <div className="select-wrap">
          <select
              defaultValue=""
              onChange={e => {
                setLesson(prevState => ({
                  ...prevState, para: e.target.value
                }));
                setShowQRCode(false);
              }}>
            <option value="" disabled={true} hidden>Para</option>
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
          </select>
          <svg xmlns="http://www.w3.org/2000/svg" height="32" width="20"
               viewBox="0 0 320 512">
            <path fill="#374151"
                  d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8L32 192c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z"/>
          </svg>
        </div>
      </div>
      <div id='home-logut'>
        <h3>{username}</h3>
        <svg onClick={logoutHandler} xmlns="http://www.w3.org/2000/svg"
             viewBox="0 0 512 512">
          <path fill="#374151"
                d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 192 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l210.7 0-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l128-128zM160 96c17.7 0 32-14.3 32-32s-14.3-32-32-32L96 32C43 32 0 75 0 128L0 384c0 53 43 96 96 96l64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-64 0c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32l64 0z"/>
        </svg>
      </div>
    </nav>
    <button className="qrcode-generate-button"
            onClick={generateButtonHandler}>{loading ? loader : "Yaratish"}</button>
    <div id="qr-code">
      {showQRCode && (<QRCode
          value={`http://localhost:5173/attendance/${lesson["name"]}/${lesson["group_name"]}/${lesson["date"]}/${lesson["para"]}`}
          size={256}/>)}
    </div>
    {showQRCode && (<main className="table" id="customers_table">
      <section className="table__body">
        <p id="table-info">{lesson.name} - {lesson.date}</p>
        <table>
          <thead>
          <tr>
            <th> O'QUVCHI ISM FAMILYASI</th>
            <th> STATUS</th>
            <th> DAVOMAT</th>
          </tr>
          </thead>
          <tbody>
          {attendanceList.length > 0 && attendanceList.map(item => (
              <tr key={item["student_name"]}>
                <td> {item["student_name"]}</td>
                <td>
              <span style={{cursor: "default"}}
                    className="table-button absent status-button">{item["status"]}</span>
                </td>
                <td>
                  <div className="table-buttons-wrapper">
                    <span
                        onClick={() => studentAttendanceHandler(item["student_name"], lesson["name"], "+")}
                        className="present table-button">+</span>
                    <span
                        onClick={() => studentAttendanceHandler(item["student_name"], lesson["name"], "-")}
                        className="absent table-button">-</span>
                  </div>
                </td>
              </tr>))}
          {/*<tr>*/}
          {/*  <td> Shakhobiddin Khusniddinov</td>*/}
          {/*  <td>*/}
          {/*    <span style={{cursor: "default"}}*/}
          {/*          className="table-button absent status-button">-</span>*/}
          {/*  </td>*/}
          {/*  <td>*/}
          {/*    <div className="table-buttons-wrapper">*/}
          {/*      <span className="present table-button">+</span>*/}
          {/*      <span className="absent table-button">-</span>*/}
          {/*    </div>*/}
          {/*  </td>*/}
          {/*</tr>*/}
          </tbody>
        </table>
      </section>
    </main>)}
    <ToastContainer/>
  </div>)
};

export default HomePage;
