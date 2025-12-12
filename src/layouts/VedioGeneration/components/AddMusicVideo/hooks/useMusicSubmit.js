import { useCallback, useEffect, useRef, useState } from "react";
import axiosInstance from "utils/AxiosInstance";

/**
 * useMusicSubmit:
 * - posts music-to-merge request
 * - starts polling for status automatically
 * - exposes polling state and final url
 */
export default function useMusicSubmit({ onStarted, onComplete, onError } = {}) {
  const [submitting, setSubmitting] = useState(false);
  const [pollingState, setPollingState] = useState(null); // idle | processing | completed | error
  const [finalUrl, setFinalUrl] = useState(null);
  const pollingRef = useRef(null);
  const lastJobId = useRef(null);

  // start a submit given body
  const startSubmit = useCallback(
    async (body) => {
      if (!body?.merge_id || !body?.user_id) {
        onError?.("Invalid body for submit");
        return;
      }

      try {
        setSubmitting(true);
        setPollingState("processing");

        const res = await axiosInstance.post("/music_to_merge_video/", body);

        if (!res.data?.success) {
          const msg = res.data?.message || "Submit failed";
          setPollingState("error");
          onError?.(msg);
          setSubmitting(false);
          return;
        }

        const newMergeId = res.data?.job_id || body.merge_id;
        lastJobId.current = newMergeId;
        onStarted?.(newMergeId);

        // start polling
        startPolling(newMergeId);
      } catch (err) {
        setPollingState("error");
        onError?.(err?.message || "Submit exception");
      } finally {
        setSubmitting(false);
      }
    },
    [onError, onStarted]
  );

  const pollOnce = useCallback(async (jobId) => {
    try {
      const res = await axiosInstance.get("/factory_get_merge_music_job_status/", {
        params: { job_id: jobId },
      });

      if (!res.data) return null;
      return res.data;
    } catch (err) {
      return null;
    }
  }, []);

  const startPolling = useCallback(
    (jobId) => {
      if (pollingRef.current) clearInterval(pollingRef.current);

      pollingRef.current = setInterval(async () => {
        const data = await pollOnce(jobId);
        if (!data) return;

        // treat any success response with final url as completion
        const status = data.job_status;
        if (status === "completed" || data.final_video_with_music_url) {
          setFinalUrl(data.final_video_with_music_url || data.final_video_url || null);
          setPollingState("completed");
          clearInterval(pollingRef.current);
          pollingRef.current = null;
          onComplete?.();
        } else if (status === "failed") {
          setPollingState("error");
          onError?.(data.message || "Processing failed");
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        } else {
          // still processing; keep polling
          setPollingState("processing");
        }
      }, 3000);
    },
    [onComplete, onError, pollOnce]
  );

  const cancelPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    setPollingState(null);
    setFinalUrl(null);
  }, []);

  const resetSubmit = useCallback(() => {
    cancelPolling();
    setSubmitting(false);
    setPollingState(null);
    setFinalUrl(null);
    lastJobId.current = null;
  }, [cancelPolling]);

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  return {
    startSubmit,
    submitting,
    pollingState,
    finalUrl,
    cancelPolling,
    resetSubmit,
  };
}
