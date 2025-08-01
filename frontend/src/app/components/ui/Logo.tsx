import Link from "next/link"
import Image from "next/image";
import logo from "@/app/assets/logo.png";

export default function Logo() {
    return (
        <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 relative">
                <Image src={logo} alt="TailoResume Logo" fill className="object-contain" priority />
            </div>
            <span className="text-xl font-bold text-gray-900">TailoResume</span>
        </Link>
    );
}
