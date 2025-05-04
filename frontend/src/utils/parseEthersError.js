// src/utils/parseEthersError.js
export const parseEthersError = (err) => {
  if (err?.code === 4001 || err?.code === "ACTION_REJECTED") {
    return "Transaction cancelled by user.";
  }

  return (
    err?.shortMessage ||
    err?.reason ||
    err?.message ||
    "Something went wrong — please try again."
  );
};
