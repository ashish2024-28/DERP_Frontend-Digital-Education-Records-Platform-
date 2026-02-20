 import { useEffect } from "react";

export default function TestQuize () {
    useEffect(() => {
        alert("t q");
    }, []);

    return (
        <div>
            <h1>Fees</h1>
        </div>
    );
}