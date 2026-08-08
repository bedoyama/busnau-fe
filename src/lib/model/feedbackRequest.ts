/**
 * Request body for POST /api/feedback (hand-aligned with busnau-api FeedbackRequest).
 */
export interface FeedbackRequest {
  /** Feedback body (required, max 4000). */
  message: string;
  /** Optional contact for a reply (email or other). */
  contact?: string | null;
}
