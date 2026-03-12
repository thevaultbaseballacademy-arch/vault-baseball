import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Coach } from "@/hooks/useCoachManagement";

const coachFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["Coach", "Director", "OrgAdmin", "VAULTHQ"]),
  org_id: z.string().uuid("Invalid organization ID"),
  team_id: z.string().uuid("Invalid team ID").optional().or(z.literal("")),
  location: z.string().optional().or(z.literal("")),
  bio: z.string().optional().or(z.literal("")),
  specialties: z.string().optional().or(z.literal("")),
  years_experience: z.coerce.number().int().min(0).optional().or(z.literal("").transform(() => undefined)),
});

type CoachFormValues = z.infer<typeof coachFormSchema>;

interface CoachFormProps {
  coach?: Coach | null;
  onSubmit: (values: CoachFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const CoachForm = ({ coach, onSubmit, onCancel, isSubmitting }: CoachFormProps) => {
  const form = useForm<CoachFormValues>({
    resolver: zodResolver(coachFormSchema),
    defaultValues: {
      name: coach?.name || "",
      email: coach?.email || "",
      role: coach?.role || "Coach",
      org_id: coach?.org_id || crypto.randomUUID(),
      team_id: coach?.team_id || "",
    },
  });

  const handleSubmit = (values: CoachFormValues) => {
    onSubmit({
      ...values,
      team_id: values.team_id || undefined,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Coach name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="coach@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Coach">Coach</SelectItem>
                  <SelectItem value="Director">Director</SelectItem>
                  <SelectItem value="OrgAdmin">Org Admin</SelectItem>
                  <SelectItem value="VAULTHQ">VAULT HQ</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="org_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization ID</FormLabel>
              <FormControl>
                <Input placeholder="Organization UUID" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="team_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Team ID (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Team UUID (optional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : coach ? "Update Coach" : "Add Coach"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
