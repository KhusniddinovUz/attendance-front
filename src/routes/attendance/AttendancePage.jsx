import '../../styles/attendance.css';
import {useParams} from "react-router";
import {useEffect, useState} from "react";
import axios from "axios";
import {url} from "../../data/api.js";
import {toast, ToastContainer} from "react-toastify";


const AttendancePage = () => {
  const [data, setData] = useState([]);
  const [student, setStudent] = useState("");
  const {group_name, date, para} = useParams();
  const [loading, setLoading] = useState(false);
  const loader = <div className="loader"></div>;

  useEffect(() => {
    const fetchData = async () => {
      axios.get(`${url}/api/attendance/get/?group_name=${group_name}&date=${date}&para=${para}`).then(async res => {
        const fetchedData = await res.data;
        setData(fetchedData);
      }).catch(err => {
        console.log(err);
      })
    };

    fetchData();
  }, [group_name, date, setLoading, loading]);


  const handleAttendance = async () => {
    setLoading(true);
    axios.put(`${url}/api/attendance/update/`, {
      student_name: student, status: "+", para: para, date: date, group_name: group_name
    }).catch(err => {
      setTimeout(() => {
        setLoading(false);
      }, 300);
      console.log(err);
    }).then(() => {
      setTimeout(() => {
        setLoading(false);
      }, 300);
      toast.success("Davomat kiritildi", {
        style: {fontFamily: "Poppins"},
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    })
  }

  return (<div id="attendance-page">
    <div className="student-list">
      <select
          defaultValue=""
          onChange={e => {
            setStudent(e.target.value);
          }}>
        <option value="" disabled={true} hidden>O'quvchini tanlash</option>
        {data.map(group => <option value={group["student_name"]}
                                   key={group["student_name"]}>{group["student_name"]}</option>)}
      </select>
      <svg xmlns="http://www.w3.org/2000/svg" height="32" width="20"
           viewBox="0 0 320 512">
        <path fill="#ffffff"
              d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8L32 192c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z"/>
      </svg>
    </div>
    <button onClick={handleAttendance}
            className={"attendance-button"}>{loading ? loader : "Tasdiqlash"}</button>
  </div>)
};

export default AttendancePage;
