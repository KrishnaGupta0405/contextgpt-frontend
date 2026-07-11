import { File, Folder } from "lucide-react";

export function FileTree({ children }) {
  return (
    <div className="my-6 rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm">
      <ul className="space-y-1">{children}</ul>
    </div>
  );
}

export function FileTreeItem({ name, folder = false, children }) {
  const Icon = folder ? Folder : File;

  return (
    <li>
      <div className="flex items-center gap-2 text-slate-700">
        <Icon className="h-4 w-4 shrink-0 text-slate-400" />
        {name}
      </div>
      {children && (
        <ul className="ml-5 mt-1 space-y-1 border-l border-slate-200 pl-3">
          {children}
        </ul>
      )}
    </li>
  );
}
