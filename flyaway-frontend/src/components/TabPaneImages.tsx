import { useState } from "react";
import { Modal } from "reactstrap";

type Activity = {
  id: number;
  images?: string[];
};

type Day = {
  id: number;
  date: string;
  destination?: string;
  activities: Activity[];
};

type Props = {
  days: Day[];
};

export default function TabPaneImages({ days }: Props) {
  const [activeImage, setActiveImage] = useState<string | null>(null);

  if (!days || days.length === 0) return <p>No hay imágenes</p>;

  return (
    <div className="mt-3">
      {days.map(day => {
        const images = day.activities.flatMap(a => a.images ?? []);
        if (images.length === 0) return null;

        return (
          <div key={day.id} className="mb-5">
            <h5 className="mb-3">
              {new Date(day.date).toLocaleDateString()}
              {day.destination && <span className="text-muted"> · {day.destination}</span>}
            </h5>

            <div className="d-flex flex-wrap gap-2">
              {images.map((img, idx) => (
                <div key={idx} className="image-card" style={{ width: 120, height: 120 }} onClick={() => setActiveImage(img)}>
                  <img src={`http://localhost:3001${img}`} alt="actividad" style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <Modal isOpen={!!activeImage} toggle={() => setActiveImage(null)} centered size="lg">
        <div className="p-0 text-center bg-dark">
          {activeImage && (
            <img src={`http://localhost:3001${activeImage}`} style={{ maxWidth: "100%", maxHeight: "90vh", objectFit: "contain" }} />
          )}
        </div>
      </Modal>
    </div>
  );
}
