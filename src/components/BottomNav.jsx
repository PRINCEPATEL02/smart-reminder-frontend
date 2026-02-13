import { NavLink } from 'react-router-dom';
import { FaHome, FaChartBar, FaUser } from 'react-icons/fa';

const BottomNav = () => {
    return (
        <nav className="bottom-nav">
            <NavLink
                to="/"
                className={({ isActive }) =>
                    `bottom-nav-item ${isActive ? 'active' : ''}`
                }
                end
            >
                <FaHome className="bottom-nav-icon" />
                <span className="bottom-nav-label">Today</span>
            </NavLink>

            <NavLink
                to="/stats"
                className={({ isActive }) =>
                    `bottom-nav-item ${isActive ? 'active' : ''}`
                }
            >
                <FaChartBar className="bottom-nav-icon" />
                <span className="bottom-nav-label">Stats</span>
            </NavLink>

            <NavLink
                to="/profile"
                className={({ isActive }) =>
                    `bottom-nav-item ${isActive ? 'active' : ''}`
                }
            >
                <FaUser className="bottom-nav-icon" />
                <span className="bottom-nav-label">Profile</span>
            </NavLink>
        </nav>
    );
};

export default BottomNav;
