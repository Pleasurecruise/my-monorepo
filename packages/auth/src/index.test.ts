import { describe, expect, it } from "vitest";
import * as authExports from "./index.js";

describe("auth exports", () => {
	it("should export necessary auth functions", () => {
		expect(authExports.authClient).toBeDefined();
		expect(authExports.signIn).toBeDefined();
		expect(authExports.signOut).toBeDefined();
		expect(authExports.signUp).toBeDefined();
		expect(authExports.useSession).toBeDefined();
		expect(authExports.getSession).toBeDefined();
	});
});
