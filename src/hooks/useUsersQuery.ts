"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/api/userService";
import type { CreateUserRequest } from "@/lib/model/createUserRequest";

export const userKeys = {
  all: ["users"] as const,
  list: (page: number, size: number) =>
    [...userKeys.all, "list", { page, size }] as const,
};

export function useUsersQuery(page: number, size: number) {
  return useQuery({
    queryKey: userKeys.list(page, size),
    queryFn: async () => {
      const [data, err] = await userService.getAllUsers({ page, size });
      if (err) throw new Error(err);
      return data!;
    },
  });
}

export function useCreateUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateUserRequest) => {
      const [data, err] = await userService.createUser(body);
      if (err) throw new Error(err);
      return data!;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}
