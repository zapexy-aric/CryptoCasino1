import { AdminLayout } from "@/components/admin/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { AdjustBalanceForm } from "@/components/admin/AdjustBalanceForm";
import type { Transaction, User } from "@shared/schema";

async function getPendingTransactions(): Promise<Transaction[]> {
  const res = await apiRequest("GET", "/api/admin/transactions?status=pending");
  return res.json();
}

async function getUsers(): Promise<User[]> {
  const res = await apiRequest("GET", "/api/admin/users");
  return res.json();
}

export function AdminDashboard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ["admin/transactions/pending"],
    queryFn: getPendingTransactions,
  });

  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["admin/users"],
    queryFn: getUsers,
  });

  const approveMutation = useMutation({
    mutationFn: (transactionId: string) => apiRequest("POST", `/api/admin/transactions/${transactionId}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin/transactions/pending"] });
      toast({ title: "Transaction approved" });
    },
    onError: (error: any) => {
      toast({ title: "Error approving transaction", description: error.message, variant: "destructive" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (transactionId: string) => apiRequest("POST", `/api/admin/transactions/${transactionId}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin/transactions/pending"] });
      toast({ title: "Transaction rejected" });
    },
    onError: (error: any) => {
      toast({ title: "Error rejecting transaction", description: error.message, variant: "destructive" });
    },
  });

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Site Statistics</h2>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-lg">Total Users: {isLoadingUsers ? '...' : users?.length}</p>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Adjust User Balance</h2>
          <div className="bg-white p-4 rounded-lg shadow">
            <AdjustBalanceForm />
          </div>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">Pending Transactions</h2>
      {isLoadingTransactions ? (
        <p>Loading transactions...</p>
      ) : (
        <div>
          {/* Table for medium screens and up */}
          <Table className="hidden md:table">
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions?.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{tx.userId}</TableCell>
                  <TableCell>{tx.type}</TableCell>
                  <TableCell>{tx.amount}</TableCell>
                  <TableCell>{tx.currency}</TableCell>
                  <TableCell>{new Date(tx.createdAt).toLocaleString()}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      className="mr-2"
                      onClick={() => approveMutation.mutate(tx.id)}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => rejectMutation.mutate(tx.id)}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                    >
                      Reject
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {/* Cards for small screens */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {transactions?.map((tx) => (
              <div key={tx.id} className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">{tx.type}</span>
                  <span className="text-sm text-gray-500">{new Date(tx.createdAt).toLocaleDateString()}</span>
                </div>
                <p>User ID: {tx.userId}</p>
                <p>Amount: {tx.amount} {tx.currency}</p>
                <div className="mt-4 flex justify-end">
                  <Button
                    size="sm"
                    className="mr-2"
                    onClick={() => approveMutation.mutate(tx.id)}
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => rejectMutation.mutate(tx.id)}
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
