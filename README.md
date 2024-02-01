# Password Tester

This TypeScript library provides a simple function to test the strength of passwords based on their entropy. It exports types for password error codes, strength levels, and a report interface.

## Installation

You can install the library via npm:

```bash
npm install password-tester
```

## Usage

```typescript
import { testPassword, PasswordReport, TestPasswordOptions } from 'password-tester';

// Define password
const password: string = "MySuperSecurePassword123!";

// Optional configuration for testing password
const options: TestPasswordOptions = {
  disableEntropyLowerBound: false,
};

// Test password strength
const report: PasswordReport = testPassword(password, options);

// Output result
console.log(report);
```

## API

`testPassword(password: string, options?: TestPasswordOptions): PasswordReport`

This function tests the strength of a given password and returns a report object.

- `password`: The password string to test.
- `options`: Optional configuration object. Currently supports disabling the entropy lower bound check.

### Types

#### `PasswordErrorCode`

```typescript
type PasswordErrorCode = "MIN_CHARS_NOT_MET" | "ENTROPY_TOO_LOW";
```
- `MIN_CHARS_NOT_MET`: Error code indicating the password does not meet the minimum character requirement (8 characters).
- `ENTROPY_TOO_LOW`: Error code indicating the password's entropy is too low (less than 25 bits of entropy).

#### `PasswordStrength`

```typescript
type PasswordStrength = "EXCELLENT" | "VERY_GOOD" | "GOOD" | "FAIR" | "POOR" | "ERROR";
```

- `EXCELLENT`: Represents excellent password strength (100 or more bits of entropy).
- `VERY_GOOD`: Represents very good password strength (80 or more bits of entropy).
- `GOOD`: Represents good password strength (80 or more bits of entropy).
- `FAIR`: Represents fair password strength (60 or more bits of entropy).
- `POOR`: Represents poor password strength (over 25 bits of entropy).
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

#### `PasswordReport`

```typescript
type PasswordReport = {
  errorCode?: PasswordErrorCode;
  strength: PasswordStrength;
  strengthLevel: PasswordStrengthLevel;
  entropy: number;
};
```

- `errorCode`: Optional error code if the password test encounters an error.
- `strength`: Password strength represented as PasswordStrength type.
- `strengthLevel`: Password strength level represented as PasswordStrengthLevel type.
- `entropy`: Entropy value calculated for the password.

## License

This library is released under the MIT or Apache-2 License.