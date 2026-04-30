import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const Schema = z.object({
  email: z.string().email(),
  password: z.string().min(10),
});
type Values = z.infer<typeof Schema>;

export function SignupForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<Values>({ resolver: zodResolver(Schema) });

  const onSubmit = handleSubmit(async (values) => {
    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values),
    });

    if (res.status === 409) {
      setError("email", { message: "Email already in use" });
      return;
    }
    if (!res.ok) throw new Error("Signup failed");
  });

  return (
    <form onSubmit={onSubmit}>
      <label>
        Email
        <input {...register("email")} />
        {errors.email && <div>{errors.email.message}</div>}
      </label>

      <label>
        Password
        <input type="password" {...register("password")} />
        {errors.password && <div>{errors.password.message}</div>}
      </label>

      <button disabled={isSubmitting}>Create account</button>
    </form>
  );
}