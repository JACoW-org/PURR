from wtforms import BooleanField, FloatField, StringField, URLField
from wtforms.validators import URL, DataRequired

from indico.web.forms.base import IndicoForm
from indico.web.forms.fields import IndicoSelectMultipleCheckboxField

from indico_purr import _


class PurrConnectForm(IndicoForm):
    api_url = URLField(_('API URL'), [DataRequired(), URL(require_tld=False)])
    api_key = StringField(_('API Key'), [DataRequired()])


class PurrDisconnectForm(IndicoForm):
    connected = BooleanField(_('Connected'), [DataRequired()])


class PurrSettingsForm(IndicoForm):
    pdf_page_width = FloatField(_('PDF page width'), [DataRequired()])
    pdf_page_height = FloatField(_('PDF page height'), [DataRequired()])
    ab_session_h1 = StringField(_('AB session H1 pattern'), [DataRequired()])
    ab_session_h2 = StringField(_('AB session H2 pattern'), [DataRequired()])
    ab_contribution_h1 = StringField(_('AB contribution standard pattern'), [DataRequired()])
    ab_contribution_h2 = StringField(_('AB contribution poster pattern'), [DataRequired()])
    custom_fields = IndicoSelectMultipleCheckboxField(_('Custom fields'), coerce=int)

    def __init__(self, *args, event, **kwargs):
        super().__init__(*args, **kwargs)
        self.custom_fields.choices = [(f.id, f.title) for f in event.contribution_fields]


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
