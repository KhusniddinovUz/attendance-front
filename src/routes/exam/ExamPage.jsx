import {useState} from "react";
import {NavLink, useNavigate} from "react-router-dom";
import {useSelector} from "react-redux";
import '../../styles/exam.css';
import axios from "axios";
import {url} from "../../data/api.js";

const ExamPage = () => {
  const navigate = useNavigate();
  const groups = useSelector(state => state.group.groups);
  const token = useSelector(state => state.auth.token);
  const [studentList, setStudentList] = useState([]);
  const [student, setStudent] = useState("");
  const [mark, setMark] = useState("");

  const onGroupChange = async(e) => {
      const {data} = await axios.get(`${url}/api/group/groups/${e.target.value}/students/`, {
          headers: {"Authorization": `Token ${token}`},
      });
      setStudentList(data);
      console.log(data);
  }

  const onSubmit = async() => {
      const body = {
          "student_id": student,
          "mark": mark,
      };
      console.log(body);
      const {data} = await axios.post(`${url}/api/finalmark/marks/`, body,{
          headers: {"Authorization": `Token ${token}`},
      });
      console.log(data);
        // navigate("/");
  }

  return (<div className="exam-page-wrapper">
        <div className="exam-page-header">
          <h1>O'quvchilarni baholash sahifasi</h1>
          <NavLink to={"/"}>Davomat</NavLink>
        </div>
        <div className="exam-page-content-wrapper">
          <div className="exam-page-content">
            <select
                defaultValue=""
                onChange={e => {
                  onGroupChange(e);
                }}
            >
              <option value="" disabled={true} hidden>Guruhni tanlash</option>
              {groups.map(group => <option value={group.id}
                                           key={group.id}>{group.name}</option>)}

            </select>
            <select
                defaultValue=""
                onChange={e => {
                  setStudent(e.target.value);
                  console.log(e.target.value);
                }}
            >
              <option value="" disabled={true} hidden>O'quvchini tanlash</option>
                {studentList.map(group => <option value={group.id}
                                             key={group.id}>{group.name}</option>)}
            </select>
            <input type="text" placeholder="Baho" value={mark} onChange={e => {
                setMark(e.target.value);
            }}/>
            <button onClick={onSubmit}>Baholash</button>
          </div>
        </div>
      </div>)
};

export default ExamPage;
