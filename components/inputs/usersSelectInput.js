import React, { useEffect } from "react";

export default function UsersSelectInput({ register, full_name, label }) {
  const [users, setUsers] = React.useState([]);
  const [selectedUserId, setSelectedUserId] = React.useState(undefined);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/v1/users");
        const resBody = await res.json();

        if (res.status == 200) {
          setUsers(resBody);
        } else {
          toast.error(resBody.message);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setSelectedUserId(e.target.value);
    register("responsible", { value: e.target.value });
  };

  return (
    <div>
      <label htmlFor={"responsible"}>{label}</label>
      <select
        {...register("responsible")}
        onChange={handleChange}
        defaultValue={selectedUserId}
      >
        <option value="">Selecione um usuário</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.full_name}
          </option>
        ))}
      </select>
    </div>
  );
}
