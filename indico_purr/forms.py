from wtforms import BooleanField, FloatField, StringField, URLField, Form
from wtforms.validators import URL, DataRequired

from indico.web.forms.base import IndicoForm
from indico.web.forms.fields import IndicoSelectMultipleCheckboxField

from indico_purr import _


class PurrConnectForm(IndicoForm):
    api_url = URLField(_("API URL"), [DataRequired(), URL(require_tld=False)])
    api_key = StringField(_("API Key"), [DataRequired()])


class PurrDisconnectForm(IndicoForm):
    connected = BooleanField(_("Connected"), [DataRequired()])


class __PurrSettingsForm(Form):
   
    pdf_page_width = FloatField(_("PDF page width"), [DataRequired()])
    pdf_page_height = FloatField(_("PDF page height"), [DataRequired()])
    ab_session_h1 = StringField(_("AB session H1 pattern"), [DataRequired()])
    ab_session_h2 = StringField(_("AB session H2 pattern"), [DataRequired()])
    ab_contribution_h1 = StringField(
        _("AB contribution standard pattern"), [DataRequired()]
    )
    ab_contribution_h2 = StringField(
        _("AB contribution poster pattern"), [DataRequired()]
    )
    custom_fields = IndicoSelectMultipleCheckboxField(_("Custom fields"), coerce=int)

    # event_title = StringField(_("Event title"), [DataRequired()])
    # event_name = StringField(_("Event name"), [DataRequired()])
    # event_hosted = StringField(_("Event hosted"), [DataRequired()])
    # event_location = StringField(_("Event location"), [DataRequired()])
    # event_editorial = StringField(_("Event Editorial Board"), [DataRequired()])
    # event_context = StringField(_("Event context"), [DataRequired()])
    # event_date = StringField(_("Event date"), [DataRequired()])
    # event_isbn = StringField(_("Event ISBN"), [DataRequired()])
    # event_issn = StringField(_("Event ISSN"), [DataRequired()])
    # event_doi = StringField(_("Event DOI"), [DataRequired()])
    isbn = StringField(_("ISBN"), [DataRequired()])
    issn = StringField(_("ISSN"), [DataRequired()])
    booktitle_short = StringField(_("Booktitle short"), [DataRequired()])
    booktitle_long = StringField(_("Booktitle long"), [DataRequired()])
    series = StringField(_("Series"), [DataRequired()])
    series_number = StringField(_("Series number"), [DataRequired()])
    location = StringField(_("location"), [DataRequired()])
    hostInfo = StringField(_("hostinfo"), [DataRequired()]) # TODO fix snake case
    editorialBoard = StringField(_("editorial board"), [DataRequired()])
    doi_base_url = StringField(_("Doi Base URL"), [DataRequired()])
    doi_user = StringField(_("doi user"), [DataRequired()])
    doi_password = StringField(_("doi password"), [DataRequired()])
        #     'isbn': '',
        # 'issn': '',
        # 'booktitle_short': '',
        # 'booktitle_long': '',
        # 'series': '',
        # 'series_number': '',
        # 'location': '',
        # 'hostInfo': '',
        # 'editorialBoard': '',
        # 'doi_base_url': '',
        # 'doi_user': '',
        # 'doi_password': ''

    def __init__(self, *args, event, **kwargs):
        super().__init__(*args, {**kwargs, "csrf_enabled": False})
        self.custom_fields.choices = [
            (f.id, f.title) for f in event.contribution_fields
        ]


# class SettingsForm(IndicoForm):
#     _submitter_editable_fields = ('title', 'description', 'person_link_data')
#     title = StringField(_('Title'), [DataRequired()])
#     description = TextAreaField(_('Description'))
#     start_dt = IndicoDateTimeField(_('Start date'),
#                                    [DataRequired(),
#                                     DateTimeRange(earliest=lambda form, field: form._get_earliest_start_dt(),
#                                                   latest=lambda form, field: form._get_latest_start_dt())],
#                                    allow_clear=False,
#                                    description=_('Start date of the contribution'))
#     duration = IndicoDurationField(_('Duration'), [DataRequired(), MaxDuration(timedelta(hours=24))],
#                                    default=timedelta(minutes=20))
#     type = QuerySelectField(_('Type'), get_label='name', allow_blank=True, blank_text=_('No type selected'))
#     person_link_data = ContributionPersonLinkListField(_('People'))
#     location_data = IndicoLocationField(_('Location'))
#     keywords = IndicoTagListField(_('Keywords'))
#     references = ReferencesField(_('External IDs'), reference_class=ContributionReference,
#                                  description=_('Manage external resources for this contribution'))
#     board_number = StringField(_('Board Number'))
#     code = StringField(_('Program code'))
