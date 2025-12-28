import { useState, useEffect } from "react";
import {CardBody, Form, Row, Col, FormGroup, Label, Input, Button, Modal, ModalHeader, ModalBody, ModalFooter, ListGroup, ListGroupItem} from "reactstrap";
import client from "../api/client";
import { useNavigate } from "react-router";

type Props = {
  tripId: number;
  tripName: string;
  setTripName: (name: string) => void;
  description?: string;
  setDescription: (desc: string) => void;
  isPublic: boolean;
  setIsPublic: (pub: boolean) => void;
  imageUrl?: string;
};

export default function TabPaneSettings({tripId, tripName, setTripName, description, setDescription, isPublic, setIsPublic, imageUrl}: Props) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const nav = useNavigate();
  
  useEffect(() => {
    if (imageUrl) {
      setPreview(`http://localhost:3001${imageUrl}`);
    }
  }, [imageUrl]);

  const handleNameBlur = async () => {
    try {
      await client.put(`/trips/${tripId}`, { name: tripName });
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleDescriptionBlur = async () => {
    try {
      await client.put(`/trips/${tripId}`, { description });
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleChangeImage = async (file: File) => {
    setPreview(URL.createObjectURL(file));

    const fd = new FormData();
    fd.append("image", file);

    try {
      await client.post(`/trips/${tripId}/image`, fd);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleTogglePublic = async () => {
    try {
      await client.put(`/trips/${tripId}`, { isPublic: !isPublic });
      setIsPublic(!isPublic);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await client.delete(`/trips/${tripId}`);
      nav("/trips");
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <CardBody>
      <h3 className="mb-4">Ajustes del viaje</h3>
      <Form>
        <Row className="align-items-center">
          <Col md={4} className="mb-3">
            <div className="border border-secondary border-dashed rounded d-flex align-items-center justify-content-center"
              style={{
                aspectRatio: "1 / 1",
                cursor: "pointer",
                background: "#f8f9fa",
              }}
              onClick={() =>
                document.getElementById("imageInput")?.click()
              }
            >
              {preview ? (
                <img src={preview} alt="preview" style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: 8 }}/>
              ) : (
                <div className="text-center text-muted">
                  <div style={{ fontSize: "2rem" }}>+</div>
                  <small>Añadir imagen</small>
                </div>
              )}
            </div>
            <input id="imageInput" type="file" accept="image/*" hidden
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) handleChangeImage(file);
              }}
            />
          </Col>

          <Col md={8}>
            <FormGroup className="text-start">
              <Label>Nombre *</Label>
              <Input value={tripName} onChange={(e) => setTripName(e.target.value)} onBlur={handleNameBlur}/>
            </FormGroup>

            <FormGroup className="text-start">
              <Label>Descripción</Label>
              <Input type="textarea" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} onBlur={handleDescriptionBlur}/>
            </FormGroup>
          </Col>
        </Row>

        <hr className="my-4" />
        <ListGroup className="mt-4">

          <ListGroupItem className="d-flex align-items-center justify-content-between">
            <div className="text-start">
              <strong>Privacidad del viaje</strong>
              <div className="text-muted small">Define si otros usuarios pueden ver este viaje</div>
            </div>
            <div className="form-check form-switch">
              <Input type="switch" id="privacySwitch" checked={isPublic} onChange={handleTogglePublic}/>
              <Label for="privacySwitch" className="ms-2 mb-0">
                {isPublic ? "Público" : "Privado"}
              </Label>
            </div>
          </ListGroupItem>

          <ListGroupItem className="text-center">
            <Button
              color="danger"
              outline
              onClick={() => setShowDeleteModal(true)}
            >
              Eliminar viaje
            </Button>
          </ListGroupItem>
        </ListGroup>
      </Form>

      <Modal isOpen={showDeleteModal} toggle={() => setShowDeleteModal(false)} centered>
        <ModalHeader toggle={() => setShowDeleteModal(false)}>Eliminar viaje</ModalHeader>
        <ModalBody>
          ¿Seguro que quieres eliminar este viaje? Esta acción no se puede deshacer.
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setShowDeleteModal(false)}>Cancelar</Button>
          <Button color="danger" onClick={handleDelete}>Eliminar</Button>
        </ModalFooter>
      </Modal>
    </CardBody>
  );
}
