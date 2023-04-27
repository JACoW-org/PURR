from wtforms import BooleanField, StringField, URLField
from wtforms.validators import URL, DataRequired

from indico.web.forms.base import IndicoForm

from indico_purr import _


class PurrConnectForm(IndicoForm):
    api_url = URLField(_("API URL"), [DataRequired(), URL(require_tld=False)])
    api_key = StringField(_("API Key"), [DataRequired()])


class PurrDisconnectForm(IndicoForm):
    connected = BooleanField(_("Connected"), [DataRequired()])

