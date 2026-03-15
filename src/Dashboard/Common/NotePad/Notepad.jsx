import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

export default function Notepad() {
    const API_BASE = import.meta.env.VITE_API_BASE_URL;

    const { domain } = useParams();
    const role = localStorage.getItem("role")
    const [notepad, setNotepad] = useState([]);

    const [message, setMessage] = useState("");
    const [title, setTitle] = useState("");
    const [noteText, setNoteText] = useState("");
    const [file, setFile] = useState(null);

    const [search, setSearch] = useState("");
    const [selectedNote, setSelectedNote] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const colors = [
        "bg-yellow-100",
        "bg-blue-100",
        "bg-green-100",
        "bg-pink-100",
        "bg-purple-100"
    ];

    function getColor(index) {
        return colors[index % colors.length];
    }
    const filteredNotes = notepad.filter(note =>
        note.title?.toLowerCase().includes(search.toLowerCase()) ||
        note.noteText?.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        async function fetchData() {
            try {
                const responseNotepad = await fetch(`${API_BASE}/${domain}/${role}/notepad`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`,
                        "Content-Type": "application/json"
                    }
                });

                const data = await responseNotepad.json();
                if (!responseNotepad.ok || !data.success) {
                    throw new Error(data.message || "server error");
                }

                setNotepad(data.data);

            } catch (error) {
                alert(` ${error}`);
                localStorage.removeItem("token");
                localStorage.removeItem("role");
                navigate(`/${domain}/login`);

            }
        }
        fetchData();
    }, [domain, role, API_BASE]);


    async function addNote(e) {
        e.preventDefault();
        const formData = new FormData();
        formData.append("title", title);
        formData.append("noteText", noteText);
        formData.append("file", file);
        try {
            const response = await fetch(
                `${API_BASE}/${domain}/${role}/notepad/add`,
                {
                    method: "POST",
                    headers: {
                        "Authorization": "Bearer " + localStorage.getItem("token")
                    },
                    body: formData
                }
            );
            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.message || "server error");
            }

            alert("Note Added Successfully");
            setNotepad([...notepad, data.data]);
            setTitle("");
            setNoteText("");
            setFile(null);
        } catch (error) {
            alert(`Note not added. \n${error}. \nTry Again...`)
            setMessage(`Note not added. \n${error}. \nTry Again...`)
        }
    }

    async function deleteNote(id) {
        if (!window.confirm("Are you sure you want to delete this note?")) return;

        try {
            const response = await fetch(
                `${API_BASE}/${domain}/${role}/notepad/delete/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        "Authorization": "Bearer " + localStorage.getItem("token")
                    },
                }
            );
            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "server error");
            }

            alert("Note Deleted Successfully");
            setNotepad(note => note.filter(note => note.id !== id));


        } catch (error) {
            alert(`Note ${id} not Deleted. \n${error}. \nTry Again...`)
            setMessage(`Note ${id} not Deleted. \n${error}. \nTry Again...`)
        }
    }


    return (
        <div>
            <h2 className>Note Pad </h2>
            <p className="text-red-500">{message}</p>
            <div className="flex justify-center mb-6">
                <input
                    type="text"
                    placeholder="Search notes..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-96 p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
            </div>
            <div className="flex gap-8 m-10 ">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {filteredNotes.map((note, index) => (
                        <div
                            key={index}
                            className={`relative ${getColor(index)} rounded-xl  p-5 shadow-lg 
hover:shadow-2xl hover:-translate-y-2 transition flex flex-col`}
                        >

                            {note.attachmentPath && (
                                <img
                                    src={`${API_BASE}/${note.attachmentPath}`}
                                    className="w-full h-36 object-cover rounded-md mb-3 cursor-pointer"
                                    onClick={() => setPreviewImage(`${API_BASE}/${note.attachmentPath}`)}
                                />
                            )}

                            <h3 className="text-lg font-bold mb-2">{note.title}</h3>

                            <p className="text-sm text-gray-700 flex-grow">
                                {note.noteText}
                            </p>

                            <div className="flex gap-2 mt-4">

                                <button
                                    className="flex-1 py-2 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                                >
                                    ✓ Complete
                                </button>

                                <button
                                    className="flex-1 py-2 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                                    onClick={() => {
                                        setSelectedNote(note)
                                        setShowModal(true)
                                    }}
                                >
                                    ✏ Edit
                                </button>

                                <button onClick={() => deleteNote(note.id)}
                                    className="flex-1 py-2 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                                >
                                    🗑 Delete
                                </button>

                            </div>

                        </div>
                    ))}
                </div>
            </div>
            {previewImage && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center">

                    <img
                        src={previewImage}
                        className="max-h-[80vh] rounded-lg"
                    />

                    <button
                        onClick={() => setPreviewImage(null)}
                        className="absolute top-6 right-6 text-white text-2xl"
                    >
                        ✖
                    </button>

                </div>
            )}
            {showModal && selectedNote && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">

                    <div className="bg-white p-6 rounded-xl w-96">

                        <h2 className="text-xl font-bold mb-4">Edit Note</h2>

                        <input
                            className="w-full border p-2 rounded mb-3"
                            value={selectedNote.title}
                            onChange={(e) => setSelectedNote({ ...selectedNote, title: e.target.value })}
                            required
                        />

                        <textarea
                            className="w-full border p-2 rounded mb-4"
                            value={selectedNote.noteText}
                            onChange={(e) => setSelectedNote({ ...selectedNote, noteText: e.target.value })}
                            required
                        />

                        <div className="flex justify-end gap-3">

                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 bg-gray-300 rounded"
                            >
                                Cancel
                            </button>

                            <button
                                className="px-4 py-2 bg-blue-500 text-white rounded"
                            >
                                Update
                            </button>

                        </div>

                    </div>

                </div>
            )}

            {/*Add Note  */}
            <form onSubmit={addNote}>
                <input
                    type="text" placeholder="Title" required
                    value={title} onChange={(e) => setTitle(e.target.value)}
                />

                <textarea className=" dark:bg-black"
                    placeholder="Note text" required
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                />

                <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                />

                <button type="submit">Add Note</button>
            </form>
        </div>
    )

}

