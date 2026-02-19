import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie } from "@tanstack/react-start/server";
import * as z from "zod";

const storageKey = "app-theme";

export const getThemeServerFn = createServerFn().handler(
	() => (getCookie(storageKey) ?? "auto") as "light" | "dark" | "auto",
);

const setThemeValidator = z.enum(["light", "dark", "auto"]);

export const setThemeServerFn = createServerFn()
	.inputValidator(setThemeValidator)
	.handler(({ data }) => setCookie(storageKey, data));
