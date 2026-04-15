import { useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AvatarGroup } from "@/components/ui/avatar-group";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useCalendar } from "@/features/calendar/contexts/calendar-context";

export function UserSelect() {
  const { users, selectedUserIds, filterEventsBySelectedUser } = useCalendar();
  const [search, setSearch] = useState("");

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return users;

    return users.filter((user) => user.name.toLowerCase().includes(term));
  }, [search, users]);

  const selectedUsers = users.filter((user) => selectedUserIds.includes(user.id));

  const triggerLabel =
    selectedUserIds.length === 0
      ? "Todos"
      : selectedUserIds.length === 1
        ? selectedUsers[0]?.name ?? "1 usuario"
        : `${selectedUserIds.length} usuarios`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-[150px] justify-between md:w-[180px]"
        >
          <span className="truncate">{triggerLabel}</span>
          {selectedUserIds.length > 0 && (
            <span className="rounded bg-muted px-1.5 py-0.5 text-xs">
              {selectedUserIds.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <div className="p-2">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => event.stopPropagation()}
            placeholder="Pesquisar por nome..."
            className="h-7 text-xs"
          />
        </div>

        <DropdownMenuCheckboxItem
          checked={selectedUserIds.length === 0}
          onCheckedChange={() => filterEventsBySelectedUser("all")}
        >
          <AvatarGroup className="mx-2 flex items-center" max={3}>
            {users.map((user) => (
              <Avatar key={user.id} className="size-6 text-xxs">
                <AvatarImage src={user.picturePath ?? undefined} alt={user.name} />
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
        </DropdownMenuCheckboxItem>

        <DropdownMenuSeparator />

        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <DropdownMenuCheckboxItem
              key={user.id}
              checked={selectedUserIds.includes(user.id)}
              onCheckedChange={() => filterEventsBySelectedUser(user.id)}
              className="flex-1 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Avatar key={user.id} className="size-6">
                  <AvatarImage src={user.picturePath ?? undefined} alt={user.name} />
                  <AvatarFallback
                    className="text-xxs text-white"
                    style={{ backgroundColor: user.userColor }}
                  >
                    {user.name[0]}
                  </AvatarFallback>
                </Avatar>
                <p className="truncate">{user.name}</p>
              </div>
            </DropdownMenuCheckboxItem>
          ))
        ) : (
          <p className="px-2 py-1.5 text-xs text-muted-foreground">
            Nenhum usuario encontrado.
          </p>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
