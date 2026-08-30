import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <p className="text-5xl font-bold text-slate-300">404</p>
      <p className="text-slate-600 mt-2">Page not found</p>
      <Link to="/" className="btn-primary mt-4">Go home</Link>
    </div>
  );
}
