 import { useEffect } from "react";

export default function TestQuize () {
    useEffect(() => {
        alert("Fees Page Loaded");
    }, []);

    return (
        <div>
            <h1>Fees</h1>
        </div>
    );
}