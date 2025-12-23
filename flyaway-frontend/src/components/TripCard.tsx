import { Card, CardBody, CardTitle, CardText, CardImg } from "reactstrap";
import { useNavigate } from "react-router-dom";
import defaultTripImage from "../assets/default-trip-image.png";

type Props = {
  trip: {
    id: number;
    name: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    imageUrl?: string;
  };
};

export default function TripCard({ trip }: Props) {
  const nav = useNavigate();

  return (
    <Card
      className="h-100 shadow-sm trip-card"
      role="button"
      onClick={() => nav(`/trips/${trip.id}`)}
      style={{ cursor: "pointer" }}
    >
      <CardImg
        top
        src={trip.imageUrl ? `http://localhost:3001${trip.imageUrl}` : defaultTripImage}
        alt={trip.name}
        style={{ aspectRatio: "1 / 1", objectFit: "cover" }}
      />

      <CardBody>
        <CardTitle tag="h5" className="mb-2">
          {trip.name}
        </CardTitle>

        <CardText className="text-muted small">
          {trip.description || "Sin descripción"}
        </CardText>

        <CardText className="text-secondary small">
          {trip.startDate
            ? new Date(trip.startDate).toLocaleDateString()
            : "Sin fecha"}
          {trip.endDate ? ` - ${new Date(trip.endDate).toLocaleDateString()}` : ""}
        </CardText>

      </CardBody>
    </Card>
  );
}