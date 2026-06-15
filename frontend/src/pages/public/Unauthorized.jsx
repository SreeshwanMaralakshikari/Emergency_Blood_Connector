import { Link } from "react-router";
import { primaryBtn } from "../../styles/common";

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-2xl font-bold text-[#1a1a1a]">Access Denied</p>
      <p className="text-[#6b6b6b] text-sm">You don't have permission to view this page.</p>
      <Link to="/" className={primaryBtn}>Go Home</Link>
    </div>
  );
}
