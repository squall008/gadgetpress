'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900 p-4 font-sans">
        <div className="max-w-md w-full rounded-2xl border border-slate-200 bg-white p-8 text-center space-y-4 shadow-md">
          <h1 className="text-xl font-bold">システムエラーが発生しました</h1>
          <p className="text-sm text-slate-600">
            時間をおいて再読み込みしてください。
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="px-5 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:opacity-90"
          >
            再読み込み
          </button>
        </div>
      </body>
    </html>
  );
}
