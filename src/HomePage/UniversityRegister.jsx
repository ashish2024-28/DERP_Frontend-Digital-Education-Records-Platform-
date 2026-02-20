import {  useState } from "react";
import {  useNavigate } from "react-router-dom";

export default function UniversityRegister() {
    const API_BASE = "http://localhost:8080/home_page";

    const navigate = useNavigate();
    const [university, setUniversity] = useState({
        permanentId: "",
        institutionName: "",
        universityName: "",
        institutionType: "",
        establishmentYear: "",
        address: "",
        state: "",
        email: "",
        mobileNumber: "",
        domain: "",
        // universityLogoPath: ""
    });
    const [domainAdmin, setDomainAdmin] = useState({
        name:"",
        mobileNumber:"",
        email:"",
        password:""
    });
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleUniversityChange = (e) => {
        setUniversity({ ...university, [e.target.name]: e.target.value });
    };
    const handleDomainAdminChange = (e) => {
        setDomainAdmin({ ...domainAdmin, [e.target.name]: e.target.value });
    };

// form submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (domainAdmin.password !== confirmPassword) {
            return setError("Passwords do not match");
        }
        
        // 
        // const formData = new FormData();

        // formData.append(
        //     "university",
        //     new Blob([JSON.stringify(university)], {
        //         type: "application/json"
        //     })
        // );

        // formData.append(
        //     "domainAdmin",
        //     new Blob([JSON.stringify(domainAdmin)], {
        //         type: "application/json"
        //     })
        // );

        // formData.append("logo", university.universityLogoPath);
        // // 

        try {

            const response = await fetch(`${API_BASE}/register_university`, {
                method: "POST",
                // body: formData //logo

                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    university: university,
                    domainAdmin: domainAdmin

                })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Signup failed");
            }

            alert(data.message + " 🎉 Please login as DomainAdmin");
            navigate(`/${university.domain}/login`);

        } catch (err) {
            alert(err)
            alert(err.message)
            setError(err);
        } finally {
            setLoading(false);
        }
    };
   

    return (<>
        {/* <div>
            <NavLink>Home</NavLink>
            <NavLink>Home</NavLink>
            <NavLink>Home</NavLink>
            <NavLink>Home</NavLink>
            </div> */}
        <div className="container">
            <h1>Register University Form </h1>
            <h2>University details</h2>

            <form onSubmit={handleSubmit} className="card">
                {error && <p className="error">{error}</p>}
                <input type="text" name="permanentId" placeholder="PermanentId" onChange={handleUniversityChange} required />
                <input type="text" name="institutionName" placeholder="InstitutionName" onChange={handleUniversityChange} required />
                <input type="text" name="universityName" placeholder="UniversityName" onChange={handleUniversityChange} required />
                <input type="text" name="institutionType" placeholder="InstitutionType" onChange={handleUniversityChange} required />
                <input type="text" name="establishmentYear" placeholder="EstablishmentYear" onChange={handleUniversityChange} required />
                <input type="text" name="address" placeholder="Address" onChange={handleUniversityChange}  autoComplete="street-address" required />
                <input type="text" name="state" placeholder="State" onChange={handleUniversityChange} autoComplete="address-level2" required />
                <input type="email" name="email" placeholder="Email" onChange={handleUniversityChange} autoComplete="email" required />
                <input name="mobileNumber" placeholder="MobileNumber" onChange={handleUniversityChange}  autoComplete="tel" required />
                <input type="text" name="domain" placeholder="Unique Domain" onChange={handleUniversityChange} required />
                {/* <input type="file" name="universityLogoPath" onChange={(e) =>setUniversity({  ...university,  universityLogoPath: e.target.files[0],})} required/> */}

                {/* {/* DomainAdmin */}
                <h2>Universiyt's Admin(DomainAdmin) details </h2>
                <input type="text" name="name" placeholder="Name" onChange={handleDomainAdminChange} required />
                <input type="tel" name="mobileNumber" placeholder="MobileNumber" onChange={handleDomainAdminChange} autoComplete="tel" required />
                <input type="email"  name="email" placeholder="Email" onChange={handleDomainAdminChange} autoComplete="email" required />
                <input type="password" name="password" onChange={handleDomainAdminChange} autoComplete="new-password" required />
                <input type="password" placeholder="Confirm Password" onChange={(e)=>{setConfirmPassword(e.target.value)}} autoComplete="new-password" required />

                <button type="submit" disabled={loading}>{loading ? "Saving..." : "Signup"}</button>
            </form>
        </div>
    </>

    );
}



