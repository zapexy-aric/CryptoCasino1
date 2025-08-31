import { AdminLayout } from "@/components/admin/AdminLayout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  landing_page_logo: z.string().url("Please enter a valid URL"),
});

async function getImages(): Promise<Record<string, string>> {
  const res = await apiRequest("GET", "/api/images");
  return res.json();
}

export function AdminImages() {
  const { toast } = useToast();
  const { data: images, isLoading } = useQuery({
    queryKey: ["images"],
    queryFn: getImages,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      landing_page_logo: images?.landing_page_logo || "",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: { key: string, url: string }) =>
      apiRequest("POST", "/api/admin/images", values),
    onSuccess: () => {
      toast({ title: "Image updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error updating image", description: error.message, variant: "destructive" });
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutation.mutate({ key: "landing_page_logo", url: values.landing_page_logo });
  }

  if (isLoading) {
    return <AdminLayout><div>Loading...</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Image Management</h1>
      <div className="bg-white p-4 rounded-lg shadow">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="landing_page_logo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Landing Page Logo URL</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter image URL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={mutation.isPending}>
              Save
            </Button>
          </form>
        </Form>
      </div>
    </AdminLayout>
  );
}
