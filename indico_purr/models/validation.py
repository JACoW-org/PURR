from dataclasses import dataclass, field
from typing import Any, Callable, Optional


@dataclass
class Validation:
    """Class to use to validate a DTO"""

    errors: dict = field(default_factory=dict)

    def required(self, field: str, value) -> 'Validation':
        if isinstance(value, list) and len(value) == 0:
            self.errors[field] = 'error.required'
        elif not value:
            self.errors[field] = 'error:required'
        return self

    def not_empty(self, field: str, list) -> 'Validation':
        if len(list) == 0:
            self.errors[field] = 'error.not-empty'
        return self

    def custom_validator(self, field: str, value, validator: Callable[[str, Any], Optional[str]]) -> 'Validation':
        error = validator(value)
        if error:
            self.errors[field] = error
        return self

    def get_errors(self) -> dict:
        return self.errors
