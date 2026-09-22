"use client";

import {
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useAuthStore } from "../../../store/authStore";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";


interface User {
  id: string;

  name: string;

  email: string;

  phone: string | null;

  role: string;

  dateOfBirth: string | null;

  gender: string | null;

  address: string | null;

  city: string | null;

  state: string | null;

  pincode: string | null;

  qualification: string | null;

  college: string | null;

  course: string | null;

  department: string | null;

  graduationYear: string | null;

  cgpa: string | null;

  tenthPercentage: string | null;

  twelfthPercentage: string | null;

  resumePath: string | null;

  identityProofPath: string | null;

  termsAccepted: boolean;

  createdAt: string;

  updatedAt: string;
}


interface ProfileResponse {
  user?: User;

  message?: string;
}


interface ProfileForm {
  name: string;

  email: string;

  phone: string;

  dateOfBirth: string;

  gender: string;

  address: string;

  city: string;

  state: string;

  pincode: string;

  qualification: string;

  college: string;

  course: string;

  department: string;

  graduationYear: string;

  cgpa: string;

  tenthPercentage: string;

  twelfthPercentage: string;
}


const emptyForm: ProfileForm = {
  name: "",

  email: "",

  phone: "",

  dateOfBirth: "",

  gender: "",

  address: "",

  city: "",

  state: "",

  pincode: "",

  qualification: "",

  college: "",

  course: "",

  department: "",

  graduationYear: "",

  cgpa: "",

  tenthPercentage: "",

  twelfthPercentage: "",
};


function userToForm(
  user: User
): ProfileForm {
  return {
    name: user.name || "",

    email: user.email || "",

    phone: user.phone || "",

    dateOfBirth:
      user.dateOfBirth || "",

    gender:
      user.gender || "",

    address:
      user.address || "",

    city:
      user.city || "",

    state:
      user.state || "",

    pincode:
      user.pincode || "",

    qualification:
      user.qualification || "",

    college:
      user.college || "",

    course:
      user.course || "",

    department:
      user.department || "",

    graduationYear:
      user.graduationYear || "",

    cgpa:
      user.cgpa || "",

    tenthPercentage:
      user.tenthPercentage || "",

    twelfthPercentage:
      user.twelfthPercentage || "",
  };
}


async function fetchProfile(): Promise<User> {
  const response = await fetch(
    "/api/profile",
    {
      method: "GET",

      credentials: "include",

      cache: "no-store",
    }
  );

  const result: ProfileResponse =
    await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        "Failed to fetch profile"
    );
  }

  if (!result.user) {
    throw new Error(
      "User data not found"
    );
  }

  return result.user;
}


async function updateProfile(
  form: ProfileForm
): Promise<User> {
  const response = await fetch(
    "/api/profile",
    {
      method: "PUT",

      headers: {
        "Content-Type":
          "application/json",
      },

      credentials: "include",

      body: JSON.stringify(form),
    }
  );

  const result: ProfileResponse =
    await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        "Failed to update profile"
    );
  }

  if (!result.user) {
    throw new Error(
      "Updated user data not found"
    );
  }

  return result.user;
}


export default function ProfilePage() {
  
  const router = useRouter();

  
  const queryClient =
    useQueryClient();


  const user = useAuthStore(
    (state) => state.user
  );

  const setUser = useAuthStore(
    (state) => state.setUser
  );

  
  const [isEditing, setIsEditing] =
    useState(false);

  const [form, setForm] =
    useState<ProfileForm>(
      emptyForm
    );

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

 
  const {
    data: profileUser,

    isLoading,

    isFetching,

    isError,

    error: queryError,

    refetch,
  } = useQuery({
    queryKey: ["profile"],

    queryFn: fetchProfile,

    

    staleTime: 1000 * 60 * 5,
  });

  
  const updateMutation =
    useMutation({
      mutationFn: updateProfile,

      onSuccess: (updatedUser) => {
        
        queryClient.setQueryData(
          ["profile"],
          updatedUser
        );

        
        setUser(updatedUser);

        
        setForm(
          userToForm(updatedUser)
        );

        setSuccess(
          "Profile updated successfully"
        );

        setError("");

        
        setIsEditing(false);
      },

      onError: (error) => {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to update profile"
        );

        setSuccess("");
      },
    });

  
  useEffect(() => {
    if (!profileUser) {
      return;
    }

    
    setUser(profileUser);

    
    setForm(
      userToForm(profileUser)
    );
  }, [
    profileUser,
    setUser,
  ]);

  
  const displayUser =
    profileUser || user;

  
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement |
        HTMLTextAreaElement |
        HTMLSelectElement
    >
  ) => {
    const {
      name,
      value,
    } = e.target;

    setForm((current) => ({
      ...current,

      [name]: value,
    }));
  };

  
  const refreshProfile =
    async () => {
      try {
        setError("");

        setSuccess("");

        await refetch();

        setSuccess(
          "Profile refreshed successfully"
        );
      } catch {
        setError(
          "Failed to refresh profile"
        );
      }
    };

  
  const startEdit = () => {
    if (!displayUser) {
      return;
    }

    setForm(
      userToForm(displayUser)
    );

    setError("");

    setSuccess("");

    setIsEditing(true);
  };

  
  const cancelEdit = () => {
    if (displayUser) {
      setForm(
        userToForm(displayUser)
      );
    }

    setError("");

    setSuccess("");

    setIsEditing(false);
  };

  
  const handleSubmit = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");

    setSuccess("");

    
    if (!form.name.trim()) {
      setError(
        "Name is required"
      );

      return;
    }

    if (!form.email.trim()) {
      setError(
        "Email is required"
      );

      return;
    }

    
    updateMutation.mutate(form);
  };

  
  if (
    isLoading &&
    !displayUser
  ) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-5xl">

          <h1 className="text-3xl font-bold text-slate-900">
            My Profile
          </h1>

          <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">

            <p className="text-slate-500">
              Loading profile...
            </p>

          </div>

        </div>
      </div>
    );
  }

  
  if (
    !displayUser &&
    isError
  ) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">

        <div className="mx-auto max-w-5xl">

          <h1 className="text-3xl font-bold text-slate-900">
            My Profile
          </h1>

          <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">

            <p className="text-red-600">
              {queryError instanceof Error
                ? queryError.message
                : "Failed to load profile"}
            </p>

            <Button
              className="mt-4"
              onClick={() =>
                refetch()
              }
            >
              Try Again
            </Button>

          </div>

        </div>

      </div>
    );
  }

 
  if (!displayUser) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">

        <div className="mx-auto max-w-5xl">

          <h1 className="text-3xl font-bold text-slate-900">
            My Profile
          </h1>

          <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">

            <p className="text-slate-500">
              No user data found.
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Please login again.
            </p>

          </div>

        </div>

      </div>
    );
  }

 
  if (isEditing) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">

        <div className="mx-auto max-w-5xl">

         
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-start gap-3">

              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() =>
                  router.back()
                }
                aria-label="Go back"
                className="mt-1 shrink-0"
              >
                ←
              </Button>

              <div>

                <h1 className="text-3xl font-bold text-slate-900">
                  Edit Profile
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Update your personal and academic
                  information.
                </p>

              </div>

            </div>

            <Button
              type="button"
              variant="outline"
              onClick={cancelEdit}
              disabled={
                updateMutation.isPending
              }
            >
              Cancel
            </Button>

          </div>

          
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">

              <p className="text-sm font-medium text-red-700">
                {error}
              </p>

            </div>
          )}

          
          {success && (
            <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4">

              <p className="text-sm font-medium text-green-700">
                {success}
              </p>

            </div>
          )}

         
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            
            <section className="rounded-2xl border bg-white p-6 shadow-sm">

              <div className="mb-6">

                <h2 className="text-xl font-semibold text-slate-900">
                  Basic Information
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Update your account information.
                </p>

              </div>

              <div className="grid gap-5 md:grid-cols-2">

                <FormField
                  label="Name"
                  name="name"
                  value={form.name}
                  onChange={
                    handleChange
                  }
                  required
                />

                <FormField
                  label="Email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={
                    handleChange
                  }
                  required
                />

                <FormField
                  label="Phone"
                  name="phone"
                  value={form.phone}
                  onChange={
                    handleChange
                  }
                />

              </div>

            </section>

            
            <section className="rounded-2xl border bg-white p-6 shadow-sm">

              <div className="mb-6">

                <h2 className="text-xl font-semibold text-slate-900">
                  Personal Information
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Update your personal details.
                </p>

              </div>

              <div className="grid gap-5 md:grid-cols-2">

                <FormField
                  label="Date of Birth"
                  name="dateOfBirth"
                  type="date"
                  value={
                    form.dateOfBirth
                  }
                  onChange={
                    handleChange
                  }
                />

                <div className="space-y-2">

                  <Label htmlFor="gender">
                    Gender
                  </Label>

                  <select
                    id="gender"
                    name="gender"
                    value={form.gender}
                    onChange={
                      handleChange
                    }
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none"
                  >

                    <option value="">
                      Select Gender
                    </option>

                    <option value="male">
                      Male
                    </option>

                    <option value="female">
                      Female
                    </option>

                    <option value="other">
                      Other
                    </option>

                  </select>

                </div>

                <FormField
                  label="City"
                  name="city"
                  value={form.city}
                  onChange={
                    handleChange
                  }
                />

                <FormField
                  label="State"
                  name="state"
                  value={form.state}
                  onChange={
                    handleChange
                  }
                />

                <FormField
                  label="Pincode"
                  name="pincode"
                  value={form.pincode}
                  onChange={
                    handleChange
                  }
                />

                <div className="space-y-2 md:col-span-2">

                  <Label htmlFor="address">
                    Address
                  </Label>

                  <textarea
                    id="address"
                    name="address"
                    value={form.address}
                    onChange={
                      handleChange
                    }
                    rows={4}
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none"
                    placeholder="Enter your address"
                  />

                </div>

              </div>

            </section>

            
            <section className="rounded-2xl border bg-white p-6 shadow-sm">

              <div className="mb-6">

                <h2 className="text-xl font-semibold text-slate-900">
                  Academic Information
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Update your education details.
                </p>

              </div>

              <div className="grid gap-5 md:grid-cols-2">

                <FormField
                  label="Qualification"
                  name="qualification"
                  value={
                    form.qualification
                  }
                  onChange={
                    handleChange
                  }
                />

                <FormField
                  label="College"
                  name="college"
                  value={
                    form.college
                  }
                  onChange={
                    handleChange
                  }
                />

                <FormField
                  label="Course"
                  name="course"
                  value={
                    form.course
                  }
                  onChange={
                    handleChange
                  }
                />

                <FormField
                  label="Department"
                  name="department"
                  value={
                    form.department
                  }
                  onChange={
                    handleChange
                  }
                />

                <FormField
                  label="Graduation Year"
                  name="graduationYear"
                  value={
                    form.graduationYear
                  }
                  onChange={
                    handleChange
                  }
                />

                <FormField
                  label="CGPA"
                  name="cgpa"
                  value={
                    form.cgpa
                  }
                  onChange={
                    handleChange
                  }
                />

                <FormField
                  label="10th Percentage"
                  name="tenthPercentage"
                  value={
                    form.tenthPercentage
                  }
                  onChange={
                    handleChange
                  }
                />

                <FormField
                  label="12th Percentage"
                  name="twelfthPercentage"
                  value={
                    form.twelfthPercentage
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>

            </section>

            
            <section className="rounded-2xl border bg-white p-6 shadow-sm">

              <div className="mb-6">

                <h2 className="text-xl font-semibold text-slate-900">
                  Documents & Verification
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Previously uploaded documents.
                </p>

              </div>

              <div className="grid gap-4 md:grid-cols-2">

                <DocumentItem
                  label="Resume"
                  value={
                    displayUser.resumePath
                  }
                />

                <DocumentItem
                  label="Identity Proof"
                  value={
                    displayUser.identityProofPath
                  }
                />

              </div>

              <p className="mt-4 text-xs text-slate-400">
                Document replacement can be handled
                separately through the onboarding
                document upload flow.
              </p>

            </section>

           
            <div className="flex justify-end gap-3">

              <Button
                type="button"
                variant="outline"
                onClick={cancelEdit}
                disabled={
                  updateMutation.isPending
                }
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={
                  updateMutation.isPending
                }
              >
                {updateMutation.isPending
                  ? "Saving..."
                  : "Save Changes"}
              </Button>

            </div>

          </form>

        </div>

      </div>
    );
  }

 
  return (
    <div className="min-h-screen bg-slate-50 p-6">

      <div className="mx-auto max-w-5xl">

        
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-start gap-3">

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() =>
                router.back()
              }
              aria-label="Go back"
              className="mt-1 shrink-0"
            >
              ←
            </Button>

            <div>

              <h1 className="text-3xl font-bold text-slate-900">
                My Profile
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                View your personal, academic and document
                information.
              </p>

            </div>

          </div>

          <div className="flex gap-3">

            <Button
              variant="outline"
              onClick={
                refreshProfile
              }
              disabled={
                isFetching
              }
            >
              {isFetching
                ? "Refreshing..."
                : "Refresh"}
            </Button>

            <Button
              onClick={
                startEdit
              }
            >
              Edit Profile
            </Button>

          </div>

        </div>

        
        {isFetching && (
          <div className="mb-4 text-xs text-slate-400">
            Updating profile data...
          </div>
        )}

        
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">

            <p className="text-sm font-medium text-red-700">
              {error}
            </p>

          </div>
        )}

        
        {success && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4">

            <p className="text-sm font-medium text-green-700">
              {success}
            </p>

          </div>
        )}

        
        <section className="mb-6 rounded-2xl border bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

            {/* AVATAR */}

            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-slate-900 text-2xl font-bold text-white">

              {displayUser.name
                ?.charAt(0)
                .toUpperCase()}

            </div>

            {/* DETAILS */}

            <div className="flex-1">

              <h2 className="text-2xl font-bold text-slate-900">
                {displayUser.name}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {displayUser.email}
              </p>

            </div>

            <Badge className="w-fit capitalize">
              {displayUser.role}
            </Badge>

          </div>

        </section>

        
        <ProfileSection
          title="Basic Information"
          description="Your account details"
        >

          <ProfileItem
            label="Name"
            value={
              displayUser.name
            }
          />

          <ProfileItem
            label="Email"
            value={
              displayUser.email
            }
          />

          <ProfileItem
            label="Phone"
            value={
              displayUser.phone
            }
          />

          <ProfileItem
            label="Role"
            value={
              displayUser.role
            }
            capitalize
          />

        </ProfileSection>

        
        <ProfileSection
          title="Personal Information"
          description="Your personal details"
        >

          <ProfileItem
            label="Date of Birth"
            value={
              displayUser.dateOfBirth
            }
          />

          <ProfileItem
            label="Gender"
            value={
              displayUser.gender
            }
            capitalize
          />

          <ProfileItem
            label="City"
            value={
              displayUser.city
            }
          />

          <ProfileItem
            label="State"
            value={
              displayUser.state
            }
          />

          <ProfileItem
            label="Pincode"
            value={
              displayUser.pincode
            }
          />

          <ProfileItem
            label="Address"
            value={
              displayUser.address
            }
            fullWidth
          />

        </ProfileSection>

        
        <ProfileSection
          title="Academic Information"
          description="Your education details"
        >

          <ProfileItem
            label="Qualification"
            value={
              displayUser.qualification
            }
          />

          <ProfileItem
            label="College"
            value={
              displayUser.college
            }
          />

          <ProfileItem
            label="Course"
            value={
              displayUser.course
            }
          />

          <ProfileItem
            label="Department"
            value={
              displayUser.department
            }
          />

          <ProfileItem
            label="Graduation Year"
            value={
              displayUser.graduationYear
            }
          />

          <ProfileItem
            label="CGPA"
            value={
              displayUser.cgpa
            }
          />

          <ProfileItem
            label="10th Percentage"
            value={
              displayUser.tenthPercentage
            }
          />

          <ProfileItem
            label="12th Percentage"
            value={
              displayUser.twelfthPercentage
            }
          />

        </ProfileSection>

       
        <ProfileSection
          title="Documents & Verification"
          description="Your submitted documents"
        >

          <DocumentItem
            label="Resume"
            value={
              displayUser.resumePath
            }
          />

          <DocumentItem
            label="Identity Proof"
            value={
              displayUser.identityProofPath
            }
          />

        </ProfileSection>

        
        <section className="mb-6 rounded-2xl border bg-white p-6 shadow-sm">

          <div>

            <h2 className="text-xl font-semibold text-slate-900">
              Verification Status
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Terms and conditions status
            </p>

          </div>

          <div className="mt-5">

            {displayUser.termsAccepted ? (
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                ✓ Terms Accepted
              </Badge>
            ) : (
              <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                ✕ Terms Not Accepted
              </Badge>
            )}

          </div>

        </section>

        
        <ProfileSection
          title="Account Information"
          description="Account metadata"
        >

          <ProfileItem
            label="User ID"
            value={
              displayUser.id
            }
            small
          />

          <ProfileItem
            label="Account Created"
            value={formatDate(
              displayUser.createdAt
            )}
          />

          <ProfileItem
            label="Last Updated"
            value={formatDate(
              displayUser.updatedAt
            )}
          />

        </ProfileSection>

      </div>

    </div>
  );
}


interface FormFieldProps {
  label: string;

  name: string;

  value: string;

  type?: string;

  required?: boolean;

  onChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
}

function FormField({
  label,
  name,
  value,
  type = "text",
  required = false,
  onChange,
}: FormFieldProps) {
  return (
    <div className="space-y-2">

      <Label htmlFor={name}>

        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}

      </Label>

      <Input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
      />

    </div>
  );
}


interface ProfileSectionProps {
  title: string;

  description: string;

  children: React.ReactNode;
}

function ProfileSection({
  title,
  description,
  children,
}: ProfileSectionProps) {
  return (
    <section className="mb-6 rounded-2xl border bg-white p-6 shadow-sm">

      <div className="mb-6">

        <h2 className="text-xl font-semibold text-slate-900">
          {title}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>

      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {children}
      </div>

    </section>
  );
}


interface ProfileItemProps {
  label: string;

  value?: string | number | null;

  capitalize?: boolean;

  fullWidth?: boolean;

  small?: boolean;
}

function ProfileItem({
  label,
  value,
  capitalize = false,
  fullWidth = false,
  small = false,
}: ProfileItemProps) {
  return (
    <div
      className={
        fullWidth
          ? "md:col-span-2"
          : ""
      }
    >

      <p className="text-sm font-medium text-slate-500">
        {label}
      </p>

      <p
        className={`mt-1 font-medium text-slate-900 ${
          capitalize
            ? "capitalize"
            : ""
        } ${
          small
            ? "break-all text-sm"
            : "break-words"
        }`}
      >
        {value || "-"}
      </p>

    </div>
  );
}


interface DocumentItemProps {
  label: string;

  value?: string | null;
}

function DocumentItem({
  label,
  value,
}: DocumentItemProps) {
  return (
    <div className="rounded-xl border bg-slate-50 p-4">

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div className="min-w-0">

          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-2 break-all text-sm font-medium text-slate-900">
            {value || "Not uploaded"}
          </p>

        </div>

        {value && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              window.open(
                value,
                "_blank",
                "noopener,noreferrer"
              )
            }
          >
            View
          </Button>
        )}

      </div>

    </div>
  );
}


function formatDate(
  value?: string | null
) {
  if (!value) {
    return "-";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
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