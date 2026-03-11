import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import FormatDate from "../../../Components/DateTimeFunction/FormatDate";


export default function AllSubAdmin() {

    const API_BASE = import.meta.env.VITE_API_BASE_URL;

    const { domain } = useParams();
    const role = localStorage.getItem("role");
    // const location = useLocation();
    const [subAdmin, SetSubAdmin] = useState([]);
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
            const subAdminRes = await fetch(`${API_BASE}/${domain}/${role}/allSubAdmin`, { headers });
            const subAdminData = await subAdminRes.json();
            SetSubAdmin(subAdminData?.data || subAdminData || []);


        } catch (error) {
            console.error("Error:", error);
            alert(`Session expired. ${localStorage.getItem("role")} Please login again.`);
            localStorage.clear();
            navigate(`/${domain}/login`);
        }
    };


    const filteredData = (subAdmin || []).filter(item =>
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subAdminId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.course?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );


    return (
        <div>

            <h1 className="text-2xl font-bold mb-4">All SubAdmin</h1>

            <div className="bg-white shadow rounded-xl p-6">

                <input
                    type="text"
                    placeholder="Search..."
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border p-2 mb-4 w-full"
                />

                <table className="table-wrapper w-full">

                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>SubAdmin ID</th>
                            <th>Email</th>
                            <th>Mobile Number</th>
                            <th>Course</th>
                            <th>Batch</th>
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
                                <td>{item.name}</td>
                                <td>{item.subAdminId}</td>
                                <td>{item.email}</td>
                                <td>{item.mobileNumber}</td>
                                <td>{item.course}</td>
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