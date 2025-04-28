import '../../styles/home.css';
import {useEffect, useState} from "react";
import {useSelector, useDispatch} from "react-redux";
import {getGroups, createLesson} from "../../store/groupSlice.js";
import QRCode from "react-qr-code";
import {url} from "../../data/api.js";

const HomePage = () => {
  const [showQRCode, setShowQRCode] = useState(false);
  const loading = useSelector(state => state.group.isLoading);
  const dispatch = useDispatch();
  const groups = useSelector(state => state.group.groups);
  const [lesson, setLesson] = useState({name: "", group_name: 1, date: ""});
  const token = useSelector(state => state.auth.token);
  const loader = <div className="loader"></div>

  useEffect(() => {
    const getGroupsHandler = async () => {
      try {
        dispatch(getGroups(token));
      } catch (error) {
        console.error('Error fetching groups:', error.response ? error.response.data : error.message);
      }
    };
    getGroupsHandler()
  }, [dispatch, token]);

  useEffect(() => {
    console.log("updated date")
    const now = new Date();
    setLesson(prevState => ({
      ...prevState,
      date: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
    }))
  }, [lesson["group_name"]]);

  const generateButtonHandler = () => {
    dispatch(createLesson({lesson: lesson, token: token}));
    setShowQRCode(true);
  }

  return (<div id="homepage">
    <h1>QR Kod yaratish</h1>
    <div className="qr-code-wrap">
      <input value={lesson["name"]}
             onChange={event => {
               setLesson(prevState => ({
                 ...prevState, name: event.target.value
               }));
               setShowQRCode(false);
             }}
             type="text" placeholder={"Fan nomi"}/>
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
          <path fill="#ffffff"
                d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8L32 192c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z"/>
        </svg>
      </div>
      <button onClick={generateButtonHandler}>{loading ? loader : "Yaratish"}</button>
    </div>
    <div id="qr-code">
      {showQRCode && (<QRCode
          value={`http://localhost:5173/attendance/${lesson["name"]}/${lesson["group_name"]}/${lesson["date"]}`}
          size={256}/>)}
    </div>
  </div>)
};

export default HomePage;
