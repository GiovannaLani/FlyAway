import { useState } from "react";
import { Input, ListGroup, ListGroupItem } from "reactstrap";

type Friend = {
  id: number;
  name: string;
  email: string;
};

type Props = {
  friends: Friend[];
  onAdd: (friend: Friend) => void;
  excludedIds: number[];
};

export default function AddParticipants({friends,onAdd,excludedIds,}: Props) {
  const [search, setSearch] = useState("");

  const filtered = friends.filter(
    f =>
      f.name.toLowerCase().includes(search.toLowerCase()) &&
      !excludedIds.includes(f.id)
  );

  return (
    <>
      <Input
        placeholder="Buscar amigos..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {search && filtered.length > 0 && (
        <ListGroup className="mt-2">
          {filtered.map(friend => (
            <ListGroupItem
              key={friend.id}
              action
              onClick={() => {
                onAdd(friend);
                setSearch("");
              }}
            >
              {friend.name} ({friend.email})
            </ListGroupItem>
          ))}
        </ListGroup>
      )}

      {search && filtered.length === 0 && (
        <p className="text-muted mt-2">No se encontraron amigos</p>
      )}
    </>
  );
}