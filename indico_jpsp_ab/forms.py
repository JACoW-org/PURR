from wtforms.validators import URL, DataRequired, Email, InputRequired

from wtforms import BooleanField, EmailField, FloatField, SelectField, StringField, TextAreaField
from wtforms.fields import IntegerField, URLField

from indico.util.i18n import _
from indico.util.string import validate_email
from indico.web.flask.util import url_for
from indico.web.forms.base import IndicoForm



class JpspConnectForm(IndicoForm):
    api_url = URLField(_('API URL'), [DataRequired(), URL()])
    api_key = StringField(_('API KEY'), [DataRequired()])
    
    
class JpspDisconnectForm(IndicoForm):
    connected = BooleanField(_('CONNECTED'), [DataRequired()])
    
    
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