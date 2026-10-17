
export default function IdleModal({ open, secondsLeft, onStay, onLogoutNow }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] grid place-items-center bg-black/50">
      <div className="w-[420px] rounded-xl bg-white p-5 shadow-2xl">
        <h3 className="text-lg font-semibold">Are you still there?</h3>

        <p className="mt-2 text-sm text-slate-700">
          You’ll be logged out in{" "}
          <span className="font-bold">{secondsLeft}</span>{" "}
          second{secondsLeft !== 1 ? "s" : ""} due to inactivity.
        </p>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onLogoutNow}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
          >
            Logout
          </button>

          <button
            onClick={onStay}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            I’m still here
          </button>
        </div>
      </div>
    </div>
  );
}
