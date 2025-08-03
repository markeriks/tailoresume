import Plans from "./Plans";
import RequireAuth from "../components/RequireAuth";


export default function PlansPage() {
  return (
    <RequireAuth>
      <Plans />
    </RequireAuth>
  );
}