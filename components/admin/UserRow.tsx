
function UserRow({ user, toggleRole, fetchUsers }: { user: User, toggleRole: (id: string, role: string) => void, fetchUsers: () => void }) {
    const [revealIp, setRevealIp] = useState(false);

    const handleAddCoins = async () => {
        const amountStr = prompt(`Ile monet dodać użytkownikowi ${user.name}? (Użyj minusa aby odjąć)`);
        if (!amountStr) return;
        const amount = parseInt(amountStr);
        if (isNaN(amount)) return alert("Nieprawidłowa kwota");

        try {
            const res = await fetch("/api/admin/coins", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.id, amount })
            });
            if (res.ok) {
                fetchUsers();
                alert(`Pomyślnie dodano ${amount} monet.`);
            } else {
                alert("Błąd podczas dodawania monet.");
            }
        } catch (e) {
            alert("Błąd połączenia.");
        }
    };

    return (
        <tr className="border-b border-white/5 hover:bg-white/5 transition">
            <td className="p-3">
                <div className="font-bold">{user.name}</div>
                <div className="text-xs text-yellow-500 font-mono">{user.tebCoins ?? 0} Coins</div>
            </td>
            <td className="p-3">
                <div className="font-mono text-sm text-gray-400">{user.email}</div>
                {user.lastIp && (
                    <div
                        className="text-xs text-indigo-400 font-mono flex items-center gap-1 cursor-pointer select-none"
                        onClick={() => setRevealIp(!revealIp)}
                        title="Click to reveal/hide IP"
                    >
                        <span>IP:</span>
                        <span className={`transition-all duration-300 ${revealIp ? "blur-none" : "blur-sm bg-indigo-900/50"}`}>
                            {user.lastIp}
                        </span>
                    </div>
                )}
            </td>
            <td className="p-3">
                <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === "ADMIN" ? "bg-red-500/20 text-red-400" : "bg-blue-500/20 text-blue-400"}`}>
                    {user.role}
                </span>
            </td>
            <td className="p-3 flex gap-2">
                <button
                    onClick={() => toggleRole(user.id, user.role)}
                    className="text-xs border border-white/10 px-2 py-1 rounded hover:bg-white/10 transition"
                >
                    {user.role === "ADMIN" ? "Demote" : "Promote"}
                </button>
                <button
                    onClick={handleAddCoins}
                    className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 px-2 py-1 rounded hover:bg-yellow-500/30 transition"
                >
                    Add Coins
                </button>
            </td>
        </tr>
    )
}
