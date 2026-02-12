
import Link from "next/link";

export default function VpnBlockedPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-black/90 text-white">
            <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-red-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.002zM12 15.75h.007v.008H12v-.008z" />
                </svg>
            </div>

            <h1 className="text-4xl font-bold mb-4">VPN Wykryty</h1>
            <p className="text-gray-400 max-w-md mb-8 text-lg">
                Dostęp do serwisu TEB News jest zablokowany dla połączeń z VPN, Proxy lub Tor. Proszę wyłącz VPN i spróbuj ponownie.
            </p>

            <Link href="/" className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full transition">
                Spróbuj ponownie
            </Link>

            <p className="mt-8 text-xs text-gray-600">
                IP: <span className="font-mono">Twoje IP</span> (Ochrona aktywna)
            </p>
        </div>
    );
}
