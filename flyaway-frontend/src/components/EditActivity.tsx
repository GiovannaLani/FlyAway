import { useState } from "react";
import { Button, Col, Input, Label, Row } from "reactstrap";

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

export default function EditActivity({activity, onCancel, onSave, onDelete
}: {
  activity: Activity;
  onCancel: () => void;
  onSave: (data: Partial<Activity>, images?: File[]) => void;
  onDelete: () => void;
}) {
  const [form, setForm] = useState<Partial<Activity>>(activity);
  const [files] = useState<File[]>([]);

  return (
    <div className="p-3 border rounded text-start h-100">
      <div className="d-flex justify-content-end gap-2 mb-3">
        <Button color="primary" onClick={() => onSave(form, files)}> Guardar </Button>
        <Button color="secondary" outline onClick={onCancel} > Cancelar </Button>
        <Button color="danger" outline onClick={onDelete} > Eliminar </Button>
      </div>

      <Label className="mb-0">Título</Label>
      <Input placeholder="Título" value={form.name || ""} onChange={e => setForm({ ...form, name: e.target.value })} />
      
      <Label className="mt-2 mb-0">Horario</Label>
      <Row>
        <Col>
          <Input type="time" value={form.startTime || ""} onChange={e => setForm({ ...form, startTime: e.target.value })}/>
        </Col>
        <Col>
          <Input type="time" value={form.endTime || ""} onChange={e => setForm({ ...form, endTime: e.target.value })}/>
        </Col>
      </Row>
        
      <Label className="mt-2 mb-0">Lugar</Label>
      <Input placeholder="Lugar" value={form.place || ""} onChange={e => setForm({ ...form, place: e.target.value })} />
      
      <Label className="mt-2 mb-0">Precio</Label>
      <Input type="number" placeholder="Precio" value={form.price ?? ""}
        onChange={e =>
          setForm({ ...form, price: e.target.value ? Number(e.target.value) : undefined })
        }
      />
      
      <Label className="mt-2 mb-0">Descripción</Label>
      <Input type="textarea" placeholder="Descripción" value={form.description || ""} onChange={e => setForm({ ...form, description: e.target.value })}/>

    </div>
  );
}
