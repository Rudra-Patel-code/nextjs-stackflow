import * as z from "zod";

export const QuestionsSchema = z.object({
  title: z
    .string()
    .min(5, "title must have atleast 5 characters!")
    .max(100, "title can contain at most 100 characters"),

  explanation: z.string().min(50, "please explain in at least 50 characters"),
  tags: z
    .array(
      z
        .string()
        .min(1)
        .max(15, "tags must not be more than 15 characters long!")
    )
    .min(1, "Please provide at least 1 tag")
    .max(5, "cannot have more than 5 tags"),
});
