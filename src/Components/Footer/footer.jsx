// const Footer = () => {
//   return (
//     <footer style={styles.footer}>
//       <div>
//         <h4>Digital Education Records Platform</h4>
//         <p>Address: 123 Education Street, Haridwar, India</p>
//         <p>Mobile: +91 9693032585</p>
//         <p>Email: derp.digital.erp@gmail.com</p>
//       </div>

//       <div>
//         <p>Instagram: @derp_official</p>
//         <p>Facebook: facebook.com/derp</p>
//         <p>Twitter: @derp_platform</p>
//       </div>

//       <p style={{ marginTop: "20px" }}>
//         © 2026 Digital Education Records Platform. All rights reserved.
//       </p>
//     </footer>
//   );
// };

// const styles = {
//   footer: {
//     marginTop: "100px",
//     padding: "40px",
//     background: "#111",
//     color: "white",
//     textAlign: "center",

//   },
// };

// export default Footer;









import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin } from "react-icons/fa";
import { MdEmail, MdPhone, MdLocationOn } from "react-icons/md";
import { Link } from "react-router";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">

      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* ── Company Info ── */}
        <div>
          <h2 className="text-xl font-bold text-white mb-3">
            Digital Education Records Platform
          </h2>
          <p className="flex items-center gap-2 text-sm mb-2">
            <MdLocationOn /> Haridwar, India
          </p>
          <p className="flex items-center gap-2 text-sm mb-2">
            <MdPhone /> +91 9693032585
          </p>
          <p className="flex items-center gap-2 text-sm">
            <MdEmail /> derp.digital.erp@gmail.com
          </p>
        </div>


        {/* ── Quick Links ── */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Quick Links</h3>

          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/" className="hover:text-white transition">
                Home
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-white transition">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/features" className="hover:text-white transition">
                Features
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-white transition">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* ── Social Media ── */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Connect With Us</h3>
          <div className="flex gap-4 text-xl">
            <FaInstagram className="hover:text-pink-500 cursor-pointer" />
            <FaFacebook className="hover:text-blue-500 cursor-pointer" />
            <FaTwitter className="hover:text-blue-400 cursor-pointer" />
            <FaLinkedin className="hover:text-blue-600 cursor-pointer" />
          </div>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700 text-center py-4 text-sm">
        © {new Date().getFullYear()} Digital Education Records Platform. All rights reserved.
      </div>

    </footer>
  );
};

export default Footer;