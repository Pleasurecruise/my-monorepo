import { createTRPCRouter, publicProcedure } from "@/trpc/init";

export const helloRouter = createTRPCRouter({
	greet: publicProcedure.query(() => {
		return { message: "Hello from tRPC!" };
	}),
});
