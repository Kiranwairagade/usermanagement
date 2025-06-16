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
  Boxes,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';
import { 
  masterModules, 
  operationsModules, 
  storageModules, 
  adminModules 
} from '../../config/modules';
import './Sidebar.css';

const icons = {
  // Master modules
  'Categories': <Tag size={18} />,
  'Brands': <Box size={18} />,
  'Suppliers': <Truck size={18} />,
  'Products': <PackageSearch size={18} />,
  'Roles': <ShieldCheck size={18} />,
  // Operations
  'Production Orders': <ClipboardList size={18} />,
  'Material Receipt': <PackagePlus size={18} />,
  'Quality Check': <PackageCheck size={18} />,
  // Storage
  'Inventory Management': <Warehouse size={18} />,
  'Stock Transfers': <Forklift size={18} />,
  'Stock Adjustments': <Boxes size={18} />,
  // Admin
  'User Management': <UserCog size={18} />,
  'ChatBot': <MessageSquare size={18} />,
  'Activity Log': <ClipboardList size={18} />  // ✅ Added icon
};

const Sidebar = () => {
  const { logout } = useAuth();
  const { hasPermission, isLoading } = usePermission();
  const navigate = useNavigate();

  const [mastersOpen, setMastersOpen] = useState(false);
  const [operationsOpen, setOperationsOpen] = useState(false);
  const [storageOpen, setStorageOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRestrictedClick = (e, module) => {
    const modulePathName = module.toLowerCase().replace(/\s+/g, '-');
    if (!hasPermission(modulePathName, 'view')) {
      e.preventDefault();
      alert(`You don't have permission to access the ${module} module.`);
    }
  };

  const renderModuleLinks = (modulesList) => {
    return modulesList.map((module) => {
      const path = `/${module.toLowerCase().replace(/\s+/g, '-')}`;
      const modulePathName = module.toLowerCase().replace(/\s+/g, '-');
      const hasAccess = !isLoading && hasPermission(modulePathName, 'view');

      return (
        <li key={module}>
          <NavLink
            to={path}
            className={`sidebar-link ${!hasAccess ? 'restricted' : ''}`}
            onClick={(e) => handleRestrictedClick(e, module)}
          >
            {icons[module] || <Box size={18} />}
            <span>{module}</span>
            {!hasAccess && <Lock size={14} className="lock-icon" />}
          </NavLink>
        </li>
      );
    });
  };

  return (
    <div className="sidebar">
      <div className="sidebar-content">
        {/* Masters */}
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
              {renderModuleLinks(masterModules)}
            </ul>
          )}
        </div>

        {/* Operations */}
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
              {renderModuleLinks(operationsModules)}
            </ul>
          )}
        </div>

        {/* Storage */}
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
              {renderModuleLinks(storageModules)}
            </ul>
          )}
        </div>

        {/* Admin */}
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
              {renderModuleLinks(adminModules)}
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
