import { getFeedbacks } from "@/actions/feedback";
import { getSession } from "@/lib/session";
import { FeedbackClient } from "./client";

export default async function FeedbackPage() {
  const [feedbacks, session] = await Promise.all([getFeedbacks(), getSession()]);
  const canReview = session?.role === "ADMIN" || session?.role === "MANAGER";

  return (
    <FeedbackClient
      feedbacks={JSON.parse(JSON.stringify(feedbacks))}
      canReview={canReview}
    />
  );
}
