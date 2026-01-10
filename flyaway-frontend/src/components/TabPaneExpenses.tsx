import { useEffect, useState } from "react";
import client from "../api/client";
import { useAuth } from "../auth/AuthProvider";

interface User {
  id: number;
  name: string;
}

interface ExpenseSplit {
  userId: number;
  amount: number;
  settled: boolean;
  user: User;
}

interface Expense {
  id: number;
  name: string;
  amount: number;
  currency: string;
  paidByUserId: number;
  paidBy: User;
  splits: ExpenseSplit[];
}

interface Balance {
  userId: number;
  balance: number;
  name: string;
}

interface Props {
  tripId: number;
}

export default function TabPaneExpenses({ tripId }: Props) {
    const me = useAuth().me;
    if (!me) return null;
    const currentUserId = me.id;
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [balances, setBalances] = useState<Balance[]>([]);
    const [participants, setParticipants] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [currency, setCurrency] = useState("EUR");
    const [splitType, setSplitType] = useState<"EQUAL" | "CUSTOM">("EQUAL");
    const [customSplits, setCustomSplits] = useState<Record<number, string>>({});
    const [displayCurrency, setDisplayCurrency] = useState("EUR");
    const [convertedAmounts, setConvertedAmounts] = useState<Record<number, number>>({});
    const [convertedBalances, setConvertedBalances] = useState<Record<number, number>>({});
    const [converting, setConverting] = useState(false);

    const COMMON_CURRENCIES = [
        { code: "EUR", label: "Euro (€)" },
        { code: "USD", label: "Dólar estadounidense ($)" },
        { code: "GBP", label: "Libra esterlina (£)" },
        { code: "CHF", label: "Franco suizo (CHF)" },
        { code: "JPY", label: "Yen japonés (¥)" },
        { code: "CAD", label: "Dólar canadiense (CAD)" },
        { code: "AUD", label: "Dólar australiano (AUD)" },
        { code: "MXN", label: "Peso mexicano (MXN)" },
        { code: "BRL", label: "Real brasileño (BRL)" },
        { code: "ARS", label: "Peso argentino (ARS)" },
    ];

    const currencySymbol: Record<string, string> = {
        EUR: "€",
        USD: "$",
        GBP: "£",
        CHF: "CHF",
        JPY: "¥",
        CAD: "CAD",
        AUD: "AUD",
        MXN: "MXN",
        BRL: "BRL",
        ARS: "ARS",
    };

    async function fetchExpenses() {
        const res = await client.get(`/expenses/trip/${tripId}`);
        setExpenses(res.data);
    }

    async function fetchBalances() {
        const res = await client.get(`/expenses/trip/${tripId}/balances`);
        setBalances(res.data);
    }

    async function fetchParticipants() {
        const res = await client.get(`/trips/${tripId}/participants`);
        setParticipants(res.data);

        const init: Record<number, string> = {};
        res.data.forEach((u: User) => (init[u.id] = ""));
        setCustomSplits(init);
    }

    async function handleCreateExpense(e: React.FormEvent) {
        e.preventDefault();

        let splits;
        if (splitType === "CUSTOM") {
            splits = Object.entries(customSplits).filter(([_, v]) => Number(v) > 0).map(([userId, amount]) => ({userId: Number(userId), amount: Number(amount)}));
        }

        await client.post("/expenses", {
            name,
            amount: Number(amount),
            currency,
            tripId,
            splitType,
            splits,
        });

        setName("");
        setAmount("");
        setSplitType("EQUAL");
        fetchExpenses();
        fetchBalances();
    }

    async function handleSettle(splitUserId: number, expenseId: number) {
        await client.patch(`/expenses/${expenseId}/settle/${splitUserId}`);
        await fetchExpenses();
        await fetchBalances();
    }

    useEffect(() => {
        setLoading(true);
        Promise.all([
        fetchExpenses(),
        fetchBalances(),
        fetchParticipants(),
        ]).finally(() => setLoading(false));
    }, [tripId]);

    useEffect(() => {
        if (!expenses.length && !balances.length) return;
        let cancelled = false;
        async function convertAll() {
            setConverting(true);
            try {
                const expenseMap: Record<number, number> = {};

                for (const e of expenses) {
                    const converted = await convertCurrency(e.currency, displayCurrency,e.amount);
                    if (cancelled) return;
                    expenseMap[e.id] = converted;
                }
                setConvertedAmounts(expenseMap);

                if (displayCurrency === "EUR") {
                    const map: Record<number, number> = {};
                    balances.forEach((b) => (map[b.userId] = b.balance));
                    setConvertedBalances(map);
                } else {
                    const rate = await convertCurrency("EUR",displayCurrency,1);
                    if (cancelled) return;
                    const map: Record<number, number> = {};
                    balances.forEach((b) => {map[b.userId] = b.balance * rate;});
                    setConvertedBalances(map);
                }
            } finally {
                if (!cancelled) setConverting(false);
            }
        }
        convertAll();
        return () => {cancelled = true};
    }, [displayCurrency, expenses, balances]);

    async function convertCurrency( from: string, to: string, amount: number): Promise<number> {
    if (from === to) return amount;
        
    const res = await client.get("/external/currency/convert", { params: {from, to, amount},});
        return res.data.converted;
    }

    const customTotal = Object.values(customSplits).reduce((s, v) => s + Number(v || 0), 0);

    return (
        <div>
        <h4 className="mb-3">Gastos</h4>
        <form onSubmit={handleCreateExpense} className="mb-4">
            <div className="row g-2">
                <div className="col-md-3">
                    <input className="form-control" placeholder="Concepto" value={name} onChange={(e) => setName(e.target.value)} required/>
                </div>

                <div className="col-md-2">
                    <input type="number" className="form-control" placeholder="Importe" value={amount} onChange={(e) => setAmount(e.target.value)} required/>
                </div>

                <div className="col-md-2">
                    <select className="form-select" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                        {COMMON_CURRENCIES.map((c) => (
                            <option key={c.code} value={c.code}>
                            {c.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="col-md-3">
                    <select
                        className="form-select"
                        value={splitType}
                        onChange={(e) => setSplitType(e.target.value as "EQUAL" | "CUSTOM")}
                    >
                        <option value="EQUAL">Reparto igual</option>
                        <option value="CUSTOM">Reparto personalizado</option>
                    </select>
                </div>

                <div className="col-md-2">
                    <button className="btn btn-primary w-100">
                        Añadir
                    </button>
                </div>
            </div>

            {splitType === "CUSTOM" && (
            <div className="mt-3">
                <h6>Reparto personalizado</h6>

                {participants.map((u) => (
                <div key={u.id} className="d-flex align-items-center mb-2 text-start">
                    <div style={{ width: 200 }}>{u.name}</div>

                    <input type="number" className="form-control" value={customSplits[u.id] || ""}
                    onChange={(e) =>
                        setCustomSplits({
                        ...customSplits,
                        [u.id]: e.target.value,
                        })
                    }
                    />
                </div>
                ))}

                {Math.abs(customTotal - Number(amount || 0)) > 0.01 && (
                <div className="text-danger">
                    La suma ({customTotal.toFixed(2)} € ) no coincide con el total
                </div>
                )}
            </div>
            )}
        </form>

        <div className="d-flex justify-content-end mb-3">
            <select className="form-select w-auto" value={displayCurrency} onChange={(e) => setDisplayCurrency(e.target.value)}>
            {COMMON_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                {c.label}
                </option>
            ))}
            </select>
        </div>

        {loading ? (
            <p>Cargando gastos...</p>
            ) : expenses.length === 0 ? (
            <p>No hay gastos todavía</p>
            ) : (
            <div className="accordion mb-4" id="expensesAccordion">
                {expenses.map((e) => (
                <div className="accordion-item" key={e.id}>
                    <h2 className="accordion-header" id={`heading-${e.id}`}>
                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target={`#collapse-${e.id}`} aria-expanded="false" aria-controls={`collapse-${e.id}`}>
                            <div className="d-flex justify-content-between w-100 align-items-center">
                                <div>
                                    <strong>{e.name}</strong>
                                    <div className="text-muted" style={{ fontSize: "0.9em" }}>
                                        Pagado por {e.paidBy.name}
                                    </div>
                                </div>
                                <div className="me-3">
                                    {converting ? (
                                        <span className="placeholder col-4"></span>
                                        ) : (
                                        <strong>
                                            {convertedAmounts[e.id]?.toFixed(2)} {currencySymbol[displayCurrency]}
                                        </strong>
                                    )}

                                    <div className="text-muted" style={{ fontSize: "0.8em" }}>
                                        {e.amount.toFixed(2)} {e.currency}
                                    </div>
                                </div>
                            </div>
                        </button>
                    </h2>

                    <div id={`collapse-${e.id}`} className="accordion-collapse collapse" aria-labelledby={`heading-${e.id}`} data-bs-parent="#expensesAccordion">
                        <div className="accordion-body">
                            {e.splits.map((s) => (
                                <div key={s.userId} className="d-flex justify-content-between align-items-center mb-2 p-2 border rounded">
                                        <span>
                                            {s.user.name}:{" "}
                                            {converting ? (
                                                <span className="placeholder col-4"></span>
                                            ) : (
                                                <strong>
                                                {(convertedAmounts[e.id] *(s.amount / e.amount)).toFixed(2)}{" "}
                                                {currencySymbol[displayCurrency]}
                                                </strong>
                                            )}
                                        </span>
                                    <div className="d-flex align-items-center gap-2">
                                        {s.settled && (
                                            <span className="badge bg-success">Pagado</span>
                                        )}

                                        {!s.settled && e.paidByUserId === currentUserId && (
                                            <button className="btn btn-sm btn-outline-success" onClick={() => handleSettle(s.userId, e.id)}>
                                                Marcar pagado
                                            </button>
                                        )}

                                        {!s.settled && e.paidByUserId !== currentUserId && (
                                            <span className="badge bg-danger">Pendiente</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                ))}
            </div>
        )}

        <h5>Balances</h5>
        <ul className="list-group">
        {balances.map((b) => (
            <li key={b.userId} className="list-group-item d-flex justify-content-between">
            <span>{b.name}</span>
            {converting ? (
                <span className="placeholder col-4"></span>
            ) : (
                <strong className={ convertedBalances[b.userId] >= 0 ? "text-success" : "text-danger"}>
                    {convertedBalances[b.userId]?.toFixed(2)}{" "}
                    {currencySymbol[displayCurrency]}
                </strong>
            )}
            </li>
        ))}
        </ul>
        </div>
    );
}