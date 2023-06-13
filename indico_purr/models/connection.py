from dataclasses import dataclass, field, asdict


@dataclass
class PurrConnection:
    """DTO dataclass for connection to PURR"""

    api_url: str = field(default='')
    api_key: str = field(default='')

    def as_dict(self):
        return asdict(self)

    def validate(self):
        errors = dict()

        self._validate_api_key(errors)
        self._validate_api_url(errors)

        return errors

    def _required_validator(self, key, value, errors: dict):
        if value is None or value == '':
            errors[key] = 'error:required'

    def _validate_api_url(self, errors: dict):
        self._required_validator('api_url', self.api_url, errors)

    def _validate_api_key(self, errors: dict):
        self._required_validator('api_key', self.api_key, errors)
