import { useState } from "react";
import { useParams } from "react-router-dom";

export default function Notepad(){
    const API_BASE = "http://localhost:8080";

    const { domain } = useParams();
    const [message, setMessage] = useState("");
    const [title, setTitle] = useState("");
    const [noteText, setNoteText] = useState("");
    const [file, setFile] = useState(null);

    async function addNote(e) {
        e.preventDefault();
        const formData = new FormData();
        formData.append("title", title);
        formData.append("noteText", noteText);
        formData.append("file", file);
        try{
            await fetch(
                `${API_BASE}/${domain}/faculty/notespad/add`,
                {
                    method: "POST",
                    headers:{
                        "Authorization": "Bearer " + localStorage.getItem("token")
                    },
                    body: formData
                }
            );

            alert("Note Added Successfully");
            setTitle("");
            setNoteText("");
            setFile(null);
        } catch (error) {
            console.log(error);
        }
    }


        return (
        <div>
            <h2>Student Dashboard</h2>
            <p>{message}</p>

            <form onSubmit={addNote}>
                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e)=>setTitle(e.target.value)}
                />

                <textarea
                    placeholder="Note text"
                    value={noteText}
                    onChange={(e)=>setNoteText(e.target.value)}
                />

                <input
                    type="file"
                    onChange={(e)=>setFile(e.target.files[0])}
                />

                <button type="submit">Add Note</button>
            </form>
        </div>
    )

}

