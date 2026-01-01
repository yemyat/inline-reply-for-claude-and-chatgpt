import { Notyf } from "notyf";

const notyf = new Notyf({
  duration: 3000,
  position: { x: "right", y: "top" },
  dismissible: true,
});

export function showToast(message: string, type: "success" | "error"): void {
  if (type === "success") {
    notyf.success(message);
  } else {
    notyf.error(message);
  }
}
