# Password Tester

This TypeScript library provides a function to test the strength of passwords based on their entropy and whether the password has been reused according to the [Have I Been Pwned](https://haveibeenpwned.com/) database. It exports types for password error codes, strength levels, and a report interface.

## Installation

You can install the library via npm:

```bash
npm install --save-exact password-tester
```

> [!IMPORTANT]
> We use `--save-exact` in the install command because this library is intended to test highly confidential passwords. Adding this flag pins the package to the current version of the library. It is a best practice to fix the package version on code that you have personally read and understand.

## Usage

### Simple Usage

```typescript
import { testPassword } from 'password-tester';

// Test password strength
const report = await testPassword("MySuperSecurePassword123!");

// Output result
console.log(report);
/* Will output:
  {
    strength: 'EXCELLENT',
    strengthLevel: 5,
    entropy: 104.24812503605781
  }
*/
```

### With Options

```typescript
import { testPassword, PasswordReport, TestPasswordOptions } from 'password-tester';

// Define password
const password: string = "MySuperSecurePassword123!";

/*
  Optional configuration for testing password
  (if this parameter is omitted, or a field left empty, the options will be set
  to the safest possible by default)
*/
const options: TestPasswordOptions = {
  enableEntropyLowerBound: true,
  enableReUsedPasswordCheck: true,
  requireReUsedPasswordCheckSuccess: true
};

// Test password strength
const report: PasswordReport = await testPassword(password, options);

// Output result
console.log(report);
/* Will output:
  {
    strength: 'EXCELLENT',
    strengthLevel: 5,
    entropy: 104.24812503605781
  }
*/
```

## API

`testPassword(password: string, options?: TestPasswordOptions): PasswordReport`

This function tests the strength of a given password and returns a report object.

- `password`: The password string to test.
- `options`: Optional configuration object. Currently supports disabling the entropy lower bound check.

### Types

#### `TestPasswordOptions`
```typescript
type TestPasswordOptions = {
  enableEntropyLowerBound?: boolean;
  enableReUsedPasswordCheck?: boolean
  requireReUsedPasswordCheckSuccess?: boolean
};
```
- `enableEntropyLowerBound`: Ensures that a report will include an error if the entropy is too low. If this field is omitted, this will be `true` by default.
- `enableReUsedPasswordCheck`: Will check the password to see if it has been previously exposed in a breach using the _Have I Been Pwned_ database. If this field is omitted, this will be `true` by default.
- `requireReUsedPasswordCheckSuccess`: Will return an `errorCode` in the report if the _Have I Been Pwned_ database check fails. If `false`, then instead of an `errorCode`, a `warningCode` will be returned and the rest of the report will read as if the database check was successful.

#### `PasswordReport`

```typescript
type PasswordReport = {
  strength: PasswordStrength;
  strengthLevel: PasswordStrengthLevel;
  entropy: number;
  warningCode?: PasswordWarningCode;
  errorCode?: PasswordErrorCode;
};
```

- `strength`: Password strength represented as PasswordStrength type.
- `strengthLevel`: Password strength level represented as PasswordStrengthLevel type.
- `entropy`: Entropy value calculated for the password.
- `warningCode`: Optional warning code to alert you if the password test encounters a non-blocking issue.
- `errorCode`: Optional error code if the password test encounters an error.

#### `PasswordWarningCode`

```typescript
export type PasswordWarningCode = "PASSWORD_PREVIOUSLY_EXPOSED" | "FAILED_TO_CHECK_PASSWORD_REUSE";
```
- `PASSWORD_PREVIOUSLY_EXPOSED`: It has been detected that the password tested has already been hacked and exposed as part of a password breach, according to _Have I Been Pwned_. The password strength, should always be `POOR`.
- `FAILED_TO_CHECK_PASSWORD_REUSE`: If the option to `requireReUsedPasswordCheckSuccess` is `false`, then this warning may show. It means that it was not possible to check the password breach database, and it cannot be verified if the password has already been exposed.

#### `PasswordErrorCode`

```typescript
type PasswordErrorCode = "MIN_CHARS_NOT_MET" | "ENTROPY_TOO_LOW" | "FAILED_TO_CHECK_PASSWORD_REUSE";
```
- `MIN_CHARS_NOT_MET`: Error code indicating the password does not meet the minimum character requirement (8 characters).
- `ENTROPY_TOO_LOW`: Error code indicating the password's entropy is too low (less than 25 bits of entropy).
- `FAILED_TO_CHECK_PASSWORD_REUSE`: The library was unable to get a response from _Have I Been Pwned_ to check if the password has been previously exposed.

#### `PasswordStrength`

```typescript
type PasswordStrength = "EXCELLENT" | "VERY_GOOD" | "GOOD" | "FAIR" | "POOR" | "ERROR";
```

- `EXCELLENT`: Represents excellent password strength (100 or more bits of entropy).
- `VERY_GOOD`: Represents very good password strength (80 or more bits of entropy).
- `GOOD`: Represents good password strength (80 or more bits of entropy).
- `FAIR`: Represents fair password strength (60 or more bits of entropy).
- `POOR`: Represents poor password strength (over 25 bits of entropy, or a reused password).
- `ERROR`: Represents an error state.

#### `PasswordStrengthLevel`

```typescript
type PasswordStrengthLevel = 5 | 4 | 3 | 2 | 1 | 0;
```
- `5`: Excellent password strength level.
- `4`: Very good password strength level.
- `3`: Good password strength level.
- `2`: Fair password strength level.
- `1`: Poor password strength level.
- `0`: Error, no password strength level.

## License

This library is released under the MIT or Apache-2 License.
