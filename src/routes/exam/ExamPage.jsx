import {useState} from "react";
import {NavLink, useNavigate} from "react-router-dom";
import {useSelector} from "react-redux";
import '../../styles/exam.css';

const ExamPage = () => {
  const navigate = useNavigate();
  const groups = useSelector(state => state.group.groups);
  const [student, setStudent] = useState("");
  const [group, setGroup] = useState("");

  const onGroupChange = (e) => {
    console.log(e.target.value);
  }

  const onSubmit = () => {
    navigate("/");
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
              <option value="1">O'quvchi no 1</option>
              <option value="2">O'quvchi no 2</option>
              <option value="3">O'quvchi no 3</option>
              <option value="4">O'quvchi no 4</option>
            </select>
            <input type="text" placeholder="Baho"/>
            <button onClick={onSubmit}>Baholash</button>
          </div>
        </div>
      </div>)
};

export default ExamPage;
