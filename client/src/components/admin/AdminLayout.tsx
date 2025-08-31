import { Link } from "wouter";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
        <nav>
          <ul>
            <li>
              <Link href="/admin/dashboard" className="block py-2 px-4 hover:bg-gray-700">
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/admin/users" className="block py-2 px-4 hover:bg-gray-700">
                Users
              </Link>
            </li>
            <li>
              <Link href="/admin/images" className="block py-2 px-4 hover:bg-gray-700">
                Images
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-8 bg-gray-100">
        {children}
      </main>
    </div>
  );
}
