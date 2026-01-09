import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";
import { useRealtimeSubscription } from "./useRealtimeSubscription";

export type TrainingCourse = Tables<"training_courses">;
export type TrainingCourseInsert = TablesInsert<"training_courses">;
export type TrainingCourseUpdate = TablesUpdate<"training_courses">;

export type TrainingRecord = Tables<"training_records">;
export type TrainingRecordInsert = TablesInsert<"training_records">;
export type TrainingRecordUpdate = TablesUpdate<"training_records">;

export const useTrainingCourses = () => {
  const [courses, setCourses] = useState<TrainingCourse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("training_courses")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching courses:", error);
    } else {
      setCourses(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Realtime subscriptions
  useRealtimeSubscription<TrainingCourse>(
    "training_courses",
    (newCourse) => setCourses((prev) => [newCourse, ...prev]),
    (updatedCourse) =>
      setCourses((prev) =>
        prev.map((c) => (c.id === updatedCourse.id ? updatedCourse : c))
      ),
    ({ id }) => setCourses((prev) => prev.filter((c) => c.id !== id))
  );

  const createCourse = async (course: TrainingCourseInsert) => {
    const { data, error } = await supabase
      .from("training_courses")
      .insert(course)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateCourse = async (id: string, updates: TrainingCourseUpdate) => {
    const { data, error } = await supabase
      .from("training_courses")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const deleteCourse = async (id: string) => {
    const { error } = await supabase.from("training_courses").delete().eq("id", id);
    if (error) throw error;
  };

  return {
    courses,
    loading,
    fetchCourses,
    createCourse,
    updateCourse,
    deleteCourse,
  };
};

export const useTrainingRecords = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<(TrainingRecord & { course?: TrainingCourse })[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("training_records")
      .select(`
        *,
        course:training_courses(*)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching records:", error);
    } else {
      setRecords(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Realtime subscriptions - refetch to get joined data
  useRealtimeSubscription<TrainingRecord>(
    "training_records",
    () => fetchRecords(),
    () => fetchRecords(),
    ({ id }) => setRecords((prev) => prev.filter((r) => r.id !== id))
  );

  const createRecord = async (record: Omit<TrainingRecordInsert, "user_id">) => {
    const { data, error } = await supabase
      .from("training_records")
      .insert({ ...record, user_id: user?.id || "" })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateRecord = async (id: string, updates: TrainingRecordUpdate) => {
    const { data, error } = await supabase
      .from("training_records")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const deleteRecord = async (id: string) => {
    const { error } = await supabase.from("training_records").delete().eq("id", id);
    if (error) throw error;
  };

  return {
    records,
    loading,
    fetchRecords,
    createRecord,
    updateRecord,
    deleteRecord,
  };
};
