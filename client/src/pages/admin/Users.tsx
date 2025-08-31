import { AdminLayout } from "@/components/admin/AdminLayout";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "wouter";
import type { User } from "@shared/schema";

async function getUsers(): Promise<User[]> {
  const res = await apiRequest("GET", "/api/admin/users");
  return res.json();
}

export function AdminUsers() {
  const { data: users, isLoading } = useQuery({
    queryKey: ["admin/users"],
    queryFn: getUsers,
  });

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      {isLoading ? (
        <p>Loading users...</p>
      ) : (
        <div>
          {/* Table for medium screens and up */}
          <Table className="hidden md:table">
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.mobile}</TableCell>
                  <TableCell>{user.balance}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <Link href={`/admin/users/${user.id}`} className="text-blue-500 hover:underline">
                      View Details
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {/* Cards for small screens */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {users?.map((user) => (
              <div key={user.id} className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">{user.username}</span>
                  <span className={`text-sm font-bold ${user.role === 'admin' ? 'text-red-500' : 'text-gray-500'}`}>{user.role}</span>
                </div>
                <p>ID: {user.id}</p>
                <p>Email: {user.email}</p>
                <p>Mobile: {user.mobile}</p>
                <p>Balance: {user.balance}</p>
                <div className="mt-4 flex justify-end">
                  <Link href={`/admin/users/${user.id}`} className="text-blue-500 hover:underline">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
