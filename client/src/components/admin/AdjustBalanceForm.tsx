import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  username: z.string().min(1, "Username is required"),
  amount: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().min(-1000000).max(1000000)
  ),
});

export function AdjustBalanceForm() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      amount: 0,
    },
  });

  const mutation = useMutation({
    mutationFn: (values: z.infer<typeof formSchema>) =>
      apiRequest("POST", "/api/admin/users/adjust-balance", values),
    onSuccess: () => {
      toast({ title: "Balance adjusted successfully" });
      form.reset();
    },
    onError: (error: any) => {
      toast({ title: "Error adjusting balance", description: error.message, variant: "destructive" });
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutation.mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Enter username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Enter amount" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={mutation.isPending}>
          Adjust Balance
        </Button>
      </form>
    </Form>
  );
}
