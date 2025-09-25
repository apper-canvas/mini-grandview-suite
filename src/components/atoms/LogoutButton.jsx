import React, { useContext } from 'react';
import Button from './Button';
import ApperIcon from '../ApperIcon';
import { AuthContext } from '../../App';

const LogoutButton = () => {
  const { logout } = useContext(AuthContext);

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={logout}
      className="p-2 text-slate-600 hover:text-slate-900"
      title="Logout"
    >
      <ApperIcon name="LogOut" className="h-5 w-5" />
    </Button>
  );
};

export default LogoutButton;