"use client";

import { ErrorMessage, Spinner } from "@/app/components";
import { issueSchema } from "@/app/validationSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Issue } from "@prisma/client";
import { Button, Callout, TextField } from "@radix-ui/themes";
import MDEditor from "@uiw/react-md-editor";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import rehypeSanitize from "rehype-sanitize";
import { z } from "zod";

type IssueFormData = z.infer<typeof issueSchema>;

const IssueForm = ({ issue }: { issue?: Issue }) => {
  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<IssueFormData>({
    resolver: zodResolver(issueSchema),
  });
  const [error, setError] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);

  const onSubmit = handleSubmit(async (data) => {
    try {
      setSubmitting(true);

      if (issue) await axios.patch(`/api/issues/${issue.id}`, data);
      else await axios.post("/api/issues", data);

      router.push("/issues");
    } catch {
      setSubmitting(false);
      setError("An unexpected error has occurred. Please try again later.");
    }
  });

  return (
    <div className="max-w-xl">
      {error && (
        <Callout.Root color="red" className="mb-5">
          <Callout.Text>{error}</Callout.Text>
        </Callout.Root>
      )}
      <form className="space-y-3" onSubmit={onSubmit}>
        <div className="space-y-1">
          <TextField.Root
            placeholder="Title"
            defaultValue={issue?.title}
            {...register("title")}
            autoFocus
          />
          <ErrorMessage>{errors.title?.message}</ErrorMessage>
        </div>
        <div className="space-y-1">
          <Controller
            name="description"
            control={control}
            defaultValue={issue?.description}
            render={({ field }) => (
              <MDEditor
                className="editor-wrapper ml-0.25 mr-0.25"
                data-color-mode="light"
                {...field}
                ref={(ref) => {
                  field.ref({
                    focus: () => {
                      ref?.textarea?.focus();
                    },
                  });
                }}
                textareaProps={{
                  placeholder: "Please describe your issue here...",
                  maxLength: issueSchema.shape.description.maxLength as number,
                }}
                previewOptions={{
                  rehypePlugins: [[rehypeSanitize]],
                }}
              />
            )}
          />
          <ErrorMessage>{errors.description?.message}</ErrorMessage>
        </div>
        <Button disabled={isSubmitting}>
          {issue ? "Update Issue" : "Submit New Issue"}
          {isSubmitting && <Spinner />}
        </Button>
      </form>
    </div>
  );
};

export default IssueForm;
