import { AdminLayout } from "@/components/admin/AdminLayout";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useParams } from "wouter";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { User, Transaction } from "@shared/schema";

type UserDetails = User & { transactions: Transaction[] };

async function getUserDetails(id: string): Promise<UserDetails> {
  const res = await apiRequest("GET", `/api/admin/users/${id}`);
  return res.json();
}

export function AdminUserDetails() {
  const params = useParams();
  const id = params.id as string;

  const { data: user, isLoading } = useQuery({
    queryKey: ["admin/user", id],
    queryFn: () => getUserDetails(id),
  });

  return (
    <AdminLayout>
      {isLoading ? (
        <p>Loading user details...</p>
      ) : user ? (
        <div>
          <h1 className="text-2xl font-bold mb-4">User Details</h1>
          <div className="bg-white p-4 rounded-lg shadow mb-8">
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Mobile:</strong> {user.mobile}</p>
            <p><strong>Balance:</strong> {user.balance}</p>
            <p><strong>Role:</strong> {user.role || 'user'}</p>
            <p><strong>Joined:</strong> {user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}</p>
          </div>
          <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {user.transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{tx.id}</TableCell>
                  <TableCell>{tx.type}</TableCell>
                  <TableCell>{tx.amount}</TableCell>
                  <TableCell>{tx.status}</TableCell>
                  <TableCell>{tx.createdAt ? new Date(tx.createdAt).toLocaleString() : 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p>User not found.</p>
      )}
    </AdminLayout>
  );
}
