import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav style={styles.nav} className="mr-5">
      <div className="flex gap-5">
      <img src="/DERP.png" alt="" className="h-10  rounded" />
      <h2 style={{ color: "#4285F4" }}>DERP</h2>
      </div>
      <div>
        <Link to="/" style={styles.link}>Home</Link>
        <Link to="/about" style={styles.link}>About</Link>
        <Link to="/contact" style={styles.link}>Contact</Link>
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