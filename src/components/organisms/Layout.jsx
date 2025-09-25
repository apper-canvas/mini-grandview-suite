import React, { useState } from 'react'
import Sidebar from './Sidebar'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'
import LogoutButton from '@/components/atoms/LogoutButton'

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Mobile header */}
      <div className="lg:hidden bg-white shadow-sm border-b border-slate-200 sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="mr-2 p-2"
            >
              <ApperIcon name="Menu" className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gradient-to-r from-primary to-blue-600 rounded-lg flex items-center justify-center">
                <ApperIcon name="Building2" className="h-5 w-5 text-white" />
              </div>
              <div className="ml-2">
                <h1 className="text-lg font-bold gradient-text">Grandview Suite</h1>
              </div>
            </div>
          </div>
          
<Button variant="ghost" size="sm" className="p-2">
            <ApperIcon name="Bell" className="h-5 w-5" />
          </Button>
          <LogoutButton />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;