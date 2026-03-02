 import { useEffect } from "react";

export default function FNotesees() {
    useEffect(() => {
        alert("Notes");
    }, []);

    return (
        <div>
            <h1>Notes</h1>
        </div>
    );
}