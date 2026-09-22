"use client";

import { useState } from "react";
import Link from "next/link";

import {
  flexRender,
  getCoreRowModel,
  type ColumnDef,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { useAuthStore } from "../../../store/authStore";



interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;

  dateOfBirth?: string | null;
  gender?: string | null;
  city?: string | null;
  state?: string | null;

  qualification?: string | null;
  college?: string | null;

  termsAccepted?: boolean;

  createdAt: string;
  updatedAt: string;
}



interface UsersResponse {
  users?: User[];

  message?: string;

  pagination?: {
    page: number;
    pageSize: number;
    totalUsers: number;
    totalPages: number;
  };

  sorting?: {
    sortBy: string;
    sortOrder: string;
  };
}


async function fetchUsers({
  name,
  email,
  phone,
  page,
  pageSize,
}: {
  name: string;
  email: string;
  phone: string;
  page: number;
  pageSize: number;
}): Promise<UsersResponse> {
  const params = new URLSearchParams();


  if (name.trim()) {
    params.set("name", name.trim());
  }

  if (email.trim()) {
    params.set("email", email.trim());
  }

  if (phone.trim()) {
    params.set("phone", phone.trim());
  }


  params.set("page", String(page));
  params.set("pageSize", String(pageSize));

  const response = await fetch(
    `/api/users?${params.toString()}`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    }
  );

  const result: UsersResponse =
    await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        "Failed to fetch users"
    );
  }

  return result;
}


async function deleteUserApi(
  userId: string
) {
  const response = await fetch(
    `/api/users/${userId}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        "Failed to delete user"
    );
  }

  return result;
}


function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}


function getRoleBadge(role: string) {
  const normalizedRole =
    role.toLowerCase();

  switch (normalizedRole) {
    case "admin":
      return (
        <Badge variant="destructive">
          Admin
        </Badge>
      );

    case "manager":
      return (
        <Badge>
          Manager
        </Badge>
      );

    case "staff":
      return (
        <Badge variant="secondary">
          Staff
        </Badge>
      );

    default:
      return (
        <Badge variant="outline">
          {role}
        </Badge>
      );
  }
}


export default function UsersPage() {

  const currentUser = useAuthStore(
    (state) => state.user
  );


  const queryClient =
    useQueryClient();


  const [nameSearch, setNameSearch] =
    useState("");

  const [emailSearch, setEmailSearch] =
    useState("");

  const [phoneSearch, setPhoneSearch] =
    useState("");


  const [page, setPage] =
    useState(1);

  const [pageSize] =
    useState(10);


  const [deleteUser, setDeleteUser] =
    useState<User | null>(null);

  const [sorting, setSorting] =
    useState<SortingState>([]);


  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      "users",
      nameSearch,
      emailSearch,
      phoneSearch,
      page,
      pageSize,
    ],

    queryFn: () =>
      fetchUsers({
        name: nameSearch,
        email: emailSearch,
        phone: phoneSearch,
        page,
        pageSize,
      }),

    staleTime: 30 * 1000,
  });


  const users =
    data?.users ?? [];

  const totalUsers =
    data?.pagination?.totalUsers ?? 0;

  const totalPages =
    data?.pagination?.totalPages ?? 1;


  const deleteMutation =
    useMutation({
      mutationFn: deleteUserApi,

      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["users"],
        });

        setDeleteUser(null);
      },

      onError: (error) => {
        console.error(
          "Delete user error:",
          error
        );
      },
    });


  const clearSearch = () => {
    setNameSearch("");
    setEmailSearch("");
    setPhoneSearch("");

    
    setPage(1);
  };


  const columns: ColumnDef<User>[] = [
 
    {
      accessorKey: "name",

      header: "Name",

      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.name}
        </span>
      ),
    },


    {
      accessorKey: "email",

      header: "Email",

      cell: ({ row }) => (
        <span>
          {row.original.email}
        </span>
      ),
    },


    {
      accessorKey: "phone",

      header: "Phone",

      cell: ({ row }) => (
        <span>
          {row.original.phone ||
            "-"}
        </span>
      ),
    },


    {
      accessorKey: "role",

      header: "Role",

      cell: ({ row }) =>
        getRoleBadge(
          row.original.role
        ),
    },


    {
      accessorKey:
        "qualification",

      header: "Qualification",

      cell: ({ row }) => (
        <span>
          {row.original
            .qualification ||
            "-"}
        </span>
      ),
    },


    {
      accessorKey:
        "createdAt",

      header: "Created",

      cell: ({ row }) => (
        <span>
          {formatDate(
            row.original.createdAt
          )}
        </span>
      ),
    },


    {
      id: "actions",

      header: () => (
        <div className="text-right">
          Actions
        </div>
      ),

      enableSorting: false,

      cell: ({ row }) => {
        const user =
          row.original;

        return (
          <div className="flex justify-end gap-2">

            

            <Link
              href={`/users/${user.id}`}
            >
              <Button
                variant="outline"
                size="sm"
              >
                View
              </Button>
            </Link>

            

            <Link
              href={`/users/${user.id}/edit`}
            >
              <Button
                variant="outline"
                size="sm"
              >
                Edit
              </Button>
            </Link>

           

            {currentUser?.role ===
              "admin" && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() =>
                  setDeleteUser(
                    user
                  )
                }
              >
                Delete
              </Button>
            )}

          </div>
        );
      },
    },
  ];


  const table =
    useReactTable({
      data: users,

      columns,

      state: {
        sorting,
      },

      onSortingChange:
        setSorting,

      getCoreRowModel:
        getCoreRowModel(),
    });


  const handleDelete = () => {
    if (!deleteUser) {
      return;
    }

    deleteMutation.mutate(
      deleteUser.id
    );
  };


  const handlePreviousPage =
    () => {
      setPage((currentPage) =>
        Math.max(
          currentPage - 1,
          1
        )
      );
    };

  const handleNextPage =
    () => {
      setPage((currentPage) =>
        Math.min(
          currentPage + 1,
          totalPages
        )
      );
    };


  return (
    <div className="min-h-screen bg-slate-50 p-6">

      <div className="mx-auto max-w-7xl">

        
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <Link
              href="/dashboard"
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-700 transition hover:text-slate-950"
            >
              <span className="text-xl">
                ←
              </span>

              <span>
                Back to Dashboard
              </span>
            </Link>

            <h1 className="text-3xl font-bold text-slate-900">
              Users
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage all registered users.
            </p>

          </div>

          <Link href="/users/create">

            <Button>
              + Add User
            </Button>

          </Link>

        </div>

        
        <div className="mb-6 border bg-white p-5 shadow-sm">

          <div className="mb-4">

            <h2 className="text-lg font-semibold text-slate-900">
              Search Users
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Search by name, email or phone number.
            </p>

          </div>

          <div className="grid gap-4 md:grid-cols-4">

            

            <div>

              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Name
              </label>

              <Input
                value={nameSearch}
                onChange={(event) => {
                  setNameSearch(
                    event.target.value
                  );

                  setPage(1);
                }}
                placeholder="Search name"
              />

            </div>

            

            <div>

              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Email
              </label>

              <Input
                value={emailSearch}
                onChange={(event) => {
                  setEmailSearch(
                    event.target.value
                  );

                  setPage(1);
                }}
                placeholder="Search email"
              />

            </div>

            

            <div>

              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Phone
              </label>

              <Input
                value={phoneSearch}
                onChange={(event) => {
                  setPhoneSearch(
                    event.target.value
                  );

                  setPage(1);
                }}
                placeholder="Search phone"
              />

            </div>

           

            <div className="flex items-end">

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={
                  clearSearch
                }
              >
                Clear Search
              </Button>

            </div>

          </div>

        </div>

        
        {isError && (
          <div className="mb-6 border border-red-200 bg-red-50 p-4">

            <p className="text-sm font-medium text-red-700">
              {error instanceof Error
                ? error.message
                : "Failed to fetch users"}
            </p>

          </div>
        )}

       
        <div className="mb-4 flex items-center justify-between">

          <div>

            <p className="text-sm text-slate-500">
              Total users
            </p>

            <p className="text-2xl font-bold text-slate-900">
              {isLoading
                ? "..."
                : totalUsers}
            </p>

          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              refetch()
            }
            disabled={
              isLoading ||
              isFetching
            }
          >
            {isFetching
              ? "Loading..."
              : "Refresh"}
          </Button>

        </div>

        
        <div className="overflow-hidden border bg-white shadow-sm">

          <Table>

           

            <TableHeader>

              {table
                .getHeaderGroups()
                .map(
                  (headerGroup) => (
                    <TableRow
                      key={
                        headerGroup.id
                      }
                    >

                      {headerGroup.headers.map(
                        (header) => (
                          <TableHead
                            key={
                              header.id
                            }
                          >

                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header
                                    .column
                                    .columnDef
                                    .header,
                                  header.getContext()
                                )}

                          </TableHead>
                        )
                      )}

                    </TableRow>
                  )
                )}

            </TableHeader>


            <TableBody>

              
              {isLoading && (
                <TableRow>

                  <TableCell
                    colSpan={
                      columns.length
                    }
                    className="h-32 text-center text-slate-500"
                  >
                    Loading users...
                  </TableCell>

                </TableRow>
              )}


              {!isLoading &&
                isError && (
                  <TableRow>

                    <TableCell
                      colSpan={
                        columns.length
                      }
                      className="h-32 text-center"
                    >

                      <p className="font-medium text-red-600">
                        Failed to load users
                      </p>

                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() =>
                          refetch()
                        }
                      >
                        Try Again
                      </Button>

                    </TableCell>

                  </TableRow>
                )}

             

              {!isLoading &&
                !isError &&
                users.length ===
                  0 && (
                  <TableRow>

                    <TableCell
                      colSpan={
                        columns.length
                      }
                      className="h-32 text-center"
                    >

                      <p className="font-medium text-slate-700">
                        No users found
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        Try changing your search.
                      </p>

                    </TableCell>

                  </TableRow>
                )}

           

              {!isLoading &&
                !isError &&
                users.length > 0 &&
                table
                  .getRowModel()
                  .rows.map(
                    (row) => (
                      <TableRow
                        key={row.id}
                      >

                        {row
                          .getVisibleCells()
                          .map(
                            (cell) => (
                              <TableCell
                                key={
                                  cell.id
                                }
                              >

                                {flexRender(
                                  cell
                                    .column
                                    .columnDef
                                    .cell,
                                  cell.getContext()
                                )}

                              </TableCell>
                            )
                          )}

                      </TableRow>
                    )
                  )}

            </TableBody>

          </Table>

        </div>

        {!isLoading &&
          !isError &&
          totalUsers > 0 && (
            <div className="mt-4 flex flex-col gap-3 border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">

              

              <div className="text-sm text-slate-500">

                Page{" "}
                <span className="font-medium text-slate-900">
                  {page}
                </span>{" "}
                of{" "}
                <span className="font-medium text-slate-900">
                  {totalPages}
                </span>

                <span className="mx-2">
                  •
                </span>

                {totalUsers} users

              </div>

              

              <div className="flex items-center gap-2">

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={
                    handlePreviousPage
                  }
                  disabled={
                    page === 1 ||
                    isFetching
                  }
                >
                  ← Previous
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={
                    handleNextPage
                  }
                  disabled={
                    page ===
                      totalPages ||
                    isFetching
                  }
                >
                  Next →
                </Button>

              </div>

            </div>
          )}

      </div>

      
      <AlertDialog
        open={!!deleteUser}
        onOpenChange={(
          open
        ) => {
          if (
            !open &&
            !deleteMutation.isPending
          ) {
            setDeleteUser(null);
          }
        }}
      >

        <AlertDialogContent>

          <AlertDialogHeader>

            <AlertDialogTitle>
              Delete User?
            </AlertDialogTitle>

            <AlertDialogDescription>

              Are you sure you want to
              delete{" "}

              <strong>
                {deleteUser?.name}
              </strong>

              ?

              <br />

              This action cannot be undone.

            </AlertDialogDescription>

          </AlertDialogHeader>

          

          {deleteMutation.isError && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3">

              <p className="text-sm text-red-700">

                {deleteMutation.error instanceof
                Error
                  ? deleteMutation.error.message
                  : "Failed to delete user"}

              </p>

            </div>
          )}

          <AlertDialogFooter>

            <AlertDialogCancel
              disabled={
                deleteMutation.isPending
              }
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();

                handleDelete();
              }}
              disabled={
                deleteMutation.isPending
              }
            >
              {deleteMutation.isPending
                ? "Deleting..."
                : "Delete"}
            </AlertDialogAction>

          </AlertDialogFooter>

        </AlertDialogContent>

      </AlertDialog>

    </div>
  );
}