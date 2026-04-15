import { useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AvatarGroup } from "@/components/ui/avatar-group";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCalendar } from "@/features/calendar/contexts/calendar-context";

export function UserSelect() {
  const { users, selectedUserId, filterEventsBySelectedUser } = useCalendar();
  const [search, setSearch] = useState("");

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return users;

    return users.filter((user) => user.name.toLowerCase().includes(term));
  }, [search, users]);

  return (
    <Select value={selectedUserId!} onValueChange={filterEventsBySelectedUser}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a user" />
      </SelectTrigger>
      <SelectContent align="end">
        <div className="p-2">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => event.stopPropagation()}
            placeholder="Pesquisar por nome..."
            className="h-8"
          />
        </div>

        <SelectItem value="all">
          <AvatarGroup className="mx-2 flex items-center" max={3}>
            {users.map((user) => (
              <Avatar key={user.id} className="size-6 text-xxs">
                <AvatarImage
                  src={user.picturePath ?? undefined}
                  alt={user.name}
                />
                <AvatarFallback
                  className="text-xxs text-white"
                  style={{ backgroundColor: user.userColor }}
                >
                  {user.name[0]}
                </AvatarFallback>
              </Avatar>
            ))}
          </AvatarGroup>
          Todos
        </SelectItem>

        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <SelectItem
              key={user.id}
              value={user.id}
              className="flex-1 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Avatar key={user.id} className="size-6">
                  <AvatarImage
                    src={user.picturePath ?? undefined}
                    alt={user.name}
                  />
                  <AvatarFallback
                    className="text-xxs text-white"
                    style={{ backgroundColor: user.userColor }}
                  >
                    {user.name[0]}
                  </AvatarFallback>
                </Avatar>

                <p className="truncate">{user.name}</p>
              </div>
            </SelectItem>
          ))
        ) : (
          <p className="px-2 py-1.5 text-xs text-muted-foreground">
            Nenhum usuário encontrado.
          </p>
        )}
      </SelectContent>
    </Select>
  );
}
