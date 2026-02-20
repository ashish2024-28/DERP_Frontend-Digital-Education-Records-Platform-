import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function SubAdminDashboard() {
  const { domain } = useParams();
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(
          `http://localhost:8080/${domain}/subadmin`,
          {
            headers: {
              Authorization:
                "Bearer " + localStorage.getItem("token"),
            },
          }
        );

        if (!response.ok) {
          throw new Error("Unauthorized");
        }

        const text = await response.text();
        setMessage(text);
      } catch (error) {
        console.log(error);
      }
    }

    fetchData();
  }, [domain]);

  return (
    <div>
      <h2>Sub Admin Dashboard</h2>
      <p>{message}</p>
    </div>
  );
}

