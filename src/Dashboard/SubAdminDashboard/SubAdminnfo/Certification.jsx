
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function Certification() {
    const { domain } = useParams();
    const [message, setMessage] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState(""); // Added for Certifications
    const [file, setFile] = useState(null);

    const addCertification = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("file", file);

        try {
            const response = await fetch(`http://localhost:8080/${domain}/student/certifications/add`, {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token")
                },
                body: formData // Note: Don't set Content-Type header when sending FormData
            });

            if(response.ok) {
                alert("Certification Added!");
                setTitle(""); setDescription("");
            }
        } catch (error) {
            console.error("Upload failed", error);
        }
    };

    return (
        <div>
            <h2>Student Dashboard</h2>
            <form onSubmit={addCertification}>
                <input placeholder="Title" value={title} onChange={(e)=>setTitle(e.target.value)} />
                <input placeholder="Description" value={description} onChange={(e)=>setDescription(e.target.value)} />
                <input type="file" onChange={(e)=>setFile(e.target.files[0])} />
                <button type="submit">Upload Certification</button>
            </form>
        </div>
    );
}