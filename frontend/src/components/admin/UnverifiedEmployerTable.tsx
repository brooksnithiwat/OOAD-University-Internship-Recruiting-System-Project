import { UnverifiedEmployer, resolveEmployerId } from '@/services/admin.service';

interface UnverifiedEmployerTableProps {
  employers: UnverifiedEmployer[];
  isLoading: boolean;
  isError?: boolean;
  onApprove: (employerId: string) => Promise<void>;
  approvingEmployerId: string | null;
}

const formatRegisterDate = (dateText: string): string => {
  const date = new Date(dateText);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const LoadingSkeleton = () => {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="h-16 rounded-lg bg-gray-200 animate-pulse" />
      ))}
    </div>
  );
};

const EmptyState = () => {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center">
      <p className="text-lg font-semibold text-gray-800">No employers waiting for verification</p>
      <p className="mt-2 text-sm text-gray-600">
        All employer registrations have been reviewed.
      </p>
    </div>
  );
};

export const UnverifiedEmployerTable: React.FC<UnverifiedEmployerTableProps> = ({
  employers,
  isLoading,
  isError,
  onApprove,
  approvingEmployerId,
}) => {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        Failed to load unverified employers. Please refresh and try again.
      </div>
    );
  }

  if (!employers.length) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-4">
      <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Company
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Industry
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Website
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Phone
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Verification
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Registered
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {employers.map((employer) => {
                const employerId = resolveEmployerId(employer);
                const isApproving = approvingEmployerId === employerId;

                return (
                  <tr key={employerId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{employer.companyName}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{employer.email || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{employer.industry}</td>
                    <td className="px-4 py-3 text-sm text-blue-700">
                      {employer.website ? (
                        <a href={employer.website} target="_blank" rel="noreferrer" className="underline">
                          Visit site
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{employer.contactName}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{employer.contactPhone}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {employer.isVerified ? 'Approved' : 'Unapproved'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {formatRegisterDate(employer.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => onApprove(employerId)}
                        disabled={isApproving}
                        className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-400"
                      >
                        {isApproving ? 'Approving...' : 'Approve'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {employers.map((employer) => {
          const employerId = resolveEmployerId(employer);
          const isApproving = approvingEmployerId === employerId;

          return (
            <div key={employerId} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-3">
                <p className="text-sm text-gray-500">Company</p>
                <p className="text-base font-semibold text-gray-900">{employer.companyName}</p>
              </div>

              <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-gray-500">Industry</p>
                  <p className="break-words text-gray-800">{employer.industry}</p>
                </div>
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="break-all text-gray-800">{employer.email || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Registered</p>
                  <p className="text-gray-800">{formatRegisterDate(employer.createdAt)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Contact</p>
                  <p className="text-gray-800">{employer.contactName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Verification</p>
                  <p className="text-gray-800">{employer.isVerified ? 'Approved' : 'Unapproved'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Phone</p>
                  <p className="text-gray-800">{employer.contactPhone}</p>
                </div>
              </div>

              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                {employer.website ? (
                  <a
                    href={employer.website}
                    target="_blank"
                    rel="noreferrer"
                    className="break-all text-sm font-medium text-blue-700 underline"
                  >
                    Visit website
                  </a>
                ) : (
                  <span className="text-sm text-gray-500">No website</span>
                )}

                <button
                  type="button"
                  onClick={() => onApprove(employerId)}
                  disabled={isApproving}
                  className="w-full rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-400 sm:w-auto"
                >
                  {isApproving ? 'Approving...' : 'Approve'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
