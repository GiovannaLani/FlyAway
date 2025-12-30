import { Button, Badge } from "reactstrap";
import { useNavigate } from "react-router-dom";
import defaultAvatarImage from "../assets/default-profile-avatar.jpg";
import client from "../api/client";

type FriendStatus = "me" | "none" | "requested" | "friend";

export default function ProfileHeader({user, friendStatus, setFriendStatus}: {user: any; friendStatus: FriendStatus; setFriendStatus: (s: FriendStatus) => void}) {
  const nav = useNavigate();
  const avatar = user.avatarUrl && user.avatarUrl.length > 0 ? `http://localhost:3001${user.avatarUrl}` : defaultAvatarImage;

  const handleAddFriend = async () => {
    await client.post("/users/friends", { email: user.email });
    setFriendStatus("requested");
  };

  const handleRemoveFriend = async () => {
    if (!confirm("¿Eliminar de tus amigos?")) return;
    await client.delete(`/users/friends/${user.id}`);
    setFriendStatus("none");
  };

  return (
    <div className="d-flex align-items-center gap-4 flex-wrap">
      <img
        src={avatar}
        alt="avatar"
        style={{
          width: 120,
          height: 120,
          borderRadius: "50%",
          objectFit: "cover",
          border: "3px solid #eee",
        }}
      />

      <div className="flex-grow-1">
        <div className="d-flex align-items-center gap-3">
          <h3 className="mb-0">{user.name}</h3>

          {friendStatus === "me" && (
            <Button color="link" className="p-0 text-decoration-none" onClick={() => nav("/profile/edit")} title="Editar perfil">
              <i className="bi bi-pencil-square fs-5"></i>
            </Button>
          )}
        </div>

        <p className="text-muted mt-1 mb-2 text-start">
          {user.bio || "Este usuario aún no ha añadido una descripción"}
        </p>

        {friendStatus === "me" ? (
          <div className="mb-3 d-flex" style={{ cursor: "pointer" }} onClick={() => nav("/friends")}>
            <Badge color="primary" outline pill>
              {user.friendsCount} amigos
              {user.pendingRequestsCount > 0 && (
                <span className="ms-2 badge bg-light  text-primary">
                  {user.pendingRequestsCount}
                </span>
              )}
            </Badge>
          </div>
        ) : (
          <div className="mb-3 d-flex">
            <Badge color="secondary" pill>
              {user.friendsCount} amigos
            </Badge>
          </div>
        )}

        <div className="d-flex gap-2">
          {friendStatus === "none" && (
            <Button color="primary" onClick={handleAddFriend}>
              <i className="bi bi-person-plus me-1"></i>
              Añadir amigo
            </Button>
          )}

          {friendStatus === "requested" && (
            <Button disabled outline>
              Solicitud enviada
            </Button>
          )}

          {friendStatus === "friend" && (
            <Button color="success" outline onClick={handleRemoveFriend}>
              <i className="bi bi-person-dash me-1"></i>
              Dejar de ser amigos
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}