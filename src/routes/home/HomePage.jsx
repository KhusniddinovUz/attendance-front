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
import {turnOn, turnOff, selectAttendanceState} from "../../store/attendanceSlice.js";
import clsx from "clsx";
import dayjs from "dayjs";
import Countdown from "react-countdown";

const HomePage = () => {
  const {isActive, expiresAt, requestData} = useSelector(selectAttendanceState);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector(state => state.group.isLoading);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const groups = useSelector(state => state.group.groups);
  const [lesson, setLesson] = useState(requestData);
  const token = useSelector(state => state.auth.token);
  const username = useSelector(state => state.auth.user["name"]);
  const teacher_name = useSelector(state => state.auth.user["id"]);
  const [attendanceList, setAttendanceList] = useState([]);
  const loader = <div className="loader"></div>;
  const [isTeacherLate, setIsTeacherLate] = useState(false);

  useEffect(() => {
    if (!expiresAt) return;

    const now = Date.now();
    const remaining = expiresAt - now;

    if (remaining <= 0) {
      dispatch(turnOff());
      setAttendanceList([]);
      setIsTeacherLate(false);
      return;
    }

    const timeout = setTimeout(() => {
      dispatch(turnOff());
      setAttendanceList([]);
      setIsTeacherLate(false);
    }, remaining);

    return () => clearTimeout(timeout); // cleanup on unmount or re-run
  }, [expiresAt, dispatch]);

  useEffect(() => {
    const updateUserInfoHandler = async () => {
      try {
        await dispatch(updateUserInfo(token)).unwrap();
        setLesson(prevState => ({
          ...prevState, teacher_name: teacher_name,
        }))
      } catch (error) {
        console.error('Error fetching user info:', error);
        dispatch(logout());
      }
    }
    const getGroupsHandler = async () => {
      try {
        dispatch(getGroups(token));
      } catch (error) {
        console.error('Error fetching groups:', error);
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

  useEffect(() => {
    if (!isActive) return;
    const fetchData = async () => {
      axios.get(`${url}/api/attendance/get/`, {
        params: {
          "lesson_name": requestData["name"],
          "group_name": requestData["group_name"],
          "date": requestData["date"],
          "para": requestData["para"],
        },
      }).then(async res => {
        const fetchedData = await res.data;
        setAttendanceList(fetchedData);
        const teacher_name = fetchedData[0]["teacher_name"];
        if (teacher_name.slice(-6) === "(LATE)") {
          setIsTeacherLate(true);
        } else {
          setIsTeacherLate(false);
        }
      }).catch(err => {
        console.log(err);
      });
    };

    fetchData();

    const interval = setInterval(fetchData, 3000); // Fetch every 3s

    return () => clearInterval(interval); // Clean up on unmount
  }, [isActive])

  const generateButtonHandler = async () => {
    let missing = [];
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
      try {
        const resp = await dispatch(createLesson({
          lesson: lesson, token: token
        })).unwrap();
        setAttendanceList(resp);
        const expirationTimer = lesson["para"] === "1" ? 900000 : 300000;
        // const expirationTimer = 60000;
        dispatch(turnOn({lesson: lesson, expirationTimer: expirationTimer}));
      } catch (e) {
        toast.error(e["non_field_errors"][0], {
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

  const studentAttendanceHandler = async (student, status) => {
    setAttendanceLoading(true);
    axios.put(`${url}/api/attendance/update/`, {
      student_name: student,
      status: status,
      para: lesson["para"],
      date: lesson["date"],
      group_name: lesson["group_name"],
    }).catch(err => {
      console.log(err);
    }).then(res => {
      setAttendanceList(res.data);
      setAttendanceLoading(false);
    })
  };

  const logoutHandler = () => {
    dispatch(logout());
    dispatch(turnOff());
    setAttendanceList([]);
    navigate("/auth");
  }

  return (
      <div id="homepage">
        <nav id="home-navbar">
          <div id="qrcode-form">
            <div className="select-wrap">
              <select
                  disabled={isActive}
                  defaultValue=""
                  onChange={e => {
                    setLesson(prevState => ({
                      ...prevState, group_name: e.target.value
                    }));
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
                  disabled={isActive}
                  defaultValue=""
                  onChange={e => {
                    setLesson(prevState => ({
                      ...prevState, para: e.target.value
                    }));
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
        <section id="home-content">
          <h1 className={clsx(("disabled-table-text"), {"disabled-table": isTeacherLate})}> Siz
            davomat olishga kech qoldingiz!</h1>
          <main className="table" id="customers_table">
            <section className="table__body">
              {isActive && (<p id="table-info">{lesson.para}chi para
                - {dayjs(lesson.date).format("MMMM D")}</p>)}
              <table>
                <thead>
                <tr>
                  <th> O'QUVCHI ISM FAMILYASI</th>
                  <th> STATUS</th>
                  <th> DAVOMAT</th>
                </tr>
                </thead>
                <tbody>
                {attendanceList.length > 0 && attendanceList.map((item, count) => (
                    <tr key={item["student_name"]}>
                      <td>{count + 1}. {item["student_name"]}</td>
                      <td>
              <span style={{cursor: "default"}}
                    className={clsx("table-button", "status-button", {
                      present: item["status"] === '+', absent: item["status"] === '-',
                    })}>{item["status"]}</span>
                      </td>
                      <td>
                        <div className="table-buttons-wrapper">
                    <span
                        onClick={() => studentAttendanceHandler(item["student_name"], "+")}
                        className="present table-button">+</span>
                          <span
                              onClick={() => studentAttendanceHandler(item["student_name"], "-")}
                              className="absent table-button">-</span>
                        </div>
                      </td>
                    </tr>))}
                </tbody>
              </table>
            </section>
            <div
                className={clsx(("disabled-table-wrapper"), {"disabled-table": isTeacherLate})}></div>
          </main>
          <div id="qrcode-wrapper">
            {expiresAt === null ? (<>
              <button disabled={isActive}
                      className="qrcode-generate-button"
                      onClick={generateButtonHandler}>{loading ? loader : "Darsni boshlash"}</button>
              <div id="qr-code">
                {!isActive && (<div id="empty-qrcode-space">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                    <path
                        fill="#374151"
                        d="M0 80C0 53.5 21.5 32 48 32l96 0c26.5 0 48 21.5 48 48l0 96c0 26.5-21.5 48-48 48l-96 0c-26.5 0-48-21.5-48-48L0 80zM64 96l0 64 64 0 0-64L64 96zM0 336c0-26.5 21.5-48 48-48l96 0c26.5 0 48 21.5 48 48l0 96c0 26.5-21.5 48-48 48l-96 0c-26.5 0-48-21.5-48-48l0-96zm64 16l0 64 64 0 0-64-64 0zM304 32l96 0c26.5 0 48 21.5 48 48l0 96c0 26.5-21.5 48-48 48l-96 0c-26.5 0-48-21.5-48-48l0-96c0-26.5 21.5-48 48-48zm80 64l-64 0 0 64 64 0 0-64zM256 304c0-8.8 7.2-16 16-16l64 0c8.8 0 16 7.2 16 16s7.2 16 16 16l32 0c8.8 0 16-7.2 16-16s7.2-16 16-16s16 7.2 16 16l0 96c0 8.8-7.2 16-16 16l-64 0c-8.8 0-16-7.2-16-16s-7.2-16-16-16s-16 7.2-16 16l0 64c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-160zM368 480a16 16 0 1 1 0-32 16 16 0 1 1 0 32zm64 0a16 16 0 1 1 0-32 16 16 0 1 1 0 32z"/>
                  </svg>
                  QR Kod be yerda bo'ladi
                </div>)}
                {isActive && (<QRCode
                    value={`http://portal.mahoratmarkaz.uz/attendance/${lesson["group_name"]}/${lesson["date"]}/${lesson["para"]}`}
                    size={256}/>)}
              </div>
            </>) : (<Countdown
                date={expiresAt}
                renderer={({minutes, seconds, completed}) => {
                  if (completed) {
                    return (<>
                      <button disabled={isActive}
                              className="qrcode-generate-button"
                              onClick={generateButtonHandler}>{loading ? loader : "Darsni boshlash"}</button>
                      <div id="qr-code">
                        {!isActive && (<div id="empty-qrcode-space">
                          <svg xmlns="http://www.w3.org/2000/svg"
                               viewBox="0 0 448 512">
                            <path
                                fill="#374151"
                                d="M0 80C0 53.5 21.5 32 48 32l96 0c26.5 0 48 21.5 48 48l0 96c0 26.5-21.5 48-48 48l-96 0c-26.5 0-48-21.5-48-48L0 80zM64 96l0 64 64 0 0-64L64 96zM0 336c0-26.5 21.5-48 48-48l96 0c26.5 0 48 21.5 48 48l0 96c0 26.5-21.5 48-48 48l-96 0c-26.5 0-48-21.5-48-48l0-96zm64 16l0 64 64 0 0-64-64 0zM304 32l96 0c26.5 0 48 21.5 48 48l0 96c0 26.5-21.5 48-48 48l-96 0c-26.5 0-48-21.5-48-48l0-96c0-26.5 21.5-48 48-48zm80 64l-64 0 0 64 64 0 0-64zM256 304c0-8.8 7.2-16 16-16l64 0c8.8 0 16 7.2 16 16s7.2 16 16 16l32 0c8.8 0 16-7.2 16-16s7.2-16 16-16s16 7.2 16 16l0 96c0 8.8-7.2 16-16 16l-64 0c-8.8 0-16-7.2-16-16s-7.2-16-16-16s-16 7.2-16 16l0 64c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-160zM368 480a16 16 0 1 1 0-32 16 16 0 1 1 0 32zm64 0a16 16 0 1 1 0-32 16 16 0 1 1 0 32z"/>
                          </svg>
                          QR Kod be yerda bo'ladi
                        </div>)}
                        {isActive && (<QRCode
                            value={`http://portal.mahoratmarkaz.uz/attendance/${lesson["group_name"]}/${lesson["date"]}/${lesson["para"]}`}
                            size={256}/>)}
                      </div>
                    </>);
                  }
                  return (<>
                    <div id="qr-code">
                      {!isActive && (<div id="empty-qrcode-space">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                          <path
                              fill="#374151"
                              d="M0 80C0 53.5 21.5 32 48 32l96 0c26.5 0 48 21.5 48 48l0 96c0 26.5-21.5 48-48 48l-96 0c-26.5 0-48-21.5-48-48L0 80zM64 96l0 64 64 0 0-64L64 96zM0 336c0-26.5 21.5-48 48-48l96 0c26.5 0 48 21.5 48 48l0 96c0 26.5-21.5 48-48 48l-96 0c-26.5 0-48-21.5-48-48l0-96zm64 16l0 64 64 0 0-64-64 0zM304 32l96 0c26.5 0 48 21.5 48 48l0 96c0 26.5-21.5 48-48 48l-96 0c-26.5 0-48-21.5-48-48l0-96c0-26.5 21.5-48 48-48zm80 64l-64 0 0 64 64 0 0-64zM256 304c0-8.8 7.2-16 16-16l64 0c8.8 0 16 7.2 16 16s7.2 16 16 16l32 0c8.8 0 16-7.2 16-16s7.2-16 16-16s16 7.2 16 16l0 96c0 8.8-7.2 16-16 16l-64 0c-8.8 0-16-7.2-16-16s-7.2-16-16-16s-16 7.2-16 16l0 64c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-160zM368 480a16 16 0 1 1 0-32 16 16 0 1 1 0 32zm64 0a16 16 0 1 1 0-32 16 16 0 1 1 0 32z"/>
                        </svg>
                        QR Kod be yerda bo'ladi
                      </div>)}
                      {isActive && (<QRCode
                          value={`http://portal.mahoratmarkaz.uz/attendance/${lesson["group_name"]}/${lesson["date"]}/${lesson["para"]}`}
                          size={256}/>)}
                    </div>
                    <button disabled={isActive}
                            className="qr-code-timer disabled">{minutes} : {seconds}</button>
                  </>);
                }}
            />)}
          </div>
        </section>
        <ToastContainer/>
      </div>
  )
};

export default HomePage;
