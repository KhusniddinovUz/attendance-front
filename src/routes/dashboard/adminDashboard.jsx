import {useEffect, useRef, useState} from "react";
import "../../styles/dashboard.css";
import {format} from "date-fns";
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import {DataGrid} from "react-data-grid";
import 'react-data-grid/lib/styles.css';
import {getGroups} from "../../store/groupSlice.js";
import {logout, updateUserInfo} from "../../store/authSlice.js";
import {useDispatch, useSelector} from "react-redux";
import {toast} from "react-toastify";
import axios from "axios";
import {url} from "../../data/api.js";
import clsx from "clsx";
import * as XLSX from "xlsx";
import {saveAs} from "file-saver";
import {getTableContent} from "../../utils/getTableContent.js";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const gridRef = useRef(null);
  const user = useSelector(state => state.auth.user);
  const token = useSelector(state => state.auth.token);
  const groups = useSelector(state => state.group.groups);
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [groupName, setGroupName] = useState(null);
  const [showLateLessons, setShowLateLessons] = useState(null);
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
        dispatch(logout());
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
    if (showLateLessons == null) missing.push("dars xolatini");
    console.log(showLateLessons);
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
      await axios.get(`${url}/api/attendance/dashboard/`, {
        params: {
          "group_name": groupName,
          "start_date": startDate,
          "end_date": endDate,
          "lessons": showLateLessons,
        },
      }).then(res => {
        const data = res.data;
        console.log(data);
        setViewingTable(true);
        const students = Array.from(new Set(data.map((x) => x.student_name)));
        const dates = Array.from(new Set(data.map((x) => x.date))).sort();
        const paras = Array.from(new Set(data.map((x) => x.lesson_name))).sort((a, b) => Number(a) - Number(b));

        // 2. Precompute teacher per (date, para)
        const teacherMap = {};
        data.forEach((x) => {
          teacherMap[`${x.date}_${x.lesson_name}`] = x.teacher_name;
        });

        // 3. Build nested columns: one group per date, children per para
        const cols = [{
          key: 'student_name',
          name: 'F.I.S.H.',
          frozen: true,
          cellClass: 'table-student-name',
          width: 250,
        }];
        dates.forEach((date) => {
          cols.push({
            key: date,
            name: date,
            headerCellClass: 'wrap-header',
            children: paras.map((para) => {
              const teacher = teacherMap[`${date}_${para}`] || '';
              return {
                key: `${date}_${para}`,
                name: `${para} – ${teacher}`, // Header shows para and teacher
                resizeable: true,
                headerCellClass: 'wrap-header',
              };
            }),
          });
        });

        // 4. Pivot rows: one row per student, one cell per (date_para) = status
        const pivoted = students.map((student) => {
          const row = {student_name: student};
          dates.forEach((date) => {
            paras.forEach((para) => {
              const rec = data.find((x) => x.student_name === student && x.date === date && x.lesson_name === para);
              row[`${date}_${para}`] = rec ? rec.status : '';
            });
          });
          return row;
        });

        setColumns(cols);
        setRows(pivoted);
        // let dates = new Set();
        // let draft = {};
        // res.data.forEach(student => {
        //   dates.add(student.date);
        //   if (draft[student.student_name] === undefined) draft[student.student_name] = [];
        //   draft[student.student_name].push([`para-${student.lesson_name}-${student.date}`, student.status])
        // });
        // //Add columns to the table
        // dates.forEach(date => {
        //   let obj = {
        //     name: date, children: [{key: `para-1-${date}`, name: '1'}, {
        //       key: `para-2-${date}`, name: '2'
        //     }, {key: `para-3-${date}`, name: '3'},],
        //   };
        //   setColumns(prevState => [...prevState, obj]);
        // });
        // //Add rows
        // for (const [key, value] of Object.entries(draft)) {
        //   let newRow = {
        //     id: key,
        //   };
        //   value.forEach(val => {
        //     newRow[val[0]] = val[1];
        //   });
        //   setRows(prevState => [...prevState, newRow]);
        // }
        setLoading(false);
      }).catch(err => {
        console.log(err);
        setLoading(false);
      })
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  }

  const handleExport = () => {
    const data = getTableContent(gridRef.current.element);
    const lines = data
        .trim()
        .split('\n')
        .map((line) => line.split(','));
    const dates = lines[0]; // ['06.01.2025','06.02.2025','06.03.2025']
    const header2 = lines[1]; // ['F.I.SH.','1','2','3','1','2','3','1','2','3']
    const rows = lines.slice(2); // data rows

    // Build the first header row with merged date spans
    const header1 = [''];
    dates.forEach((date) => {
      header1.push(date);
      header1.push('');
      header1.push('');
    });

    // Build the sheet as an array-of-arrays
    const aoa = [header1, header2, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(aoa);

    // Build merge ranges:
    const merges = [];
    // Merge the F.I.SH. column vertically (A1: A2)
    merges.push({s: {r: 0, c: 0}, e: {r: 1, c: 0}});
    // Merge each date across its three child cols
    dates.forEach((_, i) => {
      const startCol = 1 + i * 3;
      const endCol = startCol + 2;
      merges.push({s: {r: 0, c: startCol}, e: {r: 0, c: endCol}});
    });
    ws['!merges'] = merges;

    // Create a workbook and trigger download
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const wbout = XLSX.write(wb, {bookType: 'xlsx', type: 'array'});
    saveAs(new Blob([wbout], {type: 'application/octet-stream'}), 'Davomat.xlsx');
  }

  return (
      <div id="adminDashboard">
        <div id="admin-logout" className={clsx(viewingTable && "submitted")}>
          <h3>{user.username}</h3>
          <svg onClick={handleLogout} xmlns="http://www.w3.org/2000/svg"
               viewBox="0 0 512 512">
            <path fill="#000"
                  d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 192 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l210.7 0-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l128-128zM160 96c17.7 0 32-14.3 32-32s-14.3-32-32-32L96 32C43 32 0 75 0 128L0 384c0 53 43 96 96 96l64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-64 0c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32l64 0z"/>
          </svg>
        </div>
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
          <div className="select-wrap">
            <select
                defaultValue=""
                onChange={e => setShowLateLessons(e.target.value)}>
              <option value="" disabled={true} hidden>Dars xolatini tanlash</option>
              <option value="all">Hamma darslar</option>
              <option value="late">LATE</option>
              <option value="not-late">NOT LATE</option>
            </select>
            <svg xmlns="http://www.w3.org/2000/svg" height="32" width="20"
                 viewBox="0 0 320 512">
              <path fill="#374151"
                    d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8L32 192c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z"/>
            </svg>
          </div>
          <button id="dashboard-form-btn"
                  onClick={handleSubmit}>{loading ? loader : "Jadvalni ko'rish"}</button>
        </div>

        <div id="dashboard-table" className={clsx(!viewingTable && "submitted")}>
          <button className="export-button" onClick={handleExport}>Excelga saqlash
          </button>
          <DataGrid
              ref={gridRef}
              className='table rdg-light'
              columns={columns}
              rows={rows}
              defaultColumnOptions={{
                sortable: true, resizable: true,
              }}
          />
        </div>
      </div>
  )
};

export default AdminDashboard;
