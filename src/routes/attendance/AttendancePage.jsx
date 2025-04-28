import '../../styles/attendance.css';
import {useParams} from "react-router";
import {useEffect, useState} from "react";
import axios from "axios";
import {url} from "../../data/api.js";


const AttendancePage = () => {
  const [data, setData] = useState([]);
  const [student, setStudent] = useState("");
  const {lesson_name, group_name, date} = useParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      axios.get(`${url}/api/attendance/get/?lesson_name=${lesson_name}&group_name=${group_name}&date=${date}`).then(async res => {
        const fetchedData = await res.data;
        console.log(fetchedData);
        setData(fetchedData);
      }).catch(err => {
        console.log(err);
      })
    };

    fetchData();
  }, [lesson_name, group_name, date, setLoading, loading]);


  const handleAttendance = async () => {
    console.log(lesson_name, student);
    axios.put(`${url}/api/attendance/update/`, {
      lesson_name: lesson_name, student_name: student, status: "+",
    }).then(async res => {
      const fetchedData = await res.data;
      console.log(fetchedData);
    }).catch(err => {
      console.log(err);
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
    <button onClick={handleAttendance} className={"attendance-button"}>Tasdiqlash</button>
  </div>)
};

export default AttendancePage;
