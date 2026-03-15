import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import FormatDate from "../../../Components/DateTimeFunction/FormatDate";


export default function AllFaculty() {

    const API_BASE = import.meta.env.VITE_API_BASE_URL;

    const { domain } = useParams();
    const role = localStorage.getItem("role");
    // const location = useLocation();
    const [faculty, setFaculty] = useState([]);
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

            //   All Faculty
            const facultlyRes = await fetch(`${API_BASE}/${domain}/${role}/allFaculty`, { headers });
            const faacultyData = await facultlyRes.json();
            setFaculty(faacultyData?.data || faacultyData || []);


        } catch (error) {
            console.error("Error:", error);
            alert(`Session expired. ${localStorage.getItem("role")} Please login again.`);
           localStorage.removeItem("token");
  localStorage.removeItem("role");
            navigate(`/${domain}/login`);
        }
    };


    const filteredData = (faculty || []).filter(item =>
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.facultyId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.course?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.teachingBatch?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );


    return (
        <div>

            <h1 className="text-2xl font-bold mb-4">All Facutly</h1>

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
                            <th>Faculty ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Course</th>
                            <th>Teaching Batch</th>
                            <th>Mobile Number</th>
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
                                <td>{item.facultyId}</td>
                                <td>{item.name}</td>
                                <td>{item.email}</td>
                                <td>{item.course}</td>
                                <td>{item.teachingBatch}</td>
                                <td>{item.mobileNumber}</td>
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