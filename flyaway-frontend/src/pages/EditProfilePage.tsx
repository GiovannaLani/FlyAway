import { useEffect, useState } from "react";
import { Button, Card, CardBody, Col, Container, Form, FormGroup, Input, Label, Row } from "reactstrap";
import client from "../api/client";
import { useAuth } from "../auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import defaultAvatarImage from "../assets/default-profile-avatar.jpg";

export default function EditProfilePage() {
  const { me } = useAuth();
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!me) return;

    async function loadProfile() {
      const res = await client.get("/users/me");
      setName(res.data.name);
      setBio(res.data.bio || "");
      setPreview( res.data.avatarUrl ? `http://localhost:3001${res.data.avatarUrl}` : defaultAvatarImage);
    }
    loadProfile();
  }, [me]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await client.put("/users/me", { name, bio });
      if (avatar) {
        const fd = new FormData();
        fd.append("image", avatar);
        await client.post("/users/me/avatar", fd);
      }
      nav(`/users/${me?.id}`);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!me) return null;

  return (
    <Container className="mt-5" style={{ maxWidth: 700 }}>
      <Card className="shadow-sm">
        <CardBody>
          <h3 className="mb-4 text-center">Editar perfil</h3>
          <Form>
            <Row className="align-items-center mb-4">
              <Col md={4} className="text-center">
                <img src={preview || defaultAvatarImage} alt="avatar"
                  style={{
                    width: 140,
                    height: 140,
                    borderRadius: "50%",
                    objectFit: "cover",
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    document.getElementById("avatarInput")?.click()
                  }
                />

                <Input id="avatarInput" type="file" accept="image/*" hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setAvatar(file);
                      setPreview(URL.createObjectURL(file));
                    }
                  }}
                />

                <small className="text-muted d-block mt-2">
                  Haz click para cambiar
                </small>
              </Col>

              <Col md={8}>
                <FormGroup>
                  <Label>Nombre</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </FormGroup>

                <FormGroup className="mt-3">
                  <Label>Biografía</Label>
                  <Input type="textarea" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Cuéntanos algo sobre ti..."/>
                </FormGroup>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2">
              <Button color="secondary" outline onClick={() => nav(-1)} >
                Cancelar
              </Button>

              <Button color="primary" onClick={handleSave} disabled={saving}>
                {saving ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </Form>
        </CardBody>
      </Card>
    </Container>
  );
}