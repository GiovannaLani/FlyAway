import { Row, Col, Button } from "reactstrap";
import TripCard from "./TripCard";
import { useNavigate } from "react-router-dom";

export default function TripsGrid({ trips, canCreate }: any) {
  const nav = useNavigate();

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Viajes</h4>
        {canCreate && (
          <Button color="primary" onClick={() => nav("/trips/new")}>
            + Crear viaje
          </Button>
        )}
      </div>

      <Row>
        {trips.map((trip: any) => (
          <Col key={trip.id} md={3} className="mb-4">
            <TripCard trip={trip} />
          </Col>
        ))}
      </Row>
    </>
  );
}