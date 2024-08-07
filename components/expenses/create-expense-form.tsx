"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { parseDate } from "@internationalized/date";
import { Button } from "@nextui-org/button";
import { DatePicker } from "@nextui-org/date-picker";
import { Input } from "@nextui-org/input";
import { useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  createExpense,
  getAllExpensesQueryOptions,
  getTotalSpentQueryOptions,
  loadingCreateExpenseQueryOptions,
} from "@/api-client/expenses";
import { getOrCreateUUID } from "@/lib/utils";
import { createExpenseSchema } from "@/types";

const formSchema = createExpenseSchema.omit({ userId: true });

export const CreateExpenseForm = () => {
  const queryClient = useQueryClient();
  const userId = getOrCreateUUID();
  const today = new Date().toISOString().split("T")[0];

  const {
    formState: { isValid, isSubmitting, dirtyFields, errors },
    control,
    setValue,
    handleSubmit,
    reset,
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      amount: "",
      date: today,
    },
    mode: "onChange",
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const existingExpenses = await queryClient.ensureQueryData(
      getAllExpensesQueryOptions,
    );

    const data = {
      ...values,
      userId,
    };

    queryClient.setQueryData(loadingCreateExpenseQueryOptions.queryKey, {
      expense: data,
    });

    try {
      const newExpense = await createExpense({ values: data });

      queryClient.setQueryData(getAllExpensesQueryOptions.queryKey, [
        newExpense,
        ...existingExpenses,
      ]);

      toast.success("Expense created!");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";

      toast.error(errorMessage);
    } finally {
      queryClient.setQueryData(loadingCreateExpenseQueryOptions.queryKey, {});
      //ToDo: Make optimistic
      queryClient.invalidateQueries({
        queryKey: getTotalSpentQueryOptions.queryKey,
      });
      reset();
    }
  }

  return (
    <form
      className="flex flex-col w-full gap-4 p-4 rounded-large shadow-small bg-content1"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Controller
        control={control}
        name="title"
        render={({ field }) => (
          <Input
            fullWidth
            isRequired
            errorMessage={errors.title?.message}
            isDisabled={isSubmitting}
            isInvalid={!!errors.title && dirtyFields.title}
            label="Title"
            placeholder="e.g. Groceries, Rent, Phone Bill"
            type="text"
            {...field}
          />
        )}
      />
      <Controller
        control={control}
        name="amount"
        render={({ field }) => (
          <Input
            fullWidth
            isRequired
            errorMessage={errors.amount?.message}
            isDisabled={isSubmitting}
            isInvalid={!!errors.amount && dirtyFields.amount}
            label="Amount"
            startContent={<p className="text-default-400">$</p>}
            type="number"
            {...field}
          />
        )}
      />
      <Controller
        control={control}
        name="date"
        render={() => (
          <DatePicker
            isRequired
            defaultValue={parseDate(today)}
            errorMessage={errors.date?.message}
            isDisabled={isSubmitting}
            isInvalid={!!errors.date && dirtyFields.date}
            label="Date"
            onChange={(date) => setValue("date", date.toString())}
          />
        )}
      />
      <Button
        color="primary"
        isDisabled={!isValid || isSubmitting}
        isLoading={isSubmitting}
        type="submit"
      >
        Submit
      </Button>
    </form>
  );
};
