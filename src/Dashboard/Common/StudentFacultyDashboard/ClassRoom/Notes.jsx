 import { useEffect } from "react";

export default function FNotesees() {
    useEffect(() => {
        alert("Notes");
    }, []);

    return (
        <div>
            <h1>Fees</h1>
        </div>
    );
}