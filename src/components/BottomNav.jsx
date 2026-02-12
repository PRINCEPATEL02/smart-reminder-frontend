import { NavLink } from 'react-router-dom';
import { FaHome, FaCalendarAlt, FaChartBar, FaBell, FaUser } from 'react-icons/fa';

const navItems = [
    { path: '/', label: 'Today', icon: FaHome },
    { path: '/stats', label: 'Stats', icon: FaChartBar },
    { path: '/profile', label: 'Profile', icon: FaUser },
    { path: '/add-task', label: 'Add', icon: FaBell }, // Hidden visually but needed for mobile nav
];

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

            {/* Spacer for FAB */}
            <div className="w-14" />
        </nav>
    );
};

export default BottomNav;
