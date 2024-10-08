"use client";

import { Spinner } from "@nextui-org/spinner";
import {
  SortDescriptor,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/table";
import { cn } from "@nextui-org/theme";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { loadingCreateAccountQueryOptions } from "../api/create-account";
import { useDeleteAccount } from "../api/delete-account";
import { useAllAccounts } from "../api/get-accounts";
import { columns } from "../lib/columns";

import { UpdateAccountForm } from "./update-account-form";

import { DeleteButton } from "@/components/delete-button";
import { EditModal } from "@/components/edit-modal";
import { formatCurrency } from "@/lib/utils";

export function AccountsTable({ searchValue }: { searchValue: string }) {
  const { data, isPending } = useAllAccounts();
  const { data: loadingCreateAccount } = useQuery(
    loadingCreateAccountQueryOptions(),
  );
  const { mutate } = useDeleteAccount({});

  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "name",
    direction: "ascending",
  });

  let accounts = data ?? [];

  if (loadingCreateAccount?.account) {
    const optimisticAccount = {
      ...loadingCreateAccount.account,
      id: 999999,
      createdAt: new Date(),
    };

    accounts = [optimisticAccount, ...accounts];
  }

  const searchedAccounts = useMemo(() => {
    return accounts.filter((account) =>
      account.name.toLowerCase().includes(searchValue?.toLowerCase()),
    );
  }, [accounts, searchValue]);

  const sortedAccounts = useMemo(() => {
    return [...searchedAccounts].sort((a, b) => {
      const column = sortDescriptor.column as keyof (typeof accounts)[0];
      let first = a[column];
      let second = b[column];

      if (column === "balance") {
        first = parseFloat(first as string);
        second = parseFloat(second as string);
      }

      if (typeof first === "string" && typeof second === "string") {
        return sortDescriptor.direction === "ascending"
          ? first.localeCompare(second)
          : second.localeCompare(first);
      }

      if (typeof first === "number" && typeof second === "number") {
        return sortDescriptor.direction === "ascending"
          ? first - second
          : second - first;
      }

      return 0;
    });
  }, [searchedAccounts, sortDescriptor]);

  return (
    <Table
      removeWrapper
      aria-label="Accounts table"
      classNames={{
        base: "flex-1",
        table: cn({ "min-h-full": accounts.length === 0 }),
      }}
      color="primary"
      sortDescriptor={sortDescriptor}
      onSortChange={setSortDescriptor}
    >
      <TableHeader columns={columns}>
        {(column) => (
          <TableColumn
            key={column.key}
            align={column.key === "actions" ? "end" : "start"}
            allowsSorting={column.sortable}
            className="uppercase"
          >
            {column.label}
          </TableColumn>
        )}
      </TableHeader>

      <TableBody
        emptyContent={accounts.length === 0 && "No accounts found. Create one!"}
        isLoading={isPending}
        items={sortedAccounts}
        loadingContent={<Spinner size="lg" />}
      >
        {sortedAccounts.map((account) => {
          const isOptimisticAccount = account.id === 999999;

          return (
            <TableRow key={account.id}>
              <TableCell>{account.name}</TableCell>
              <TableCell>{formatCurrency(account.balance)}</TableCell>
              <TableCell>
                <div className="relative flex items-center justify-end gap-2">
                  <EditModal
                    description="Add the details of the account you want to edit."
                    isLoading={isOptimisticAccount}
                    title="Edit account"
                  >
                    <UpdateAccountForm
                      account={{
                        balance: account.balance,
                        id: account.id,
                        name: account.name,
                      }}
                    />
                  </EditModal>

                  <DeleteButton<string>
                    errorMessage="Error deleting account"
                    id={account.id!.toString()}
                    isLoading={isOptimisticAccount}
                    successMessage="Account deleted!"
                    onDelete={async (id) => {
                      await mutate({ id: Number(id) });
                    }}
                  />
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
