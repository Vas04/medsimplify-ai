import { Bell, UserCircle, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "../../services/auth";

function Navbar() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div>
        <p className="text-sm text-slate-500">MedSimplify AI</p>
        <h2 className="text-lg font-semibold text-slate-900">Health Report Dashboard</h2>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100" aria-label="Notifications">
          <Bell size={20} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-blue-600" />
        </button>

        <div className="flex items-center gap-2">
          <UserCircle size={30} className="text-slate-400" />
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-slate-800">{user?.name || "User"}</p>
            <p className="text-xs text-slate-500">{user?.email || "Account"}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
          title="Sign out"
          aria-label="Sign out"
        >
          <LogOut size={19} />
        </button>
      </div>
    </header>
  );
}

export default Navbar;
