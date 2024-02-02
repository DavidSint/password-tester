import { createHash } from "crypto";

const BASE_URL = "https://api.pwnedpasswords.com/range";

export async function checkIfPasswordHasBeenPwned(
	password: string,
): Promise<boolean> {
	const sha1Hash: string = createHash("sha1")
		.update(password)
		.digest("hex")
		.toUpperCase();
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
