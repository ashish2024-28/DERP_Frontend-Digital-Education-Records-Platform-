import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import FormatDate from "../../../Components/DateTimeFunction/FormatDate";


export default function AllStudents() {

    const API_BASE = import.meta.env.VITE_API_BASE_URL;

    const { domain } = useParams();
    const role = localStorage.getItem("role");
    // const location = useLocation();
    const [students, setStudents] = useState([]);
  const [showPassword, setShowPassword] = useState(false);


    const [searchQuery, setSearchQuery] = useState("");

    // ================= FETCH DATA =================
    useEffect(() => {
        fetchAllData();
    }, [domain]);

    const fetchAllData = async () => {
        try {
            const headers = {
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json"
            }

            //   All Students
            const studentRes = await fetch(`${API_BASE}/${domain}/${role}/allStudent`, { headers });
            const studentData = await studentRes.json();
            setStudents(studentData?.data || studentData || []);


        } catch (error) {
            console.error("Error:", error);
            alert(`Session expired. ${localStorage.getItem("role")} Please login again.`);
              localStorage.removeItem("token");
  localStorage.removeItem("role");
            navigate(`/${domain}/login`);
        }
    };


    const filteredData = (students || []).filter(item =>
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.course?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.branch?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.batch?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );


    return (
        <div>

            <h1 className="text-2xl font-bold mb-4">Students</h1>

            <div className="shadow rounded-xl p-6">

                <input
                    type="text"
                    placeholder="Search..."
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border p-2 mb-4 w-full"
                />

                <table className="table-wrapper w-full">

                    <thead>
                        <tr>
                            <th>Roll No</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Course</th>
                            <th>Branch</th>
                            <th>Batch</th>
                            <th>Mobile Number</th>
                            <th>Father Name</th>
                            <th>Father Number</th>
                            {role === "DOMAIN_ADMIN" && (<>
                                <th>Created At</th>
                                <th>Last Login</th>
                                <th>
                                    Password
                                    <span style={{ marginLeft: "8px", cursor: "pointer" }}
                                        onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </span>
                                </th></>

                            )}
                        </tr>
                    </thead>

                    <tbody>
                        {filteredData.map((item, index) => (
                            <tr key={index}>
                                <td>{item.rollNumber}</td>
                                <td>{item.name}</td>
                                <td>{item.email}</td>
                                <td>{item.course}</td>
                                <td>{item.branch}</td>
                                <td>{item.batch}</td>
                                <td>{item.mobileNumber}</td>
                                <td>{item.fatherName}</td>
                                <td>{item.fatherMobNo}</td>
                                {role === "DOMAIN_ADMIN" && (<>
                                    <td>{FormatDate(item.lastLoginDateTime)}</td>
                                    <td>{FormatDate(item.createdDateTime)}</td>
                                    <td>
                                        {showPassword
                                            ? item.password
                                            : "••••••••"}
                                    </td></>
                                )}
                            </tr>
                        ))}

                    </tbody>

                </table>

            </div>

        </div>
    );
}