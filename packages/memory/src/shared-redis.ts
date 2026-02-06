import { createLoggerWithContext } from "@my-monorepo/logger";
import { createClient } from "redis";

type SharedRedisClient = ReturnType<typeof createClient>;

const logger = createLoggerWithContext("redis");

const resolveRedisUrl = () => {
	const url = process.env.REDIS_URL ?? process.env.KV_URL;
	if (!url) {
		throw new Error("REDIS_URL environment variable is required");
	}
	return url;
};

export const isRedisConfigured = () => Boolean(process.env.REDIS_URL || process.env.KV_URL);

const createRedisClient = (label: string) => {
	const isProduction = process.env.NODE_ENV === "production" || Boolean(process.env.FLY_APP_NAME);

	const client = createClient({
		url: resolveRedisUrl(),
		pingInterval: 60 * 1000,
		socket: {
			family: isProduction ? 6 : 4,
			connectTimeout: isProduction ? 10000 : 5000,
			keepAlive: true,
			noDelay: true,
			reconnectStrategy: (retries) => {
				const delay = Math.min(100 * 2 ** retries, 3000);
				logger.info(`Reconnecting in ${delay}ms (attempt ${retries + 1})`, { label });
				return delay;
			},
		},
	});

	client.on("error", (error) => {
		logger.error("Client error", { label, error });
	});

	client.on("reconnecting", () => {
		logger.info("Reconnecting...", { label });
	});

	client.connect().catch((error) => {
		logger.error("Initial connection error", { label, error });
	});

	return client;
};

let sharedClient: SharedRedisClient | null = null;

let sharedPublisher: SharedRedisClient | null = null;

let sharedSubscriber: SharedRedisClient | null = null;

export const getSharedRedisClient = (): SharedRedisClient => {
	if (!sharedClient) {
		sharedClient = createRedisClient("client");
	}
	return sharedClient;
};

export const getSharedRedisPublisher = (): SharedRedisClient => {
	if (!sharedPublisher) {
		sharedPublisher = createRedisClient("publisher");
	}
	return sharedPublisher;
};

export const getSharedRedisSubscriber = (): SharedRedisClient => {
	if (!sharedSubscriber) {
		sharedSubscriber = createRedisClient("subscriber");
	}
	return sharedSubscriber;
};
