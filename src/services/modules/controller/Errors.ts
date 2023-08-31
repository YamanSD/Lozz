/**
 * File containing error classes.
 * Names are self-descriptive as to not need any comments.
 */

export class NoUpdateError extends Error {
  public constructor() {
    super("NoUpdateError");
  }
}

export class NoDeleteError extends Error {
  public constructor() {
    super("NoDeleteError");
  }
}

export class NoDeactivateError extends Error {
  public constructor() {
    super("NoDeactivateError");
  }
}

export class NoDataError extends Error {
  public constructor() {
    super("NoDataError");
  }
}

export class IdAlreadyExistsError extends Error {
  public constructor() {
    super("IdAlreadyExistsError");
  }
}

export class IdDoesNotExistError extends Error {
  public constructor() {
    super("IdDoesNotExistError");
  }
}

export class IllegalStateError extends Error {
  public constructor() {
    super("IllegalStateError");
  }
}

export class ProductNotFoundError extends Error {
  public constructor() {
    super("ProductNotFoundError");
  }
}

export class NoTrailError extends Error {
  public constructor() {
    super("NoTrailError");
  }
}

export class NoZonesError extends Error {
  public constructor() {
    super("NoZonesError");
  }
}

export class InvalidInputError extends Error {
  public constructor() {
    super("InvalidInputError");
  }
}

export class PivotError extends Error {
  public constructor() {
    super("PivotError");
  }
}

export class NotAuthorizedError extends Error {
  public constructor() {
    super("NotAuthorizedError");
  }
}

export class InsufficientQuantitiesError extends Error {
  public constructor() {
    super("InsufficientQuantitiesError");
  }
}

export class OrderNotPendingError extends Error {
  public constructor() {
    super("OrderNotPendingError");
  }
}

export class InvalidOrderCreationStatusError extends Error {
  public constructor() {
    super("InvalidOrderCreationStatusError");
  }
}

export class OrderNotConfirmedNorPendingError extends Error {
  public constructor() {
    super("OrderNotConfirmedNorPendingError");
  }
}

export class EmptyRestockError extends Error {
  public constructor() {
    super("EmptyRestockError");
  }
}

export class NoCancelError extends Error {
  public constructor() {
    super("NoCancelError");
  }
}

export class OrderNotAtCourierError extends Error {
  public constructor() {
    super("OrderNotAtCourierError");
  }
}

export class RestockDeletionError extends Error {
  public constructor() {
    super("RestockDeletionError");
  }
}

export class RestockAlreadyRevokedError extends Error {
  public constructor() {
    super("RestockAlreadyRevokedError");
  }
}

export class InvalidInvoiceQuantitiesError extends Error {
  public constructor() {
    super("InvalidInvoiceQuantitiesError");
  }
}

export class NotStatisticalError extends Error {
  public constructor() {
    super("NotStatisticalError");
  }
}

export class CheckDirError extends Error {
  public constructor() {
    super("CheckDirError");
  }
}

export class ImageDownloadError extends Error {
  public constructor() {
    super("ImageDownloadError");
  }
}

export class NoConnectionError extends Error {
  public constructor() {
    super("NoConnectionError");
  }
}
