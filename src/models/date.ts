import { z } from "zod";

export const DateSchema = z.string().refine(
    (val) => !isNaN(new Date(val).getTime()),
    { message: "Must be a valid date string for new Date()" }
);