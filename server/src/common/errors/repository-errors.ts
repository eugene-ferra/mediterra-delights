export abstract class RepositoryError extends Error {
  readonly kind: string;

  protected constructor(kind: string, message?: string) {
    super(message ?? kind);
    this.kind = kind;
  }
}

export class DuplicateKeyRepoError extends RepositoryError {
  constructor(
    public readonly collection: string,
    public readonly fields: Record<string, unknown>,
  ) {
    super('DUPLICATE_KEY', `Duplicate key in ${collection}`);
  }
}

export class InvalidDataRepoError extends RepositoryError {
  constructor(public readonly details: unknown) {
    super('INVALID_DATA', 'Invalid data for update');
  }
}

export class RepositoryUnknownError extends RepositoryError {
  constructor(public readonly cause: unknown) {
    super('UNKNOWN_REPOSITORY_ERROR', 'Unknown repository error');
  }
}
