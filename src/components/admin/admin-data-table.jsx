import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import TableHeaderComponent from "./table-header";
import UserRow from "./user-row";
import JobRow from "./job-row";
import LoadingSpinner from "./loading-spinner";

// Reusable data table component for admin sections
const AdminDataTable = ({ config, activeTab }) => {
  if (!config) return null;

  return (
    <div className={`bg-transparent/5 backdrop-blur-sm rounded-xl border ${
      activeTab === 'suspicious' ? 'border-orange-600/30' : 'border-gray-600/30'
    } shadow-sm`}>
      <TableHeaderComponent
        title={config.title}
        searchValue={config.searchValue}
        onSearchChange={config.onSearchChange}
        searchPlaceholder={config.searchPlaceholder}
        totalCount={config.totalCount}
      >
        {config.headerActions}
      </TableHeaderComponent>

      {config.loading ? (
        <LoadingSpinner message={config.loadingMessage} />
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-transparent">
              <TableRow>
                {config.headers.map((header) => (
                  <TableHead key={header} className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {config.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={config.headers.length} className="px-6 py-8 text-center text-gray-400">
                    {config.emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                config.data.map(config.renderRow)
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminDataTable;
