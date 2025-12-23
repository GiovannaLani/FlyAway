import { useEffect, useState } from "react";
import client from "../api/client";
import { Row, Col, Button } from "reactstrap";
import TripCard from "../components/TripCard";
import { useNavigate } from "react-router-dom";

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
  const nav = useNavigate();
  
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
    <div className="container mt-4">
      <h2>Mis viajes</h2>
      <Button color="primary" className="mb-4" onClick={() => nav("/trips/new")}>
        + Crear viaje
      </Button>
      {loading ? <p>Cargando...</p> : (
        <Row>
          {trips.map(trip => (
            <Col key={trip.id} md="3" className="mb-4">
              <TripCard trip={trip} />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}