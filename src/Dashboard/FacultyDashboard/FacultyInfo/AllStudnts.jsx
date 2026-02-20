import { useEffect } from "react";

export default function AllStudents() {


    return (
        <div>
            <h1>students</h1>

            {/* TABLE */}
            <div className="bg-white shadow rounded-xl p-6">

                <input type="text" placeholder="Search..."
                    onChange={(e) => setSearchQuery(e.target.value)} className="border p-2 mb-4" />

                <table className="table-wrapper">
                    <thead>
                        <tr>
                            <th>Name:</th>
                            <th>Email:</th>
                            <th>Mobile Number:</th>
                            <th>Roll No:</th>
                            <th>Branch:</th>
                            <th>Batch:</th>
                            <th>Father Name</th>
                            <th>Father Mob No:</th>
                            <th>Course:</th>
                            <th>Last Login:</th>
                            <th>Created Date:</th>
                            <th>Password
                                <span style={{ marginLeft: "8px", cursor: "pointer" }}
                                    onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </span>
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredData.map((item, index) => (
                            <tr key={index}>
                                <td>{item.name}</td>
                                <td>{item.email}</td>
                                <td>{item.mobileNumber}</td>

                                <td>{item.rollNumber}</td>
                                <td>{item.branch}</td>
                                <td>{item.batch}</td>
                                <td>{item.fatherName}</td>
                                <td>{item.fatherMobNo}</td>

                                <td>{item.course}</td>
                                <td>{item.lastLoginDateTime}</td>
                                <td>{item.createdDateTime}</td>
                                <td>
                                    {showPassword ? item.password : "••••••••"}
                                </td>

                            </tr>
                        ))}
                    </tbody>
                </table>

            </div>
            <Outlet />

        </div >
    );
}