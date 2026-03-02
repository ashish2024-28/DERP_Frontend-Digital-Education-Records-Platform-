import { useEffect } from "react";

export default function Assignment() {
    useEffect(() => {
        alert("Assignment");
    }, []);

    return (
        <div>
            <h1>Assignment</h1>
        </div>
    );
}