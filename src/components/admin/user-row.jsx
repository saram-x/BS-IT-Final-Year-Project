import { TableCell, TableRow } from "@/components/ui/table";
import ConfirmationDialog from "./confirmation-dialog";

// Reusable user row component for admin table
const UserRow = ({ user, onBanUser, onDeleteUser }) => {
  const name = user.first_name || "No name";
  const email = user.email_addresses?.[0]?.email_address || "No email";
  const username = user.username || "-";
  const role = user.unsafe_metadata?.role || user.public_metadata?.role || "N/A";
  const lastSignIn = user.last_sign_in_at
    ? new Date(user.last_sign_in_at).toLocaleDateString()
    : "-";
  const createdAt = user.created_at
    ? new Date(user.created_at).toLocaleDateString()
    : "-";

  return (
    <TableRow key={user.id}>
      <TableCell className="px-6 py-3 whitespace-nowrap text-gray-200 font-medium">{name}</TableCell>
      <TableCell className="px-6 py-3 whitespace-nowrap text-gray-200">{email}</TableCell>
      <TableCell className="px-6 py-3 whitespace-nowrap text-gray-200">{username}</TableCell>
      <TableCell className="px-6 py-3 whitespace-nowrap capitalize text-gray-200">{role}</TableCell>
      <TableCell className="px-6 py-3 whitespace-nowrap">
        <span className={`px-2 py-1 rounded-full text-xs ${
          user.banned 
            ? "bg-red-100 text-red-800" 
            : "bg-green-100 text-green-800"
        }`}>
          {user.banned ? "Banned" : "Active"}
        </span>
      </TableCell>
      <TableCell className="px-6 py-3 whitespace-nowrap text-gray-200">{lastSignIn}</TableCell>
      <TableCell className="px-6 py-3 whitespace-nowrap text-gray-200">{createdAt}</TableCell>
      <TableCell className="px-6 py-3 whitespace-nowrap">
        <div className="flex gap-2">
          {/* Ban/Unban user button */}
          <ConfirmationDialog
            trigger={
              <button
                className={`px-3 py-1 rounded text-xs font-medium ${
                  user.banned 
                    ? "bg-green-100 text-green-700 hover:bg-green-200" 
                    : "bg-red-100 text-red-700 hover:bg-red-200"
                }`}
              >
                {user.banned ? "Unban" : "Ban"}
              </button>
            }
            title={user.banned ? "Unban User" : "Ban User"}
            description={`Are you sure you want to ${user.banned ? "unban" : "ban"} ${email}?`}
            confirmText={`Confirm ${user.banned ? "Unban" : "Ban"}`}
            onConfirm={() => onBanUser(user.id, user.banned)}
          />

          {/* Delete user button */}
          <ConfirmationDialog
            trigger={
              <button className="px-3 py-1 rounded text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200">
                Delete
              </button>
            }
            title="Delete User"
            description={`Are you sure you want to delete ${email}? This action cannot be undone.`}
            confirmText="Confirm Delete"
            onConfirm={() => onDeleteUser(user.id)}
          />
        </div>
      </TableCell>
    </TableRow>
  );
};

export default UserRow;
