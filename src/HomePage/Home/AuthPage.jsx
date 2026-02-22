import { useParams } from "react-router-dom";

const AuthPage = ({ type }) => {
  const { domain } = useParams();

  return (
    <div style={{ textAlign: "center", marginTop: "150px" }}>
      <h1>{domain.toUpperCase()} - {type.toUpperCase()} PAGE</h1>
      <p>This is dummy {type} page for {domain}</p>
    </div>
  );
};

export default AuthPage;