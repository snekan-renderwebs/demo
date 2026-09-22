"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";

import { useAuthStore } from "../../../store/authStore";

import {
  generalInformationSchema,
  academicInformationSchema,
  documentsVerificationSchema,
  onboardingSchema,
  type OnboardingFormData,
} from "@/src/lib/validation/onboarding";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";


export default function OnboardingPage() {

  const [step, setStep] = useState(1);

  const [formKey, setFormKey] = useState(0);

  const setUser = useAuthStore(
    (state) => state.setUser
  );

  const router = useRouter();

 
  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    reset,
    formState: {
      errors,
    },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(
      onboardingSchema
    ),

    mode: "onTouched",

    defaultValues: {
      name: "",
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

      termsAccepted: false,
    },
  });

  
  const onboardingMutation = useMutation({
    
    mutationFn: async (
      formData: FormData
    ) => {
      const response = await fetch(
        "/api/onboarding",
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      const result =
        await response.json();

      
      if (!response.ok) {
        throw new Error(
          result.message ||
            "Onboarding failed"
        );
      }

      return result;
    },

   
    onSuccess: (result) => {
      // Update global user
      setUser(result.user);

      // Reset form
      reset();

      // Go to first step
      setStep(1);

      // Re-create form
      setFormKey(
        (current) => current + 1
      );

      alert(
        "Onboarding completed successfully!"
      );

      console.log(
        "Updated user:",
        result.user
      );
    },

    
    onError: (error) => {
      console.error(
        "Onboarding submit error:",
        error
      );

      alert(
        error.message ||
          "Something went wrong"
      );
    },
  });

  
  const nextStep = async () => {
    
    if (step === 1) {
      const values = getValues();

      const result =
        generalInformationSchema.safeParse({
          name: values.name,
          phone: values.phone,
          dateOfBirth:
            values.dateOfBirth,
          gender: values.gender,
          address: values.address,
          city: values.city,
          state: values.state,
          pincode: values.pincode,
        });

      if (!result.success) {
        await trigger([
          "name",
          "phone",
          "dateOfBirth",
          "gender",
          "address",
          "city",
          "state",
          "pincode",
        ]);

        return;
      }

      setStep(2);

      return;
    }

    
    if (step === 2) {
      const values = getValues();

      const result =
        academicInformationSchema.safeParse({
          qualification:
            values.qualification,

          college:
            values.college,

          course:
            values.course,

          department:
            values.department,

          graduationYear:
            values.graduationYear,

          cgpa:
            values.cgpa,

          tenthPercentage:
            values.tenthPercentage,

          twelfthPercentage:
            values.twelfthPercentage,
        });

      if (!result.success) {
        await trigger([
          "qualification",
          "college",
          "course",
          "department",
          "graduationYear",
          "cgpa",
          "tenthPercentage",
          "twelfthPercentage",
        ]);

        return;
      }

      setStep(3);
    }
  };

  
  const previousStep = () => {
    setStep((currentStep) =>
      Math.max(currentStep - 1, 1)
    );
  };

  
  const onSubmit = async (
    data: OnboardingFormData
  ) => {
    
    const documentsResult =
      documentsVerificationSchema.safeParse({
        resume: data.resume,
        identityProof:
          data.identityProof,
        termsAccepted:
          data.termsAccepted,
      });

    if (!documentsResult.success) {
      await trigger([
        "resume",
        "identityProof",
        "termsAccepted",
      ]);

      return;
    }

  
    const completeResult =
      onboardingSchema.safeParse(data);

    if (!completeResult.success) {
      await trigger();

      return;
    }

    
    const formData = new FormData();

    
    formData.append(
      "name",
      data.name
    );

    formData.append(
      "phone",
      data.phone
    );

    formData.append(
      "dateOfBirth",
      data.dateOfBirth
    );

    formData.append(
      "gender",
      data.gender
    );

    formData.append(
      "address",
      data.address
    );

    formData.append(
      "city",
      data.city
    );

    formData.append(
      "state",
      data.state
    );

    formData.append(
      "pincode",
      data.pincode
    );

    
    formData.append(
      "qualification",
      data.qualification
    );

    formData.append(
      "college",
      data.college
    );

    formData.append(
      "course",
      data.course
    );

    formData.append(
      "department",
      data.department
    );

    formData.append(
      "graduationYear",
      data.graduationYear
    );

    formData.append(
      "cgpa",
      data.cgpa
    );

    formData.append(
      "tenthPercentage",
      data.tenthPercentage
    );

    formData.append(
      "twelfthPercentage",
      data.twelfthPercentage
    );

    
    if (
      data.resume &&
      data.resume.length > 0
    ) {
      formData.append(
        "resume",
        data.resume[0]
      );
    }

 
    if (
      data.identityProof &&
      data.identityProof.length > 0
    ) {
      formData.append(
        "identityProof",
        data.identityProof[0]
      );
    }

    
    formData.append(
      "termsAccepted",
      String(data.termsAccepted)
    );

    
    onboardingMutation.mutate(
      formData
    );
  };

  
  const ErrorMessage = ({
    message,
  }: {
    message?: string;
  }) => {
    if (!message) {
      return null;
    }

    return (
      <p className="mt-1 text-sm text-destructive">
        {message}
      </p>
    );
  };

  
  const steps = [
    {
      number: 1,
      title: "General",
      description:
        "Personal information",
    },
    {
      number: 2,
      title: "Academic",
      description:
        "Education details",
    },
    {
      number: 3,
      title: "Documents",
      description:
        "Verification",
    },
  ];

  
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-4xl">

        
        <div className="flex space-x-5">

          <div className="py-9">

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

          </div>

          <div className="mb-8">

            <Badge
              variant="secondary"
              className="mb-3"
            >
              User Onboarding
            </Badge>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Complete Your Profile
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Please provide your
              information to complete
              the onboarding process.
            </p>

          </div>

        </div>

        
        <div className="mb-10">

          <div className="grid grid-cols-3 gap-3">

            {steps.map((item) => {

              const active =
                step === item.number;

              const completed =
                step > item.number;

              return (
                <div
                  key={item.number}
                  className="relative"
                >

                  <div
                    className={`flex items-center gap-3 border-b-2 pb-4 ${
                      active ||
                      completed
                        ? "border-slate-900"
                        : "border-slate-200"
                    }`}
                  >

                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                        active ||
                        completed
                          ? "bg-slate-900 text-white"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {completed
                        ? "✓"
                        : item.number}
                    </div>

                    <div className="hidden sm:block">

                      <p
                        className={`text-sm font-semibold ${
                          active ||
                          completed
                            ? "text-slate-900"
                            : "text-slate-500"
                        }`}
                      >
                        {item.title}
                      </p>

                      <p className="text-xs text-slate-400">
                        {item.description}
                      </p>

                    </div>

                  </div>

                </div>
              );
            })}

          </div>

        </div>

       
        <form
          key={formKey}
          onSubmit={handleSubmit(
            onSubmit
          )}
        >

          
          {step === 1 && (

            <section className="space-y-6">

              <div className="border-b pb-5">

                <h2 className="text-xl font-semibold text-slate-900">
                  General Information
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Enter your personal
                  details.
                </p>

              </div>

              <div className="grid gap-6 md:grid-cols-2">

                

                <FormField
                  label="Full Name"
                  required
                  error={
                    errors.name?.message
                  }
                >
                  <Input
                    {...register("name")}
                    placeholder="Enter your full name"
                  />
                </FormField>

                

                <FormField
                  label="Phone Number"
                  required
                  error={
                    errors.phone?.message
                  }
                >
                  <Input
                    {...register("phone")}
                    placeholder="Enter phone number"
                    inputMode="numeric"
                  />
                </FormField>

                

                <FormField
                  label="Date of Birth"
                  required
                  error={
                    errors.dateOfBirth
                      ?.message
                  }
                >
                  <Input
                    {...register(
                      "dateOfBirth"
                    )}
                    type="date"
                  />
                </FormField>

               

                <FormField
                  label="Gender"
                  required
                  error={
                    errors.gender?.message
                  }
                >
                  <select
                    {...register("gender")}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  >

                    <option value="">
                      Select gender
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
                </FormField>

                

                <FormField
                  label="City"
                  required
                  error={
                    errors.city?.message
                  }
                >
                  <Input
                    {...register("city")}
                    placeholder="Enter city"
                  />
                </FormField>

                

                <FormField
                  label="State"
                  required
                  error={
                    errors.state?.message
                  }
                >
                  <Input
                    {...register("state")}
                    placeholder="Enter state"
                  />
                </FormField>

                

                <FormField
                  label="Pincode"
                  required
                  error={
                    errors.pincode?.message
                  }
                >
                  <Input
                    {...register("pincode")}
                    placeholder="Enter pincode"
                    inputMode="numeric"
                  />
                </FormField>

                

                <FormField
                  label="Address"
                  required
                  error={
                    errors.address?.message
                  }
                  fullWidth
                >
                  <textarea
                    {...register("address")}
                    placeholder="Enter your complete address"
                    rows={4}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                  />
                </FormField>

              </div>

              

              <div className="flex justify-end border-t pt-6">

                <Button
                  type="button"
                  onClick={nextStep}
                  size="lg"
                >
                  Continue

                  <span className="ml-2">
                    →
                  </span>
                </Button>

              </div>

            </section>
          )}

          
          {step === 2 && (

            <section className="space-y-6">

              <div className="border-b pb-5">

                <h2 className="text-xl font-semibold text-slate-900">
                  Academic Information
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Enter your education
                  details.
                </p>

              </div>

              <div className="grid gap-6 md:grid-cols-2">

               

                <FormField
                  label="Qualification"
                  required
                  error={
                    errors.qualification
                      ?.message
                  }
                >
                  <Input
                    {...register(
                      "qualification"
                    )}
                    placeholder="Example: B.Tech"
                  />
                </FormField>

                

                <FormField
                  label="College / University"
                  required
                  error={
                    errors.college?.message
                  }
                >
                  <Input
                    {...register("college")}
                    placeholder="Enter college name"
                  />
                </FormField>

               

                <FormField
                  label="Course"
                  required
                  error={
                    errors.course?.message
                  }
                >
                  <Input
                    {...register("course")}
                    placeholder="Example: Computer Science"
                  />
                </FormField>

                

                <FormField
                  label="Department"
                  required
                  error={
                    errors.department
                      ?.message
                  }
                >
                  <Input
                    {...register(
                      "department"
                    )}
                    placeholder="Enter department"
                  />
                </FormField>

               

                <FormField
                  label="Graduation Year"
                  required
                  error={
                    errors.graduationYear
                      ?.message
                  }
                >
                  <Input
                    {...register(
                      "graduationYear"
                    )}
                    placeholder="Example: 2026"
                    inputMode="numeric"
                  />
                </FormField>

                

                <FormField
                  label="CGPA"
                  required
                  error={
                    errors.cgpa?.message
                  }
                >
                  <Input
                    {...register("cgpa")}
                    placeholder="Example: 8.5"
                    inputMode="decimal"
                  />
                </FormField>

               

                <FormField
                  label="10th Percentage"
                  required
                  error={
                    errors.tenthPercentage
                      ?.message
                  }
                >
                  <Input
                    {...register(
                      "tenthPercentage"
                    )}
                    placeholder="Example: 90"
                    inputMode="decimal"
                  />
                </FormField>

                

                <FormField
                  label="12th Percentage"
                  required
                  error={
                    errors.twelfthPercentage
                      ?.message
                  }
                >
                  <Input
                    {...register(
                      "twelfthPercentage"
                    )}
                    placeholder="Example: 88"
                    inputMode="decimal"
                  />
                </FormField>

              </div>

              

              <div className="flex justify-between border-t pt-6">

                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={
                    previousStep
                  }
                  disabled={
                    onboardingMutation.isPending
                  }
                >
                  ← Back
                </Button>

                <Button
                  type="button"
                  size="lg"
                  onClick={nextStep}
                >
                  Continue →
                </Button>

              </div>

            </section>
          )}

         
          {step === 3 && (

            <section className="space-y-6">

              <div className="border-b pb-5">

                <h2 className="text-xl font-semibold text-slate-900">
                  Documents & Verification
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Upload your documents
                  and complete
                  verification.
                </p>

              </div>

              <div className="space-y-6">

               

                <div className="space-y-2">

                  <Label htmlFor="resume">
                    Resume

                    <span className="ml-1 text-destructive">
                      *
                    </span>
                  </Label>

                  <Input
                    {...register("resume")}
                    id="resume"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="cursor-pointer"
                  />

                  <p className="text-xs text-slate-500">
                    Accepted formats:
                    PDF, DOC, DOCX
                  </p>

                  <ErrorMessage
                    message={
                      errors.resume
                        ?.message as
                        | string
                        | undefined
                    }
                  />

                </div>

                

                <div className="space-y-2">

                  <Label htmlFor="identityProof">
                    Identity Proof

                    <span className="ml-1 text-destructive">
                      *
                    </span>
                  </Label>

                  <Input
                    {...register(
                      "identityProof"
                    )}
                    id="identityProof"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="cursor-pointer"
                  />

                  <p className="text-xs text-slate-500">
                    Accepted formats:
                    PDF, JPG, JPEG, PNG
                  </p>

                  <ErrorMessage
                    message={
                      errors.identityProof
                        ?.message as
                        | string
                        | undefined
                    }
                  />

                </div>

                {/* TERMS */}

                <div className="border-t pt-6">

                  <label className="flex cursor-pointer items-start gap-3">

                    <input
                      {...register(
                        "termsAccepted"
                      )}
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded border-gray-300"
                    />

                    <span className="text-sm text-slate-700">
                      I accept the terms and
                      conditions and confirm
                      that the information
                      provided is accurate.
                    </span>

                  </label>

                  <ErrorMessage
                    message={
                      errors.termsAccepted
                        ?.message as
                        | string
                        | undefined
                    }
                  />

                </div>

              </div>

              

              <div className="flex justify-between border-t pt-6">

                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={
                    previousStep
                  }
                  disabled={
                    onboardingMutation.isPending
                  }
                >
                  ← Back
                </Button>

                <Button
                  type="submit"
                  size="lg"
                  disabled={
                    onboardingMutation.isPending
                  }
                >
                  {onboardingMutation.isPending
                    ? "Submitting..."
                    : "Complete Onboarding"}
                </Button>

              </div>

            </section>
          )}

        </form>

      </div>

    </div>
  );
}


interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  fullWidth?: boolean;
  children: React.ReactNode;
}

function FormField({
  label,
  required = false,
  error,
  fullWidth = false,
  children,
}: FormFieldProps) {
  return (
    <div
      className={
        fullWidth
          ? "space-y-2 md:col-span-2"
          : "space-y-2"
      }
    >

      <Label>

        {label}

        {required && (
          <span className="ml-1 text-destructive">
            *
          </span>
        )}

      </Label>

      {children}

      {error && (
        <p className="text-sm text-destructive">
          {error}
        </p>
      )}

    </div>
  );
}