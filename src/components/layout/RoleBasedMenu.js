// src/components/layout/RoleBasedMenu.js
import React from 'react';
import { Menu } from 'antd';
import { useHistory, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  TeamOutlined,
  BankOutlined,
  SettingOutlined,
  FileTextOutlined,
  DollarOutlined,
  UserOutlined,
  SafetyOutlined,
  HomeOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { isSuperAdmin, isAdmin } from '../../utils/auth';

const { SubMenu } = Menu;

const RoleBasedMenu = () => {
  const history = useHistory();
  const location = useLocation();

  // Get current path for active menu item
  const currentPath = location.pathname;

  // Common menu items for all roles
  const commonMenuItems = [
    {
      key: '/home',
      icon: <HomeOutlined />,
      label: 'Home',
      onClick: () => history.push('/home'),
    },
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => history.push('/profile'),
    },
  ];

  // Super Admin exclusive menu items
  const superAdminMenuItems = [
    {
      key: '/super-admin',
      icon: <SafetyOutlined />,
      label: 'Super Admin',
      onClick: () => history.push('/super-admin'),
    },
  ];

  // Admin menu items (accessible by both admin and super admin)
  const adminMenuItems = [
    {
      key: 'organization',
      icon: <BankOutlined />,
      label: 'Organization',
      children: [
        {
          key: '/forane',
          label: 'Forane',
          onClick: () => history.push('/forane'),
        },
        {
          key: '/parish',
          label: 'Parish',
          onClick: () => history.push('/parish'),
        },
        {
          key: '/koottayma',
          label: 'Koottayma',
          onClick: () => history.push('/koottayma'),
        },
        {
          key: '/Family',
          label: 'Family',
          onClick: () => history.push('/Family'),
        },
      ],
    },
    {
      key: 'finance',
      icon: <DollarOutlined />,
      label: 'Finance',
      children: [
        {
          key: '/PersonManagement',
          label: 'Person Management',
          onClick: () => history.push('/PersonManagement'),
        },
        {
          key: '/FamilyFinance',
          label: 'Family Finance',
          onClick: () => history.push('/FamilyFinance'),
        },
        {
          key: '/transactions',
          label: 'Transactions',
          onClick: () => history.push('/transactions'),
        },
        {
          key: '/Titheprint',
          label: 'Tithe Print',
          onClick: () => history.push('/Titheprint'),
        },
      ],
    },
    {
      key: 'reports',
      icon: <FileTextOutlined />,
      label: 'Reports',
      children: [
        {
          key: '/report',
          label: 'Church Report',
          onClick: () => history.push('/report'),
        },
        {
          key: '/ReportsDashboard',
          label: 'Comprehensive Reports',
          onClick: () => history.push('/ReportsDashboard'),
        },
        {
          key: '/AuditDashboard',
          label: 'Audit Dashboard',
          onClick: () => history.push('/AuditDashboard'),
        },
      ],
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      children: [
        {
          key: '/FinanceSettings',
          label: 'Finance Settings',
          onClick: () => history.push('/FinanceSettings'),
        },
        {
          key: '/communitysettings',
          label: 'Community Settings',
          onClick: () => history.push('/communitysettings'),
        },
        {
          key: '/otherprojectsettings',
          label: 'Project Settings',
          onClick: () => history.push('/otherprojectsettings'),
        },
        {
          key: '/parishallocsettings',
          label: 'Parish Allocation',
          onClick: () => history.push('/parishallocsettings'),
        },
      ],
    },
    {
      key: 'other',
      icon: <AppstoreOutlined />,
      label: 'Other',
      children: [
        {
          key: '/community',
          label: 'Community',
          onClick: () => history.push('/community'),
        },
        {
          key: '/project',
          label: 'Projects',
          onClick: () => history.push('/project'),
        },
        {
          key: '/movefamily',
          label: 'Move Family',
          onClick: () => history.push('/movefamily'),
        },
        {
          key: '/addopening',
          label: 'Opening Balance',
          onClick: () => history.push('/addopening'),
        },
        {
          key: '/yearendtransfer',
          label: 'Year End Transfer',
          onClick: () => history.push('/yearendtransfer'),
        },
      ],
    },
  ];

  // Build menu based on role
  const getMenuItems = () => {
    let menuItems = [...commonMenuItems];

    if (isSuperAdmin()) {
      // Super admin gets everything
      // menuItems = [...superAdminMenuItems, ...menuItems, ...adminMenuItems];
      menuItems = [...menuItems, ...adminMenuItems];
    } else if (isAdmin()) {
      // Regular admin gets standard menu
      menuItems = [...menuItems, ...adminMenuItems];
    }

    return menuItems;
  };

  // Render menu items recursively
  const renderMenuItems = (items) => {
    return items.map((item) => {
      if (item.children) {
        return (
          <SubMenu key={item.key} icon={item.icon} title={item.label}>
            {renderMenuItems(item.children)}
          </SubMenu>
        );
      }
      return (
        <Menu.Item key={item.key} icon={item.icon} onClick={item.onClick}>
          {item.label}
        </Menu.Item>
      );
    });
  };

  return (
    <Menu
      mode="inline"
      selectedKeys={[currentPath]}
      defaultOpenKeys={['organization', 'finance', 'reports', 'settings', 'other']}
      style={{ height: '100%', borderRight: 0 }}
    >
      {renderMenuItems(getMenuItems())}
    </Menu>
  );
};

export default RoleBasedMenu;