from flask import session

from indico.core import signals
from indico.util.i18n import make_bound_gettext
from indico.web.flask.util import url_for
from indico.web.menu import SideMenuItem


_ = make_bound_gettext('purr')


@signals.menu.items.connect_via('event-management-sidemenu')
def purr_sidemenu_items(sender, event, **kwargs):
    if event.can_manage(session.user):
        yield SideMenuItem('purr', _('PURR'),
                           url_for('plugin_purr.purr-home', event),
                           0, section='workflows', icon='pdf')
