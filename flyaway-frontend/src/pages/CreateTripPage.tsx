import { useEffect, useState } from "react";
import { Card, CardBody, Row, Col, Form, FormGroup, Input, Label, Button, ListGroup, ListGroupItem } from "reactstrap";
import { useNavigate } from "react-router-dom";
import client from "../api/client";

type Friend = {
  id: number;
  name: string;
  email: string;
};

export default function CreateTripPage() {
    const nav = useNavigate();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const [search, setSearch] = useState("");
    const [participants, setParticipants] = useState<Friend[]>([]);

    const [friends, setFriends] = useState<Friend[]>([]);
    const [loadingFriends, setLoadingFriends] = useState(false);

    const [isPublic, setIsPublic] = useState(false);

    const filteredFriends = friends.filter(
    f =>
        f.name.toLowerCase().includes(search.toLowerCase()) &&
        !participants.some(p => p.id === f.id)
    );

    const addParticipant = (friend: Friend) => {
        setParticipants([...participants, friend]);
        setSearch("");
    };

    const removeParticipant = (id: number) => {
        setParticipants(participants.filter(p => p.id !== id));
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            alert("El nombre del viaje es obligatorio");
            return;
        }
        if(!startDate){
            alert("La fecha de inicio es obligatoria");
            return;
        }
        if(endDate && startDate && endDate <  startDate) {
            alert("La fecha de fin no puede ser anterior a la fecha de inicio");
            return;
        }

        const formData = new FormData();
        
        formData.append("name", name);
        if (description) formData.append("description", description);
        if (startDate) formData.append("startDate", startDate);
        if (endDate) formData.append("endDate", endDate);
        
        if (imageFile) {
            formData.append("image", imageFile);
        }

        formData.append(
            "participants",
            JSON.stringify(participants.map(p => p.email))
        );

        formData.append("isPublic", String(isPublic));
        
        try {
            await client.post("/trips", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            });

            nav("/trips");
        } catch (err: any) {
            alert(err.response?.data?.message || err.message);
        }
    };

    useEffect(() => {
        async function loadFriends() {
            setLoadingFriends(true);
            try {
            const res = await client.get("/users/friends");
            setFriends(res.data);
            } catch (err: any) {
            alert(err.response?.data?.message || err.message);
            } finally {
            setLoadingFriends(false);
            }
        }

    loadFriends();
    }, []);

    return (
        <Card className="shadow">
        <CardBody>
            <h3 className="mb-4">Crear nuevo viaje</h3>

            <Form>
            <Row>
                <Col md={4}>
                <div
                    className="border border-secondary border-dashed rounded d-flex align-items-center justify-content-center"
                    style={{
                    aspectRatio: "1 / 1",
                    cursor: "pointer",
                    background: "#f8f9fa",
                    }}
                    onClick={() =>
                    document.getElementById("imageInput")?.click()
                    }
                >
                    {imagePreview ? (
                    <img
                        src={imagePreview}
                        alt="preview"
                        style={{ maxWidth: "100%", maxHeight: "100%" }}
                    />
                    ) : (
                    <div className="text-center text-muted">
                        <div style={{ fontSize: "2rem" }}>+</div>
                        <small>Añadir imagen</small>
                    </div>
                    )}
                </div>

                <input
                    id="imageInput"
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                            setImageFile(file);
                            setImagePreview(URL.createObjectURL(file));
                        }
                    }}
                />
                </Col>

                <Col md={8}>
                <FormGroup className="text-start">
                    <Label>Nombre *</Label>
                    <Input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Viaje a Roma"
                    />
                </FormGroup>

                <Row>
                    <Col md={6}>
                    <FormGroup className="text-start">
                        <Label>Fecha inicio</Label>
                        <Input
                        type="date"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        />
                    </FormGroup>
                    </Col>
                    <Col md={6}>
                    <FormGroup className="text-start">
                        <Label>Fecha fin</Label>
                        <Input
                        type="date"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        />
                    </FormGroup>
                    </Col>
                </Row>

                <FormGroup className="text-start">
                    <Label>Descripción</Label>
                    <Input
                    type="textarea"
                    rows={4}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Describe el viaje..."
                    />
                </FormGroup>
                </Col>
            </Row>

            <hr className="my-4" />

            <h5>Añadir participantes</h5>

            <Input
                placeholder="Buscar amigos..."
                value={search}
                onChange={e => setSearch(e.target.value)}
            />

            {loadingFriends && <p className="text-muted mt-2">Cargando amigos...</p>}

            {search && !loadingFriends && filteredFriends.length === 0 && (
            <p className="text-muted mt-2">No se encontraron amigos</p>
            )}

            {search && filteredFriends.length > 0 && (
                <ListGroup className="mt-2">
                {filteredFriends.map(friend => (
                    <ListGroupItem
                    key={friend.id}
                    action
                    onClick={() => addParticipant(friend)}
                    >
                    {friend.name} ({friend.email})
                    </ListGroupItem>
                ))}
                </ListGroup>
            )}

            {participants.length > 0 && (
                <ListGroup className="mt-3">
                {participants.map(p => (
                    <ListGroupItem
                    key={p.id}
                    className="d-flex justify-content-between align-items-center"
                    >
                    {p.name}
                    <Button
                        close
                        onClick={() => removeParticipant(p.id)}
                    />
                    </ListGroupItem>
                ))}
                </ListGroup>
            )}

            <ListGroup className="mt-4">
                <ListGroupItem className="d-flex align-items-center justify-content-between">
                    <div className="text-start">
                    <strong>Privacidad del viaje</strong>
                    <div className="text-muted small">
                        Define si otros usuarios pueden ver este viaje
                    </div>
                    </div>

                    <div className="form-check form-switch">
                    <Input
                        type="switch"
                        id="privacySwitch"
                        checked={isPublic}
                        onChange={() => setIsPublic(prev => !prev)}
                    />
                    <Label for="privacySwitch" className="ms-2 mb-0">
                        {isPublic ? "Público" : "Privado"}
                    </Label>
                    </div>
                </ListGroupItem>
            </ListGroup>

            <div className="d-flex justify-content-end mt-4">
                <Button color="primary" onClick={handleSubmit}>
                    Crear viaje
                </Button>
            </div>
            </Form>
        </CardBody>
        </Card>
    );
}