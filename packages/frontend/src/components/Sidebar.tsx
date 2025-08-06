import {
  LiaHomeSolid,
  LiaChartBarSolid,
  LiaCompassSolid,
  LiaShoppingBagSolid,
  LiaCommentSolid,
  LiaCogSolid,
  LiaQuestionCircleSolid,
  LiaUserFriendsSolid,
  LiaSignOutAltSolid,
} from 'react-icons/lia';
import { NavLink } from 'react-router-dom';

const NavItem = ({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center px-4 py-2 text-lg rounded-lg transition-colors duration-200 ${
        isActive
          ? 'bg-gray-900 text-white'
          : 'text-gray-600 hover:bg-gray-100'
      }`
    }
  >
    <span className="mr-3">{icon}</span>
    {label}
  </NavLink>
);

function Sidebar() {
  return (
    <div className="flex flex-col h-full p-4 bg-white shadow-lg">
      <div className="flex items-center mb-8">
        <div className="bg-gray-900 text-white text-2xl font-bold rounded-full w-10 h-10 flex items-center justify-center">
          X
        </div>
        <span className="ml-3 text-2xl font-bold">Xenith</span>
      </div>

      <nav className="flex-grow">
        <ul>
          <li><NavItem to="/dashboard" icon={<LiaHomeSolid />} label="Home" /></li>
          <li><NavItem to="/analytics" icon={<LiaChartBarSolid />} label="Analytics" /></li>
          <li><NavItem to="/explore" icon={<LiaCompassSolid />} label="Explore" /></li>
          <li><NavItem to="/shop" icon={<LiaShoppingBagSolid />} label="Shop" /></li>
          <li><NavItem to="/chat" icon={<LiaCommentSolid />} label="Chat" /></li>
        </ul>

        <h2 className="mt-8 mb-4 text-sm font-semibold text-gray-400 uppercase">Tools</h2>
        <ul>
          <li><NavItem to="/settings" icon={<LiaCogSolid />} label="Settings" /></li>
          <li><NavItem to="/help" icon={<LiaQuestionCircleSolid />} label="Help" /></li>
          <li><NavItem to="/manage-users" icon={<LiaUserFriendsSolid />} label="Manage user" /></li>
        </ul>
      </nav>

      <div>
        <button className="flex items-center w-full px-4 py-2 text-lg text-gray-600 rounded-lg hover:bg-gray-100">
          <LiaSignOutAltSolid className="mr-3" />
          Log out
        </button>
      </div>
    </div>
  );
}

export { Sidebar };
