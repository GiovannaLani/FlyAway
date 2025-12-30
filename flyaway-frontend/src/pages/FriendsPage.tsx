import { useEffect, useState } from "react";
import { Card, CardBody, Button, Col, Container, Form, FormGroup, Input, Label, Row } from "reactstrap";
import client from "../api/client";
import { useNavigate } from "react-router-dom";
import defaultAvatarImage from "../assets/default-profile-avatar.jpg";

type User = {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string;
};

export default function FriendsPage() {
  const nav = useNavigate();

  const [friends, setFriends] = useState<User[]>([]);
  const [requests, setRequests] = useState<User[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "danger">("success");

  async function loadData() {
    setLoading(true);
    try {
      const [friendsRes, requestsRes] = await Promise.all([
        client.get("/users/friends"),
        client.get("/users/friends/requests/pending"),
      ]);
      setFriends(friendsRes.data);
      setRequests(requestsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const sendRequest = async () => {
    if (!email) return;
    try {
      await client.post("/users/friends", { email });
      setEmail("");
      setMessageType("success");
      setMessage("Solicitud enviada correctamente");
    } catch (err: any) {
      setMessageType("danger");
      setMessage(err.response?.data?.message || err.message);
    }
  };

  const respondRequest = async (id: number, accept: boolean) => {
    try {
      await client.post( `/users/friends/${id}/${accept ? "accept" : "reject"}` );
      setMessageType("success");
      setMessage( accept ? "Solicitud aceptada" : "Solicitud rechazada" );
      loadData();
    } catch (err: any) {
      setMessageType("danger");
      setMessage(err.response?.data?.message || err.message);
    }
  };

  if (loading) return <p className="text-center mt-5">Cargando amigos...</p>;

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Amigos</h2>

      {message && (
        <div className="mb-4">
            <div className={`alert alert-${messageType} alert-dismissible fade show`} role="alert" >
            {message}
            <button type="button" className="btn-close" onClick={() => setMessage(null)} />
            </div>
        </div>
        )}

      <Row className="g-4">
        <Col md={8}>
          <Card className="shadow-sm">
            <CardBody>
              <h5 className="mb-3">Mis amigos</h5>
              {friends.length === 0 ? (
                <p className="text-muted">Todavía no tienes amigos.</p>
              ) : (
                friends.map(friend => (
                  <div key={friend.id}
                    className="d-flex align-items-center justify-content-between border-bottom py-2"
                    style={{ cursor: "pointer" }}
                    onClick={() => nav(`/users/${friend.id}`)}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <img src={friend.avatarUrl ? `http://localhost:3001${friend.avatarUrl}` : defaultAvatarImage}
                        alt="avatar"
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                      <div>
                        <strong>{friend.name}</strong>
                        <div className="text-muted small">{friend.email}</div>
                      </div>
                    </div>

                    <i className="bi bi-chevron-right text-muted"></i>
                  </div>
                ))
              )}
            </CardBody>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow-sm mb-4">
            <CardBody>
              <h6>Enviar solicitud</h6>

              <Form>
                <FormGroup>
                  <Label>Email del usuario</Label>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="usuario@email.com" />
                </FormGroup>

                <Button color="primary" className="w-100" onClick={sendRequest}>
                  Enviar solicitud
                </Button>
              </Form>
            </CardBody>
          </Card>

          <Card className="shadow-sm">
            <CardBody>
              <h6>Solicitudes pendientes</h6>

              {requests.length === 0 ? (
                <p className="text-muted small">
                  No tienes solicitudes pendientes
                </p>
              ) : (
                requests.map(req => (
                  <div key={req.id} className="d-flex align-items-center justify-content-between mb-3" >
                    <div className="d-flex align-items-center gap-2">
                      <img
                        src={req.avatarUrl ? `http://localhost:3001${req.avatarUrl}` : defaultAvatarImage}
                        alt="avatar"
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                      <div>
                        <strong>{req.name}</strong>
                        <div className="text-muted small">{req.email}</div>
                      </div>
                    </div>

                    <div className="d-flex gap-1">
                      <Button size="sm" color="success" onClick={() => respondRequest(req.id, true)} >
                        <i className="bi bi-check-lg"></i>
                      </Button>
                      <Button size="sm" color="danger" outline onClick={() => respondRequest(req.id, false)} >
                        <i className="bi bi-x-lg"></i>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
