import { useRef, useState } from "react";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import client from "../api/client";

export type Activity = {
  id: number;
  name: string;
  startTime?: string;
  endTime?: string;
  place?: string;
  price?: number;
  description?: string;
  images?: string[];
};

export default function ViewActivity({activity, onEdit, setSelectedActivity, updateActivityInDays}: {
  activity: Activity;
  onEdit: () => void;
  setSelectedActivity: React.Dispatch<React.SetStateAction<Activity | null>>;
  updateActivityInDays: (updated: Activity) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [removeImg, setRemoveImg] = useState<string | null>(null);
  
  const uploadImage = async (file: File) => {
    const fd = new FormData();
    fd.append("images", file);
    const res = await client.post(
      `/itinerary/activities/${activity.id}/images`,
      fd
    );
    setSelectedActivity(res.data);
    updateActivityInDays(res.data);
  };

  return (
    <div className="p-3 border rounded text-start h-100 position-relative">
        <Button color="primary" outline style={{ position: "absolute", top: 12, right: 12, cursor: "pointer" }} onClick={onEdit}>
          <i className="bi bi-pencil-square"></i>
        </Button>

      <h4 className="mb-3">{activity.name}</h4>
      <p>
        <strong>Horario:</strong>{" "}
        {activity.startTime?.slice(0, 5)} - {activity.endTime?.slice(0, 5)}
      </p>

      {activity.place && <p><strong>Lugar:</strong> {activity.place}</p>}
      {activity.price != null && <p><strong>Precio:</strong> {activity.price} €</p>}
      {activity.description && (<p><strong>Descripción:</strong> {activity.description}</p>)}

      <strong>Imágenes</strong>

      <div className="d-flex flex-wrap gap-3 mt-2">
        {activity.images?.map(img => (
          <div key={img} className="position-relative image-wrapper">
            <img src={`http://localhost:3001${img}`} style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 6}}/>
            <span className="image-remove" onClick={() => setRemoveImg(img)}>
              ✕
            </span>
          </div>
        ))}

        <input ref={fileInputRef} type="file" hidden 
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) uploadImage(file);
          }}
        />
        <div className="image-add" onClick={() => fileInputRef.current?.click()}>
          +
        </div>
      </div>

      <Modal isOpen={!!removeImg} toggle={() => setRemoveImg(null)}>
        <ModalHeader toggle={() => setRemoveImg(null)}>
          Eliminar imagen
        </ModalHeader>

        <ModalBody>
          ¿Seguro que quieres eliminar esta imagen?
        </ModalBody>

        <ModalFooter>
          <Button color="danger"
            onClick={async () => {
              if (!removeImg || !activity) return;

              const res = await client.delete(
                `/itinerary/activities/${activity.id}/images`,
                { data: { url: removeImg } }
              );

              setSelectedActivity(res.data);
              updateActivityInDays(res.data);

              setRemoveImg(null);
            }}
          >
            Eliminar
          </Button>
          <Button outline onClick={() => setRemoveImg(null)}>
            Cancelar
          </Button>
        </ModalFooter>
      </Modal>

    </div>
  );
}
