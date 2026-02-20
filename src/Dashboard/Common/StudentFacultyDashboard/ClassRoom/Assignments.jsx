import { useEffect } from "react";

export default function Assignment() {
    useEffect(() => {
        alert("Assignment");
    }, []);

    return (
        <div>
            <h1>Fees</h1>
        </div>
    );
}