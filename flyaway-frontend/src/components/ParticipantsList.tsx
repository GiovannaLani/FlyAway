import { useState } from "react";
import {ListGroup, ListGroupItem, Button, Badge, Input, Modal, ModalHeader, ModalBody, ModalFooter, } from "reactstrap";

export type Participant = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "member";
};

type Props = {
  participants: Participant[];
  currentUserId: number;
  onChangeRole: (userId: number, role: "admin" | "member") => void;
  onRemove: (userId: number) => void;
  onLeave: () => void;
};

export default function ParticipantsList({ participants, currentUserId, onChangeRole, onRemove, onLeave}: Props) {
  const currentUser = participants.find(p => p.id === currentUserId);
  const isAdmin = currentUser?.role === "admin";
  const isSelf = (userId: number) => userId === currentUserId;

  type RemoveAction = { type: "remove"; userId: number } | { type: "leave" } | null;
  const [removeAction, setRemoveAction] = useState<RemoveAction>(null);

  return (
    <>
      <ListGroup className="mt-3">
        {participants.map(p => (
          <ListGroupItem key={p.id} className="d-flex justify-content-between align-items-center">
            <div className="text-start">
              <strong>{p.name}</strong>
              <div className="text-muted small">{p.email}</div>
            </div>

            <div className="d-flex align-items-center gap-2">
              {isAdmin && !isSelf(p.id) ? (
                <Input type="select" bsSize="sm" value={p.role} onChange={e => onChangeRole(p.id, e.target.value as "admin" | "member")}>
                  <option value="admin">admin</option>
                  <option value="member">member</option>
                </Input>
              ) : (
                <Badge color={p.role === "admin" ? "primary" : "secondary"}>
                  {p.role}
                </Badge>
              )}

              {isAdmin && !isSelf(p.id) && (
                <Button size="sm" outline color="danger" onClick={() => setRemoveAction({ type: "remove", userId: p.id })}>
                  Eliminar
                </Button>
              )}

              {isSelf(p.id) && (
                <Button size="sm" color="danger" onClick={() => setRemoveAction({ type: "leave" })}>
                  Salir
                </Button>
              )}
            </div>
          </ListGroupItem>
        ))}
      </ListGroup>

      <Modal isOpen={removeAction !== null} toggle={() => setRemoveAction(null)}>
        <ModalHeader toggle={() => setRemoveAction(null)}>
            {removeAction?.type === "leave"? "Salir del viaje": "Eliminar participante"}
        </ModalHeader>

        <ModalBody>
            {removeAction?.type === "leave"? "¿Seguro que quieres salir de este viaje?": "¿Seguro que quieres eliminar a este participante del viaje?"}
        </ModalBody>

        <ModalFooter>
            <Button color="danger"
            onClick={() => {
                if (removeAction?.type === "leave") {
                onLeave();
                } else if (removeAction?.type === "remove") {
                onRemove(removeAction.userId);
                }
                setRemoveAction(null);
            }}
            >
              Confirmar
            </Button>

            <Button outline onClick={() => setRemoveAction(null)}>
              Cancelar
            </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}