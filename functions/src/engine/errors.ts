/** Thrown when the caller sends structurally invalid input (a client bug). */
export class InvalidInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidInputError";
  }
}

/** Thrown at load time when a rule file violates the /rules schema. */
export class RuleValidationError extends Error {
  readonly problems: readonly string[];

  constructor(ruleSetId: string, problems: readonly string[]) {
    super(`Invalid rule set "${ruleSetId}":\n  - ${problems.join("\n  - ")}`);
    this.name = "RuleValidationError";
    this.problems = problems;
  }
}
