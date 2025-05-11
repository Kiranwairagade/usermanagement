import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usePermission } from '../../contexts/PermissionContext';
import {
  UserCog,
  LogOut,
  Box,
  Tag,
  Truck,
  PackageSearch,
  Users,
  Lock,
  ChevronDown,
  ChevronUp,
  Factory,
  Warehouse,
  ClipboardList,
  PackagePlus,
  PackageCheck,
  PackageX,
  Forklift,
  Boxes, // Using Boxes instead of Pallet
  ShieldCheck // Icon for Roles
} from 'lucide-react';
import masterModules from '../../config/modules'; // Import the modules configuration
import './Sidebar.css';

const icons = {
  Categories: <Tag size={18} />,
  Brands: <Box size={18} />,
  Suppliers: <Truck size={18} />,
  Products: <PackageSearch size={18} />,
  Employees: <Users size={18} />,
  Roles: <ShieldCheck size={18} />, // Icon for Roles
  // Operations icons
  'Production Orders': <ClipboardList size={18} />,
  'Material Receipt': <PackagePlus size={18} />,
  'Quality Check': <PackageCheck size={18} />,
  // Storage icons
  'Inventory Management': <Warehouse size={18} />,
  'Stock Transfers': <Forklift size={18} />,
  'Stock Adjustments': <Boxes size={18} /> // Changed from Pallet to Boxes
};

const Sidebar = () => {
  const { logout } = useAuth();
  const { hasPermission, isLoading } = usePermission();
  const navigate = useNavigate();
  const [mastersOpen, setMastersOpen] = useState(true);
  const [operationsOpen, setOperationsOpen] = useState(true);
  const [storageOpen, setStorageOpen] = useState(true);
  const [adminOpen, setAdminOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRestrictedClick = (e, module) => {
    if (!hasPermission(module.toLowerCase(), 'view')) {
      e.preventDefault();
      alert(`You don't have permission to access the ${module} module.`);
    }
  };

  // Define operations and storage modules
  const operationsModules = ['Production Orders', 'Material Receipt', 'Quality Check'];
  const storageModules = ['Inventory Management', 'Stock Transfers', 'Stock Adjustments'];

  return (
    <div className="sidebar">
      <div className="sidebar-content">
        <div className="sidebar-section">
          <div
            className="sidebar-section-header"
            onClick={() => setMastersOpen(!mastersOpen)}
          >
            <h2>Masters</h2>
            {mastersOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
          {mastersOpen && (
            <ul className="sidebar-list">
              {masterModules.map((module) => {
                const path = `/${module.toLowerCase().replace(' ', '-')}`;
                const hasAccess = !isLoading && hasPermission(module.toLowerCase().replace(' ', '-'), 'view');

                return (
                  <li key={module}>
                    <NavLink
                      to={path}
                      className={`sidebar-link ${!hasAccess ? 'restricted' : ''}`}
                      onClick={(e) => handleRestrictedClick(e, module)}
                    >
                      {icons[module]}
                      <span>{module}</span>
                      {!hasAccess && <Lock size={14} className="lock-icon" />}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="sidebar-section">
          <div
            className="sidebar-section-header"
            onClick={() => setOperationsOpen(!operationsOpen)}
          >
            <h2>Operations</h2>
            {operationsOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
          {operationsOpen && (
            <ul className="sidebar-list">
              {operationsModules.map((module) => {
                const path = `/${module.toLowerCase().replace(' ', '-')}`;
                const hasAccess = !isLoading && hasPermission(module.toLowerCase().replace(' ', '-'), 'view');

                return (
                  <li key={module}>
                    <NavLink
                      to={path}
                      className={`sidebar-link ${!hasAccess ? 'restricted' : ''}`}
                      onClick={(e) => handleRestrictedClick(e, module)}
                    >
                      {icons[module]}
                      <span>{module}</span>
                      {!hasAccess && <Lock size={14} className="lock-icon" />}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="sidebar-section">
          <div
            className="sidebar-section-header"
            onClick={() => setStorageOpen(!storageOpen)}
          >
            <h2>Storage</h2>
            {storageOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
          {storageOpen && (
            <ul className="sidebar-list">
              {storageModules.map((module) => {
                const path = `/${module.toLowerCase().replace(' ', '-')}`;
                const hasAccess = !isLoading && hasPermission(module.toLowerCase().replace(' ', '-'), 'view');

                return (
                  <li key={module}>
                    <NavLink
                      to={path}
                      className={`sidebar-link ${!hasAccess ? 'restricted' : ''}`}
                      onClick={(e) => handleRestrictedClick(e, module)}
                    >
                      {icons[module]}
                      <span>{module}</span>
                      {!hasAccess && <Lock size={14} className="lock-icon" />}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="sidebar-section">
          <div
            className="sidebar-section-header"
            onClick={() => setAdminOpen(!adminOpen)}
          >
            <h2>Admin</h2>
            {adminOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
          {adminOpen && (
            <ul className="sidebar-list">
              <li>
                <NavLink to="/user-management" className="sidebar-link">
                  <UserCog size={18} /> <span>User Management</span>
                </NavLink>
              </li>

              <li>
                <NavLink to="/chatbot" className="sidebar-link">
                  <UserCog size={18} /> <span>ChatBot</span>
                </NavLink>
              </li>
            </ul>
          )}
        </div>
      </div>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={18} /> <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;