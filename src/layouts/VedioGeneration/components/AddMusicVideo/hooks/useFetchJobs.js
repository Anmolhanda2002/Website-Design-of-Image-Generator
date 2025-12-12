import { useCallback, useEffect, useRef, useState } from "react";
import axiosInstance from "utils/AxiosInstance";

/**
 * useFetchJobs:
 * - fetches jobs for selectedUser with pagination
 * - supports loadNextPage for infinite scroll
 * - deduplicates results
 */
export default function useFetchJobs(selectedUser) {
  const [jobs, setJobs] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const fetchingRef = useRef(false);

  const reset = useCallback(() => {
    setJobs([]);
    setCurrentPage(0);
    setTotalPages(1);
  }, []);

  useEffect(() => {
    // when selectedUser changes, reset and fetch first page
    reset();
    if (selectedUser?.user_id) {
      loadPage(1, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser?.user_id]);

  const loadPage = useCallback(
    async (page = 1, replace = false) => {
      if (!selectedUser?.user_id) return;
      if (fetchingRef.current) return;
      if (page > totalPages) return;
      try {
        fetchingRef.current = true;
        setLoading(true);

        const res = await axiosInstance.get("/get_user_all_jobs/", {
          params: { user_id: selectedUser.user_id, page },
        });

        if (!res.data?.success) {
          if (replace) setJobs([]);
          return;
        }

        // filter only jobs with final_video_url (like your original logic)
        const fetched = (res.data.data || []).filter((j) => j.final_video_url);

        setJobs((prev) => {
          if (replace) return fetched;
          // dedupe by job_id
          const map = new Map(prev.map((p) => [p.job_id, p]));
          fetched.forEach((f) => map.set(f.job_id, f));
          return Array.from(map.values());
        });

        setCurrentPage(res.data.current_page || page);
        setTotalPages(res.data.total_pages || 1);
      } catch (err) {
        // swallow or handle
        // console.error("fetch jobs error", err);
      } finally {
        fetchingRef.current = false;
        setLoading(false);
      }
    },
    [selectedUser?.user_id, totalPages]
  );

  const loadNextPage = useCallback(() => {
    if (currentPage >= totalPages) return;
    loadPage(currentPage + 1, false);
  }, [currentPage, totalPages, loadPage]);

  const refresh = useCallback(() => {
    loadPage(1, true);
  }, [loadPage]);

  const hasMore = currentPage < totalPages;

  // expose a setter to set jobs externally if needed
  const setJobsFromExternal = useCallback((arr) => {
    setJobs(arr || []);
  }, []);

  return {
    jobs,
    loading,
    currentPage,
    totalPages,
    loadNextPage,
    refresh,
    hasMore,
    setJobsFromExternal,
  };
}
