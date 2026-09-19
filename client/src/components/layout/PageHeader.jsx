import { Menu } from "lucide-react";

function PageHeader({ title, description, onMenuClick }) {
  return (
    <div className="mb-8 flex items-start gap-4">

      <button
        onClick={onMenuClick}
        className="mt-1 rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
      >
        <Menu size={22} />
      </button>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>

        {description && (
          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>
        )}
      </div>

    </div>
  );
}

export default PageHeader;