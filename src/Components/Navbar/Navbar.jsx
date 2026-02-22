import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav style={styles.nav}>
      <h2 style={{ color: "#4285F4" }}>DERP</h2>
      <div>
        <Link to="/" style={styles.link}>Home</Link>
        <Link to="#" style={styles.link}>About</Link>
        <Link to="#" style={styles.link}>Contact</Link>
        <Link to="#" style={styles.link}>Docs</Link>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    padding: "15px 50px",
    borderBottom: "1px solid #ddd",
  },
  link: {
    margin: "0 15px",
    textDecoration: "none",
    color: "#555",
    fontWeight: "500",
  },
};

export default Navbar;