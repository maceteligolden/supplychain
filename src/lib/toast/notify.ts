import { toast } from "sonner";

/**
 * Shows a success toast after a completed user action.
 */
export function showSuccessToast(message: string): void {
  toast.success(message);
}

/**
 * Shows an error toast when an action fails.
 */
export function showErrorToast(message: string): void {
  toast.error(message);
}
