const Footer = () => {
  return (
    <footer style={styles.footer}>
      <div>
        <h4>Digital Education Records Platform</h4>
        <p>Address: 123 Education Street, Haridwar, India</p>
        <p>Mobile: +91 9876543210</p>
        <p>Email: support@derp.com</p>
      </div>

      <div>
        <p>Instagram: @derp_official</p>
        <p>Facebook: facebook.com/derp</p>
        <p>Twitter: @derp_platform</p>
      </div>

      <p style={{ marginTop: "20px" }}>
        © 2026 Digital Education Records Platform. All rights reserved.
      </p>
    </footer>
  );
};

const styles = {
  footer: {
    marginTop: "100px",
    padding: "40px",
    background: "#111",
    color: "white",
    textAlign: "center",
  },
};

export default Footer;