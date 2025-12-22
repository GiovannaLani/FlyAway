import { useEffect, useState } from "react";
import client from "../api/client";

type Trip = {
  id: number;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
};

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await client.get("/trips");
        setTrips(Array.isArray(res.data) ? res.data : []);
      } catch (err: any) {
        alert(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div>
      <h2>Mis viajes</h2>
      {loading ? <p>Cargando...</p> : (
        <ul>
          {trips.map(t => <li key={t.id}>{t.name} — {t.startDate ?? "sin fecha"}</li>)}
        </ul>
      )}
    </div>
  );
}