"use client";

import { Button } from "@nextui-org/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  deleteExpense,
  getAllExpensesQueryOptions,
  getTotalSpentQueryOptions,
} from "@/api-client/expenses";
import { TrashIcon } from "@/components/icons";

export const DeleteExpenseButton = ({ id }: { id: string }) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: deleteExpense,
    onError: () => {
      toast.error("Error deleting expense");
    },
    onSuccess: (deletedExpense) => {
      toast.success("Expense deleted!");

      queryClient.setQueryData(
        getAllExpensesQueryOptions.queryKey,
        (existingExpenses) =>
          existingExpenses!.filter((expense) => expense.id !== Number(id)),
      );

      queryClient.setQueryData(
        getTotalSpentQueryOptions.queryKey,
        (oldTotal) => {
          const newTotal =
            Number(oldTotal?.total) - Number(deletedExpense.amount);

          return { total: newTotal.toString() };
        },
      );
    },
  });

  return (
    <Button
      isIconOnly
      color="danger"
      disabled={mutation.isPending}
      isLoading={mutation.isPending}
      size="sm"
      startContent={!mutation.isPending && <TrashIcon size={18} />}
      variant="flat"
      onPress={() => mutation.mutate({ id: Number(id) })}
    />
  );
};
