import re

from dataclasses import dataclass, field, asdict

@dataclass
class PurrSettings:
    """DTO dataclass for PURR settings"""

    ab_session_h1: str = field(default='')
    ab_session_h2: str = field(default='')
    ab_contribution_h1: str = field(default='')
    ab_contribution_h2: str = field(default='')
    custom_fields: list = field(default_factory=list)
    isbn: str = field(default='')
    issn: str = field(default='')
    booktitle_short: str = field(default='')
    booktitle_long: str = field(default='')
    series: str = field(default='')
    series_number: str = field(default='')
    location: str = field(default='')
    host_info: str = field(default='')
    editorial_board: str = field(default='')
    doi_base_url: str = field(default='')
    doi_user: str = field(default='')
    doi_password: str = field(default='')

    def as_dict(self):
        return asdict(self)
    
    def validate(self):
        errors = dict()

        self._validate_ab_session_h1(errors)
        self._validate_ab_session_h2(errors)
        self._validate_ab_contribution_h1(errors)
        self._validate_ab_contribution_h2(errors)
        self._validate_isbn(errors)
        self._validate_issn(errors)
        self._validate_booktitle_short(errors)
        self._validate_booktitle_long(errors)
        self._validate_series(errors)
        self._validate_series_number(errors)
        self._validate_location(errors)
        self._validate_host_info(errors)
        self._validate_editorial_board(errors)
        self._validate_doi_base_url(errors)
        self._validate_doi_user(errors)
        self._validate_doi_password(errors)

        return errors
    
    def _required_validator(self, key, value, errors: dict):
        if value == None or value == '':
            errors[key] = 'error:required'
        
    def _format_validator(key, value, regex):
        pass
    
    def _validate_ab_session_h1(self, errors: dict):
        self._required_validator('ab_session_h1', self.ab_session_h1, errors)
        
    def _validate_ab_session_h2(self, errors: dict):
        self._required_validator('ab_session_h2', self.ab_session_h2, errors)
        
    def _validate_ab_contribution_h1(self, errors: dict):
        self._required_validator('ab_contribution_h1', self.ab_contribution_h1, errors)
        
    def _validate_ab_contribution_h2(self, errors: dict):
        self._required_validator('ab_contribution_h2', self.ab_contribution_h2, errors)

    def _validate_isbn(self, errors: dict):
        self._required_validator('isbn', self.isbn, errors)

        # TODO use isbnlib to validate if ISBN-10 or ISBN-13

    def _validate_issn(self, errors: dict):
        self._required_validator('issn', self.issn, errors)

        # if re.search(r'[\S]{4}\-[\S]{4}', self.issn) == None:
        #     errors['issn'] = 'error:issn-format'
        
    def _validate_booktitle_short(self, errors: dict):
        self._required_validator('booktitle_short', self.booktitle_short, errors)

    def _validate_booktitle_long(self, errors: dict):
        self._required_validator('booktitle_long', self.booktitle_long, errors)
        
    def _validate_series(self, errors: dict):
        self._required_validator('series', self.series, errors)

    def _validate_series_number(self, errors: dict):
        self._required_validator('series_number', self.series_number, errors)

    def _validate_location(self, errors: dict):
        self._required_validator('location', self.location, errors)

    def _validate_host_info(self, errors: dict):
        self._required_validator('host_info', self.host_info, errors)

    def _validate_editorial_board(self, errors: dict):
        self._required_validator('editorial_board', self.editorial_board, errors)

    def _validate_doi_base_url(self, errors: dict):
        self._required_validator('doi_base_url', self.doi_base_url, errors)

    def _validate_doi_user(self, errors: dict):
        self._required_validator('doi_user', self.doi_user, errors)

    def _validate_doi_password(self, errors: dict):
        self._required_validator('doi_password', self.doi_password, errors)