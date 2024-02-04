export async function createSha1Hash(
	password: string,
	nodeProcess?: NodeJS.Process,
): Promise<string> {
	let nodeProcessOrUndefined: NodeJS.Process | undefined;
	try {
		nodeProcessOrUndefined = nodeProcess || process;
	} catch (e) {
		nodeProcessOrUndefined = undefined;
	}
	const isNode =
		nodeProcessOrUndefined !== undefined &&
		nodeProcessOrUndefined.versions != null &&
		nodeProcessOrUndefined.versions.node != null;
	if (isNode) {
		const { createHash } = require("crypto");
		const hash = createHash("sha1");
		hash.update(password);
		return hash.digest("hex");
	}

	const encodedData = new TextEncoder().encode(password);
	const buffer = await crypto.subtle.digest("SHA-1", encodedData);
	const hashArray = Array.from(new Uint8Array(buffer));
	const hashHex = hashArray
		.map((byte) => byte.toString(16).padStart(2, "0"))
		.join("");
	return hashHex;
}

const BASE_URL = "https://api.pwnedpasswords.com/range";

export async function checkIfPasswordHasBeenPwned(
	password: string,
): Promise<boolean> {
	const sha1Hash = (await createSha1Hash(password)).toUpperCase();
	const sha1HashPrefix = sha1Hash.substring(0, 5);
	const sha1HashSuffix = sha1Hash.substring(5);

	const res = await fetch(`${BASE_URL}/${sha1HashPrefix}`, {
		headers: {
			"Add-Padding": "true",
		},
	});
	if (!res.ok) {
		throw new Error("Unable to access Have I Been Pwned");
	}
	const data = await res.text();
	const passwordSuffixHashes: Array<string> | null = data.split("\r\n");

	const passwordHashIsPresent = passwordSuffixHashes.find(
		(hashEntry: string) => {
			return hashEntry.startsWith(sha1HashSuffix) && !hashEntry.endsWith(":0");
		},
	);
	return !!passwordHashIsPresent;
}
