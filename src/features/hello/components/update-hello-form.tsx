"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { useQueryClient } from "@tanstack/react-query";
import { Fragment } from "react";
import { Controller, useForm } from "react-hook-form";

import { useHelloMutation } from "../api/update-hello";
import { updateHelloFormSchema } from "../schemas";
import { UpdateHelloForm } from "../types";

export function CreateHello() {
  const queryClient = useQueryClient();
  const { mutateAsync } = useHelloMutation(queryClient);

  const form = useForm<UpdateHelloForm>({
    resolver: zodResolver(updateHelloFormSchema),
    defaultValues: {
      message: "",
    },
  });

  async function onSubmit(values: UpdateHelloForm) {
    const { message } = values;

    try {
      await mutateAsync(message);
      form.reset();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  }

  return (
    <form
      className="flex min-w-80 flex-col items-center justify-center"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <Controller
        control={form.control}
        name="message"
        render={({ field }) => (
          <Fragment>
            <Input
              fullWidth
              isRequired
              // errorMessage={form.formState.errors.message?.message}
              isDisabled={form.formState.isSubmitting}
              isInvalid={
                !!form.formState.errors.message &&
                form.formState.dirtyFields.message
              }
              label="New message"
              type="text"
              {...field}
            />
            <div className="my-1 h-4 w-full pl-1 text-tiny text-danger">
              {form.formState.dirtyFields.message && (
                <span>{form.formState.errors.message?.message}</span>
              )}
            </div>
          </Fragment>
        )}
      />
      <Button
        className="w-full"
        color="primary"
        isDisabled={!form.formState.isValid || form.formState.isSubmitting}
        isLoading={form.formState.isSubmitting}
        type="submit"
      >
        Update
      </Button>
    </form>
  );
}