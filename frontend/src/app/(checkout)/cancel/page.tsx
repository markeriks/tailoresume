import RequireAuth from "@/app/components/RequireAuth";
import CancelPage from "./Cancel";

export default function Page() {
  return (
    <RequireAuth>
      <CancelPage />
    </RequireAuth>
  )
}