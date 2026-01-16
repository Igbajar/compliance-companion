import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRealtimeSubscription } from "./useRealtimeSubscription";

export interface Employee {
  id: string;
  user_id: string | null;
  employee_number: string | null;
  full_name: string;
  email: string;
  department: string | null;
  job_title: string | null;
  phone: string | null;
  hire_date: string | null;
  status: string | null;
  skills: string[] | null;
  certifications: string[] | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface EmployeeInsert {
  user_id?: string | null;
  employee_number?: string | null;
  full_name: string;
  email: string;
  department?: string | null;
  job_title?: string | null;
  phone?: string | null;
  hire_date?: string | null;
  status?: string | null;
  skills?: string[] | null;
  certifications?: string[] | null;
}

export interface EmployeeUpdate {
  user_id?: string | null;
  employee_number?: string | null;
  full_name?: string;
  email?: string;
  department?: string | null;
  job_title?: string | null;
  phone?: string | null;
  hire_date?: string | null;
  status?: string | null;
  skills?: string[] | null;
  certifications?: string[] | null;
}

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .order("full_name", { ascending: true });

      if (error) throw error;
      setEmployees(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching employees",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Realtime subscriptions
  useRealtimeSubscription<Record<string, unknown>>(
    "employees" as any,
    (newEmployee) => setEmployees((prev) => [...prev, newEmployee as unknown as Employee].sort((a, b) => a.full_name.localeCompare(b.full_name))),
    (updatedEmployee) => setEmployees((prev) => prev.map((e) => (e.id === (updatedEmployee as unknown as Employee).id ? (updatedEmployee as unknown as Employee) : e))),
    ({ id }) => setEmployees((prev) => prev.filter((e) => e.id !== id))
  );

  const createEmployee = async (employee: EmployeeInsert) => {
    try {
      const { data, error } = await supabase
        .from("employees")
        .insert(employee)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Employee created",
        description: "The employee has been added successfully.",
      });
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Error creating employee",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const updateEmployee = async (id: string, updates: EmployeeUpdate) => {
    try {
      const { data, error } = await supabase
        .from("employees")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Employee updated",
        description: "The employee has been updated successfully.",
      });
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Error updating employee",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      const { error } = await supabase
        .from("employees")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Employee deleted",
        description: "The employee has been removed successfully.",
      });
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Error deleting employee",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  return {
    employees,
    loading,
    fetchEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  };
};
