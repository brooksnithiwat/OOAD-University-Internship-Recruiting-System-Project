type WithdrawButtonProps = {
  disabled?: boolean;
  onWithdraw: () => void | Promise<void>;
};

export const WithdrawButton: React.FC<WithdrawButtonProps> = ({ disabled, onWithdraw }) => {
  const handleClick = async () => {
    const confirmed = window.confirm('Are you sure you want to withdraw this application?');
    if (!confirmed) {
      return;
    }

    await onWithdraw();
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className="inline-flex items-center justify-center rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
    >
      Withdraw
    </button>
  );
};

export default WithdrawButton;