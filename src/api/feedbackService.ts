import { api } from "./client";
import { handleApiCall } from "./utils";
import type { FeedbackRequest } from "@/lib/model/feedbackRequest";

export const feedbackService = {
  /** Authenticated feedback; API emails the operator via Resend. */
  submit: (body: FeedbackRequest) =>
    handleApiCall(
      api.post("api/feedback", { json: body }).then(() => undefined as void)
    ),
};
