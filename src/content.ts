import { InlineReplyManager } from "./manager";

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => new InlineReplyManager());
} else {
  new InlineReplyManager();
}
