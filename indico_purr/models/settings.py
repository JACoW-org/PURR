from dataclasses import dataclass, field, asdict


@dataclass
class PurrSettings:
    """DTO dataclass for PURR settings"""

    ab_session_h1: str = field(default='')
    ab_session_h2: str = field(default='')
    ab_contribution_h1: str = field(default='')
    ab_contribution_h2: str = field(default='')
    custom_fields: list = field(default_factory=list)
    pdf_page_height: str = field(default='')
    pdf_page_width: str = field(default='')
    date: str = field(default='')
    isbn: str = field(default='')
    issn: str = field(default='')
    booktitle_short: str = field(default='')
    booktitle_long: str = field(default='')
    series: str = field(default='')
    series_number: str = field(default='')
    pre_print: str = field(default='')
    location: str = field(default='')
    host_info: str = field(default='')
    editorial_board: str = field(default='')
    editorial_json: str = field(default='')
    doi_env: str = field(default='')
    doi_proto: str = field(default='')
    doi_domain: str = field(default='')
    doi_context: str = field(default='')
    doi_organization: str = field(default='')
    doi_conference: str = field(default='')
    doi_user: str = field(default='')
    doi_password: str = field(default='')
    primary_color: str = field(default='#F39433')
    toc_grouping: list = field(default_factory=list)

    def as_dict(self):
        return asdict(self)

    def validate(self):
        errors = dict()

        self._validate_ab_session_h1(errors)
        self._validate_ab_session_h2(errors)
        self._validate_ab_contribution_h1(errors)
        self._validate_ab_contribution_h2(errors)
        self._validate_pdf_page_height(errors)
        self._validate_pdf_page_width(errors)
        self._validate_isbn(errors)
        self._validate_issn(errors)
        self._validate_booktitle_short(errors)
        self._validate_booktitle_long(errors)
        self._validate_series(errors)
        self._validate_series_number(errors)
        self._validate_pre_print(errors)
        self._validate_location(errors)
        self._validate_host_info(errors)
        self._validate_editorial_board(errors)
        self._validate_editorial_json(errors)
        self._validate_doi(errors)
        self._validate_doi_user(errors)
        self._validate_doi_password(errors)
        self._validate_primary_color(errors)
        self._validate_toc_grouping(errors)

        return errors

    def _required_validator(self, key, value, errors):
        if not value:
            errors[key] = 'error:required'

    def _format_validator(self, key, value, regex):
        pass

    def _validate_ab_session_h1(self, errors):
        self._required_validator('ab_session_h1', self.ab_session_h1, errors)

    def _validate_ab_session_h2(self, errors):
        self._required_validator('ab_session_h2', self.ab_session_h2, errors)

    def _validate_ab_contribution_h1(self, errors):
        self._required_validator('ab_contribution_h1', self.ab_contribution_h1, errors)

    def _validate_ab_contribution_h2(self, errors):
        self._required_validator('ab_contribution_h2', self.ab_contribution_h2, errors)

    def _validate_pdf_page_height(self, errors):
        self._required_validator('pdf_page_height', self.pdf_page_height, errors)

    def _validate_pdf_page_width(self, errors):
        self._required_validator('pdf_page_width', self.pdf_page_width, errors)

    def _validate_date(self, errors):
        self._required_validator('date', self.date, errors)

    def _validate_isbn(self, errors):
        self._required_validator('isbn', self.isbn, errors)

    def _validate_issn(self, errors):
        self._required_validator('issn', self.issn, errors)

        # if re.search(r'[\S]{4}\-[\S]{4}', self.issn) == None:
        #     errors['issn'] = 'error:issn-format'

    def _validate_booktitle_short(self, errors):
        self._required_validator('booktitle_short', self.booktitle_short, errors)

    def _validate_booktitle_long(self, errors):
        self._required_validator('booktitle_long', self.booktitle_long, errors)

    def _validate_series(self, errors):
        self._required_validator('series', self.series, errors)

    def _validate_series_number(self, errors):
        self._required_validator('series_number', self.series_number, errors)

    def _validate_pre_print(self, errors):
        self._required_validator('pre_print', self.pre_print, errors)

    def _validate_location(self, errors):
        self._required_validator('location', self.location, errors)

    def _validate_host_info(self, errors):
        self._required_validator('host_info', self.host_info, errors)

    def _validate_editorial_board(self, errors):
        self._required_validator('editorial_board', self.editorial_board, errors)

    def _validate_editorial_json(self, errors):
        self._required_validator('editorial_json', self.editorial_json, errors)

    def _validate_doi(self, errors):
        self._required_validator('doi_env', self.doi_env, errors)
        self._required_validator('doi_proto', self.doi_proto, errors)
        self._required_validator('doi_domain', self.doi_domain, errors)
        self._required_validator('doi_context', self.doi_context, errors)
        self._required_validator('doi_organization', self.doi_organization, errors)
        self._required_validator('doi_conference', self.doi_conference, errors)

    def _validate_doi_user(self, errors):
        self._required_validator('doi_user', self.doi_user, errors)

    def _validate_doi_password(self, errors):
        self._required_validator('doi_password', self.doi_password, errors)

    def _validate_primary_color(self, errors):
        self._required_validator('primary_color', self.primary_color, errors)

    def _validate_toc_grouping(self, errors):
        if len(self.toc_grouping) == 0:
            errors['toc_grouping'] = 'error:required'
