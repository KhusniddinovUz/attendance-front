import {useEffect, useState} from "react";
import "../../styles/dashboard.css";
import {format} from "date-fns";
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import {DataGrid} from "react-data-grid";
import 'react-data-grid/lib/styles.css';
import {getGroups} from "../../store/groupSlice.js";
import {updateUserInfo} from "../../store/authSlice.js";
import {useDispatch, useSelector} from "react-redux";
import {toast} from "react-toastify";
import axios from "axios";
import {url} from "../../data/api.js";
import clsx from "clsx";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const token = useSelector(state => state.auth.token);
  const groups = useSelector(state => state.group.groups);
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [groupName, setGroupName] = useState(null);
  const [viewingTable, setViewingTable] = useState(false);
  const [columns, setColumns] = useState([{
    key: 'id', name: 'F.I.SH.', width: 250, cellClass: 'table-student-name'
  }]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const loader = <div className="loader"></div>;

  useEffect(() => {
    const updateInfoHandler = async () => {
      try {
        await dispatch(updateUserInfo(token)).unwrap();
        await dispatch(getGroups(token)).unwrap();
      } catch (error) {
        console.error('Error fetching info:', error);
      }
    };

    updateInfoHandler()
  }, [dispatch, token]);

  const handleSubmit = async () => {
    const startDate = format(start, "yyyy-MM-dd");
    const endDate = format(end, "yyyy-MM-dd");

    let missing = [];
    if (groupName == null) missing.push("guruhni");
    if (start == null) missing.push("kunlarni");
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
        theme: "light",
      });
    } else {
      setLoading(true);
      console.log(groupName, startDate, endDate);
      await axios.get(`${url}/api/attendance/dashboard/`, {
        params: {
          "group_name": groupName, "start_date": startDate, "end_date": endDate,
        },
      }).then(res => {
        setViewingTable(true);
        let dates = new Set();
        let draft = {};
        res.data.forEach(student => {
          dates.add(student.date);
          if (draft[student.student_name] === undefined) draft[student.student_name] = [];
          draft[student.student_name].push([`para-${student.lesson_name}-${student.date}`, student.status])
        });
        //Add columns to the table
        dates.forEach(date => {
          let obj = {
            name: date, children: [{key: `para-1-${date}`, name: '1'}, {
              key: `para-2-${date}`, name: '2'
            }, {key: `para-3-${date}`, name: '3'},],
          };
          setColumns(prevState => [...prevState, obj]);
        });
        //Add rows
        for (const [key, value] of Object.entries(draft)) {
          let newRow = {
            id: key,
          };
          value.forEach(val => {
            newRow[val[0]] = val[1];
          });
          setRows(prevState => [...prevState, newRow]);
        }
        setLoading(false);
      }).catch(err => {
        console.log(err);
        setLoading(false);
      })
    }
  }

  return (<div id="adminDashboard">
    <div className={clsx("form-wrapper", viewingTable && "submitted")}>
      <div className="select-wrap">
        <select
            defaultValue=""
            onChange={e => setGroupName(e.target.value)}>
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
      <div>
        <DatePicker
            className='date-picker'
            selectsRange
            startDate={start}
            endDate={end}
            onChange={(dates) => {
              const [from, to] = dates;
              setStart(from);
              setEnd(to);
            }}
            isClearable
            placeholderText='Kunlarni tanlash'
        />
      </div>
      <button id="dashboard-form-btn"
              onClick={handleSubmit}>{loading ? loader : "Jadvalni ko'rish"}</button>
    </div>

    <div id="dashboard-table" className={clsx(!viewingTable && "submitted")}>
      <DataGrid
          className='table rdg-light'
          columns={columns}
          rows={rows}
          defaultColumnOptions={{
            sortable: true, resizable: true,
          }}
      />
    </div>

  </div>)
};

export default AdminDashboard;
