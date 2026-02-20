import { NavLink } from "react-router";
function Navbar(){
    return(
    <div className="Navbar">
        {/* <ul><NavLink to={"/"} >Home</NavLink></ul> */}
        <ul><NavLink to={"/"} >About</NavLink></ul>
        <ul><NavLink to={"/"} >Contact</NavLink></ul>
        <ul><NavLink to={"/"} >Signup</NavLink></ul>

    </div>        

    );
}

export default Navbar;