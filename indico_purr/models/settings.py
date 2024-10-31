from dataclasses import dataclass, field, asdict
from typing import Optional

from indico_purr.models.validation import Validation

def materials_validator(materials: list[dict]) -> Optional[str]:
    count_logos = 0
    count_posters = 0
    for material in materials:
        if material.get('section') == 'logo':
            count_logos += 1
        if material.get('section') == 'poster':
            count_posters += 1
    if count_logos > 1 or count_posters > 1:
        return 'error:bad-data'
    return None

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
    copyright_year: str = field(default='')
    site_license_text: str = field(default='')
    site_license_url: str = field(default='')
    paper_license_icon_url: str = field(default='')
    paper_license_text: str = field(default='')
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
    materials: list[dict] = field(default_factory=list)
    duplicate_of_alias: str = field(default='')
    cat_publish_alias: str = field(default='')

    def as_dict(self):
        return asdict(self)

    def validate(self):

        return (Validation()
                .required('ab_session_h1', self.ab_session_h1)
                .required('ab_session_h2', self.ab_session_h2)
                .required('ab_contribution_h1', self.ab_contribution_h1)
                .required('ab_contribution_h2', self.ab_contribution_h2)
                .required('pdf_page_height', self.pdf_page_height)
                .required('pdf_page_width', self.pdf_page_width)
                .required('isbn', self.isbn)
                .required('issn', self.issn)
                .required('booktitle_short', self.booktitle_short)
                .required('booktitle_long', self.booktitle_long)
                .required('series', self.series)
                .required('series_number', self.series_number)
                .required('pre_print', self.pre_print)
                .required('copyright_year', self.copyright_year)
                .required('site_license_text', self.site_license_text)
                .required('site_license_url', self.site_license_url)
                .required('paper_license_icon_url', self.paper_license_icon_url)
                .required('paper_license_text', self.paper_license_text)
                .required('location', self.location)
                .required('host_info', self.host_info)
                .required('editorial_board', self.editorial_board)
                .required('editorial_json', self.editorial_json)
                .required('doi_env', self.doi_env)
                .required('doi_proto', self.doi_proto)
                .required('doi_domain', self.doi_domain)
                .required('doi_context', self.doi_context)
                .required('doi_organization', self.doi_organization)
                .required('doi_conference', self.doi_conference)
                .required('doi_user', self.doi_user)
                .required('doi_password', self.doi_password)
                .required('primary_color', self.primary_color)
                .not_empty('toc_grouping', self.toc_grouping)
                .custom_validator('materials', self.materials, materials_validator)
                .required('duplicate_of_alias', self.duplicate_of_alias)
                .required('cat_publish_alias', self.cat_publish_alias)
                .get_errors())

        # errors = dict()

        # self._validate_ab_session_h1(errors)
        # self._validate_ab_session_h2(errors)
        # self._validate_ab_contribution_h1(errors)
        # self._validate_ab_contribution_h2(errors)
        # self._validate_pdf_page_height(errors)
        # self._validate_pdf_page_width(errors)
        # self._validate_isbn(errors)
        # self._validate_issn(errors)
        # self._validate_booktitle_short(errors)
        # self._validate_booktitle_long(errors)
        # self._validate_series(errors)
        # self._validate_series_number(errors)
        # self._validate_pre_print(errors)
        # self._validate_copyright_year(errors)
        # self._validate_site_license_text(errors)
        # self._validate_site_license_url(errors)
        # self._validate_paper_license_icon_url(errors)
        # self._validate_paper_license_text(errors)
        # self._validate_location(errors)
        # self._validate_host_info(errors)
        # self._validate_editorial_board(errors)
        # self._validate_editorial_json(errors)
        # self._validate_doi(errors)
        # self._validate_doi_user(errors)
        # self._validate_doi_password(errors)
        # self._validate_primary_color(errors)
        # self._validate_toc_grouping(errors)
        # self._validate_materials(errors)
        # self._validate_duplicate_of_alias(errors)
        # self._validate_cat_publish_alias(errors)

        # return errors

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
        self._required_validator('ab_contribution_h1',
                                 self.ab_contribution_h1, errors)

    def _validate_ab_contribution_h2(self, errors):
        self._required_validator('ab_contribution_h2',
                                 self.ab_contribution_h2, errors)

    def _validate_pdf_page_height(self, errors):
        self._required_validator(
            'pdf_page_height', self.pdf_page_height, errors)

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
        self._required_validator(
            'booktitle_short', self.booktitle_short, errors)

    def _validate_booktitle_long(self, errors):
        self._required_validator('booktitle_long', self.booktitle_long, errors)

    def _validate_series(self, errors):
        self._required_validator('series', self.series, errors)

    def _validate_series_number(self, errors):
        self._required_validator('series_number', self.series_number, errors)

    def _validate_pre_print(self, errors):
        self._required_validator('pre_print', self.pre_print, errors)

    def _validate_copyright_year(self, errors):
        self._required_validator('copyright_year', self.copyright_year, errors)

    def _validate_site_license_text(self, errors):
        self._required_validator('site_license_text', self.copyright_year, errors)

    def _validate_site_license_url(self, errors):
        self._required_validator('site_license_url', self.site_license_url, errors)

    def _validate_paper_license_icon_url(self, errors):
        self._required_validator('paper_license_icon_url', self.paper_license_icon_url, errors)

    def _validate_paper_license_text(self, errors):
        self._required_validator('paper_license_text', self.paper_license_text, errors)

    def _validate_location(self, errors):
        self._required_validator('location', self.location, errors)

    def _validate_host_info(self, errors):
        self._required_validator('host_info', self.host_info, errors)

    def _validate_editorial_board(self, errors):
        self._required_validator(
            'editorial_board', self.editorial_board, errors)

    def _validate_editorial_json(self, errors):
        self._required_validator('editorial_json', self.editorial_json, errors)

    def _validate_doi(self, errors):
        self._required_validator('doi_env', self.doi_env, errors)
        self._required_validator('doi_proto', self.doi_proto, errors)
        self._required_validator('doi_domain', self.doi_domain, errors)
        self._required_validator('doi_context', self.doi_context, errors)
        self._required_validator(
            'doi_organization', self.doi_organization, errors)
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

    def _validate_materials(self, errors):
        count_logos = 0
        count_posters = 0
        for material in self.materials:
            if material.get('section') == 'logo':
                count_logos += 1
            if material.get('section') == 'poster':
                count_posters += 1
        if count_logos > 1 or count_posters > 1:
            errors['materials'] = 'error:bad-data'

    def _validate_duplicate_of_alias(self, errors):
        self._required_validator('duplicate_of_alias', self.duplicate_of_alias, errors)

    def _validate_cat_publish_alias(self, errors):
        self._required_validator('cat_publish_alias', self.cat_publish_alias, errors)
