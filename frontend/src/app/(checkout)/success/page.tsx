import RequireAuth from "@/app/components/RequireAuth";
import SuccessPage from "./Success";

export default function Page() {
    return (
        <RequireAuth>
            <SuccessPage />
        </RequireAuth>
    );
}