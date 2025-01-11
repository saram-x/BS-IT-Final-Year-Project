import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

// Reusable confirmation dialog for admin actions
const ConfirmationDialog = ({ 
  trigger, 
  title, 
  description, 
  confirmText = "Confirm", 
  onConfirm, 
  variant = "destructive" 
}) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={variant === "destructive" ? "bg-red-600 hover:bg-red-700 text-white" : "bg-green-600 hover:bg-green-700 text-white"}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmationDialog;

// milestone 0: Refined recruiter dashboard actions and confirmation prompts

// milestone 8: Improved onboarding steps for employers and candidates

// milestone 13: Optimized repeated API requests and stale state refreshes

// milestone 17: Cleaned up duplicated logic in job and company views

// milestone 19: Improved login and route guard UX for protected pages

// milestone 21: Adjusted project notes and setup documentation

// milestone 22: Reviewed role-based UI states for recruiter and applicant flows

// milestone 32: Tuned list filtering logic for location and role preferences
