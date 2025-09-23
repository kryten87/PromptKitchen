import {
  LiaCogSolid,
  LiaHomeSolid,
  LiaQuestionCircleSolid,
  LiaSignOutAltSolid,
  LiaUserFriendsSolid,
} from 'react-icons/lia';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSession } from '../hooks/useSession';

const NavItem = ({ to, icon, label, testId }: { to: string, icon: React.ReactNode, label: string, testId?: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center px-4 py-2 text-lg rounded-lg transition-colors duration-200 ${
        isActive
          ? 'bg-primary text-white'
          : 'text-text-secondary hover:bg-btn-subtle-hover'
      }`
    }
    data-testid={testId}
  >
    <span className="mr-3">{icon}</span>
    {label}
  </NavLink>
);

function Sidebar() {
  const navigate = useNavigate();
  const { setUser } = useSession();

  const handleLogout = () => {
    setUser(null);
    navigate('/');
  };

  return (
    <div className="flex flex-col h-full p-4 bg-white shadow-lg">
      <div className="flex items-center mb-8">
        <span className="ml-3 text-2xl font-bold" data-testid="sidebar-title">Prompt Kitchen</span>
      </div>

      <nav className="flex-grow">
        <ul>
          <li><NavItem to="/dashboard" icon={<LiaHomeSolid />} label="Home" testId="sidebar-home-link" /></li>
        </ul>

        <h2 className="mt-8 mb-4 text-sm font-semibold text-gray-400 uppercase">Tools</h2>
        <ul>
          <li><NavItem to="/settings" icon={<LiaCogSolid />} label="Settings" /></li>
          <li><NavItem to="/help" icon={<LiaQuestionCircleSolid />} label="Help" /></li>
          <li><NavItem to="/manage-users" icon={<LiaUserFriendsSolid />} label="Manage user" /></li>
        </ul>
      </nav>

      <div>
        <button
          className="flex items-center w-full px-4 py-2 text-lg text-text-secondary rounded-lg bg-btn-subtle hover:bg-btn-subtle-hover"
          onClick={handleLogout}
          data-testid="sidebar-logout-button"
        >
          <LiaSignOutAltSolid className="mr-3" />
          Log out
        </button>
        <div className="mt-2 px-4 text-xs text-gray-400" data-testid="sidebar-version">
          v{__APP_VERSION__}
        </div>
      </div>
    </div>
  );
}

export { Sidebar };
